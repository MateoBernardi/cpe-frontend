# Arquitectura Frontend — CPE (Clínica para Empresas)

Documento de referencia para replicar este frontend en otra institución.
Cubre la app pública, el panel admin, los flujos de contenido, autenticación, subida de archivos y reglas de renderizado.

---

## 1. Visión General

Este proyecto contiene **dos SPAs independientes** que se construyen por separado y comparten librerías:

| App | Entry point | Build output | Acceso |
|-----|-------------|--------------|--------|
| **Main** (pública) | `index.html` → `src/apps/main/main.tsx` | `dist-main/` | Público, sin auth |
| **Admin** | `admin.html` → `src/apps/admin/admin.tsx` | `dist-admin/` | Protegido por Cloudflare Zero Trust |

**Stack:** React 19 + TypeScript 5.9 + Vite 7 + Tailwind 3 + TanStack Query 5 + React Router 7 + Lenis (scroll suave).

**No hay Firebase, Supabase ni Redux.** El backend es una API REST propia. El almacenamiento de archivos es Cloudflare R2.

```
src/
├── apps/
│   ├── main/      ← SPA pública
│   └── admin/     ← SPA admin
├── features/
│   ├── content/   ← CMS (secciones, bloques, media, archivos)
│   └── contact/   ← Formularios (contacto, postulaciones, puestos)
└── shared/
    ├── api/       ← Cliente HTTP
    ├── components/← Layout, ErrorBoundary, Spinner
    └── hooks/     ← useScrollProgress, useSmoothScroll, etc.
```

---

## 2. Autenticación y Tokens

### Cloudflare Zero Trust (único mecanismo de auth)

No hay login propio. La autenticación la delega Cloudflare:

1. El dominio admin está protegido por una **Cloudflare Access Policy**.
2. Cloudflare autentica al usuario (Google, email OTP, etc.) y deposita una cookie `CF_Authorization` en el browser.
3. El frontend extrae ese token de la cookie y lo envía como header en cada request al backend.

```typescript
// src/shared/api/apiRequest.ts
function getCfAccessToken(): string | null {
  const match = document.cookie.match(/CF_Authorization=([^;]+)/)
  return match ? match[1] : null
}
```

**Header que se agrega a cada request:**
```
cf-access-jwt-assertion: <jwt-token-de-la-cookie>
```

**Si no hay token:** el request se envía sin ese header. Si el backend lo requiere, devuelve 401 o 403.

**Si el backend devuelve 403:** se dispara un evento `app:forbidden-tenant` en `window`, que el `AdminLayout` captura para mostrar un mensaje de error. Esto indica que el usuario está autenticado en CF pero no tiene tenant asignado en la base de datos.

### Tenant ID

Todo request incluye el header:
```
x-tenant-id: 1
```

Está hardcodeado en `src/shared/api/apiConfig.ts`:
```typescript
const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  CONTENT_PREFIX: '/content',
  PUBLIC_PREFIX: '/public',
  TENANT_ID: '1',       // ← cambiar por tenant de la nueva institución
}
```

**Para adaptar a otra institución:** cambiar `TENANT_ID` y `VITE_API_BASE_URL` en el `.env`.

### Dónde aplica auth

| Endpoint | Auth necesaria |
|----------|----------------|
| `GET /public/**` | No (sin headers requeridos) |
| `POST /public/**` | No (rate-limited por IP) |
| `GET /content/**` | Sí (CF token + tenant) |
| `POST /content/**` | Sí |
| `PATCH /content/**` | Sí |
| `DELETE /content/**` | Sí |

La app pública **nunca envía** el CF token porque no lo necesita. La app admin siempre lo incluye automáticamente porque está en el mismo dominio donde CF depositó la cookie.

---

## 3. Cliente HTTP (`src/shared/api/apiRequest.ts`)

### `apiRequest<TResponse>(options)` — requests JSON

Construye todos los headers automáticamente:

```typescript
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'x-tenant-id': ENV.TENANT_ID,
  // + cf-access-jwt-assertion si hay cookie CF_Authorization
  // + Authorization: Bearer <token> si se pasa token explícito (no usado actualmente)
}
```

