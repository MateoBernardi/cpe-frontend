/**
 * Roles predeterminados por sección.
 * El admin no necesita definir roles manualmente — se asignan según la sección activa.
 */

interface SectionRoleConfig {
  textRoles: string[]
  mediaRoles: string[]
}

export const SECTION_ROLES: Record<string, SectionRoleConfig> = {
  hero: {
    textRoles: ['headline', 'subheadline'],
    mediaRoles: ['background'],
  },
  secondary_hero: {
    textRoles: ['heading', 'subtitle', 'cta'],
    mediaRoles: ['photo'],
  },
  about: {
    textRoles: ['heading', 'paragraph', 'bio'],
    mediaRoles: ['photo', 'logo'],
  },
  news: {
    textRoles: ['heading', 'paragraph', 'quote'],
    mediaRoles: ['thumbnail', 'illustration'],
  },
  info_primary: {
    textRoles: ['heading', 'bullet'],
    mediaRoles: ['diagram', 'icon'],
  },
  info_secondary: {
    textRoles: ['heading', 'paragraph', 'quote'],
    mediaRoles: ['photo', 'logo'],
  },
  contact_form: {
    textRoles: ['heading', 'paragraph', 'cta', 'info', 'label_name', 'label_email', 'label_location', 'label_phone', 'label_employees', 'label_message'],
    mediaRoles: ['background'],
  },
  service_intervencion: {
    textRoles: ['heading', 'subtitle', 'paragraph', 'bullet'],
    mediaRoles: ['photo'],
  },
  service_seleccion: {
    textRoles: ['heading', 'subtitle', 'paragraph', 'bullet', 'label_area', 'label_experience', 'label_modality', 'label_availability'],
    mediaRoles: ['photo'],
  },
  service_acompanamiento: {
    textRoles: ['heading', 'subtitle', 'paragraph', 'bullet'],
    mediaRoles: ['photo'],
  },
}

export function getSectionRoles(sectionName: string): SectionRoleConfig {
  return SECTION_ROLES[sectionName] ?? {
    textRoles: ['headline', 'paragraph'],
    mediaRoles: ['background'],
  }
}

/* ── Nombres en español para la UI de administración ── */

export const SECTION_DISPLAY_NAMES: Record<string, string> = {
  hero: 'Portada Principal',
  secondary_hero: 'Portada Secundaria',
  about: 'Nosotros',
  news: 'Novedades',
  info_primary: 'Información Principal',
  info_secondary: 'Información Secundaria',
  contact_form: 'Formulario de Contacto',
  service_intervencion: 'Servicio: Intervención Directa',
  service_seleccion: 'Servicio: Selección de Personal',
  service_acompanamiento: 'Servicio: Acompañamiento',
}

export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  // Roles de texto
  headline: 'Título principal',
  subheadline: 'Subtítulo principal',
  heading: 'Encabezado',
  subtitle: 'Subtítulo',
  paragraph: 'Párrafo',
  bio: 'Biografía',
  quote: 'Cita',
  bullet: 'Viñeta',
  cta: 'Llamada a la acción',
  // Roles de media
  background: 'Fondo',
  portrait: 'Retrato',
  photo: 'Foto',
  logo: 'Logo',
  thumbnail: 'Miniatura',
  illustration: 'Ilustración',
  diagram: 'Diagrama',
  icon: 'Ícono',
  info: 'Información adicional',
  label_name: 'Etiqueta nombre',
  label_email: 'Etiqueta email',
  label_location: 'Etiqueta localidad',
  label_phone: 'Etiqueta teléfono',
  label_employees: 'Etiqueta empleados',
  label_message: 'Etiqueta mensaje',
  label_area: 'Pregunta área de trabajo',
  label_experience: 'Pregunta experiencia',
  label_modality: 'Pregunta modalidad',
  label_availability: 'Pregunta disponibilidad',
}

export function getSectionDisplayName(sectionName: string): string {
  return SECTION_DISPLAY_NAMES[sectionName] ?? sectionName
}

export function getRoleDisplayName(role: string): string {
  return ROLE_DISPLAY_NAMES[role] ?? role
}
