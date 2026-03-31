# Auditoria tecnica de /admin (edicion de textos e imagenes)

Fecha: 2026-03-31
Alcance: flujo de contenido del panel admin para secciones, preview y galeria.
Foco: edicion de texto e imagen, payloads por boton, estados, orden, altas/reemplazos, contratos HTTP, inconsistencias y mejoras.

---

## 1) Mapa funcional de /admin (contenido)

- /sections: listado de secciones editables.
- /sections/:sectionId: editor visual (canvas) de una seccion.
- /preview: previsualizacion agrupada + publicar/descartar borradores.
- /gallery: gestion global de imagenes + asignacion a secciones.

Nota: /contacts y /candidates existen en /admin, pero no forman parte del flujo de edicion de textos/imagenes de contenido del sitio.

---

## 2) Estados de contenido y modelo operativo

### 2.1 Estados principales

- Bloques: DRAFTED | PUBLISHED.
- Texto e imagen heredan estado del bloque.
- Archivos: a nivel DTO aparecen PENDING | QUARANTINE | VERIFIED | REJECTED, pero en modelo de UI se usan PENDING | UPLOADED (ver inconsistencias).

### 2.2 Regla de visualizacion Draft-over-Published

Para un mismo order, si hay DRAFTED y PUBLISHED, el editor muestra el DRAFTED y oculta el PUBLISHED.
Esto aplica al matcheo de slots de texto e imagen.

Impacto:
- Editar contenido publicado no pisa en caliente: crea reemplazo DRAFTED.
- Hasta publicar, conviven viejo (PUBLISHED) y nuevo (DRAFTED), pero la UI prioriza nuevo.

---

## 3) Reglas de orden (sumar, reemplazar, crear)

### 3.1 Cuandos se suma el orden (+1)

Texto:
- Alta en slot multiple sin existente especifico: next order del role + 1.
- Alta en slot simple vacio: slotIndex + 1 (no usa max global del role).

Imagen:
- Upload nuevo en slot multiple/simple: next order del role + 1.
- En Files panel (R2): usa files.length + 1 para role attachment.

### 3.2 Cuandos se reemplaza conservando orden

Texto publicado:
- Al guardar sobre texto PUBLISHED, NO hace PATCH.
- Crea nuevo DRAFTED con el mismo order del texto publicado.

Imagen publicada:
- Boton Cambiar imagen sube nueva imagen DRAFTED con preserveOrder = order actual.
- La imagen publicada vieja queda hasta publicar cambios.

### 3.3 Cuando crea entradas nuevas

Texto:
- Guardar en slot vacio -> POST content con texts[1].
- Guardar sobre PUBLISHED -> POST content con texts[1] (reemplazo por borrador).
- Reordenar texto cuando participa algun PUBLISHED -> POST content con texts[2] (duplicacion de ambos con orden invertido).

Imagen:
- Upload (drop/click) -> POST media/draft (nueva media + bloque DRAFTED).
- Asignar desde galeria -> POST content con media[1] (nuevo bloque asociado).
- Reordenar imagen cuando participa algun PUBLISHED -> POST content con media[2] (nuevos bloques DRAFTED con orden invertido).

---

## 4) Botones y payloads exactos

## 4.1 Editor de seccion (/sections/:id)

### Header

1. Boton Publicar cambios
- Accion: publicar todos los DRAFTED de la seccion.
- HTTP: POST /content/sections/:sectionId/publish
- Body: sin body
- Estado UI: isPending de mutacion + disabled si draftedBlockCount = 0.

2. Boton Previsualizar sitio
- Accion: navegacion a /preview
- HTTP: no aplica

### Edicion de texto inline

3. Boton Guardar (editor inline)
- Caso A: texto DRAFTED existente -> PATCH /content/texts/:textId
- Body A: { "body": "..." }
- Caso B: texto PUBLISHED existente -> POST /content/sections/:sectionId/content
- Body B: {
  "texts": [{ "body": "...", "role": "...", "order": N }]
}
- Caso C: slot vacio -> POST /content/sections/:sectionId/content
- Body C: igual a B con order calculado por slot/regla.

