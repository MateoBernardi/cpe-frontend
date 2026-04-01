# Auditoria tecnica backend vs frontend (/admin)

Fecha: 2026-03-31  
Alcance: edicion de textos, imagenes, preview, public y galeria.  
Objetivo: documentar el funcionamiento real del backend y las inconsistencias con frontend para resolver issues.

---

## 1. Resumen ejecutivo

- El backend de contenido implementa modelo incremental por eventos (create/patch/delete/swap/publish), no por snapshot completo de seccion.
- La publicacion backend esta modelada para reemplazar por posicion (`section_id + role + order`) en transaccion.
- El backend de preview admin ya aplica dedupe por posicion con prioridad de draft.
- La mayoria de inconsistencias visibles de "sigue mostrando el viejo" vienen de  estrategias de seleccion/render del frontend en capas que no aplican una regla uniforme de prioridad.
- Hay incoherencias internas de contratos en modulo files (estado `UPLOADED` legacy vs pipeline `QUARANTINE/VERIFIED/REJECTED`, y uso de `tamaño`).

---

## 2. Contrato backend real (validado en codigo)

### 2.1 Endpoints de contenido (admin)

- `GET /content/gallery`
- `GET /content/sections`
- `GET /content/sections/:sectionId` (devuelve bloques activos, draft + published)
- `GET /content/sections/:sectionId/preview` (dedupe por `role+order` con prioridad draft)
- `POST /content/sections/:sectionId/content` (crea bloques DRAFTED de texto/media)
- `POST /content/sections/:sectionId/publish` (publicacion masiva de drafts de la seccion)
- `POST /content/media/draft` (upload + creacion de media y bloque DRAFTED si viene `section_id`)
- `POST /content/media/:mediaId/publish` con `{ block_id }`
- `POST /content/texts/:textId/publish` con `{ block_id }`
- `PATCH /content/texts/:textId`
- `PATCH /content/media/:mediaId`
- `PATCH /content/blocks/:blockId`
- `DELETE /content/blocks/:blockId`
- `DELETE /content/texts/:textId`
- `DELETE /content/media/:mediaId`

### 2.2 Endpoints de archivos (admin/public)

- `POST /content/files/upload-url`
- `POST /content/files/:fileId/confirm`
- `GET /content/files`
- `GET /content/files/:fileId/download-url`
- `PATCH /content/file-blocks/:blockId`
- `DELETE /content/files/:fileId`
- `POST /public/files/upload-url` (PDF only, tamano maximo forzado)
- `POST /public/files/:fileId/confirm`

### 2.3 Endpoints publicos de contenido

- `GET /public/sections`
- `GET /public/sections/:sectionName` (solo bloques PUBLISHED)

---

## 3. Reglas de negocio backend que impactan frontend

### 3.1 Lectura admin vs preview vs public

- Admin (`/sections/:id`): trae bloques activos sin filtrar por status (coexisten DRAFTED y PUBLISHED).
- Preview admin (`/sections/:id/preview`): usa `DISTINCT ON (role, order)` y orden por status para priorizar draft en empate de posicion.
- Public (`/public/sections/:name`): solo `PUBLISHED`.

### 3.2 Publicacion

- Publicar bloque individual (`publishBlock`) y publicar seccion (`publishSection`) hacen:
1. Buscar DRAFTED activo.
2. Soft-delete de cualquier `PUBLISHED` en la misma posicion (`section_id`, `role`, `order`).
3. Promocionar DRAFTED a PUBLISHED.
- Este flujo es transaccional en repositorio.

### 3.3 Creacion y mutaciones

- `POST /sections/:id/content` crea nuevos bloques DRAFTED (text/media) en batch transaccional.
- `PATCH /blocks/:id` solo actualiza metadatos (`role`, `order`).
- `DELETE /blocks/:id` solo desactiva bloque (soft delete), no borra entidad text/media/file asociada.

### 3.4 Archivos y estados

- Flujo actual de archivos admin/public:
1. Crear registro en `PENDING` + upload URL.
2. Confirmar upload -> `QUARANTINE`.
3. Scanner mueve a `VERIFIED` o `REJECTED`.
- Descarga firmada exige `VERIFIED`.

---

## 4. Matriz de alineacion backend vs frontend

## 4.1 Donde SI hay alineacion

