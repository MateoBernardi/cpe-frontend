import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@shared/components'
import { DEFAULT_INTERACCION_ROUTE } from '@features/content/components/foro'
import HomePage from './pages/HomePage'
import ContactPage from './pages/ContactPage'
import IntervencionDirectaPage from './pages/IntervencionDirectaPage'
import SeleccionPersonalPage from './pages/SeleccionPersonalPage'
import AcompanamientoPage from './pages/AcompanamientoPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import InteraccionSeccionPage from './pages/foro/InteraccionSeccionPage'
import PublicacionPage from './pages/foro/PublicacionPage'

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
          {/* No hay vista "todas las publicaciones": se navega por tipo. La ruta
              base solo redirige para que los enlaces viejos no queden muertos. */}
          <Route path="/interacciones" element={<Navigate to={DEFAULT_INTERACCION_ROUTE} replace />} />
          <Route path="/interacciones/:seccion" element={<InteraccionSeccionPage />} />
          <Route path="/publicaciones/:id" element={<PublicacionPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}
