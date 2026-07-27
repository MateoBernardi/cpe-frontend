import type { ReactNode } from 'react'
import { useForoAuth, canPublish } from '@features/foro'
import { colors } from '@/theme'

/**
 * Extra gate for `/perfil/publicar` and `/perfil/publicaciones/:id/editar`,
 * on top of `ProfileGate` (which only checks authentication, not role).
 * Mirrors the check `MisPublicacionesPanel`'s tab already relies on
 * (`canPublish(role)`) — without this, a signed-in visitor could reach the
 * composer directly by URL.
 */
export default function PublisherGate({ children }: { children: ReactNode }) {
  const { role } = useForoAuth()

  if (!canPublish(role)) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 px-6 py-16 text-center">
        <h1 className="text-lg font-semibold" style={{ color: colors.blueDark }}>
          Se necesita el rol de publicador
        </h1>
        <p className="max-w-md text-sm text-gray-500">
          Tu cuenta no tiene permisos para crear o editar publicaciones del Foro.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
