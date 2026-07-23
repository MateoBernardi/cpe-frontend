import { Outlet } from 'react-router-dom'
import {
  ForoAuthProvider,
  ForoAuthDialog,
  useForoAuth,
  canPublish,
  SubscribeButton,
} from '@features/foro'
import { LoadingSpinner } from '@shared/components'

/**
 * Publisher-space gate for `/admin/foro/**`.
 *
 * The Foro backend authenticates separately from the admin chrome's
 * Cloudflare Zero Trust session (a different cookie session), so this
 * subtree needs its own `<ForoAuthProvider>` + `<ForoAuthDialog/>`.
 *
 * Access rules:
 * - loading session -> spinner
 * - not authenticated -> sign-in/sign-up prompt
 * - authenticated but role is not publisher/admin -> "permisos insuficientes"
 * - publisher/admin -> renders the nested publisher-space routes
 */
function ForoGateContent() {
  const { isLoading, isAuthenticated, role, user, openAuthDialog } = useForoAuth()

  if (isLoading) {
    return <LoadingSpinner className="py-16" />
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-gray-300 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-gray-900">Iniciá sesión en el Foro</h2>
        <p className="max-w-md text-sm text-gray-500">
          El espacio de publicadores usa una cuenta del Foro (separada del acceso institucional).
          Iniciá sesión o creá una cuenta para gestionar publicaciones, categorías y etiquetas.
        </p>
        <div className="flex gap-2">
          <SubscribeButton variant="teal" signedOutLabel="Iniciar sesión / Crear cuenta" />
          <button
            type="button"
            onClick={() => openAuthDialog('sign-in')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Ya tengo cuenta
          </button>
        </div>
      </div>
    )
  }

  if (!canPublish(role)) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-amber-900">Permisos insuficientes</h2>
        <p className="max-w-md text-sm text-amber-800">
          Tu cuenta ({user?.email}) no tiene rol de publicador en el Foro. Pedile a un administrador
          del Foro que te asigne el rol <strong>publisher</strong> o <strong>admin</strong> para
          poder gestionar publicaciones.
        </p>
      </div>
    )
  }

  return <Outlet />
}

export default function AdminForoGate() {
  return (
    <ForoAuthProvider>
      <ForoAuthDialog />
      <ForoGateContent />
    </ForoAuthProvider>
  )
}
