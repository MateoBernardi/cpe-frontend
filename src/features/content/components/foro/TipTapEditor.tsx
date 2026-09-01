import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import { foroService, isContentRejected, getForoApiErrorMessage } from '@features/foro'
import { colors, foroHairline } from '../../../../theme'

interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
}

/**
 * Botonera mínima — sólo cubre lo que la allowlist del backend
 * (`sanitizePublicationHtml`, cpe-foro-backend/src/lib/html.ts) efectivamente conserva: p/br,
 * negrita/cursiva/subrayado/tachado, h2-h4, listas, blockquote, link, imagen. No hay botón para
 * nada fuera de esa lista (tablas, por ejemplo) porque el resultado se perdería al guardar.
 */
function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className="rounded-md px-2 py-1 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      style={active ? { backgroundColor: colors.ctaPrimary, color: colors.white } : { color: colors.blueDark }}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor, onImageButtonClick }: { editor: Editor; onImageButtonClick: () => void }) {
  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-t-lg border-b px-2 py-1.5"
      style={{ borderColor: foroHairline, backgroundColor: colors.offWhite }}
    >
      <ToolbarButton label="Negrita" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <b>B</b>
      </ToolbarButton>
      <ToolbarButton label="Cursiva" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <i>I</i>
      </ToolbarButton>
      <ToolbarButton label="Subrayado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <u>U</u>
      </ToolbarButton>
      <ToolbarButton label="Tachado" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <s>S</s>
      </ToolbarButton>
      <span className="mx-1 h-4 w-px" style={{ backgroundColor: foroHairline }} />
      <ToolbarButton label="Subtítulo" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolbarButton>
      <ToolbarButton label="Encabezado menor" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolbarButton>
      <ToolbarButton label="Lista" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • Lista
      </ToolbarButton>
      <ToolbarButton label="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. Lista
      </ToolbarButton>
      <ToolbarButton label="Cita" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        “ Cita
      </ToolbarButton>
      <span className="mx-1 h-4 w-px" style={{ backgroundColor: foroHairline }} />
      <ToolbarButton
        label="Link"
        active={editor.isActive('link')}
        onClick={() => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run()
            return
          }
          const url = window.prompt('URL del link (http:// o https://):')
          if (url && url.trim()) editor.chain().focus().setLink({ href: url.trim() }).run()
        }}
      >
        Link
      </ToolbarButton>
      <ToolbarButton label="Imagen" onClick={onImageButtonClick}>
        Imagen
      </ToolbarButton>
    </div>
  )
}

/**
 * Editor rich-text usado sólo cuando `form.contentFormat === 'html'` — hoy, sólo tras un import
 * de .docx (ver PublicationComposer.tsx). El texto plano de siempre sigue siendo un `<textarea>`
 * sin tocar; este componente no reemplaza nada para ese caso.
 *
 * El HTML que produce viaja tal cual al backend, que lo vuelve a sanitizar SERVER-SIDE antes de
 * persistirlo (D46 en cpe-foro-backend/DECISIONS.md) — este editor no es la barrera de seguridad,
 * sólo intenta no ofrecer botones para markup que el backend igual va a descartar.
 */
export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      TiptapImage,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: updated }) => onChange(updated.getHTML()),
  })

  // Sincroniza un `content` que cambió desde AFUERA (el import de .docx reemplazando el borrador
  // entero) sin pisar lo que el usuario esté tipeando: sólo si difiere de lo que el editor ya
  // tiene. `emitUpdate: false` evita un onChange en loop contra el `onUpdate` de arriba.
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !editor) return
    setUploadError(null)
    setUploadingImage(true)
    try {
      const img = await foroService.uploadImage(file)
      editor.chain().focus().setImage({ src: img.url, alt: '' }).run()
    } catch (err) {
      if (!isContentRejected(err)) setUploadError(getForoApiErrorMessage(err))
    } finally {
      setUploadingImage(false)
    }
  }

  if (!editor) return null

  return (
    <div className="rounded-lg border" style={{ borderColor: foroHairline }}>
      <Toolbar editor={editor} onImageButtonClick={() => fileInputRef.current?.click()} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleImageChange(e)} />
      {uploadingImage && <p className="px-3 pt-2 text-xs text-gray-400">Subiendo imagen…</p>}
      {uploadError && <p className="px-3 pt-2 text-xs text-red-600">{uploadError}</p>}
      <EditorContent
        editor={editor}
        className="prose max-w-none px-3 py-2 text-sm focus-within:outline-none [&_.ProseMirror]:min-h-[240px] [&_.ProseMirror]:outline-none"
      />
    </div>
  )
}
