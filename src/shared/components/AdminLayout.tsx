import { type ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface AdminLayoutProps {
  children: ReactNode
}

const navItems = [
  { to: '/', label: 'Dashboard', exact: true },
  { to: '/preview', label: 'Previsualización', exact: false },
  { to: '/sections', label: 'Secciones', exact: false },
  { to: '/gallery', label: 'Galería', exact: false },
  { to: '/contacts', label: 'Contactos', exact: false },
  { to: '/candidates', label: 'Postulaciones', exact: false },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tenantForbidden, setTenantForbidden] = useState(false)

  useEffect(() => {
    const handler = () => setTenantForbidden(true)
    window.addEventListener('app:forbidden-tenant', handler)
    return () => window.removeEventListener('app:forbidden-tenant', handler)
  }, [])

  return (
    <div className="relative flex min-h-screen bg-gray-100">
      {tenantForbidden && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Acceso no habilitado</h3>
            <p className="mt-2 text-sm text-gray-600">
              Tu usuario no tiene tenant asignado.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => { window.location.href = '/cdn-cgi/access/logout' }}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Cerrar sesión
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = '/admin.html' }}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
              >
                Volver a login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — colapsado por defecto, se abre con burger */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-gray-200 bg-white shadow-lg transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 lg:shadow-sm`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <Link to="/" className="text-lg font-bold text-gray-900 hover:text-blue-700 transition-colors">
            CPE Admin
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm">
          {/* Burger button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-sm font-medium text-gray-500">Panel de Administración</h2>
        </header>
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