- Estrategia draft-first en edicion: backend soporta coexistencia draft/published y reemplazo al publicar.
- Reemplazo por misma posicion: backend vacia `PUBLISHED` previo al promocionar draft.
- Modelo incremental del cliente: backend esta disenado para recibir eventos parciales, no snapshot total.

## 4.2 Donde NO hay alineacion (causas de issues)

1. Seleccion/render frontend no uniforme por status
- Hecho backend: preview endpoint ya deduplica por `role+order` con prioridad draft.
- Problema frontend: en vistas que renderizan desde arrays por `find`/primer item de role o helpers por role sin dedupe, puede elegirse el registro viejo por orden de llegada.
- Efecto: "publique y sigo viendo el viejo" aunque backend haya publicado correctamente.

2. Uso inconsistente de fuentes de datos para preview
- Si frontend usa `GET /sections/:id` para preview visual sin aplicar dedupe local, hereda coexistencia draft/published y puede mezclar estado efectivo.
- Para preview estable deberia usar `GET /sections/:id/preview` o aplicar la misma regla de dedupe en cliente.

3. Delete de texto en dos requests desde frontend
- Hecho backend: existen endpoints separados para bloque y texto.
- Problema: frontend puede hacer `DELETE block` y luego `DELETE text`; si falla el segundo queda estado parcial.
- Impacto: inconsistencia funcional/UX, aunque el backend opere segun contrato.

4. Estados de files divergentes entre capas
- Hecho backend: constraint y repositorio usan `PENDING|UPLOADED|QUARANTINE|VERIFIED|REJECTED`.
- Problema: flujo operativo real usa `QUARANTINE/VERIFIED/REJECTED`, pero hay consultas legacy por `UPLOADED` (public files list), y algunos modelos UI simplifican estados.
- Impacto: listados y reglas de botones pueden ocultar estados reales o no mostrar archivos esperados.

5. Campo `tamaño` en DTO/DB
- Hecho backend: contratos de files usan `tamaño`.
- Problema de integracion: clientes tipados suelen esperar `size`; aumenta riesgo de errores de serializacion/mapeo.

6. Publicacion sin drafts devuelve error de dominio no tipado
- Hecho backend: `publishSection` lanza `No drafted blocks to publish`.
- Problema: sin error mapping consistente a 4xx, el frontend puede recibir 500 generico y tratarlo como fallo tecnico.

---

## 5. Inconsistencias tecnicas detectadas en backend

1. Metodo legacy `findWebUploaded` filtra `state = UPLOADED`
- Riesgo: no refleja pipeline actual (`QUARANTINE -> VERIFIED`).
- Resultado probable: `/public/files` puede omitir archivos validos si ya no se usa `UPLOADED` en ese flujo.

2. Convencion de nombres no estandar en payload
- `ConfirmUploadDTO` recibe `{ tamaño?: number }`.
- Deuda: baja interoperabilidad con clientes JS/TS no hispanizados.

3. Mapeo de errores de dominio insuficiente
- El codigo lanza `Error` plano en varios servicios/repositorios.
- Sin middleware de errores tipado, el frontend no puede distinguir con precision conflictos funcionales vs errores internos.

4. `status` modelado como `string` (sin enum fuerte)
- Afecta robustez en compile time y facilita divergencias de valores entre backend/frontend.

---

## 6. Plan de resolucion recomendado (issues)

### Issue 1: Regla unica de seleccion efectiva en frontend

- Objetivo: aplicar la misma semantica en canvas, preview y render publico interno de admin.
- Regla propuesta por posicion: priorizar `DRAFTED` sobre `PUBLISHED` para empate de (`role`, `order`); si no hay draft, usar published.
- Aceptacion:
1. Mismo dataset produce misma salida en todas las vistas.
2. Caso "viejo+nuevo mismo role/order" siempre muestra draft en admin preview.

### Issue 2: Consumir endpoint de preview correcto

- Objetivo: que la vista de preview admin use `GET /content/sections/:id/preview` como fuente principal.
- Aceptacion:
1. Preview no depende del orden de arrays de `/sections/:id`.
2. Desaparecen regresiones de "muestra publicado viejo" en secciones de riesgo alto.

### Issue 3: Delete atomico de texto

- Opcion A (preferida): endpoint backend unico para borrar bloque+texto en transaccion.
- Opcion B: mantener dos endpoints, pero con compensacion/retry idempotente desde frontend.
- Aceptacion:
1. No quedan estados parciales tras fallo intermedio.
2. Mensaje de error accionable por item.