4. Boton Publicar texto (chip/hover sobre texto DRAFTED)
- HTTP: POST /content/texts/:textId/publish
- Body: { "block_id": blockId }

5. Boton Eliminar texto
- Secuencia:
  1) DELETE /content/blocks/:blockId
  2) DELETE /content/texts/:textId
- Body: sin body en ambos.

6. Flechas reorden texto (arriba/abajo)
- Caso A: ambos DRAFTED
  - PATCH /content/blocks/:blockIdA { "order": orderB }
  - PATCH /content/blocks/:blockIdB { "order": orderA }
- Caso B: alguno PUBLISHED
  - POST /content/sections/:sectionId/content
  - Body:
    {
      "texts": [
        { "body": "textoA", "role": "roleA", "order": orderB },
        { "body": "textoB", "role": "roleB", "order": orderA }
      ]
    }

### Edicion de imagen inline

7. Upload imagen (drop/click en slot)
- HTTP: POST /content/media/draft (multipart/form-data)
- Campos form-data:
  - image: file binario
  - section_id: string
  - role: string
  - order: string
  - title: string aleatorio basado en timestamp

8. Boton Publicar imagen (hover sobre imagen DRAFTED)
- HTTP: POST /content/media/:mediaId/publish
- Body: { "block_id": blockId }

9. Boton Cambiar imagen (reemplazo)
- HTTP: POST /content/media/draft (multipart)
- Particularidad: conserva order actual via preserveOrder.

10. Boton Eliminar imagen
- HTTP: DELETE /content/blocks/:blockId
- Efecto: desasocia de la seccion; no borra globalmente el media.

11. Boton O elegir de la galeria / Galeria
- Flujo: abrir modal -> seleccionar -> confirmar.
- HTTP: POST /content/sections/:sectionId/content
- Body:
  {
    "media": [
      { "media_id": mediaId, "role": "slotRole", "order": N }
    ]
  }

12. Flechas reorden imagen (slots multiples)
- Caso A: ambos DRAFTED -> PATCH de ambos blocks (swap order).
- Caso B: alguno PUBLISHED -> POST content con 2 items media (swap por creacion de DRAFTED).
- Body caso B:
  {
    "media": [
      { "media_id": mediaA, "role": "roleA", "order": orderB },
      { "media_id": mediaB, "role": "roleB", "order": orderA }
    ]
  }

### Files panel (seccion news)

13. Boton Subir archivo
- Paso 1: POST /content/files/upload-url
- Body paso 1:
  {
    "filename": "...",
    "content_type": "...",
    "title": "...",
    "section_id": sectionId,
    "role": "attachment",
    "order": files.length + 1
  }
- Paso 2: PUT directo a upload.url (Cloudflare R2)
- Body paso 2: binario del archivo
- Paso 3: POST /content/files/:fileId/confirm
- Body paso 3: { "tamaño": file.size }

14. Boton Descargar archivo
- HTTP: GET /content/files/:fileId/download-url
- Efecto: abre URL firmada en nueva pestana.

15. Boton Eliminar archivo
- HTTP: DELETE /content/files/:fileId

## 4.2 Preview (/preview)

16. Boton Guardar cambios
- Recolecta secciones con drafts y publica en paralelo.
- HTTP: POST /content/sections/:id/publish por cada id.
- Body: sin body.

17. Boton Descartar borradores
- Busca todos los blocks DRAFTED (text/media/file) de las secciones cargadas.
- HTTP: DELETE /content/blocks/:blockId por cada bloque.
- Body: sin body.

## 4.3 Galeria (/gallery)

18. Boton Asignar a seccion (card)
- Abre modal de asignacion.
- Confirmar Asignar -> POST /content/sections/:sectionId/content
- Body:
  {
    "media": [
      { "media_id": mediaId, "role": "roleElegido", "order": order }
    ]
  }

19. Boton Eliminar imagen (card)
- HTTP: DELETE /content/media/:mediaId
- Si backend rechaza por asociaciones activas, se muestra dialog con asociaciones.

20. Boton Eliminar asociacion (en dialog de error de borrado)
- HTTP: DELETE /content/blocks/:blockId
- Luego se refrescan caches de galeria y contenido.

---

## 5) Contratos HTTP relevantes (resumen)

