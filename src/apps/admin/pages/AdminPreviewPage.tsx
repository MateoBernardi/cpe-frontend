import { SectionView } from '@features/content/views'

/**
 * Previsualización dentro del admin.
 * Renderiza las secciones públicas como si fuera la app principal.
 */
const publicSections = ['hero', 'secondary_hero', 'about', 'news', 'info_primary', 'info_secondary', 'contact_form']

export default function AdminPreviewPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Previsualización</h1>
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
          Vista previa
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {/* Renderiza la landing dentro de un frame visual */}
        <div className="mx-auto max-w-6xl p-6">
          {/* Header fijo */}
          <header className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white text-sm font-bold">
                CPE
              </div>
              <span className="text-lg font-bold text-gray-900">Clínica para Empresas</span>
            </div>
            <nav className="flex gap-4 text-sm text-gray-600">
              <span className="cursor-default">Inicio</span>
              <span className="cursor-default">Nosotros</span>
              <span className="rounded-md bg-teal-600 px-4 py-1.5 text-white">Contáctanos</span>
            </nav>
          </header>

          <div className="space-y-16">
            {publicSections.map((name) => (
              <section key={name} id={name}>
                <SectionView sectionName={name} />
              </section>
            ))}
          </div>

          {/* Footer fijo */}
          <footer className="mt-16 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
            © 2026 Clínica para Empresas. Todos los derechos reservados.
          </footer>
        </div>
      </div>
    </div>
  )
}
