import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3-force'
import type { Category } from '@features/foro'

// ==========================================
// Node model — extracted from the approved "CartografiaCompleta" mock
// (src/apps/foro/pages/HomePage.tsx). Real categories have no hierarchy
// level, so it's derived deterministically below (§ deriveLevel).
// ==========================================
interface MapNode extends d3.SimulationNodeDatum {
  id: number
  name: string
  level: 1 | 2 | 3
}

/** Half-width/half-height of a node's rendered label box, in px. */
interface NodeHalfSize {
  halfW: number
  halfH: number
}

/**
 * Deterministic visual hierarchy for real categories (which carry no
 * "level" of their own): the first category reads as the anchor concept
 * (level 1, biggest type), the rest alternate between level 2 and level 3
 * so the map still reads like the mock's original hierarchy instead of a
 * flat list.
 */
function deriveLevel(index: number): 1 | 2 | 3 {
  if (index === 0) return 1
  return index % 2 === 1 ? 2 : 3
}

const MOBILE_BREAKPOINT = 640
const MD_BREAKPOINT = 768

/**
 * Font size (px) actually applied to a node's label `<span>`, mirroring the
 * Tailwind classes in the JSX below and Tailwind's *default* type scale
 * (verified against `tailwind.config.ts` / `index.css` — no custom
 * `fontSize` overrides in this project):
 *   level 1: `text-base sm:text-xl md:text-2xl`  → 16 / 20 / 24
 *   level 2: `text-sm sm:text-base md:text-lg`   → 14 / 16 / 18
 *   level 3: `text-xs sm:text-sm` (no md: bump)  → 12 / 14 / 14
 * The breakpoint tier is picked from the map's own container width (the
 * same width the resize/tick logic already reads), which tracks the
 * viewport width these Tailwind breakpoints respond to.
 */
function fontSizePxForLevel(level: 1 | 2 | 3, containerWidth: number): number {
  const tier: 'base' | 'sm' | 'md' =
    containerWidth >= MD_BREAKPOINT ? 'md' : containerWidth >= MOBILE_BREAKPOINT ? 'sm' : 'base'

  if (level === 1) return tier === 'md' ? 24 : tier === 'sm' ? 20 : 16
  if (level === 2) return tier === 'md' ? 18 : tier === 'sm' ? 16 : 14
  return tier === 'base' ? 12 : 14
}

// Analytic label-box model — drives sizing from the first frame (before any
// DOM measurement lands) from the label's letter count and its actual
// applied font size, rather than fixed per-level guesses.
const AVG_CHAR_WIDTH_RATIO = 0.58 // serif face, midpoint of the 0.55–0.6 range
const LEADING_TIGHT = 1.25 // matches the `leading-tight` class on the label
const MOBILE_WRAP_WIDTH = 140 // matches the `max-w-[140px]` mobile wrap box
const HOVER_DOT_ALLOWANCE = 14 // the `•` glyph + `gap-1` before the label (desktop only)
const BUTTON_PADDING_X = 12 // `p-1.5` (6px) on each side of the button

/**
 * Estimates a node's rendered label-box half-size from its letter count and
 * applied font size — used as the fallback/first-frame sizing until (and
 * unless) `sizesRef` has a real DOM measurement for that node, which always
 * wins when available.
 */
function estimateHalfSize(name: string, level: 1 | 2 | 3, containerWidth: number): NodeHalfSize {
  const isMobileTier = containerWidth < MOBILE_BREAKPOINT
  const fontSize = fontSizePxForLevel(level, containerWidth)
  const estimatedWidth = name.length * AVG_CHAR_WIDTH_RATIO * fontSize

  if (isMobileTier) {
    // Wraps inside `max-w-[140px]` (leading-tight → 1.25 line-height).
    const width = Math.min(estimatedWidth, MOBILE_WRAP_WIDTH)
    const lines = Math.max(1, Math.ceil(estimatedWidth / MOBILE_WRAP_WIDTH))
    const height = lines * LEADING_TIGHT * fontSize
    return { halfW: width / 2, halfH: height / 2 }
  }

  // `whitespace-nowrap` — single line, plus the hover dot + button padding.
  const width = estimatedWidth + HOVER_DOT_ALLOWANCE + BUTTON_PADDING_X
  const height = LEADING_TIGHT * fontSize
  return { halfW: width / 2, halfH: height / 2 }
}

// Circle-collide over-approximates a rectangle's corners, so the effective
// radius is shrunk from the true half-diagonal — tuned to look tight without
// letting boxes actually touch.
const COLLIDE_FACTOR = 0.78
const COLLIDE_MARGIN = 10

// Small breathing room added on top of a node's own half-size when clamping
// it inside the container edges.
const EDGE_MARGIN = 12

interface ConceptMapProps {
  categories: Category[]
  onSelectCategory: (id: number) => void
}

/**
 * The full map screen (header + d3-force conceptual map + footer strip),
 * rebuilt on real category data. Renders inside `ForoLayout`'s
 * `<main className="pt-[15vh]">`, so it's sized to the REMAINING viewport
 * (not `h-screen`, which would double-count the fixed site header's space).
 */