### Lectura
- GET /content/sections
- GET /content/sections/:sectionId
- GET /content/sections/:sectionId/preview
- GET /content/gallery

### Escritura texto/media
- POST /content/sections/:sectionId/content
  - texts[]: { body, role?, order? }
  - media[]: { media_id, role?, order? }
- PATCH /content/texts/:textId { body? }
- PATCH /content/media/:mediaId { title?, url?, mime_type?, origin? }
- PATCH /content/blocks/:blockId { role?, order? }

### Publicacion
- POST /content/sections/:sectionId/publish
- POST /content/texts/:textId/publish { block_id }
- POST /content/media/:mediaId/publish { block_id }

### Borrado
- DELETE /content/blocks/:blockId
- DELETE /content/texts/:textId
- DELETE /content/media/:mediaId
- DELETE /content/files/:fileId

### Uploads
- POST /content/media/draft (multipart)
- POST /content/files/upload-url
- PUT presigned URL (R2)
- POST /content/files/:fileId/confirm
- GET /content/files/:fileId/download-url

---

## 6) Estados de UI por accion

- Carga general seccion: isLoading.
- Error general seccion: error + boton retry.
- Upload media draft: isUploading.
- Publicar media: isPublishingMedia.
- Publicar texto: isPublishingText.
- Upload R2: isUploadingR2.
- Publicar seccion: publishMut.isPending.
- Preview publicar masivo: publishMut.isPending.
- Preview descartar: discardMut.isPending.
- Galeria eliminar media: isDeleting.
- Galeria asignar: isAssigning.
- Galeria eliminar asociacion: isRemovingAssociation.

Observacion: varias mutaciones son globales por vista (no por item), entonces un pending puede bloquear/afectar feedback de multiples items a la vez.

---

## 7) Problemas, inconsistencias y riesgos detectados

### Alta prioridad

1. Reorden de cards de Novedades puede desalinear texto/imagen si falta alguna miniatura
- Al swap de cards, siempre intercambia textos, pero miniaturas solo si existen ambas.
- Resultado: posible mismatch texto-imagen por indice.

2. Eliminacion de texto en 2 requests sin transaccion (delete block -> delete text)
- Si falla el segundo DELETE, puede quedar estado parcial.
- No hay rollback ni manejo de error intermedio en esa cadena.

3. Asignacion desde galeria cierra modal antes de confirmar exito
- Se ejecuta onAssign(...) y onClose() inmediatamente.
- Si falla API, el usuario pierde contexto de intento y no ve error localizado en modal.

### Media prioridad

4. Divergencia de estados de archivo entre DTO y modelo UI
- DTO: PENDING | QUARANTINE | VERIFIED | REJECTED.
- Modelo UI: PENDING | UPLOADED.
- Se castea estado; puede ocultar estados reales y romper reglas (ej: boton descargar solo para UPLOADED).

5. Campo tamaño en contratos de archivo usa clave no estandar
- Confirm payload usa { "tamaño": number }.
- Riesgo de interoperabilidad/typing si algun consumidor espera "size".

6. Roles definidos en sectionRoles no reflejan todos los slots del canvas en algunas secciones
- Ejemplos: slots cta_heading/cta existen en canvas de servicios, pero no en algunas listas de roles.
- Hoy impacta poco porque canvas domina, pero genera incoherencia y deuda para features que usen role lists.

7. Mutaciones de lote por loops sin await coordinado en algunos caminos
- Algunos flujos disparan multiples mutaciones item por item.
- Dificulta feedback preciso por item, retries y consistencia eventual.

8. Render de preview/publico sin prioridad explicita por estado (DRAFTED vs PUBLISHED)
- El editor canvas SI aplica prioridad DRAFTED por order para slots conectados.
- Pero el render de secciones (incluyendo /preview) usa helpers por rol que no conocen status.
- Si backend devuelve para un mismo role/order ambos registros, el frontend puede mostrar el viejo PUBLISHED segun el orden de llegada de blocks.

9. Seleccion por "primer elemento del rol" en muchas secciones
- textByRole/mediaByRole devuelven el primer match por role.
- En empates de order (viejo+nuevo), mostrar uno u otro depende del orden del array que devuelve backend.
- Esto explica por que en algunas secciones se ve bien y en otras queda el anterior.

