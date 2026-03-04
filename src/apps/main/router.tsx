import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@shared/components'
import HomePage from './pages/HomePage'
import NewsPage from './pages/NewsPage'
import ContactPage from './pages/ContactPage'
import IntervencionDirectaPage from './pages/IntervencionDirectaPage'
import SeleccionPersonalPage from './pages/SeleccionPersonalPage'
import AcompanamientoPage from './pages/AcompanamientoPage'
import TraspasoGeneracionalPage from './pages/TraspasoGeneracionalPage'

export default function MainRouter() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/servicios/intervencion-directa" element={<IntervencionDirectaPage />} />
          <Route path="/servicios/seleccion-de-personal" element={<SeleccionPersonalPage />} />
          <Route path="/servicios/acompanamiento" element={<AcompanamientoPage />} />
          <Route path="/servicios/traspaso-generacional" element={<TraspasoGeneracionalPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}
