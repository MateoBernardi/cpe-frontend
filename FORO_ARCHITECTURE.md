# Foro Subdomain — Architecture & Knowledge Base (RAG)

Reference for future sessions working on the **Foro** (forum / content hub) added to the CPE
frontend. Complements `ARQUITECTURA_FRONTEND.md` (which documents the main + admin apps). Read this
before touching anything under `src/apps/foro`, `src/features/foro`, the shared header/footer, or the
foro backend.

---

## 1. What the Foro is

A **third independent SPA** alongside `main` and `admin`, built with the same pattern:

| App | Entry | Build | Backend |
|-----|-------|-------|---------|
| main (public) | `index.html` → `src/apps/main/main.tsx` | `dist-main/` | Content backend (CF Zero Trust, `x-tenant-id:1`) |
| admin | `admin.html` → `src/apps/admin/admin.tsx` | `dist-admin/` | Content backend |
| **foro** | `foro.html` → `src/apps/foro/foro.tsx` | `dist-foro/` | **Foro backend** (separate: Better Auth, no tenant) |

- Scripts: `npm run dev:foro`, `npm run build:foro` (in `build:all`). Config: `vite.config.foro.ts`.
- The Foro talks to its **own backend** at `/home/mateo/cpe-foro-backend` — a *different* backend from
  main/admin. Its endpoints are also consumed by the main app (home preview) and the admin app
  (publisher space).

## 2. Two backends, do not confuse them

| | Content backend (main/admin) | **Foro backend** (`/home/mateo/cpe-foro-backend`) |
|---|---|---|
| Auth | Cloudflare Zero Trust (`cf-access-jwt-assertion`) | **Better Auth**, cookie `better-auth.session_token`, `credentials:'include'` |
| Tenant | `x-tenant-id: 1` header | **single-tenant — never send `x-tenant-id`** |
| Case | mixed | **snake_case everywhere** (request + response) |
| Stack | — | Express 5 + Drizzle + Postgres + Cloudflare Images |
| Base URL (frontend) | `VITE_API_BASE_URL` | `VITE_FORO_API_BASE_URL` (default `http://localhost:3000`) |

## 3. Frontend structure