10. Vista previa de Hero en canvas usa find() directo y puede mostrar publicado viejo
- En la pestana Preview de Hero, se hace find por role sobre section.texts sin dedupe por status.
- Aunque en la pestana Textos del canvas se vea el DRAFTED correcto, la mini-preview de Hero puede mostrar el texto anterior.

### Baja prioridad

11. Codigo legacy exportado/no usado (TextEditor, MediaEditor, submitNewContent)
- Hay piezas antiguas visibles en VM y exports que no participan del canvas actual.
- Aumenta ruido y costo de mantenimiento.

12. Mensajeria de estados parcial en errores de operaciones especificas
- Hay buenos errores generales, pero faltan algunos errores granulares por accion (ej. replace image, assign gallery inline).

---

## 8) Lugares con mejoras concretas

1. Asegurar atomicidad en delete text
- Opcion A: endpoint backend unico para borrar bloque+texto.
- Opcion B: manejar fallo del segundo delete con compensacion/retry.

2. Reorden robusto en Novedades
- Reordenar por entidad card explicita (texto + thumb id) o persistir pairing por clave comun, no por indice.

3. Asignacion de galeria con UX transaccional
- Mantener modal abierto hasta exito.
- Mostrar error inline en modal y permitir reintento.

4. Unificar contrato de estados de archivo
- Resolver mapeo completo QUARANTINE/VERIFIED/REJECTED.
- Alinear condicion de boton descargar con estado real backend.

5. Estandarizar payload de confirm upload
- Evaluar migrar de tamaño -> size (con compatibilidad backward).

6. Limpiar codigo legacy
- Eliminar componentes/acciones sin uso o documentar plan de deprecacion.

7. Instrumentacion y trazabilidad
- Agregar telemetry por accion critica (swap, replace, assign, delete chain).
- Incluir IDs de section/block/media para debugging.

---

## 9) Matriz rapida: crear vs reemplazar vs sumar orden

- Crear nuevo texto: slot vacio o agregar item -> POST content.texts[]
- Reemplazar texto publicado: guardar sobre PUBLISHED -> POST content.texts[] con mismo order
- Editar texto borrador: guardar sobre DRAFTED -> PATCH text
- Crear nueva imagen: upload draft -> POST media/draft
- Reemplazar imagen publicada: boton cambiar -> POST media/draft con preserveOrder
- Sumar orden texto multiple: max(order role)+1
- Sumar orden imagen multiple: max(order role)+1
- Reorden DRAFTED vs DRAFTED: PATCH blocks swap
- Reorden con PUBLISHED involucrado: crear 2 DRAFTED nuevos con orden invertido

---

## 10) Conclusiones

- La estrategia general de borradores esta bien planteada: evita pisar contenido publicado y permite preview segura.
- El comportamiento de orden esta bastante consistente en slots multiples y en reemplazos, con una excepcion importante en Novedades cuando falta miniatura en alguna card.
- Los principales riesgos actuales son de consistencia transaccional (delete en 2 pasos), de contrato de estado de archivos, de UX/error handling en asignacion desde galeria y de no unificar DRAFTED>PUBLISHED en el render de preview/publico.

---

## 11) Casos reportados: como actua hoy el frontend vs backend

### 11.1 "Edito texto, queda DRAFTED, publico y sigue el viejo"

Comportamiento esperado por backend (segun tu descripcion):
- Al publicar, para mismo order debe sobrevivir solo el mas reciente publicado.

Comportamiento actual frontend:
- En canvas editor (slots conectados): suele verse bien porque hay dedupe DRAFTED sobre PUBLISHED por order.
- En /preview y render de secciones: no hay dedupe por status. Se selecciona por role (primer item) y/o por listas ordenadas solo por order.
- Si llegan dos bloques con mismo role/order (viejo+nuevo), puede seguir visible el viejo aunque backend ya haya promovido el nuevo, dependiendo del orden de blocks retornado.

Resultado:
- No necesariamente es que el backend "dejo el viejo"; muchas veces el frontend lo vuelve a elegir por estrategia de render.

