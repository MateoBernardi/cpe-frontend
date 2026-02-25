import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useSectionsList,
  usePublishChanges,
  useDiscardDrafts,
  contentKeys,
} from '@features/content/viewmodels'
import type { PendingEdits } from '@features/content/viewmodels'
import type { AdminSection } from '@features/content/models'
import type { AdminSectionResponseDTO } from '@features/content/dtos'
import { contentService } from '@features/content/services'
import { mapAdminSectionDTO } from '@features/content/mappers'
import { SectionRenderer } from '@features/content/components'
import { getSectionDisplayName } from '@features/content/config/sectionRoles'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

/**
 * Orden de previsualización agrupado por "página" del sitio.
 * Cada grupo se separa visualmente con un encabezado.
 */
const PREVIEW_GROUPS = [
  {
    label: 'Página principal',
    sections: ['hero', 'about', 'info_primary', 'info_secondary', 'secondary_hero'],
  },
  {
    label: 'Novedades',
    sections: ['news'],
  },
  {
    label: 'Contacto',
    sections: ['contact_form'],
  },
  {
    label: 'Servicios',
    sections: ['service_intervencion', 'service_seleccion', 'service_acompanamiento'],
  },
] as const

function AdminPreviewSection({ sectionId }: { sectionId: number }) {
  const { data: section, isLoading, error } = useQuery({
    queryKey: contentKeys.section(sectionId),
    queryFn: ({ signal }) => contentService.getAdminSection(sectionId, signal),
    select: (d) => mapAdminSectionDTO(d.section),
  })

  if (isLoading) return <LoadingSpinner className="py-8" />
  if (error || !section) return null

  return <SectionRenderer section={section} />
}

export default function AdminPreviewPage() {
  const { data: sectionsList, isLoading: listLoading, error: listError } = useSectionsList()
  const publishMut = usePublishChanges()
  const discardMut = useDiscardDrafts()
  const qc = useQueryClient()

  // Aplanar todos los nombres de sección en orden
  const allSectionNames = useMemo(
    () => PREVIEW_GROUPS.flatMap((g) => g.sections),
    [],
  )

  // Resolver IDs desde la lista del backend
  const orderedSections = useMemo(() => {
    if (!sectionsList) return []
    return allSectionNames
      .map((name) => sectionsList.find((s) => s.name === name))
      .filter((s): s is NonNullable<typeof s> => s != null)
  }, [sectionsList, allSectionNames])

  // Agrupar secciones resueltas por grupo
  const resolvedGroups = useMemo(() => {
    if (!sectionsList) return []
    return PREVIEW_GROUPS.map((g) => ({
      label: g.label,
      items: g.sections
        .map((name) => sectionsList.find((s) => s.name === name))
        .filter((s): s is NonNullable<typeof s> => s != null),
    })).filter((g) => g.items.length > 0)
  }, [sectionsList])

  // Detectar si hay cambios pendientes
  const pending = qc.getQueryData<PendingEdits>(contentKeys.pendingEdits())
  const hasPendingEdits = pending && Object.keys(pending.textEdits).length > 0

  // Verificar si hay textos en DRAFT en las secciones cacheadas
  const hasDrafts = useMemo(() => {
    if (!orderedSections.length) return false
    for (const s of orderedSections) {
      const cached = qc.getQueryData<{ section: { texts: { status: string | null }[] } }>(
        contentKeys.section(s.id),
      )
      if (cached?.section.texts.some((t) => t.status === 'DRAFT')) return true
    }
    return false
  }, [orderedSections, qc])

  const hasChanges = hasPendingEdits || hasDrafts

  const handlePublish = () => {
    const adminSections: AdminSection[] = []
    for (const s of orderedSections) {
      const cached = qc.getQueryData<AdminSectionResponseDTO>(
        contentKeys.section(s.id),
      )
      if (cached) {
        adminSections.push(mapAdminSectionDTO(cached.section))
      }
    }
    publishMut.mutate(adminSections)
  }

  const handleDiscard = () => {
    if (!confirm('¿Descartar todos los borradores y ediciones sin guardar? Esta acción no se puede deshacer.')) return
    const adminSections: AdminSection[] = []
    for (const s of orderedSections) {
      const cached = qc.getQueryData<AdminSectionResponseDTO>(
        contentKeys.section(s.id),
      )
      if (cached) {
        adminSections.push(mapAdminSectionDTO(cached.section))
      }
    }
    discardMut.mutate(adminSections)
  }

  if (listLoading) return <LoadingSpinner className="py-12" />
  if (listError) return <ErrorMessage message="Error cargando secciones" />

  return (
    <div className="space-y-4">
      {/* ── Header con botón de publicar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Previsualización</h1>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
            Vista previa
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              disabled={discardMut.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              {discardMut.isPending ? 'Descartando...' : 'Descartar borradores'}
            </button>
          )}
          <button
            type="button"
            onClick={handlePublish}
            disabled={!hasChanges || publishMut.isPending}
            className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white transition-colors ${
              hasChanges
                ? 'bg-green-600 hover:bg-green-700 shadow-md'
                : 'cursor-not-allowed bg-gray-400'
            } disabled:opacity-60`}
          >
            {publishMut.isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Publicando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </div>

      {publishMut.isSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          ✓ Todos los cambios fueron publicados correctamente.
        </div>
      )}
      {discardMut.isSuccess && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
          ✓ Todos los borradores fueron descartados.
        </div>
      )}
      {publishMut.isError && (
        <ErrorMessage
          message={publishMut.error instanceof Error ? publishMut.error.message : 'Error al publicar'}
        />
      )}

      {hasChanges && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Hay cambios sin publicar. Presioná <strong>"Guardar cambios"</strong> para que se reflejen en la página principal.
        </div>
      )}

      {/* ── Previsualización del sitio ── */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
          {/* Header simulado */}
          <header className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                CPE
              </div>
              <span className="hidden text-lg font-bold text-gray-900 sm:inline">Clínica para Empresas</span>
            </div>
            <nav className="flex gap-2 text-sm text-gray-600 sm:gap-4">
              <span className="cursor-default">Inicio</span>
              <span className="cursor-default">Nosotros</span>
              <span className="rounded-md bg-teal-600 px-3 py-1.5 text-white sm:px-4">Contáctanos</span>
            </nav>
          </header>

          {resolvedGroups.map((group, gi) => (
            <div key={group.label}>
              {/* Separador de grupo / subsección */}
              {gi > 0 && (
                <div className="my-8 flex items-center gap-4">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.label}
                  </span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
              )}

              <div className="space-y-0">
                {group.items.map((s, si) => (
                  <section key={s.id} id={s.name}>
                    {/* Separador entre secciones dentro del mismo grupo */}
                    {si > 0 && group.items.length > 1 && (
                      <div className="my-4 border-t border-dashed border-gray-200" />
                    )}
                    {/* Etiqueta de sección */}
                    <div className="mb-2 flex items-center gap-2 px-2">
                      <span className="h-2 w-2 rounded-full bg-teal-500" />
                      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                        {getSectionDisplayName(s.name)}
                      </span>
                    </div>
                    <AdminPreviewSection sectionId={s.id} />
                  </section>
                ))}
              </div>
            </div>
          ))}

          {/* Footer simulado */}
          <footer className="mt-16 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Clínica para Empresas. Todos los derechos reservados.
          </footer>
        </div>
      </div>
    </div>
  )
}
