import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AdminLayout } from '@shared/components'
import AdminDashboard from './pages/AdminDashboard'
import AdminSectionsPage from './pages/AdminSectionsPage'
import AdminSectionEditPage from './pages/AdminSectionEditPage'

export default function AdminRouter() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/sections" element={<AdminSectionsPage />} />
          <Route path="/sections/:sectionName" element={<AdminSectionEditPage />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  )
}
