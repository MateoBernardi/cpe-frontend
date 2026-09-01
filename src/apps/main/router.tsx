import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// Deep import, not `from '@shared/components'` (the barrel): that barrel is
// also what the admin app imports `AdminLayout`/`LoadingSpinner`/etc from,
// and merely re-exporting `MainLayout` there is enough to drag `MainLayout`
// (which imports `HeaderProfileButton` -> `@features/foro` -> `better-auth`)
// into admin's build graph, even though admin never renders it — Rollup
// still has to parse the module to resolve the barrel's re-export, and a
// handful of its (and its foro dependencies') module-scope calls
// (`createAuthClient(...)`, `createContext(...)`, `forwardRef(...)`) aren't
// provably side-effect-free, so their statements survive tree-shaking
// regardless of whether the bindings are ever used. See Part 7 of
// rustling-wobbling-bentley.md.
import MainLayout from '@shared/components/MainLayout'
import { DEFAULT_INTERACCION_ROUTE } from '@features/content/components/foro'
import HomePage from './pages/HomePage'
import ContactPage from './pages/ContactPage'
import IntervencionDirectaPage from './pages/IntervencionDirectaPage'
import SeleccionPersonalPage from './pages/SeleccionPersonalPage'
import AcompanamientoPage from './pages/AcompanamientoPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import RestablecerPasswordPage from './pages/RestablecerPasswordPage'
import VerificarEmailPage from './pages/VerificarEmailPage'
import InteraccionSeccionPage from './pages/foro/InteraccionSeccionPage'
import PublicacionPage from './pages/foro/PublicacionPage'
import ProfileGate from './pages/perfil/ProfileGate'
import ProfilePage from './pages/perfil/ProfilePage'
import PublicarPage from './pages/perfil/PublicarPage'
import EditarPublicacionPage from './pages/perfil/EditarPublicacionPage'

export default function MainRouter() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/servicios/intervencion-directa" element={<IntervencionDirectaPage />} />
          <Route path="/servicios/seleccion-de-personal" element={<SeleccionPersonalPage />} />
          <Route path="/servicios/acompanamiento" element={<AcompanamientoPage />} />
          <Route path="/politica-de-privacidad" element={<PrivacyPolicyPage />} />
          <Route path="/restablecer-password" element={<RestablecerPasswordPage />} />
          <Route path="/verificar-email" element={<VerificarEmailPage />} />
          {/* No hay vista "todas las publicaciones": se navega por tipo. La ruta
              base solo redirige para que los enlaces viejos no queden muertos. */}
          <Route path="/interacciones" element={<Navigate to={DEFAULT_INTERACCION_ROUTE} replace />} />
          <Route path="/interacciones/:seccion" element={<InteraccionSeccionPage />} />
          <Route path="/publicaciones/:id" element={<PublicacionPage />} />
          <Route path="/perfil" element={<ProfileGate />}>
            <Route index element={<ProfilePage />} />
            {/* Static segments outrank the dynamic `:panel` below in React
                Router's route-ranking algorithm, so these two win the match
                against `/perfil/publicar` and `/perfil/publicaciones` even
                though `:panel` is also declared here — declared first only
                for readability, not because order affects the match. */}
            <Route path="publicar" element={<PublicarPage />} />
            <Route path="publicaciones/:id/editar" element={<EditarPublicacionPage />} />
            <Route path=":panel" element={<ProfilePage />} />
          </Route>
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}