### Issue 4: Normalizar estados de files

- Tarea backend:
1. Definir estado canonico (recomendado: `PENDING|QUARANTINE|VERIFIED|REJECTED`).
2. Corregir consultas legacy (`UPLOADED`) o documentar su uso real.
3. Exponer enum DTO consistente.
- Tarea frontend:
1. Mapear todos los estados del backend.
2. Habilitar descarga solo para `VERIFIED`.
- Aceptacion:
1. UI refleja estado real de backend sin casteos ambiguos.

### Issue 5: Estandarizar `tamaño` -> `size`

- Estrategia gradual:
1. Backend acepta ambos (`tamaño` y `size`) temporalmente.
2. Backend responde ambos por una version.
3. Deprecar `tamaño` con fecha.
- Aceptacion:
1. Ningun cliente rompe en migracion.

### Issue 6: Contrato de errores tipado

- Tarea backend:
1. Introducir errores de dominio (`code`, `message`, `details`, `httpStatus`).
2. Middleware global para mapear errores a 4xx/5xx consistentes.
- Aceptacion:
1. Frontend puede manejar UX especifica por causa (ej. 409, 422, 404).

---

## 7. Casos reportados y diagnostico backend

### Caso A: "Edito, publico y sigue el viejo"

- Backend: publica por posicion en transaccion y soft-delete del published anterior.
- Diagnostico: si persiste visualmente, la causa mas probable es seleccion frontend (fuente o dedupe) y no falla de publish.

### Caso B: "Swap de imagenes y en preview admin aparece la vieja"

- Backend: soporta coexistencia de estados y priorizacion en endpoint preview.
- Diagnostico: si la vista usa colecciones sin dedupe uniforme o mezcla por indice/role, puede emerger published viejo por estrategia de render.

### Caso C: "Confirmo upload y no puedo descargar"

- Backend: descarga solo para `VERIFIED`.
- Diagnostico: entre confirmacion y verificacion del scanner, el estado esperado es `QUARANTINE`; no es fallo, es estado transitorio.

---

## 8. Recomendaciones de implementacion inmediata

1. Frontend: centralizar helper de "contenido efectivo" por (`role`,`order`,`status`) y reutilizarlo en todas las secciones.
2. Frontend: para preview admin, consumir endpoint `.../preview` en lugar de arrays completos de admin.
3. Backend: agregar endpoint atomico para delete text+block.
4. Backend: corregir/retirar dependencia de `UPLOADED` en consultas publicas de files.
5. Backend+Frontend: iniciar migracion de `tamaño` a `size` con compatibilidad temporal.
6. Backend: formalizar middleware de errores con codigos de dominio.

---

## 9. Veredicto final

- Backend de contenido esta bien encaminado en semantica de borradores, publicacion transaccional y reemplazo por posicion.
- Las inconsistencias que hoy generan issues en /admin se explican principalmente por diferencias de seleccion/render en frontend entre canvas, preview y vistas por seccion.
- El frente de archivos requiere saneamiento de contrato (estados y naming) para evitar confusiones y bugs de integracion.
- Con una regla unica de contenido efectivo y pequenos ajustes de contrato, el sistema puede quedar consistente extremo a extremo sin reescribir el modelo incremental actual.

---

## 10. Estado de implementacion (backend, inicio)

Implementado en esta iteracion:

1. Contrato de archivos con compatibilidad `size` + `tamaño`.
2. Respuestas de archivos y bloques de contenido ahora incluyen alias `size` para migracion gradual.
3. Listado de archivos web acepta estado `VERIFIED` y mantiene compatibilidad con `UPLOADED` legacy.
4. Middleware global de errores con soporte para errores de dominio (`code`, `message`, `details`, `httpStatus`).
5. FilesService migrado a errores de dominio para casos de negocio frecuentes (not found, not verified, conflictos).
6. Endpoint atomico de borrado texto+bloque agregado: `DELETE /content/text-blocks/:blockId`.

Pendiente para siguientes iteraciones:

1. Extender errores de dominio al resto de modulos (content/public/contacts/candidates).
2. Exponer y versionar formalmente enums de estado para frontend.
3. Definir deprecacion definitiva de `tamaño`.
4. Implementar la regla unica de contenido efectivo en frontend (canvas/preview/render).