Siempre usa `credentials: 'include'` para que el browser envíe cookies.

**Request coalescing:** Si hay dos requests GET idénticos en vuelo al mismo tiempo (misma URL + mismo tenant), el segundo se reutiliza la misma `Promise` en lugar de hacer dos fetch. Esto evita duplicados en renders concurrentes.

**Rate limiting (429):** Lee el header `Retry-After` y expone `retryAfterMs` en el error. TanStack Query lo usa para reintentar con backoff automático.

**Mapeo de errores:**
```
400 → 'validation'   (datos inválidos)
401 → 'auth'         (sesión expirada)
403 → 'forbidden'    (sin tenant asignado)
404 → 'not-found'
429 → 'rate-limit'
5xx → 'server'
```

### `apiUpload<TResponse>(endpoint, formData)` — multipart

Para subir imágenes al backend (NO para subir archivos a R2). No setea `Content-Type` — el browser lo hace con el boundary correcto.

---

## 4. CMS de Contenido — Conceptos Clave

### Modelo de datos

```
Section (sección de página)
  └── Block[] (bloques dentro de la sección)
        ├── type: 'text' | 'media' | 'file'
        ├── role: string        ← qué función cumple (ej: 'headline', 'photo')
        ├── order: number       ← posición relativa entre bloques del mismo rol
        ├── status: 'DRAFTED' | 'PUBLISHED'
        └── text / media / file  ← contenido embebido
```

**Sección:** un bloque temático de una página (ej: `hero`, `about`, `news`). Identificada por nombre (`string`) y por ID numérico.

**Bloque:** la unidad mínima de contenido. Cada bloque tiene exactamente una de las tres opciones: texto, media o archivo.

**Rol:** etiqueta semántica que determina cómo renderiza el componente. El frontend busca bloques por rol, no por posición en el array. Ejemplos de roles:
- Texto: `headline`, `subheading`, `paragraph`, `bullet`, `cta`, `cta_secondary`, `trust`, `bio`, `quote`, `subtitle`, `heading`, `info`, `form_heading`, `form_paragraph`, `cta_heading`
- Media: `background`, `photo`, `thumbnail`, `diagram`, `icon`

**Estado (DRAFTED / PUBLISHED):**
- `DRAFTED`: borrador. Visible en el admin, invisible en el frontend público.
- `PUBLISHED`: publicado. Visible en ambos.
- Si existe un DRAFTED y un PUBLISHED para el mismo `role+order`, el DRAFTED tiene prioridad en el admin (se muestra como versión "pendiente").

### Ciclo de vida del contenido

```
Admin escribe texto / sube imagen
        ↓
Backend crea bloque con status = DRAFTED
        ↓
Admin visualiza en Preview (DRAFTED prioritario)
        ↓
Admin hace click en "Guardar cambios"
        ↓
POST /content/sections/:id/publish → DRAFTED → PUBLISHED
        ↓
Frontend público lo ve en GET /public/sections/:name
```

**El botón "Guardar cambios":**
- Solo está habilitado (`!disabled`) cuando `hasDrafts === true`, es decir, cuando alguna sección tiene bloques con `status === 'DRAFTED'`.
- Al hacer click llama `POST /content/sections/:sectionId/publish` para cada sección que tenga borradores (en paralelo con `Promise.all`).
- Después de publicar, invalida toda la caché de TanStack Query para forzar un refetch.

---

## 5. Secciones del Sitio — Mapa Completo

### App Pública (`/`)

