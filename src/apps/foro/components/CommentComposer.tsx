import { useState, type FormEvent } from 'react'
import { useForoAuth } from '@features/foro'

interface CommentComposerProps {
  onSubmit: (content: string) => Promise<unknown>
  isSubmitting?: boolean
  placeholder?: string
  submitLabel?: string
}

/** Reply composer — posting requires auth; opens the auth dialog otherwise. */
export function CommentComposer({
  onSubmit,
  isSubmitting = false,
  placeholder = 'Sumá tu experiencia a esta conversación…',
  submitLabel = 'Publicar respuesta',
}: CommentComposerProps) {
  const { isAuthenticated, openAuthDialog } = useForoAuth()
  const [content, setContent] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      openAuthDialog('sign-in')
      return
    }
    const trimmed = content.trim()
    if (!trimmed) return
    await onSubmit(trimmed)
    setContent('')
  }

  return (
    <form className="foro-compose" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        onFocus={() => { if (!isAuthenticated) openAuthDialog('sign-in') }}
      />
      <div className="foro-row">
        {!isAuthenticated && <span className="foro-hint">Iniciá sesión para participar.</span>}
        <button type="submit" className="foro-btn foro-btn-teal" disabled={isSubmitting || !content.trim()}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
