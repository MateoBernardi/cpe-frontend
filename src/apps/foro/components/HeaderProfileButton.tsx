import { useNavigate } from 'react-router-dom'
import { useDemoAuth } from '../demo/demoAuthContext'
import { initialsOf } from '../lib/typeStyle'

/**
 * DEMO ONLY — replaces <SubscribeButton/> as the header's trailing widget
 * inside the foro app. Logged out: teal CTA that starts the demo (→ visitor).
 * Logged in: quiet ghost "Mi perfil" widget (avatar initials + first name)
 * that routes to the role-appropriate profile page.
 *
 * Self-wraps in `.foro-scope` like <SubscribeButton/> — the header renders
 * outside `.foro-app` (see FORO_ARCHITECTURE.md), so this picks up the foro
 * tokens/resets locally without stretching the shared institutional chrome.
 */
export function HeaderProfileButton() {
  const { user, isAuthenticated, setDemoState } = useDemoAuth()
  const navigate = useNavigate()

  if (!isAuthenticated || !user) {
    return (
      <span className="foro-scope" style={{ display: 'inline-flex' }}>
        <button
          type="button"
          className="foro-btn foro-btn-teal foro-btn-subscribe"
          onClick={() => setDemoState('visitor')}
        >
          Suscribirme
        </button>
      </span>
    )
  }

  const firstName = user.name.split(' ')[0]
  const target = user.role === 'publisher' ? '/perfil/publicador' : '/perfil/visitante'

  return (
    <span className="foro-scope" style={{ display: 'inline-flex' }}>
      <button
        type="button"
        className="foro-btn foro-btn-ghost foro-btn-subscribe foro-btn-profile"
        onClick={() => navigate(target)}
      >
        <span className="foro-avatar">{initialsOf(user.name)}</span>
        {firstName}
      </button>
    </span>
  )
}

export default HeaderProfileButton