| Ruta | Componente de página | Secciones del CMS usadas |
|------|---------------------|--------------------------|
| `/` | `HomePage` | `hero`, `about`, `teaser_circuit`, `teaser_clinica`, `teaser_traspaso`, `info_primary`, `info_secondary`, `secondary_hero` |
| `/news` | `NewsPage` | `news` |
| `/contact` | `ContactPage` | `contact_form` |
| `/servicios/intervencion-directa` | `IntervencionDirectaPage` | `service_intervencion` |
| `/servicios/seleccion-de-personal` | `SeleccionPersonalPage` | `service_seleccion` |
| `/servicios/acompanamiento` | `AcompanamientoPage` | `service_acompanamiento` |
| `/servicios/clinica-para-empresarios` | `ClinicaEmpresariosPage` | `service_clinica_empresarios` |
| `/servicios/traspaso-generacional` | `TraspasoGeneracionalPage` | `traspaso_generacional` |

### App Admin (`/admin.html`)

| Ruta | Página |
|------|--------|
| `/admin/` | `AdminDashboard` |
| `/admin/sections` | Lista de secciones |
| `/admin/sections/:sectionId` | Editor de sección (SectionCanvasEditor) |
| `/admin/preview` | Previsualización + botón publicar |
| `/admin/gallery` | Galería de imágenes |
| `/admin/contacts` | Leads de contacto |
| `/admin/candidates` | Postulaciones laborales |
| `/admin/candidates/:id` | Detalle de postulante |

---

## 6. Roles por Sección — Referencia Exacta

Esta tabla define qué roles espera cada componente de renderizado. El admin debe cargar contenido con estos roles exactos para que aparezca correctamente.

### `hero` — Portada Principal

| Rol | Tipo | Cantidad | Descripción |
|-----|------|----------|-------------|
| `headline` | texto | 1 | Título principal (máx. 80 chars) |
| `subheading` | texto | 1 | Subtítulo de transformación (máx. 150) |
| `cta` | texto | 1 | Texto del botón primario (máx. 40) |
| `cta_secondary` | texto | 1 | Texto del botón secundario (máx. 40) |
| `trust` | texto | 1 | Barra de confianza (máx. 80) |
| `background` | media | N | Imágenes del carrusel de fondo (recomendado 1920×1080) |

> Si `cta` o `cta_secondary` no tienen texto, el botón no se renderiza.

### `secondary_hero`

| Rol | Tipo | Cantidad | Descripción |
|-----|------|----------|-------------|
| `heading` | texto | 1 | Encabezado (máx. 100) |
| `subtitle` | texto | 1 | Subtítulo (máx. 100) |
| `cta` | texto | 1 | Texto del CTA (máx. 120) |
| `photo` | media | 1 | Imagen destacada 16:9 (rec. 1200×675) |

### `about` — Nosotros

| Rol | Tipo | Cantidad | Descripción |
|-----|------|----------|-------------|
| `heading` | texto | 1 | Título de sección |
| `bio` | texto | 2 | Nombre/rol por persona (slotIndex 0 y 1) |
| `paragraph` | texto | 2 | Descripción por persona (slotIndex 0 y 1) |
| `photo` | media | 2 | Foto retrato 3:4 por persona (rec. 600×800) |

### `news` — Novedades

| Rol | Tipo | Cantidad | Descripción |
|-----|------|----------|-------------|
| `heading` | texto | 1 | Título de sección |
| `paragraph` | texto | N | Cada `paragraph` = una novedad (múltiples) |
| `thumbnail` | media | N | Imagen de cada novedad (emparejada por order) |

### `info_primary` — Información Principal

| Rol | Tipo | Cantidad | Descripción |
|-----|------|----------|-------------|
| `heading` | texto | 1 | Título de sección |
| `bullet` | texto | N | Cada bullet = un punto clave |
| `diagram` | media | 1 | Imagen/diagrama izquierda (rec. 600×600) |
| `icon` | media | N | Íconos (uno por bullet, emparejados por order) |

### `info_secondary` — Información Secundaria (dona + acordeones)

| Rol | Tipo | Cantidad | Descripción |
|-----|------|----------|-------------|
| `heading` | texto | 1 | Título de sección |
| `paragraph` | texto | N | Título de cada porción de la dona |
| `quote` | texto | N | Descripción desplegable de cada porción (emparejada por order) |

### `contact_form` — Formulario de Contacto

| Rol | Tipo | Cantidad | Descripción |
|-----|------|----------|-------------|
| `info` | texto | 1 | Texto informativo debajo del formulario |

