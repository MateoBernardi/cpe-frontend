import { Routes, Route } from 'react-router-dom'
import { ForoLayout } from './components/ForoLayout'
import HomePage from './pages/HomePage'
import PublicationPage from './pages/PublicationPage'
import PerfilPage from './pages/PerfilPage'
import PublicarPage from './pages/PublicarPage'

export default function ForoRouter() {
  return (
    <ForoLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/publicaciones/:id" element={<PublicationPage />} />
        <Route path="/perfil/visitante" element={<PerfilPage role="visitor" />} />
        <Route path="/perfil/publicador" element={<PerfilPage role="publisher" />} />
        <Route path="/publicar" element={<PublicarPage />} />
      </Routes>
    </ForoLayout>
  )
}
