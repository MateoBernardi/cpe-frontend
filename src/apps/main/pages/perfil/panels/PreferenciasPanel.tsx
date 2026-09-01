import { useUserPreferences } from '@features/foro'
import { LoadingSpinner, AnimatedCheckbox } from '@shared/components'

/**
 * Two notification toggles. `isUnavailable` means the backend endpoint isn't
 * implemented yet, so the toggles render disabled with an inline note instead
 * of an error state.
 *
 * El marcado se dibuja al instante porque `useUserPreferences.update` es
 * optimista: el check no espera al round-trip.
 */
export default function PreferenciasPanel() {
  const { data, isLoading, isUnavailable, update } = useUserPreferences()

  if (isLoading) {
    return <LoadingSpinner size="md" className="py-12" />
  }

  const emailChecked = data?.emailNotifications ?? false
  const pushChecked = data?.pushNotifications ?? false
  const disabled = isUnavailable || update.isPending

  return (
    <div className="flex max-w-lg flex-col gap-5">
      {isUnavailable && (
        <p className="text-sm text-gray-500">
          Las preferencias de notificaciones todavía no están disponibles.
        </p>
      )}

      <AnimatedCheckbox
        label="Recibir emails"
        checked={emailChecked}
        disabled={disabled}
        onChange={(next) => update.mutate({ emailNotifications: next })}
      />

      <AnimatedCheckbox
        label="Recibir notificaciones"
        checked={pushChecked}
        disabled={disabled}
        onChange={(next) => update.mutate({ pushNotifications: next })}
      />
    </div>
  )
}