> Los campos del formulario son fijos en código. No son editables desde el admin.

### `service_*` / `traspaso_generacional` — Páginas de Servicio

Estos 5 nombres (`service_intervencion`, `service_seleccion`, `service_acompanamiento`, `service_clinica_empresarios`, `traspaso_generacional`) comparten el mismo layout base:

| Rol | Tipo | Cantidad | Descripción |
|-----|------|----------|-------------|
| `heading` | texto | 1 | Título del servicio |
| `subtitle` | texto | 1 | Objetivo (se muestra en caja teal) |
| `paragraph` | texto | N | Párrafos descriptivos |
| `bullet` | texto | N | Ejes de trabajo |
| `cta_heading` | texto | 1 | Título del bloque CTA (máx. 80) |
| `cta` | texto | 1 | Texto del botón CTA (máx. 40) |
| `photo` | media | 1 | Foto del servicio 4:3 (rec. 800×600) |

`service_seleccion` además tiene:

| Rol | Tipo | Cantidad | Descripción |
|-----|------|----------|-------------|
| `form_heading` | texto | 1 | Título del formulario de postulación |
| `form_paragraph` | texto | 1 | Texto introductorio del formulario |

### Teasers

**`teaser_circuit`:** Solo `heading` (texto, 1).
**`teaser_clinica`:** `heading`, `subtitle`, `cta` (texto, 1 cada uno).
**`teaser_traspaso`:** `heading`, `subtitle`, `cta` (texto, 1 cada uno).

---

## 7. Cómo el Admin Carga Contenido

### Flujo general

1. Admin va a `/admin/sections` → ve la lista de secciones del tenant.
2. Hace click en una sección → va a `/admin/sections/:sectionId`.
3. El `SectionCanvasEditor` muestra un "canvas" con **slots** definidos en `CANVAS_CONFIGS` (`src/features/content/config/sectionCanvasConfig.ts`).
4. Cada slot corresponde exactamente a un rol esperado por el componente de renderizado.
5. El admin edita texto en el slot → se crea/actualiza un bloque `DRAFTED`.
6. El admin sube imágenes en los slots de media → se crea un bloque `DRAFTED`.
7. Va a `/admin/preview` → ve cómo quedaría el sitio con los borradores aplicados.
8. Hace click en "Guardar cambios" → todos los borradores pasan a `PUBLISHED`.

### Creación de texto (slot)

Al confirmar el texto en un slot:
```
POST /content/sections/:sectionId/content
Body: { texts: [{ body: "...", role: "headline", order: 0 }] }
```
Crea un bloque `DRAFTED`. Si ya existe uno `PUBLISHED` para ese mismo `role+order`, el DRAFTED lo "cubre" en el admin hasta que se publique.

Para editar un texto ya existente (PATCH in-place):
```
PATCH /content/texts/:textId
Body: { body: "nuevo texto" }
```

### Subida de imágenes

**Flujo de imagen como DRAFTED** (permite reordenar antes de publicar):
```
POST /content/media/draft    ← multipart: image, section_id, role, order, title
Respuesta: { media: { id, url, mime_type, title, block_id } }
```
La imagen queda en el servidor local como DRAFTED.

**Publicar imagen** (mueve a Cloudflare CDN):
```
POST /content/media/:mediaId/publish
Body: { block_id: <blockId> }
```

**Alternativa — asignar desde galería:**
```
POST /content/sections/:sectionId/content
Body: { media: [{ media_id: 42, role: "photo", order: 0 }] }
```
Reutiliza una imagen ya subida.

### Reordenar bloques

- Si ambos bloques son DRAFTED: `PATCH /content/blocks/:blockIdA` + `PATCH /content/blocks/:blockIdB` (intercambio de `order` en paralelo).
- Si alguno es PUBLISHED: se crean nuevos DRAFTED con los órdenes intercambiados (no se modifica el PUBLISHED directamente).
- Solo se puede reordenar entre bloques del **mismo rol**.

### Eliminar bloques

