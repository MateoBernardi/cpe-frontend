import { Outlet } from 'react-router-dom'
import { useForoAuth } from '@features/foro'
import { hoverBgSwap } from '@features/content/components/foro'
import { LoadingSpinner } from '@shared/components'
import { colors, layout } from '@/theme'

/**
 * Access gate for `/perfil/**`. Unlike `AdminForoGate` (a separate admin
 * SPA), the main app already mounts a single app-wide `<ForoAuthProvider>` +
 * `<ForoAuthDialog>` in `App.tsx` — this gate must NOT mount its own copies.
 *
 * - loading session -> spinner
 * - not authenticated -> sign-in prompt card
 * - authenticated -> renders the nested `/perfil` routes
 */
export default function ProfileGate() {
  const { isLoading, isAuthenticated, openAuthDialog } = useForoAuth()

  if (isLoading) {
    return <LoadingSpinner size="lg" className="pt-[22vh] pb-24" />
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-[22vh] pb-[6vh] sm:pb-[8vh] md:pb-[10vh]" style={{ backgroundColor: colors.white }}>
        <div className={layout.container}>
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 px-6 py-16 text-center">
            <h1 className="text-lg font-semibold" style={{ color: colors.blueDark }}>
              Iniciá sesión para ver tu perfil
            </h1>
            <p className="max-w-md text-sm text-gray-500">
              Accedé a tu cuenta del Foro para ver tus publicaciones guardadas, tus
              interacciones y gestionar tus preferencias.
            </p>
            <button
              type="button"
              onClick={() => openAuthDialog('sign-in')}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors"
              style={{ backgroundColor: colors.ctaPrimary }}
              {...hoverBgSwap(colors.ctaPrimary, colors.ctaPrimaryHover)}
            >
              Iniciar sesión o crear cuenta
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}
