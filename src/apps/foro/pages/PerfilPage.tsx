import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDemoAuth, type DemoAuthState } from '../demo/demoAuthContext'
import { DEMO_SAVED, DEMO_MY_PUBLICATIONS, DEMO_PREFERENCES } from '../demo/demoData'
import { PublicationListItem } from '../components/PublicationListItem'
import { CategoryTag } from '../components/CategoryTag'
import { initialsOf, formatForoDate } from '../lib/typeStyle'
import { interactionRows } from '../lib/interactionRows'

type ProfileRole = 'visitor' | 'publisher'
type ProfileTab = 'mis-publicaciones' | 'guardados' | 'preferencias'

interface PerfilPageProps {
  role: ProfileRole
}

export default function PerfilPage({ role }: PerfilPageProps) {
  const { user, demoState, setDemoState, signOutDemo } = useDemoAuth()
  const navigate = useNavigate()

  // Sync demoState → route role on mount/role change so the header matches
  // when deep-linking straight to /perfil/publicador etc.
  useEffect(() => {
    const wantedState: DemoAuthState = role === 'publisher' ? 'publisher' : 'visitor'
    if (demoState !== wantedState) setDemoState(wantedState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  const [tab, setTab] = useState<ProfileTab>(role === 'publisher' ? 'mis-publicaciones' : 'guardados')

  // Guard: while demoState catches up to the route role above, user can be
  // momentarily null (e.g. deep link straight to a profile route). Avoid
  // touching user.name until it settles.
  if (!user) {
    return (
      <div className="foro-wrap" style={{ padding: '60px 0' }}>
        <p style={{ color: 'var(--foro-muted)' }}>Cargando perfil…</p>
      </div>
    )
  }

  const handleSignOut = () => {
    signOutDemo()
    navigate('/')
  }

  return (
    <main className="foro-pod">
      <div className="foro-wrap">
        <header className="foro-profile-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span className="foro-avatar foro-avatar-lg">{initialsOf(user.name)}</span>
            <div>
              <h1>{user.name}<span className="foro-accent-period">.</span></h1>
              <div className="foro-byline" style={{ marginTop: 6, paddingBottom: 0, border: 'none' }}>
                <span>{user.email}</span>
                <span className="foro-dotsep" />
                <span>{role === 'publisher' ? 'PUBLICADOR' : 'VISITANTE'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontFamily: 'var(--foro-font-mono)',
                  fontSize: 11,
                  color: 'var(--foro-muted)',
                  letterSpacing: '.06em',
                }}
              >
                MODO DEMO:
              </span>
              <button
                type="button"
                className="foro-demo-chip"
                aria-pressed={role === 'visitor'}
                onClick={() => navigate('/perfil/visitante')}
              >
                Visitante
              </button>
              <button
                type="button"
                className="foro-demo-chip"
                aria-pressed={role === 'publisher'}
                onClick={() => navigate('/perfil/publicador')}
              >
                Publicador
              </button>
            </div>
            <button type="button" className="foro-btn foro-btn-light" onClick={handleSignOut}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <nav className="foro-profile-tabs">
          {role === 'publisher' && (
            <button
              type="button"
              className={tab === 'mis-publicaciones' ? 'active' : ''}
              onClick={() => setTab('mis-publicaciones')}
            >
              Mis publicaciones
            </button>
          )}
          <button type="button" className={tab === 'guardados' ? 'active' : ''} onClick={() => setTab('guardados')}>
            Guardados
          </button>
          <button
            type="button"
            className={tab === 'preferencias' ? 'active' : ''}
            onClick={() => setTab('preferencias')}
          >
            Preferencias
          </button>
        </nav>

        {tab === 'mis-publicaciones' && role === 'publisher' && <MisPublicacionesTab />}
        {tab === 'guardados' && <GuardadosTab />}
        {tab === 'preferencias' && <PreferenciasTab />}
      </div>
    </main>
  )
}

function GuardadosTab() {
  return (
    <section>
      <div className="foro-list">
        {DEMO_SAVED.map((entry, i) => (
          <PublicationListItem
            key={entry.preview.id}
            publication={entry.preview}
            typeSlug={entry.slug}
            typeName={entry.typeName}
            index={i + 1}
          />
        ))}
      </div>
    </section>
  )
}

function PreferenciasTab() {
  const [state, setState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DEMO_PREFERENCES.map((p) => [p.key, p.defaultChecked])),
  )
  return (
    <section>
      {DEMO_PREFERENCES.map((pref) => (
        <label key={pref.key} className="foro-pref-row">
          <div>
            <div style={{ fontWeight: 600, color: 'var(--foro-navy)' }}>{pref.label}</div>
            <div style={{ fontSize: 13, color: 'var(--foro-muted)' }}>{pref.description}</div>
          </div>
          <input
            type="checkbox"
            checked={state[pref.key] ?? false}
            onChange={(e) => setState((s) => ({ ...s, [pref.key]: e.target.checked }))}
          />
        </label>
      ))}
      <p
        style={{
          fontFamily: 'var(--foro-font-mono)',
          fontSize: 12,
          color: 'var(--foro-muted-2)',
          marginTop: 18,
        }}
      >
        Preferencias de demostración — no se guardan.
      </p>
    </section>
  )
}

function MisPublicacionesTab() {
  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Link to="/publicar" className="foro-btn foro-btn-teal">+ Nueva publicación</Link>
      </div>
      <div className="foro-list">
        {DEMO_MY_PUBLICATIONS.map((entry) => (
          <article key={entry.preview.id} className="foro-list-item">
            <div className="foro-thumb foro-ph"><span>img</span></div>
            <div className="foro-text">
              <CategoryTag slug={entry.slug} label={entry.typeName} />
              <h3>{entry.preview.title}</h3>
              <div className="foro-card-meta">
                <span>{formatForoDate(entry.preview.createdAt)}</span>
              </div>
              <div className="foro-interactions">
                {interactionRows(entry.preview.interactions, entry.slug).map((row) => (
                  <span key={row.label}><b>{row.value}</b> {row.label}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