- Eliminar texto: `DELETE /content/blocks/:blockId` + `DELETE /content/texts/:textId`.
- Eliminar media de sección (la imagen queda en galería): solo `DELETE /content/blocks/:blockId`.
- Soft delete — el backend no borra físicamente.

### El botón "Publicar" / "Guardar cambios"

```typescript
// Habilitado solo cuando existe al menos un bloque DRAFTED en alguna sección
disabled={!hasChanges || publishMut.isPending}
```

Al hacer click:
```typescript
// Para cada sección que tiene DRAFTED:
POST /content/sections/:sectionId/publish
// Se ejecutan todos en paralelo con Promise.all
```

Después de publicar, se invalida toda la caché: `qc.refetchQueries({ queryKey: ['content'] })`.

**"Descartar borradores":**
- Solo visible cuando `hasChanges === true`.
- Llama `DELETE /content/blocks/:blockId` para cada bloque DRAFTED de cada sección afectada (en paralelo).

---

## 8. Cómo el Frontend Público Renderiza Contenido

### Fetch de secciones

Cada página llama al hook `useSectionViewModel(sectionName)` o `useMultipleSectionsViewModel([...names])`:

```typescript
// TanStack Query con 30 min de staleTime
useQuery({
  queryKey: ['public', 'section', sectionName],
  queryFn: () => contentService.getPublicSection(sectionName),
  staleTime: 1000 * 60 * 30,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
})
```

Endpoint:
```
GET /public/sections/:sectionName
Respuesta: { section: { id, name, blocks: PublicBlockDTO[] } }
```

El endpoint solo devuelve bloques `PUBLISHED`. El frontend nunca ve borradores.

### `SectionRenderer`

Recibe un objeto `Section` (el modelo mapeado desde el DTO) y despacha al componente correcto:

```typescript
const SECTION_LAYOUTS = {
  hero: HeroSection,
  about: AboutSection,
  news: NewsSection,
  // ... (uno por cada nombre de sección)
}

const Layout = SECTION_LAYOUTS[section.name]
if (Layout) return <Layout section={section} />
// fallback genérico si no hay layout registrado
```

### Cómo cada componente consume los bloques

Los componentes reciben el objeto `Section` con arrays `texts[]`, `media[]` y `files[]` (ya mapeados desde los bloques). Buscan por rol:

```typescript
// Ejemplo dentro de HeroSection:
const headline = section.texts.find(t => t.role === 'headline')
const backgrounds = section.media.filter(m => m.role === 'background')
const cta = section.texts.find(t => t.role === 'cta')

// Si no hay headline, no renderiza el título
// Si no hay cta, no renderiza el botón
```

**Regla general:** si un rol no tiene contenido, el elemento correspondiente simplemente no se renderiza. No hay crashes por contenido faltante.

---

## 9. Subida de Archivos a R2 (Presigned URL)

Se usa para CVs de postulantes y para adjuntos del admin. El archivo **nunca pasa por el backend** — va directo a Cloudflare R2.

### Flujo completo (3 pasos)

**Paso 1 — Solicitar URL prefirmada:**
```
POST /content/files/upload-url   (admin)
POST /public/files/upload-url    (público, solo PDF ≤ 5 MB)
Body: {
  filename: "cv.pdf",
  content_type: "application/pdf",
  title: "CV Juan Pérez",
  max_size: 5242880,     // opcional
  section_id: 12,        // opcional, si se vincula a sección
  role: "document",      // opcional
  order: 0               // opcional
}
Respuesta: {
  file_id: 42,
  block_id: 99,          // solo si se vinculó a sección
  upload: { url: "https://r2.cloudflare.com/..." }
}
```

**Paso 2 — Subir directo a R2:**
```
PUT {upload.url}
Headers: { 'Content-Type': 'application/pdf' }
Body: <binary file>
```
Este request **no incluye** headers de auth ni tenant. Va directamente a R2.

**Paso 3 — Confirmar al backend:**
```
POST /content/files/:fileId/confirm   (admin)
POST /public/files/:fileId/confirm    (público)
Body: { tamaño: 204800 }   // tamaño en bytes del archivo
Respuesta: { id: 42, state: "PENDING" }
```

