import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@shared/components'
import HomePage from './pages/HomePage'

export default function MainRouter() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}