- **`src/features/foro/`** — shared module consumed by all three apps. Barrel: `@features/foro`.
  - `api/foroApiRequest.ts` + `foroApiConfig.ts` — client for the foro backend (own base URL,
    `credentials:'include'`, NO tenant header).
  - `foroService` — every endpoint. `dtos` (snake_case) / `models` (camelCase) / `mappers`.
  - Auth: `ForoAuthProvider` + `useForoAuth()` → `{ user, role, isAuthenticated, isLoading,
    signInEmail, signUpEmail, signInSocial, signOut, refetch, openAuthDialog, closeAuthDialog, ... }`.
  - `<ForoAuthDialog/>` (login/signup modal, portal, self-scoped), `<SubscribeButton/>` ("intelligent
    subscribe": logged-out → opens dialog; logged-in → "Cerrar sesión"). Helper `canPublish(role)`.
  - viewmodels: `usePublications`, `useInfinitePublications`, `useFeedsByType`, `usePublication`,
    `usePublicationTypes`, `useCategories`, `useTags`, `usePublicationMutations`, `useComments`,
    `useCommentMutations`, etc. Query keys: `foroKeys`.
- **`src/apps/foro/`** — the SPA. `ForoLayout` (header/footer/scope), `router` (`/`, `/publicaciones/:id`),
  pages (`HomePage`, `PublicationPage`), components (FeedStrip, PublicationDetail, CommentList/Composer…).
- **Shared chrome** (institutional look, used by main AND foro):
  - `src/shared/components/SiteHeader.tsx` — extracted from `MainLayout`. Parameterized by
    `navItems`, `onLogoClick`, `searchItems`, `trailing`, `forceActive`, `onContactClick`.
  - `src/shared/components/SiteFooter.tsx` — extracted footer. Prop `privacyTo` / `privacyExternal`.
  - Main app maps its `NAV_LINKS`/`SERVICE_LINKS`/`SEARCH_ITEMS` into these. Foro passes its own nav
    (Foro/Papers/Podcasts/Novedades/Discusión as `?tipo=<slug>` filters) + `<SubscribeButton/>` as `trailing`.

## 4. ⚠️ CRITICAL CSS gotchas (these caused real bugs)

- **`.foro-scope` is DUAL-USE. Do not put layout/page styling on it.**
  - It is (a) the page token/reset scope AND (b) the self-wrap used by portable widgets
    (`SubscribeButton`, `ForoAuthDialog` wrap themselves in `className="foro-scope"` so they can be
    dropped into main/admin chrome).
  - Page-root surface styling (`min-height:100vh`, `background`) lives on **`.foro-app`** (in
    `foro.css`), applied to ForoLayout's content `<div className="foro-scope foro-app">`. **Never move
    those back onto `.foro-scope`** — doing so stretched the `SubscribeButton`'s wrapper to `100vh`,
    turning it into a full-height column and blowing the header up to full viewport height.
- **The shared `SiteHeader`/`SiteFooter` render OUTSIDE `.foro-scope`.** `.foro-scope img { max-width:100% }`
  breaks the intentionally-oversized main logo (`h-72`, overflows a thin bar). Header/footer are
  institutional chrome — keep them out of the foro scope. Only page CONTENT is foro-scoped.
- Foro design tokens: `src/features/foro/styles/tokens.css` (`:root` vars, `.foro-scope` resets,
  `.foro-*` component classes) + `src/apps/foro/foro.css` (page layouts). Both imported via the app.
- **Request coalescing must NOT share an `AbortSignal`** (`src/features/foro/api/foroApiRequest.ts`).
  The client coalesces identical in-flight GETs into one shared promise — but that promise's `fetch`
  is bound to the FIRST caller's signal. React **StrictMode** (dev) mounts→unmounts→remounts, aborting
  the first request → the shared promise rejects with `AbortError` (browser: **`NS_BINDING_ABORTED`**)
  → the remount reuses that rejected promise → the query is left cancelled with NO data and never
  retries (retry is 429-only). Symptom: *nothing* loads (no types → "Categoría" fallback, no
  publications). Fix in place: only coalesce GETs with **no** signal (`signal === undefined`); React
  Query already dedupes by query key, so per-request coalescing is redundant for RQ-driven calls.
  The main app's `apiRequest` has the same latent pattern — don't reintroduce signal-bound coalescing.

## 5. ⚠️ Backend data-model gotchas

- **Publication PATCH FULL-REPLACES collection keys** (`tag_ids`, `category_ids`, `image_ids`,
  `external_links`). Any edit must resubmit the COMPLETE set to keep. (Bug we fixed: the admin edit
  form initialized `tagIds:[]`, silently wiping tags on save. Fix: resolve existing tag names→ids via
  `useTags()` in the prefill.)
- **Read/write asymmetry**: publications READ `tags: string[]` (names) but WRITE `tag_ids: number[]`;
  READ `external_links` as a `{label:url}` MAP but WRITE as `{label,url}[]` array.
- **Publication types**: resolve `type_id` at runtime via `GET /publication-types`
  (slugs `paper`/`podcast`/`novedad`/`discusion`, diacritics stripped). NEVER hardcode numeric ids.
  Frontend `resolveKnownSlug()` matches on the slug.
- **Interactions**: type ids `like=1, comentario=2, upvote=3, guardado=4, visita=5`. The interaction
  read DTO has **no author name** (only `user_id`) and returns `images:[{id,url,alt_text}]` (not
  `image_ids`). Comments render author as a generic fallback until the backend joins user names.
- **Discussion** screen is built on FLAT publication comments (`/interactions` type_id=2) — there is no
  thread/reply/best-answer model.

## 6. Auth model

Better Auth. Email/password IS enabled (plus Google/Apple OAuth). Roles: `visitor | publisher | admin`.
- `POST /auth/sign-up/email {email,password,name}` (new users → `visitor`), `POST /auth/sign-in/email`,
  `POST /auth/sign-in/social`, `GET /auth/get-session` (→ `{session,user:{id,name,email,role}}` | null),
  `POST /auth/sign-out`. All cookie-based; frontend uses `credentials:'include'`.
- **Bootstrap admin**: backend env `BOOTSTRAP_ADMIN_EMAIL` auto-promotes that email to `admin` on signup.
  Admin-only role management: `GET /users`, `PATCH /users/:id/role`.
- Admin "publisher space" lives at `/admin/foro/*`, gated by `useForoAuth()` role (`publisher`/`admin`).
  It authenticates against the FORO backend (separate session from admin's CF Zero Trust) → wrapped in
  its own `ForoAuthProvider`.

## 7. Endpoints (all snake_case, `credentials:'include'`, NO tenant header)

- `GET /publications?type_id=&category_id=&limit=&offset=` (all optional, coerced) → previews. `GET /publications/:id` → full. `POST/PATCH/DELETE` gated `publisher|admin`.
- `GET /publication-types` (public) → `[{id,name,slug}]`.
- `GET /categories`, `GET /tags` (**public reads**); writes gated. 
- `POST /interactions`, `GET /interactions/publication/:id?type_id=`, `PATCH/DELETE /interactions/:id`.
- Images (Cloudflare direct upload, `publisher|admin`): `POST /images/upload-url` → upload to returned
  `upload_url` → `POST /images {image_id,alt_text?}` → returns `{id,url}`; pass `id`s as `image_ids`.
- `GET /health`. Errors: Spanish messages + `code`; validation `400 VALIDATION_ERROR`; rate limit 100/15min/IP.
- CORS is env-driven (`ALLOWED_ORIGINS`, comma-separated); localhost 5173-5175 always allowed for dev.

## 8. What changed in main/admin

- **Novedades removed entirely**: no `/news` route/page, no `news` section/layout/config/roles, nav
  "Novedades" → **"Foro"** external button (`VITE_FORO_URL ?? '/foro.html'`).
- Main home gained a **Foro preview** section (`src/apps/main/components/ForoPreviewSection.tsx`) using
  `useFeedsByType` from `@features/foro` (public reads; renders nothing if the foro backend is down).
  Its two heros' COPY is CMS-editable via the **`foro_teaser`** content section (roles `heading`,
  `subheading`, `cta_heading`, `cta_paragraph`, `cta`), read with `useSectionViewModel('foro_teaser')`
  and falling back to hardcoded strings. Section is seeded by `cms-backend/prisma/seed.ts`
  (`npx prisma db seed`, tenant 1); registered in `sectionRoles.ts` + `sectionCanvasConfig.ts`. The
  publications themselves stay live from the foro backend (not CMS).
- **⚠️ Specificity trap when reusing foro classes inside the main app:** the preview mixes Tailwind
  utilities with `.foro-scope`, and `.foro-scope` element+class rules (0-1-1) BEAT Tailwind single-class
  utilities (0-1-0). Concretely `.foro-scope p { margin:0 }` kills `mt-*`/`mx-auto` on `<p>`, and
  `.foro-scope a { color:teal-700 }` kills `.foro-btn-teal { color:#fff }` on anchor buttons (teal-on-teal
  = invisible). Fix with inline `style` (highest specificity) for margins/centering/button color — don't
  rely on Tailwind utilities on bare `p`/`a` inside `.foro-scope`.

## 9. Local dev / deploy checklist

1. **DB** (docker): `cd /home/mateo/cpe-foro-backend && docker compose up -d db`. NOTE the host has a
   native Postgres on 5432, so `docker-compose.yml` maps the container to **host port 5433**;
   `.env` `DATABASE_URL` points at `localhost:5433`.
2. **Migrations**: `pnpm db:migrate` (must include `0006`/`0007`/`0008` = type slug, role seed, type seed).
3. **Backend `.env`** (local): `DATABASE_URL=...5433`, `BETTER_AUTH_SECRET` (32+ chars), empty
   GOOGLE/APPLE/CLOUDFLARE (OK for email-password dev), `BOOTSTRAP_ADMIN_EMAIL=<your email>`,
   `ALLOWED_ORIGINS` empty (dev origins auto-added).
4. **Frontend `.env`** (has real CF secrets — APPEND only): `VITE_FORO_API_BASE_URL=http://localhost:3000`,
   `VITE_FORO_URL=/foro.html`. (`VITE_MAIN_URL` used by the foro footer's privacy link; defaults to
   `https://clinicaparaempresas.com`.)
5. **Run**: backend `pnpm dev` (:3000), frontend `npm run dev:foro` (vite :5173 → /foro.html).
6. **Seed content**: `scratchpad/seed_foro_content.sql` (idempotent) seeds a publisher author + 8
   publications across the 4 types + categories/tags/links. `created_by` needs a real `user` row.
7. **Become admin**: sign up in the foro app with `BOOTSTRAP_ADMIN_EMAIL` → unlocks `/admin/foro`.

## 10. Verify builds

`npm run build:main && npm run build:admin && npm run build:foro` (all use one shared `tsc -b`; repo has
`noUnusedLocals`/`noUnusedParameters` — clean up dead imports when removing code). Backend: `pnpm build`,
`pnpm test`.