**Estados del archivo:**
- `PENDING` → acaba de confirmarse
- `QUARANTINE` → en análisis antivirus
- `VERIFIED` → limpio, disponible
- `REJECTED` → bloqueado

### Cuándo usar la versión pública vs admin

- **`/public/files/...`**: formulario de postulación (usuario sin auth). Solo acepta PDF, máx 5 MB. Rate-limited.
- **`/content/files/...`**: subida desde el panel admin. Acepta cualquier tipo, puede vincularse a secciones.

---

## 10. Formularios Públicos

### Formulario de Contacto (`ContactFormSection`)

**Estado:** gestionado localmente con `useState`. **Actualmente no integrado con la API** — el submit no hace ningún request.

Campos del form (para integrar con `POST /public/contacts`):
```typescript
{
  name: string,
  email: string,
  town: string,
  address: string,
  phone_number?: string,
  number_of_people: number,
  message?: string
}
```

### Formulario de Postulación (`RecruitmentFormSection`)

Completamente integrado con la API. Usa el hook `useCandidateFormViewModel`.

**Campos:**
```typescript
{
  name: string,           // obligatorio
  surname: string,        // obligatorio
  email: string,          // obligatorio
  phone_number?: string,
  id_interest: number,    // ID del puesto seleccionado (obligatorio)
  experience: string,     // obligatorio
  modality: string,       // 'Presencial' | 'Remoto' | 'Híbrido' (obligatorio)
  incorporation_time: string,  // obligatorio
  message?: string,
  file_id: number,        // ID del archivo (CV) ya subido a R2 (obligatorio)
}
```

**Flujo de submit:**

1. Validación local (todos los campos obligatorios + privacyAccepted).
2. `setIsSubmitting(true)`, `setStep('Subiendo CV…')`.
3. `fileService.uploadPublicFile(file, title)` → ejecuta los 3 pasos de R2 y devuelve `{ fileId }`.
4. `setStep('Enviando postulación…')`.
5. `contactService.submitCandidate({ ...form, file_id: fileId })` → `POST /public/candidates`.
6. En éxito: `setSuccess(true)`, resetear form y archivo.
7. En error 429: mensaje "Demasiados envíos. Intentá de nuevo en 24 horas."

**Cuándo habilitar el botón de submit:**
```typescript
const canSubmit = isFormComplete && !!file && privacyAccepted && !isSubmitting
// isFormComplete = todos los campos obligatorios con texto no vacío
```

**Carga de puestos disponibles:**
```
GET /public/interests
Respuesta: { interests: [{ id, name, active }] }
```
Se ejecuta al montar el componente. Si falla con 429, TanStack Query reintenta hasta 3 veces con backoff exponencial.

---

## 11. Gestión de Puestos (Admin)

Desde el panel admin se pueden crear y modificar los puestos de trabajo disponibles para el formulario de postulación.

```
GET  /content/interests          → lista todos los puestos
POST /content/interests          → crear puesto { name, active }
PATCH /content/interests/:id     → modificar puesto { name?, active? }
```

Los puestos con `active: true` son los que aparecen en el selector del formulario público.

---

## 12. Galería de Imágenes

```
GET /content/gallery
Respuesta: {
  media: [{
    id, url, mime_type, title, origin, created_at,
    associations: [{ block_id, section_id, section_name, role }]
  }]
}
```

La galería muestra todas las imágenes subidas por el tenant. Desde allí se pueden asignar imágenes existentes a secciones sin necesidad de subirlas de nuevo.

---

## 13. Configuración de TanStack Query

### App Pública (30 min de caché)
```typescript
QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        // Solo reintentar en 429, máx 3 veces
        if (error instanceof ApiError && error.status === 429)
          return failureCount < 3
        return false
      },
      retryDelay: (attempt, error) => {
        // Usar Retry-After si existe, sino backoff exponencial
        if (error instanceof ApiError && error.retryAfterMs != null)
          return error.retryAfterMs
        return Math.min(1000 * (2 ** (attempt - 1)), 4000)
      },
    },
  },
})
```

