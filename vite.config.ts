import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Dev-only: Vite's dev server only serves `foro.html` at the exact path
 * `/foro.html` (per the `build.rollupOptions.input` multi-page entries).
 * The foro SPA, however, is given a `/foro.html` basename in dev (see
 * `src/apps/foro/App.tsx`) so its client-side routes render as
 * `/foro.html/publicaciones/5`, `/foro.html/?tipo=paper`, etc. Without this
 * rewrite, a hard navigation/refresh on any of those sub-paths 404s past
 * Vite's multi-page resolution and falls through to `index.html` (the main
 * app). Rewriting the request URL back to the bare `/foro.html` before it
 * reaches Vite's built-in middlewares lets the SPA's router take over from
 * `window.location` on load, same as any other client-side router refresh.
 * Prod serves the foro build at a subdomain root (no basename), so this
 * plugin only ever matters for `npm run dev` / `dev:foro`.
 */
function foroDeepLinkFallback(): Plugin {
  return {
    name: 'foro-deep-link-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && /^\/foro\.html\//.test(req.url)) {
          req.url = '/foro.html'
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), foroDeepLinkFallback()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
      '@apps': path.resolve(__dirname, './src/apps'),
    },
  },
  server: {
    allowedHosts: ['f8e3-2800-40-86-481-c5b8-a60b-3b8e-610c.ngrok-free.app'],
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html'),
        foro: path.resolve(__dirname, 'foro.html'),
      },
    },
  },
})
