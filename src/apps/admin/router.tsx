import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '@shared/components'
import AdminDashboard from './pages/AdminDashboard'
import AdminSectionsPage from './pages/AdminSectionsPage'
import AdminSectionEditPage from './pages/AdminSectionEditPage'
import AdminPreviewPage from './pages/AdminPreviewPage'

export default function AdminRouter() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/sections" element={<AdminSectionsPage />} />
          <Route path="/sections/:sectionId" element={<AdminSectionEditPage />} />
          <Route path="/preview" element={<AdminPreviewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  )
}
