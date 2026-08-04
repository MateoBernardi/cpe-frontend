# Security headers (nginx / Caddy) — fuera de este repo

Fecha: 2026-07-28  
Alcance: headers HTTP de respuesta que la meta-CSP de `index.html`/`admin.html` no puede cubrir.  
Objetivo: bloque listo para pegar en el servidor estatico que sirve el SPA (no versionado en
este repo), y explicar por que la meta-CSP sola no alcanza.

---

## 1. Por que esto no puede vivir en este repo

El SPA se sirve desde un host estatico que no es este repositorio (Railway aloja los backends,
no el frontend), asi que no hay `nginx.conf`/`Caddyfile` propio donde setear headers. Una
meta-CSP en el `<head>` (la que ya tienen `index.html` y `admin.html`) cubre `script-src`,
`img-src`, `connect-src`, etc., pero:

- **No puede expresar `frame-ancestors`** — la spec de CSP prohibe explicitamente esa directiva
  en un `<meta>` (el navegador la ignora silenciosamente ahi). Es la unica defensa real contra
  clickjacking, y hoy no existe en ningun lado: no hay `X-Frame-Options` ni `frame-ancestors`.
- **No puede setear `Strict-Transport-Security`, `X-Content-Type-Options` ni `Referrer-Policy`**
  — son headers de respuesta HTTP, no directivas de documento; no tienen equivalente en `<meta>`.

Este archivo es el bloque a pegar en el servidor real. No reemplaza la meta-CSP existente: un
navegador que recibe CSP por header Y por meta-tag aplica la interseccion de ambas (mas
restrictivo gana), asi que agregar el header es un refuerzo, no un duplicado inutil.

---

## 2. nginx

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://clinicaparaempresas.com https://imagedelivery.net https://api.clinicaparaempresas.com; media-src 'self' blob: https://api.clinicaparaempresas.com; connect-src 'self' https://challenges.cloudflare.com https://imagedelivery.net https://upload.imagedelivery.net https://api.clinicaparaempresas.com https://foro.clinicaparaempresas.com; frame-src 'self' https://challenges.cloudflare.com https://www.youtube-nocookie.com; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

Nota: este bloque de `Content-Security-Policy` corresponde a `index.html` (el sitio publico).
Si `admin.html` se sirve bajo una location/vhost distinta, usar ahi la version sin Turnstile
ni YouTube (ver `admin.html` en este repo para el contenido exacto — `script-src 'self'`,
sin `frame-src` externo) mas `frame-ancestors 'none'` agregado igual.

Nota sobre `connect-src` y Cloudflare Images: hacen falta LOS DOS hosts, `imagedelivery.net` y
`upload.imagedelivery.net` — no son intercambiables ni uno implica el otro (CSP no tiene
wildcard implicito de subdominio). `upload.imagedelivery.net` es el endpoint de direct-creator-
upload (`src/features/foro/services/foroService.ts` hace `fetch(uploadUrl, {method:'POST',
body: FormData})` contra una URL que el backend devuelve en ese host); `imagedelivery.net` (sin
`upload.`) es el host de entrega publica de las imagenes ya subidas, usado en `img-src` para
mostrarlas. Sacar cualquiera de los dos de `connect-src` rompe la subida de imagenes sin tocar
la visualizacion (por eso el bug pudo pasar desapercibido).

Nota sobre `foro.clinicaparaempresas.com`: es el backend del foro (`VITE_FORO_API_BASE_URL`,
`src/features/foro/api/foroApiConfig.ts`), origen distinto de `api.clinicaparaempresas.com`.
CSP no tiene wildcard implicito de subdominio, asi que necesita su propia entrada aunque el
host padre ya este listado. Va en `connect-src` porque todo el trafico del foro es `fetch`:
las llamadas de `foroApiRequest.ts` y tambien las de better-auth (`/auth/get-session` y demas,
via el SDK en `foroAuthClient.ts`). Solo aplica al CSP de `index.html` — `/admin` no consume
el foro. Las imagenes del foro NO necesitan nada nuevo en `img-src`: se sirven desde
`imagedelivery.net` (Cloudflare Images), no desde este host.

## 3. Caddy

```caddyfile
header {
    Content-Security-Policy "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://clinicaparaempresas.com https://imagedelivery.net https://api.clinicaparaempresas.com; media-src 'self' blob: https://api.clinicaparaempresas.com; connect-src 'self' https://challenges.cloudflare.com https://imagedelivery.net https://upload.imagedelivery.net https://api.clinicaparaempresas.com https://foro.clinicaparaempresas.com; frame-src 'self' https://challenges.cloudflare.com https://www.youtube-nocookie.com; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
    Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    X-Content-Type-Options "nosniff"
    Referrer-Policy "strict-origin-when-cross-origin"
    -Server
}
```