### 11.2 "Intercambio imagenes y en admin preview se ve la PUBLISHED"

Comportamiento actual frontend:
- Reorden con PUBLISHED involucrado crea dos bloques DRAFTED nuevos con order invertido (no parchea los publicados).
- En el canvas de edicion, los slots conectados suelen priorizar DRAFTED por order.
- En render de preview/secciones, mediaByRole/mediasByRole no filtran por status: ordenan por order y toman primero o por indice.
- Si coexisten vieja publicada y nueva draft con mismo order, puede quedar visible la publicada en algunas secciones.

Por que pasa "solo en algunas secciones":
- Secciones que toman un unico elemento por role (ej. photo/background con mediaByRole) son mas propensas.
- Secciones con mapeo por indice (ej. about/news/info primaria/secundaria) pueden mezclar pares texto-imagen o mostrar combinaciones inconsistentes.

### 11.3 "Confirmo/publico y sigue la vieja publicada"

Que hace frontend tras publicar:
- Dispara publish y refetch de queries de content.
- Si el endpoint de lectura/preview devuelve arrays con duplicados por role/order o con orden no estable para empates, la UI puede volver a elegir el registro viejo por role.

Interpretacion:
- El problema visible puede persistir aun con publish exitoso por criterio de seleccion en frontend, no solo por persistencia en backend.

### 11.4 Matriz exhaustiva por tipo de seccion (riesgo de mostrar viejo)

Riesgo alto:
- Hero (render por role + preview de canvas con find directo)
- Secondary Hero (heading/subtitle/cta/photo por role)
- ServiceDetail/Recruitment/GenerationalTransfer (heading/subtitle/cta/photo por role)
- Teasers (heading/subtitle/cta por role)

Riesgo medio-alto (por indice ademas de role):
- About (bios/paragraphs/photos por indices 0/1)
- News (paragraphs + thumbnails emparejados por indice)
- InfoPrimary (bullets + icons por indice)
- InfoSecondary (paragraphs + quotes por indice)

Riesgo bajo:
- Canvas de edicion en slots conectados (aca si hay dedupe DRAFTED>PUBLISHED por order).

### 11.5 Veredicto de alineacion frontend vs backend

- El frontend NO esta completamente alineado al contrato backend de "ultimo publicado por mismo order" en las capas de preview/render de secciones.
- Si backend elimina/reemplaza correctamente, igualmente puede verse viejo por la estrategia de seleccion del frontend cuando hay coexistencia temporal o respuestas con orden ambiguo en empates.
- Para que quede acorde: la regla de prioridad por status y/o por recencia debe aplicarse de forma uniforme en TODAS las capas (canvas, preview y render de secciones).

---

## 12) Aclaracion clave: el frontend NO envia "snapshot completo" de nuevos elementos

Expectativa planteada:
- "El frontend deberia mandar: estos son los nuevos (DRAFTED), backend borra el resto, devuelve solo los nuevos".

Comportamiento real del frontend hoy:
- No manda el estado final completo de la seccion.
- Opera por mutaciones incrementales (crear/patch/reorden por pares) y luego llama a publish.

Que SI envia:
- Altas puntuales: POST /content/sections/:sectionId/content (texts[] o media[] parciales).
- Edicion puntual de borrador: PATCH /content/texts/:id.
- Reorden DRAFTED vs DRAFTED: PATCH /content/blocks/:id (swap de order).
- Reorden con PUBLISHED involucrado: crea 2 DRAFTED nuevos (solo ese par), no un reemplazo total de la seccion.
- Publicacion final: POST /content/sections/:sectionId/publish sin snapshot de items.

Implicancia:
- El backend recibe "eventos" parciales, no "estado final deseado".
- Por eso, si el render frontend no aplica una regla uniforme DRAFTED>PUBLISHED, puede verse contenido viejo aun con publish exitoso.

Conclusion operativa:
- La frase "no siempre" es correcta: con el flujo actual no hay garantia de semantica de reemplazo total desde el cliente.
- Para lograr esa semantica, se necesita o:
  1) endpoint de reemplazo atomico por seccion (snapshot), o
  2) mantener el flujo incremental pero unificar estrictamente la seleccion en frontend para priorizar el ultimo estado efectivo.
