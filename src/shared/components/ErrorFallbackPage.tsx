import { colors, fonts } from '../../theme'

const WHATSAPP_NUMBER = '5493512180273'
const WHATSAPP_MESSAGE = 'Hola, quiero información respecto a los servicios de Clínica para Empresas.'
const EMAIL = 'contacto@clinicaparaempresas.com'
const PHONE = '+54 9 351 218-0273'

interface ErrorFallbackPageProps {
  onRetry?: () => void
}

export default function ErrorFallbackPage({ onRetry }: ErrorFallbackPageProps) {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: colors.offWhite, fontFamily: fonts.primary }}
    >
      {/* ── Illustrated icon composition ── */}
      <div className="relative mb-10 h-48 w-48 select-none" aria-hidden="true">
        {/* Outer pulsing ring */}
        <div
          className="absolute inset-0 animate-ping rounded-full opacity-10"
          style={{ backgroundColor: colors.tealBright }}
        />
        {/* Circle background */}
        <div
          className="absolute inset-0 rounded-full opacity-10"
          style={{ backgroundColor: colors.tealMid }}
        />
        {/* Inner circle */}
        <div
          className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg"
          style={{ backgroundColor: colors.white }}
        >
          {/* Wrench + Gear composite icon */}
          <svg
            className="h-16 w-16"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gear */}
            <g style={{ color: colors.tealMid }}>
              <path
                d="M36.5 8h-9l-1.2 5.1a18.1 18.1 0 00-4.4 2.5L17 13.5l-4.5 7.8 4 3.4a18.3 18.3 0 000 5l-4 3.4 4.5 7.8 4.9-2.1a18.1 18.1 0 004.4 2.5L27.5 46h9l1.2-5.1a18.1 18.1 0 004.4-2.5l4.9 2.1 4.5-7.8-4-3.4a18.3 18.3 0 000-5l4-3.4-4.5-7.8-4.9 2.1a18.1 18.1 0 00-4.4-2.5L36.5 8z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <circle
                cx="32"
                cy="27"
                r="7"
                stroke="currentColor"
                strokeWidth="2.5"
              />
            </g>
            {/* Small alert triangle */}
            <g style={{ color: colors.blueDark }}>
              <path
                d="M44 42l6.5 11.3a2 2 0 01-1.73 3H37.23a2 2 0 01-1.73-3L42 42a2 2 0 013.46 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                fill={colors.offWhite}
              />
              <line
                x1="45.5"
                y1="48"
                x2="45.5"
                y2="51"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="45.5" cy="53.5" r="1" fill="currentColor" />
            </g>
          </svg>
        </div>
        {/* Floating decorative dots */}
        <span
          className="absolute left-2 top-6 h-3 w-3 rounded-full opacity-40"
          style={{ backgroundColor: colors.tealBright }}
        />
        <span
          className="absolute bottom-8 right-0 h-2 w-2 rounded-full opacity-30"
          style={{ backgroundColor: colors.blueMid }}
        />
        <span
          className="absolute right-4 top-2 h-2 w-2 rounded-full opacity-25"
          style={{ backgroundColor: colors.tealDeep }}
        />
      </div>

      {/* ── Heading ── */}
      <h1
        className="mb-3 text-3xl font-bold sm:text-4xl"
        style={{ color: colors.blueDark }}
      >
        Estamos teniendo problemas
      </h1>
      <p
        className="mb-8 max-w-md text-base leading-relaxed sm:text-lg"
        style={{ color: colors.tealDeep, opacity: 0.85 }}
      >
        Algo salió mal al cargar esta sección. <br />
        Podés intentar de nuevo o contactarnos por cualquiera de estos medios:
      </p>

      {/* ── Contact cards ── */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row">
        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-xl px-6 py-3 shadow-md transition-all hover:scale-105 hover:shadow-lg"
          style={{ backgroundColor: '#25D366', color: colors.white }}
        >
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="text-sm font-semibold">WhatsApp</span>
        </a>

        {/* Email */}
        <a
          href={`mailto:${EMAIL}`}
          className="group flex items-center gap-3 rounded-xl px-6 py-3 shadow-md transition-all hover:scale-105 hover:shadow-lg"
          style={{ backgroundColor: colors.tealMid, color: colors.white }}
        >
          <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <span className="text-sm font-semibold">Email</span>
        </a>

        {/* Phone */}
        <a
          href={`tel:${PHONE.replace(/\s/g, '')}`}
          className="group flex items-center gap-3 rounded-xl border-2 px-6 py-3 shadow-md transition-all hover:scale-105 hover:shadow-lg"
          style={{ borderColor: colors.tealMid, color: colors.tealMid, backgroundColor: colors.white }}
        >
          <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          <span className="text-sm font-semibold">Llamar</span>
        </a>
      </div>

      {/* ── Retry button ── */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mb-6 rounded-xl px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
          style={{ backgroundColor: colors.blueDark }}
        >
          Reintentar
        </button>
      )}

      {/* ── Home link ── */}
      <a
        href="/"
        className="text-sm underline underline-offset-4 transition-colors"
        style={{ color: colors.tealMid }}
      >
        Volver al inicio
      </a>
    </div>
  )
}
