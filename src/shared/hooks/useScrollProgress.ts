import { useEffect, useRef, useState } from 'react'

/**
 * Hook que devuelve el progreso de scroll (0 → 1) de un elemento
 * conforme cruza el viewport. Ideal para animaciones basadas en scroll.
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleScroll = () => {
      const rect = el.getBoundingClientRect()
      const wh = window.innerHeight
      // 0 cuando el top del elemento toca el fondo del viewport
      // 1 cuando el bottom del elemento pasa el top del viewport
      const raw = (wh - rect.top) / (wh + rect.height)
      setProgress(Math.max(0, Math.min(1, raw)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { ref, progress }
}
