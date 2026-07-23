import type { CSSProperties, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Category, PublicationPreview } from '@features/foro'
import { usePublicationTypes, usePublicationsByCategories } from '@features/foro'
import { resolveKnownSlug } from '@features/foro'
import { typeSlugToCssVar } from '../lib/typeStyle'

interface PublicationsSlideProps {
  open: boolean
  categories: Category[]
  selectedIds: number[]
  onToggleCategory: (id: number) => void
  onClose: () => void
}

/**
 * Channel/external links (Spotify/YouTube/…), same flat-chip idiom as
 * <PublicationListItem>'s `ChannelLinks` — 0-N chips, nothing when the
 * preview doesn't carry `externalLinks`. Unlike that component, each card
 * here IS the wrapping `<Link>` (see below), so every chip stops propagation
 * on click: without it, the click would bubble up to the card's own Link and
 * navigate to the publication instead of opening the external URL.
 */
function ChannelLinks({ links }: { links: PublicationPreview['externalLinks'] }) {
  if (!links || links.length === 0) return null
  const stop = (e: MouseEvent) => e.stopPropagation()
  return (
    <div className="foro-channels" onClick={stop}>
      {links.map((link) => (
        <a
          key={link.label}
          className="foro-channel"
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stop}
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}

/**
 * Full-viewport "reading" slide from the approved mock
 * (src/apps/foro/pages/HomePage.tsx), rebuilt on real publications: lists
 * the strict AND-intersection of publications across every selected
 * category, with a combinable chips row to add/remove concepts in place.
 */
export function PublicationsSlide({ open, categories, selectedIds, onToggleCategory, onClose }: PublicationsSlideProps) {
  const { data: types, isLoading: typesLoading } = usePublicationTypes()
  const feeds = usePublicationsByCategories(selectedIds)

  const anyFeedLoading = feeds.some((f) => f.isLoading)
  const isLoading = selectedIds.length > 0 && (anyFeedLoading || typesLoading)

  // Strict intersection (AND): start from the first selected category's
  // items (to preserve its order) and keep only publications present in
  // EVERY other selected category's list, matched by id.
  const activePublications: PublicationPreview[] = (() => {
    if (selectedIds.length === 0 || feeds.length === 0) return []
    if (feeds.some((f) => f.isLoading)) return []

    const [base, ...rest] = feeds
    if (!base) return []

    return base.items.filter((pub) => rest.every((feed) => feed.items.some((item) => item.id === pub.id)))
  })()

  const selectedNames = selectedIds
    .map((id) => categories.find((c) => c.id === id)?.name)
    .filter((name): name is string => Boolean(name))
    .join(' + ')

  return (
    <div
      className={`fixed inset-0 bg-[var(--foro-bg)] z-50 transition-all duration-400 ease-in-out flex flex-col ${
        open ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'
      }`}
    >
      <header className="px-5 md:px-16 py-5 border-b border-[#E2DFD8] bg-[var(--foro-bg)] flex justify-between items-center shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-mono text-[#1A1A1A] hover:text-[#C04A28] transition-colors flex items-center gap-2 font-bold uppercase tracking-wider"
        >
          ← Volver al mapa
        </button>

        <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase hidden sm:inline">
          Publicaciones Curadas
        </span>
      </header>

      <main className="flex-1 overflow-y-auto px-5 md:px-16 py-8 max-w-6xl mx-auto w-full">
        {/* SELECTOR DE CONCEPTOS DENTRO DEL SLIDE */}
        <div className="border-b border-[#E2DFD8] pb-6 mb-8 space-y-4">
          <h2 className="text-xl md:text-3xl font-serif text-[#1A1A1A]">
            Lecturas sobre: {selectedNames}
          </h2>

          {/* SELECCIÓN Y COMBINACIÓN DE CONCEPTOS */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase w-full sm:w-auto">
              Combinar conceptos:
            </span>
            {categories.map((category) => {
              const isSelected = selectedIds.includes(category.id)
              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => onToggleCategory(category.id)}
                  className={`text-[11px] font-mono px-2.5 py-1 border transition-all ${
                    isSelected
                      ? 'bg-[#C04A28] text-white border-[#C04A28] font-bold'
                      : 'bg-white text-gray-600 border-[#E2DFD8] hover:border-black'
                  }`}
                >
                  {isSelected ? `✓ ${category.name}` : `+ ${category.name}`}
                </button>
              )
            })}
          </div>
        </div>

        {/* TARJETAS CON PORTADA Y TIPO */}
        {isLoading ? (
          <div className="py-16 text-center">
            <p className="font-mono text-xs text-gray-400 uppercase tracking-widest">Cargando publicaciones…</p>
          </div>
        ) : activePublications.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {activePublications.map((pub) => {
              const type = types?.find((t) => t.id === pub.typeId)
              const slug = resolveKnownSlug(type)
              const accent = typeSlugToCssVar(slug)
              const catStyle = { '--foro-cat': accent } as CSSProperties
              const dateLabel = pub.createdAt.toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })

              return (
                <Link
                  key={pub.id}
                  to={`/publicaciones/${pub.id}`}
                  className="bg-white border border-[#E2DFD8] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer overflow-hidden"
                >
                  <div className="w-full h-32 relative flex flex-col justify-between">
                    {pub.imageUrl ? (
                      <img
                        src={pub.imageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="foro-ph absolute inset-0 flex items-center justify-center">
                        <span>img</span>
                      </div>
                    )}
                    <div className="relative z-10 p-4 flex justify-between items-start">
                      {type && (
                        <span
                          className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 uppercase text-white"
                          style={{ backgroundColor: accent }}
                        >
                          {type.name}
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-white/90 bg-black/40 px-2 py-0.5 backdrop-blur ml-auto">
                        {dateLabel}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between gap-4" style={catStyle}>
                    <div className="space-y-1.5">
                      <h3 className="font-serif font-semibold text-base md:text-lg text-[#1A1A1A] group-hover:text-[#C04A28] transition-colors leading-snug">
                        {pub.title}
                      </h3>
                      {pub.subtitle && (
                        <p className="font-sans text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          «{pub.subtitle}»
                        </p>
                      )}
                      <ChannelLinks links={pub.externalLinks} />
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
                      <span className="font-mono text-xs font-bold text-[#1A1A1A] group-hover:text-[#C04A28]">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="py-16 border border-dashed border-[#E2DFD8] text-center bg-white space-y-3 px-4">
            <p className="font-serif text-base text-[#1A1A1A]">
              No hay publicaciones que crucen simultáneamente estos conceptos.
            </p>
            <p className="text-xs font-sans text-gray-500">
              Probá quitar alguno de los conceptos arriba para ampliar los resultados.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
