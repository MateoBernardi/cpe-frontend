import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AdminLayout } from '@shared/components'
import AdminDashboard from './pages/AdminDashboard'
import AdminSectionsPage from './pages/AdminSectionsPage'
import AdminSectionEditPage from './pages/AdminSectionEditPage'
import AdminPreviewPage from './pages/AdminPreviewPage'
import AdminGalleryPage from './pages/AdminGalleryPage'
import AdminContactsPage from './pages/AdminContactsPage'
import AdminCandidatesPage from './pages/AdminCandidatesPage'
import AdminCandidateDetailPage from './pages/AdminCandidateDetailPage'

export default function AdminRouter() {
  return (
    <BrowserRouter>
      <AdminLayout>
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/sections" element={<AdminSectionsPage />} />
            <Route path="/sections/:sectionId" element={<AdminSectionEditPage />} />
            <Route path="/preview" element={<AdminPreviewPage />} />
            <Route path="/gallery" element={<AdminGalleryPage />} />
            <Route path="/contacts" element={<AdminContactsPage />} />
            <Route path="/candidates" element={<AdminCandidatesPage />} />
            <Route path="/candidates/:id" element={<AdminCandidateDetailPage />} />
          </Routes>
      </AdminLayout>
    </BrowserRouter>
  )
}
