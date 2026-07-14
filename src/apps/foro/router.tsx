import { Routes, Route } from 'react-router-dom'
import { ForoLayout } from './components/ForoLayout'
import HomePage from './pages/HomePage'
import PublicationPage from './pages/PublicationPage'

export default function ForoRouter() {
  return (
    <ForoLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/publicaciones/:id" element={<PublicationPage />} />
      </Routes>
    </ForoLayout>
  )
}
