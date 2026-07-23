export interface ServiceLinkItem {
  label: string
  href: string
}

/**
 * Los 5 servicios de CPE — única fuente de verdad para sus labels/rutas.
 * Consumido por el menú "Servicios" (MainLayout), la matriz de servicios
 * del hero (AboutHeroServicesMatrix) y los labels visibles del CircuitSection.
 */
export const SERVICE_LINKS: ServiceLinkItem[] = [
  { label: 'Intervención Directa', href: '/servicios/intervencion-directa' },
  { label: 'Acompañamiento a las personas', href: '/servicios/acompanamiento' },
  { label: 'Selección de Personal', href: '/servicios/seleccion-de-personal' },
  { label: 'Consultoría para el Empresario', href: '/servicios/clinica-para-empresarios' },
  { label: 'Traspaso Generacional', href: '/servicios/traspaso-generacional' },
]
