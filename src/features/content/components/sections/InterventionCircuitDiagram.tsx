import { useNavigate } from 'react-router-dom'
import { SERVICE_LINKS } from '@shared/config/serviceLinks'
import { colors } from '../../../../theme'

/** Labels/rutas visibles de los hotspots del circuito — mismas que SERVICE_LINKS. */
const intervencionDirecta = SERVICE_LINKS.find((s) => s.href === '/servicios/intervencion-directa')!
const seleccionDePersonal = SERVICE_LINKS.find((s) => s.href === '/servicios/seleccion-de-personal')!
const acompanamiento = SERVICE_LINKS.find((s) => s.href === '/servicios/acompanamiento')!

/**
 * Diagrama del circuito integrado de acción (imagen + hotspots clickeables),
 * embebido en la sección de Metodología (InfoSecondarySection) en lugar de la
 * rueda de segmentos. Replica a propósito el markup del diagrama de
 * CircuitSection.tsx — esa sección quedó oculta de la home y NO debe editarse,
 * por eso este componente vive aparte en vez de extraer/compartir su código.
 */
export default function InterventionCircuitDiagram() {
  const navigate = useNavigate()
  const handleNavigate = (route: string) => () => navigate({ pathname: route, hash: '' })

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="relative mx-auto w-full aspect-[810/1012] max-w-[320px] overflow-hidden sm:max-w-[380px] md:max-w-[420px] lg:max-w-[460px]"
        style={{ backgroundColor: colors.infoSecondaryBg }}
      >
        <img
          src="/CPE%20%20POST.svg"
          alt="Circuito integrado de accion"
          className="block h-full w-full select-none object-contain mix-blend-multiply"
          loading="lazy"
          draggable={false}
        />

        {/* Hotspots invisibles — la imagen del circuito ya trae los títulos de
            los servicios, así que acá no se renderiza texto duplicado; el nombre
            accesible queda en el aria-label. */}

        {/* Intervención Directa (Cuadrado superior) */}
        <button
          type="button"
          aria-label={intervencionDirecta.label}
          onClick={handleNavigate(intervencionDirecta.href)}
          className="absolute left-1/2 top-[20%] h-[25%] w-[55%] -translate-x-1/2 bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        />

        {/* Selección de Personal (Cuadrado inferior izquierdo) */}
        <button
          type="button"
          aria-label={seleccionDePersonal.label}
          onClick={handleNavigate(seleccionDePersonal.href)}
          className="absolute left-[15%] top-[40%] h-[40%] w-[30%] bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        />

        {/* Acompañamiento a las personas (Cuadrado inferior derecho) */}
        <button
          type="button"
          aria-label={acompanamiento.label}
          onClick={handleNavigate(acompanamiento.href)}
          className="absolute right-[5%] top-[50%] h-[30%] w-[50%] bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        />
      </div>

      {/* Hint — mismo texto que en CircuitSection */}
      <div className="mt-2 text-center text-sm text-gray-500">
        Clickeá cada sección del circuito para conocer nuestros servicios.
      </div>
    </div>
  )
}
