import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface AdminLayoutProps {
  children: ReactNode
}

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/sections', label: 'Secciones' },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white shadow-sm">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <h1 className="text-lg font-bold text-gray-900">CPE Admin</h1>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
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
        <header className="flex h-16 items-center border-b border-gray-200 bg-white px-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Panel de Administración</h2>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
