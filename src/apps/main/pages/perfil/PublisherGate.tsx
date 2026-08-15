import type { ReactNode } from 'react'
import { useForoAuth, canAuthor } from '@features/foro'
import { colors } from '@/theme'

/**
 * Extra gate for `/perfil/publicar` and `/perfil/publicaciones/:id/editar`,
 * on top of `ProfileGate` (which only checks authentication, not role).
 * Any signed-in user can author now — publishers create/publish directly,
 * visitors submit into the review workflow (see `PublicationComposer.tsx`) —
 * so this only turns away anonymous visitors who reached the URL directly
 * before `ProfileGate` redirected them (belt-and-suspenders, same shape as
 * before the review workflow existed).
 */
export default function PublisherGate({ children }: { children: ReactNode }) {
  const { role } = useForoAuth()

  if (!canAuthor(role)) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 px-6 py-16 text-center">
        <h1 className="text-lg font-semibold" style={{ color: colors.blueDark }}>
          Se necesita una cuenta del Foro
        </h1>
        <p className="max-w-md text-sm text-gray-500">
          Iniciá sesión para crear o editar publicaciones del Foro.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
