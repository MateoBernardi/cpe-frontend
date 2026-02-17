/**
 * Roles predeterminados por sección.
 * El admin no necesita definir roles manualmente — se asignan según la sección activa.
 */

interface SectionRoleConfig {
  textRoles: string[]
  mediaRoles: string[]
  /** Rol por defecto para textos nuevos */
  defaultTextRole: string
  /** Rol por defecto para media nuevo */
  defaultMediaRole: string
}

export const SECTION_ROLES: Record<string, SectionRoleConfig> = {
  hero: {
    textRoles: ['heading', 'subheading'],
    mediaRoles: ['background'],
    defaultTextRole: 'heading',
    defaultMediaRole: 'background',
  },
  secondary_hero: {
    textRoles: ['heading', 'subtitle', 'paragraph'],
    mediaRoles: ['background', 'portrait'],
    defaultTextRole: 'heading',
    defaultMediaRole: 'portrait',
  },
  about: {
    textRoles: ['heading', 'paragraph', 'bio'],
    mediaRoles: ['photo', 'logo'],
    defaultTextRole: 'heading',
    defaultMediaRole: 'photo',
  },
  news: {
    textRoles: ['heading', 'paragraph', 'quote'],
    mediaRoles: ['thumbnail', 'illustration'],
    defaultTextRole: 'heading',
    defaultMediaRole: 'thumbnail',
  },
  info_primary: {
    textRoles: ['heading', 'subtitle', 'paragraph', 'bullet'],
    mediaRoles: ['diagram', 'icon'],
    defaultTextRole: 'heading',
    defaultMediaRole: 'diagram',
  },
  info_secondary: {
    textRoles: ['heading', 'paragraph', 'quote'],
    mediaRoles: ['photo', 'logo'],
    defaultTextRole: 'heading',
    defaultMediaRole: 'photo',
  },
  contact_form: {
    textRoles: ['heading', 'paragraph', 'cta'],
    mediaRoles: ['background'],
    defaultTextRole: 'heading',
    defaultMediaRole: 'background',
  },
}

export function getSectionRoles(sectionName: string): SectionRoleConfig {
  return SECTION_ROLES[sectionName] ?? {
    textRoles: ['heading', 'paragraph'],
    mediaRoles: ['photo'],
    defaultTextRole: 'heading',
    defaultMediaRole: 'photo',
  }
}
