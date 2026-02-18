import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@shared/components'
import HomePage from './pages/HomePage'
import NewsPage from './pages/NewsPage'
import ContactPage from './pages/ContactPage'

export default function MainRouter() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}
