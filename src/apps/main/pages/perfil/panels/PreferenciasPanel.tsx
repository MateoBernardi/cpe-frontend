import { useUserPreferences } from '@features/foro'
import { LoadingSpinner } from '@shared/components'
import { colors } from '@/theme'

/**
 * Two notification toggles. No switch component exists in this repo — the
 * precedent is the native checkbox in `ContactPage`'s privacy field
 * (`h-4 w-4 accent-teal-600`). `isUnavailable` means the backend endpoint
 * isn't implemented yet, so the toggles render disabled with an inline note
 * instead of an error state.
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

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={emailChecked}
          disabled={disabled}
          onChange={(e) => update.mutate({ emailNotifications: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 accent-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="text-sm" style={{ color: colors.blueDark }}>Recibir emails</span>
      </label>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={pushChecked}
          disabled={disabled}
          onChange={(e) => update.mutate({ pushNotifications: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 accent-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="text-sm" style={{ color: colors.blueDark }}>Recibir notificaciones</span>
      </label>
    </div>
  )
}
