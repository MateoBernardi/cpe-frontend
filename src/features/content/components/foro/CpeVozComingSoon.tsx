import cpevozLogo from './assets/cpevoz-logo.png'
import { foroAccents } from '../../../../theme'

/**
 * CPEVoz's "not published yet" state for the type page (`InteraccionSeccionPage`,
 * shown only once the publications fetch has actually resolved to an empty
 * list — see the caller's `!pubsLoading && !pubsError && ...` guard, which
 * this component assumes already happened. It intentionally does not check
 * loading state itself, so it must never be rendered off a bare `!publications`.
 *
 * Vertical preview clip (`/cpevoz-preview.mp4`, native 1080x1920) autoplays
 * muted/looped like a Reels/Story preview — silent since there's nothing to
 * narrate yet, just motion to signal "this is a real, coming show". Skips
 * autoplay under `prefers-reduced-motion`, leaving the paused first frame.
 */
export function CpeVozComingSoon() {
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  return (
    <div className="flex flex-col items-center gap-8 py-12 text-center lg:flex-row lg:justify-center lg:gap-14 lg:py-16 lg:text-left">
      <div
        className="aspect-[9/16] w-48 shrink-0 overflow-hidden bg-black shadow-lg ring-1 ring-slate-200 sm:w-56"
      >
        <video
          className="h-full w-full object-cover"
          src="/cpevoz-preview.mp4"
          autoPlay={!prefersReducedMotion}
          loop={!prefersReducedMotion}
          muted
          playsInline
          aria-hidden="true"
        />
      </div>

      <div className="flex max-w-md flex-col items-center gap-4 lg:items-start">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: foroAccents.podcast }}
        >
          Próximamente
        </span>
        <img src={cpevozLogo} alt="CPEVoz" className="h-9 w-auto sm:h-10" />
        <p className="text-sm leading-relaxed text-gray-500 sm:text-base">
          Estamos preparando el primer episodio. Muy pronto vas a poder escucharlo acá.
        </p>
      </div>
    </div>
  )
}