Misma nota que en nginx: swap del valor de `Content-Security-Policy` por la variante de
`admin.html` si ese entry point se sirve por una ruta/host separado.

---

## 4. Por que cada header

- **`Content-Security-Policy` (header)**: mismo contenido que la meta-CSP de cada HTML, mas
  `frame-ancestors 'none'` — hoy no hay ningun mecanismo anti-clickjacking activo. No reemplaza
  la meta-CSP; el navegador aplica ambas.
- **`Strict-Transport-Security`**: fuerza HTTPS en todas las requests futuras del browser a este
  host, incluso si alguien pega un link `http://` o hay un intento de downgrade en la red.
  Imposible de expresar en un `<meta>` tag.
- **`X-Content-Type-Options: nosniff`**: evita que el browser "adivine" el tipo de un archivo
  servido (ej. interpretar un `.txt` subido por un usuario como HTML/JS ejecutable) —
  mitigacion barata contra XSS via MIME-sniffing.
- **`Referrer-Policy: strict-origin-when-cross-origin`**: evita filtrar el path/query completo
  (que puede llevar ids o tokens) al navegar hacia un sitio externo, sin romper analytics
  same-origin.

---

## 5. Notas / deuda conocida

- **`worker-src 'self' blob:` solo en los meta tags**: el cliente HMR de Vite crea un Worker
  desde una `blob:` URL; sin la directiva el fallback es `script-src` (que no lista `blob:`) y
  el dev server llena la consola de errores. Deliberadamente NO esta en los bloques de
  nginx/Caddy: en produccion no se crea ningun worker, y al aplicarse la interseccion de
  politicas el header sin `worker-src` lo bloquea igual (mismo mecanismo que `localhost` y
  picsum).
- **`http://localhost:*` en `connect-src`**: presente en ambos HTML entry points
  (`index.html` y `admin.html`) y no deberia llegar a produccion. Sacarlo requiere inyectar la
  CSP en build-time por entorno (dev vs prod), que es un cambio de pipeline mayor a este ajuste
  puntual de headers — queda flageado, no resuelto aca.
- **Cloudflare R2 sin host en `connect-src`**: `fileService.uploadToR2`
  (`src/features/content/services/fileService.ts`) hace un `fetch(PUT)` directo a una URL
  presignada de R2 — usado por el formulario publico de subida de CV
  (`useCandidateFormViewModel`) y por la edicion de secciones en `/admin`
  (`useAdminSectionViewModel`). Ninguna CSP actual (ni la meta-tag existente en `index.html`, ni
  la nueva de `admin.html`, ni los bloques de este documento) lista un host de R2 en
  `connect-src`. Si el CSP se enforce estrictamente contra esas requests, la subida rompe.
  **No se agrega un host ni un wildcard aca a proposito**: la URL presignada es dinamica
  (bucket/cuenta especificos de Cloudflare, o un dominio custom no documentado en el codigo
  estatico) y no es derivable de forma confiable sin consultar la config real del backend/R2.
  Adivinar un hostname o abrir `connect-src` con un wildcard amplio (`https://*.r2.dev` o
  similar) seria peor que dejar el gap documentado: agregaria superficie de ataque real a
  cambio de una suposicion no verificada. Queda como hallazgo para resolver en el proximo ajuste
  de CSP, confirmando primero el host real contra la config de R2/backend.
- **`https://picsum.photos` + `https://fastly.picsum.photos` en `img-src`, sólo en el meta tag**: las 10 publicaciones de demo
  que crea `pnpm db:seed` en el backend (`cpe-foro-backend/src/db/seed.ts`) tienen
  `front_image_url` apuntando a ese servicio de imagenes de relleno. Está agregado en
  `index.html` para que el foro se vea completo en desarrollo, y **deliberadamente NO está en
  los bloques de nginx/Caddy de este documento**: el navegador aplica la interseccion de todas
  las politicas CSP activas, asi que en cuanto el header de produccion esté puesto, picsum
  queda bloqueado igual. No es contenido real y no tiene por que estar permitido en prod.
  Hacen falta los DOS hosts: `picsum.photos` responde un 302 a `fastly.picsum.photos` (su CDN)
  y CSP re-chequea la URL destino del redirect contra la lista — no hereda el permiso del
  host original. Listar sólo el primero deja la imagen bloqueada igual.
  **Corolario importante**: mientras el header de produccion NO esté deployado, la meta-tag
  manda sola y picsum SÍ queda permitido — una razon mas para aplicar estos headers.