### App Admin (5 min de caché, retry: 1)
```typescript
QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})
```

---

## 14. Construcción y Variables de Entorno

### Scripts de build
```bash
npm run dev          # dev server (ambas apps juntas, índice en /)
npm run dev:admin    # dev abriendo /admin.html
npm run build:main   # solo app pública → dist-main/
npm run build:admin  # solo admin → dist-admin/
npm run build:all    # ambas
```

### Variables de entorno (`.env`)
```
VITE_API_BASE_URL=https://api.tu-institucion.com
```

Los secrets de Cloudflare Access (Client-ID y Client-Secret) se usan en el backend/proxy, **no deben estar en el frontend público**. Si estaban en `.env` en esta repo, es un error de seguridad — moverlos a `.env.local` o a variables de CI/CD.

### Aliases de importación
```
@        → src/
@shared  → src/shared/
@features → src/features/
@apps    → src/apps/
```

---

## 15. Checklist para Adaptar a Otra Institución

1. **`apiConfig.ts`:** cambiar `API_BASE_URL` y `TENANT_ID`.
2. **Secciones:** las secciones en el backend deben existir con los mismos nombres (`hero`, `about`, etc.) para que el SectionRenderer las encuentre. Agregar nuevas secciones requiere:
   - Nuevo componente en `src/features/content/components/sections/`
   - Registrar en `SECTION_LAYOUTS` en `SectionRenderer.tsx`
   - Agregar config de canvas en `CANVAS_CONFIGS` (`sectionCanvasConfig.ts`)
   - Agregar roles en `SECTION_ROLES` (`sectionRoles.ts`)
3. **Rutas públicas (`router.tsx`):** ajustar según la estructura de páginas de la nueva institución.
4. **`PREVIEW_GROUPS` en `AdminPreviewPage`:** actualizar para agrupar las secciones de la nueva institución.
5. **Cloudflare Access:** configurar la política de acceso para el dominio admin de la nueva institución.
6. **Tenant en backend:** crear el tenant con `id = 1` (o ajustar el `TENANT_ID` al valor correcto).
7. **Logo y marca:** `public/cpeLogo.png`, `public/cpeTAB.jpeg`, y colores en `src/theme.ts`.
8. **WhatsApp FAB:** número hardcodeado en `src/shared/components/WhatsAppFab.tsx`.

---

## 16. Flujo End-to-End de Referencia — Publicar Contenido

```
Admin abre /admin/sections
         ↓
GET /content/sections → lista de secciones del tenant
         ↓
Admin hace click en "Portada Principal" (hero)
         ↓
GET /content/sections/:id → carga blocks actuales (DRAFTED + PUBLISHED)
         ↓
SectionCanvasEditor muestra los slots vacíos/con contenido
         ↓
Admin escribe el título en el slot "headline"
         ↓
POST /content/sections/:id/content
  { texts: [{ body: "Texto...", role: "headline", order: 0 }] }
         ↓
Backend devuelve bloque DRAFTED
         ↓
Admin arrastra imagen al slot "background"
         ↓
POST /content/media/draft  (multipart: image + section_id + role + order)
         ↓
Backend guarda imagen localmente, devuelve bloque DRAFTED
         ↓
Admin va a /admin/preview
         ↓
GET /content/sections/:id/preview (para cada sección, en paralelo)
         ↓
SectionRenderer renderiza con DRAFTED prioritario (preview)
         ↓
Banner: "Hay cambios sin publicar"
Botón "Guardar cambios" habilitado
         ↓
Admin hace click en "Guardar cambios"
         ↓
POST /content/sections/:id/publish (para cada sección con DRAFTED)
         ↓
DRAFTED → PUBLISHED en el backend
         ↓
qc.refetchQueries(['content']) → caché invalidada
         ↓
Frontend público ya puede ver el contenido
  GET /public/sections/hero → solo bloques PUBLISHED
```
