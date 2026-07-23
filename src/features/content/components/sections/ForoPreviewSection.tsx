import '@features/foro/styles/tokens.css'
import { usePublicationTypes, useFeedsByType, resolveKnownSlug } from '@features/foro'
import { colors } from '../../../../theme'

/** Borde plano sin redondear — mismo hairline que usa el hero/matriz de servicios. */
const HAIRLINE = `${colors.blueDark}1f`

const FORO_BASE = (import.meta.env.VITE_FORO_URL as string | undefined) ?? '/foro.html'

function foroHref(path = ''): string {
  return `${FORO_BASE}${path}`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ForoPreviewSection() {
  const { data: types } = usePublicationTypes()

  const paperType = types?.find((t) => resolveKnownSlug(t) === 'paper')
  const discussionType = types?.find((t) => resolveKnownSlug(t) === 'discusion')
  const podcastType = types?.find((t) => resolveKnownSlug(t) === 'podcast')
  const novedadType = types?.find((t) => resolveKnownSlug(t) === 'novedad')

  const typeIds = [paperType?.id, discussionType?.id, podcastType?.id, novedadType?.id].filter(
    (id): id is number => typeof id === 'number',
  )
  const feeds = useFeedsByType(typeIds, 6)

  const paperItems = feeds.find((f) => f.typeId === paperType?.id)?.items ?? []
  const discussionItems = feeds.find((f) => f.typeId === discussionType?.id)?.items ?? []
  const podcastItems = feeds.find((f) => f.typeId === podcastType?.id)?.items ?? []
  const novedadItems = feeds.find((f) => f.typeId === novedadType?.id)?.items ?? []

  if (
    paperItems.length === 0 &&
    discussionItems.length === 0 &&
    podcastItems.length === 0 &&
    novedadItems.length === 0
  ) {
    return null
  }

  const featuredPaper = paperItems[0]
  const featuredDiscussion = discussionItems[0]
  const featuredPodcast = podcastItems[0]
  const featuredNovedad = novedadItems[0]

  return (
    <section className="w-full bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado superior */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0e4844]">
            Desde el foro
          </span>
        </div>

        {/* Contenedor principal Grid */}
        <div className="grid grid-cols-1 gap-5">

          {/* FILA SUPERIOR: Paper Destacado + Imagen */}
          {featuredPaper && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Card izquierda verde oscuro — bordes rectos, sin redondear */}
              <div className="bg-[#0b3b38] text-white p-7 lg:p-8 flex flex-col justify-between min-h-[320px]">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#34d399] block mb-4">
                    Paper destacado
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif leading-tight mb-4 text-white">
                    {featuredPaper.title}
                  </h2>
                  {featuredPaper.subtitle && (
                    <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-light line-clamp-3">
                      {featuredPaper.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-6 text-xs text-gray-300 font-medium border-t border-[#1a4d4a] mt-6">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="18" rx="0" strokeWidth="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h18M8 3v3M16 3v3" />
                    </svg>
                    {formatDate(featuredPaper.createdAt)}
                  </span>
                  <a
                    href={foroHref(`/publicaciones/${featuredPaper.id}`)}
                    className="group flex items-center gap-1 text-sm font-semibold text-white"
                  >
                    <span className="underline-offset-4 group-hover:underline">Leer paper</span>
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </a>
                </div>
              </div>

              {/* Card derecha Imagen — borde recto hairline, sin redondear */}
              <div className="overflow-hidden min-h-[320px] relative border bg-gray-100" style={{ borderColor: HAIRLINE }}>
                {featuredPaper.imageUrl ? (
                  <img
                    src={featuredPaper.imageUrl}
                    alt={featuredPaper.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#f2f4f4]" />
                )}
              </div>
            </div>
          )}

          {/* FILA INFERIOR: 3 Cards de fondo claro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Card 1: Foros de Discusión */}
            {featuredDiscussion && (
              <div className="bg-[#f2f4f4] border p-6 flex flex-col justify-between min-h-[230px]" style={{ borderColor: HAIRLINE }}>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e4844] block mb-3">
                    Foros de discusión
                  </span>
                  <h3 className="text-xl font-serif text-[#0e4844] leading-snug mb-3">
                    {featuredDiscussion.title}
                  </h3>
                  {featuredDiscussion.subtitle && (
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {featuredDiscussion.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4">
                  <a
                    href={foroHref(`/publicaciones/${featuredDiscussion.id}`)}
                    className="group flex items-center gap-1 text-xs font-semibold text-[#0e4844] sm:text-sm"
                  >
                    <span className="underline-offset-4 group-hover:underline">Participar</span>
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </a>
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0e4844] border" style={{ borderColor: HAIRLINE }}>
                    {/* Icono Chat */}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Card 2: Podcast del Foro */}
            {featuredPodcast && (
              <div className="bg-[#f2f4f4] border p-6 flex flex-col justify-between min-h-[230px]" style={{ borderColor: HAIRLINE }}>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e4844] block mb-3">
                    Podcast del foro
                  </span>
                  <h3 className="text-xl font-serif text-[#0e4844] leading-snug mb-3">
                    {featuredPodcast.title}
                  </h3>
                  {featuredPodcast.subtitle && (
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {featuredPodcast.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4">
                  <a
                    href={foroHref(`/publicaciones/${featuredPodcast.id}`)}
                    className="group flex items-center gap-1 text-xs font-semibold text-[#0e4844] sm:text-sm"
                  >
                    <span className="underline-offset-4 group-hover:underline">Escuchar episodio</span>
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </a>
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0e4844] border" style={{ borderColor: HAIRLINE }}>
                    {/* Icono Onda de Audio */}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12 0c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Card 3: Novedad Destacada */}
            {featuredNovedad && (
              <div className="bg-[#f2f4f4] border p-6 flex flex-col justify-between min-h-[230px]" style={{ borderColor: HAIRLINE }}>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e4844] block mb-3">
                    Novedad destacada
                  </span>
                  <h3 className="text-xl font-serif text-[#0e4844] leading-snug mb-3">
                    {featuredNovedad.title}
                  </h3>
                  {featuredNovedad.subtitle && (
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {featuredNovedad.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4">
                  <a
                    href={foroHref(`/publicaciones/${featuredNovedad.id}`)}
                    className="group flex items-center gap-1 text-xs font-semibold text-[#0e4844] sm:text-sm"
                  >
                    <span className="underline-offset-4 group-hover:underline">Ver novedad</span>
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </a>
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0e4844] border" style={{ borderColor: HAIRLINE }}>
                    {/* Icono Novedad (campana) */}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Link inferior */}
        <div className="mt-8 text-center">
          <a
            href={foroHref()}
            className="group inline-flex items-center gap-1 text-xs font-semibold text-[#0e4844] sm:text-sm"
          >
            <span className="underline-offset-4 group-hover:underline">Ver todas las publicaciones</span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