export function ConceptMap({ categories, onSelectCategory }: ConceptMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const simulationRef = useRef<d3.Simulation<MapNode, undefined> | null>(null)

  // Real, measured label-box half-sizes per node id (populated from the DOM
  // after render — never fed back into React state, only consumed by the
  // simulation's collide force and the tick handler's edge clamp).
  const sizesRef = useRef<Map<number, NodeHalfSize>>(new Map())
  // Live button elements per node id, populated via stable per-id ref
  // callbacks (so 60fps tick re-renders don't churn the ref map).
  const nodeElsRef = useRef<Map<number, HTMLButtonElement>>(new Map())
  const nodeRefCallbacksRef = useRef<Map<number, (el: HTMLButtonElement | null) => void>>(new Map())

  const [nodes, setNodes] = useState<MapNode[]>([])
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  // Stable key so the simulation only reinitializes when the actual set of
  // category ids changes (not on every re-render of the parent/query).
  const categoriesKey = categories.map((c) => c.id).join(',')

  const getNodeRefCallback = (id: number) => {
    let cb = nodeRefCallbacksRef.current.get(id)
    if (!cb) {
      cb = (el: HTMLButtonElement | null) => {
        if (el) nodeElsRef.current.set(id, el)
        else nodeElsRef.current.delete(id)
      }
      nodeRefCallbacksRef.current.set(id, cb)
    }
    return cb
  }

  useEffect(() => {
    if (!containerRef.current) return
    if (categories.length === 0) return

    // Fresh category set: any sizes/elements measured for a previous set
    // (possibly reusing the same numeric ids in a different context) are
    // stale.
    sizesRef.current.clear()
    nodeElsRef.current.clear()
    nodeRefCallbacksRef.current.clear()

    const width = containerRef.current.offsetWidth || 360
    const height = containerRef.current.offsetHeight || 500

    const initialNodes: MapNode[] = categories.map((c, index) => ({
      id: c.id,
      name: c.name,
      level: deriveLevel(index),
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100,
    }))

    const simulation = d3.forceSimulation<MapNode>(initialNodes)
    simulationRef.current = simulation

    const collideRadiusFor = (node: MapNode, w: number): number => {
      const { halfW, halfH } = sizesRef.current.get(node.id) ?? estimateHalfSize(node.name, node.level, w)
      return Math.hypot(halfW, halfH) * COLLIDE_FACTOR + COLLIDE_MARGIN
    }

    const handleResize = (reheatHard: boolean) => {
      if (!containerRef.current || !simulationRef.current) return
      const w = containerRef.current.offsetWidth
      const h = containerRef.current.offsetHeight
      const isMobile = w < MOBILE_BREAKPOINT

      // Escalas dinámicas según ancho de pantalla
      const chargeStrength = isMobile ? -130 : -260

      simulationRef.current
        .force('center', d3.forceCenter(w / 2, h / 2).strength(0.05))
        .force('charge', d3.forceManyBody().strength(chargeStrength))
        .force('collide', d3.forceCollide<MapNode>().radius((d) => collideRadiusFor(d, w)))
        .force('x', d3.forceX(w / 2).strength(0.03))
        .force('y', d3.forceY(h / 2).strength(0.03))

      // On a real resize the previous layout may be badly overlapped for the
      // new dimensions/radii — reheat hard so nodes actually redistribute
      // instead of cooling down from a tangled state.
      simulationRef.current.alpha(reheatHard ? 0.9 : 0.5).restart()
    }

    /** Re-reads each node's real label box from the DOM, then re-applies forces. */
    const measureAndReheat = (reheatHard: boolean) => {
      nodeElsRef.current.forEach((el, id) => {
        sizesRef.current.set(id, { halfW: el.offsetWidth / 2, halfH: el.offsetHeight / 2 })
      })
      handleResize(reheatHard)
    }

    simulation.on('tick', () => {
      if (!containerRef.current) return
      const w = containerRef.current.offsetWidth
      const h = containerRef.current.offsetHeight

      initialNodes.forEach((node) => {
        const { halfW, halfH } = sizesRef.current.get(node.id) ?? estimateHalfSize(node.name, node.level, w)

        const minX = halfW + EDGE_MARGIN
        const maxX = w - halfW - EDGE_MARGIN
        if (node.x !== undefined) {
          // If the container is narrower than the label + margins, the
          // range inverts (minX > maxX) — center it instead of collapsing
          // every node onto the same edge value.
          node.x = minX <= maxX ? Math.max(minX, Math.min(maxX, node.x)) : w / 2
        }

        const minY = halfH + EDGE_MARGIN
        const maxY = h - halfH - EDGE_MARGIN
        if (node.y !== undefined) {
          node.y = minY <= maxY ? Math.max(minY, Math.min(maxY, node.y)) : h / 2
        }
      })

      setNodes([...initialNodes])
    })

    // Debounce continuous resize thrashing (dragging the window edge fires
    // ResizeObserver many times a second); only measure + reheat once things
    // settle for a beat.
    let resizeTimeout: ReturnType<typeof setTimeout> | undefined
    const scheduleMeasureAndReheat = () => {
      if (resizeTimeout !== undefined) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        resizeTimeout = undefined
        measureAndReheat(true)
      }, 100)
    }

    const resizeObserver = new ResizeObserver(() => scheduleMeasureAndReheat())
    resizeObserver.observe(containerRef.current)

    // Prime the forces immediately (using fallback size estimates, since no
    // node has been painted yet) so the very first ticks aren't wildly off.
    handleResize(false)

    return () => {
      if (resizeTimeout !== undefined) clearTimeout(resizeTimeout)
      resizeObserver.disconnect()
      simulation.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesKey])

  // One-time initial measurement once the nodes have actually been painted
  // (their real label boxes now exist in the DOM) — refines the fallback
  // estimates used for the first few ticks into real per-node sizes, then
  // reheats so the collide force pushes off of accurate radii. Guarded so
  // it only fires once per category set; later remeasures come from the
  // ResizeObserver above. Sizes are stored in a ref, never in state, so this
  // can't loop.
  const didInitialMeasureRef = useRef(false)
  useEffect(() => {
    didInitialMeasureRef.current = false
  }, [categoriesKey])

  useLayoutEffect(() => {
    if (nodes.length === 0 || didInitialMeasureRef.current) return
    didInitialMeasureRef.current = true

    nodeElsRef.current.forEach((el, id) => {
      sizesRef.current.set(id, { halfW: el.offsetWidth / 2, halfH: el.offsetHeight / 2 })
    })

    if (!containerRef.current || !simulationRef.current) return
    const w = containerRef.current.offsetWidth
    const h = containerRef.current.offsetHeight
    const isMobile = w < MOBILE_BREAKPOINT
    const chargeStrength = isMobile ? -130 : -260

    simulationRef.current
      .force('center', d3.forceCenter(w / 2, h / 2).strength(0.05))
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force(
        'collide',
        d3.forceCollide<MapNode>().radius((d) => {
          const { halfW, halfH } = sizesRef.current.get(d.id) ?? estimateHalfSize(d.name, d.level, w)
          return Math.hypot(halfW, halfH) * COLLIDE_FACTOR + COLLIDE_MARGIN
        }),
      )
      .force('x', d3.forceX(w / 2).strength(0.03))
      .force('y', d3.forceY(h / 2).strength(0.03))

    simulationRef.current.alpha(0.7).restart()
  }, [nodes])

  return (
    <div className="w-full h-[calc(100vh-15vh)] bg-[var(--foro-bg)] text-[#1A1A1A] font-sans flex flex-col justify-between overflow-hidden selection:bg-[#E2DFD8]">
      <style>{`
        @keyframes floatBreathing {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        .breathing-node {
          animation: floatBreathing 7s ease-in-out infinite;
        }
      `}</style>

      <header className="px-5 md:px-14 pt-6 md:pt-8 pb-4 border-b border-[#E2DFD8]/70 bg-[var(--foro-bg)] z-20">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl md:text-3xl font-serif text-[#1A1A1A] font-normal">
            Explorá nuestras ideas
          </h1>
          <p className="text-xs font-sans text-gray-500 mt-0.5">
            {categories.length > 0 ? 'Elegí un concepto para comenzar.' : 'Cargando conceptos…'}
          </p>
        </div>
      </header>

      {/* CONTENEDOR DEL MAPA CON BORDES PROTEGIDOS */}
      <main className="flex-1 relative overflow-hidden">
        <div ref={containerRef} className="absolute inset-0">
          {nodes.map((concept, index) => {
            const isHovered = hoveredId === concept.id

            return (
              <div
                key={concept.id}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  transform: `translate3d(${concept.x || 0}px, ${concept.y || 0}px, 0) translate(-50%, -50%)`,
                  zIndex: 10,
                }}
              >
                <button
                  ref={getNodeRefCallback(concept.id)}
                  type="button"
                  style={{ animationDelay: `${(index * 0.8) % 4}s` }}
                  className="breathing-node p-1.5 focus:outline-none group cursor-pointer block text-center max-w-[140px] sm:max-w-none"
                  onMouseEnter={() => setHoveredId(concept.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onSelectCategory(concept.id)}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span
                      className={`text-xs transition-opacity duration-200 text-[#C04A28] ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      •
                    </span>

                    {/* TIPOGRAFÍA ESCALADA PARA MOBILE */}
                    <span
                      className={`font-serif tracking-tight transition-colors duration-200 leading-tight whitespace-normal sm:whitespace-nowrap ${
                        concept.level === 1
                          ? 'text-base sm:text-xl md:text-2xl font-semibold text-[#1A1A1A]'
                          : concept.level === 2
                            ? 'text-sm sm:text-base md:text-lg font-medium text-[#3A3A3A]'
                            : 'text-xs sm:text-sm text-[#6A6A6A]'
                      } group-hover:text-[#C04A28]`}
                    >
                      {concept.name}
                    </span>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
