// DEMO ONLY — mock content for the demo profile flow. Delete alongside demoAuth.tsx.
import type { PublicationPreview, InteractionCounts, KnownPublicationTypeSlug } from '@features/foro'
import { DEMO_USERS } from './demoAuthContext'

export interface DemoPublicationEntry {
  preview: PublicationPreview
  slug: KnownPublicationTypeSlug
  typeName: string
}

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

const counts = (saves: number, visits: number, likes: number, comments: number): InteractionCounts => ({
  saves,
  visits,
  likes,
  comments,
})

// 8 seeded-id-compatible mock publications spanning the 4 types (ids 1–8) so
// any links resolve against the seeded DB if the demo is ever pointed at it.
const BASE: DemoPublicationEntry[] = [
  {
    slug: 'paper',
    typeName: 'Paper',
    preview: {
      id: 1,
      title: 'Marcos regulatorios para IA en salud ocupacional',
      subtitle: 'Un relevamiento comparado de normativas locales y su impacto en clínicas laborales.',
      imageUrl: null,
      typeId: null,
      createdBy: DEMO_USERS.publisher.name,
      createdAt: daysAgo(3),
      interactions: counts(18, 240, 32, 6),
    },
  },
  {
    slug: 'podcast',
    typeName: 'Podcast',
    preview: {
      id: 2,
      title: 'Salud mental en equipos remotos',
      subtitle: 'Conversamos con especialistas sobre burnout y contención a distancia.',
      imageUrl: null,
      typeId: null,
      createdBy: DEMO_USERS.visitor.name,
      createdAt: daysAgo(6),
      interactions: counts(9, 310, 21, 3),
      externalLinks: [{ label: 'Escuchar en Spotify', url: 'https://open.spotify.com/' }],
    },
  },
  {
    slug: 'novedad',
    typeName: 'Novedad',
    preview: {
      id: 3,
      title: 'Nueva guía de reincorporación laboral',
      subtitle: null,
      imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
      typeId: null,
      createdBy: DEMO_USERS.publisher.name,
      createdAt: daysAgo(1),
      interactions: counts(5, 180, 14, 0),
      // Exercises the promotional video path (TypeHero/MagazineGrid video
      // badge + the detail page's embedded player) — see getYouTubeEmbedUrl.
      externalLinks: [{ label: 'youtube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }],
    },
  },
  {
    slug: 'discusion',
    typeName: 'Discusión',
    preview: {
      id: 4,
      title: '¿Cómo miden el ausentismo en sus organizaciones?',
      subtitle: 'Comparemos métricas y herramientas entre pares.',
      imageUrl: null,
      typeId: null,
      createdBy: DEMO_USERS.visitor.name,
      createdAt: daysAgo(10),
      interactions: counts(2, 95, 7, 12),
    },
  },
  {
    slug: 'paper',
    typeName: 'Paper',
    preview: {
      id: 5,
      title: 'Ergonomía y productividad: revisión de evidencia 2020-2025',
      subtitle: 'Qué dice la literatura reciente sobre puestos híbridos.',
      imageUrl: null,
      typeId: null,
      createdBy: DEMO_USERS.publisher.name,
      createdAt: daysAgo(14),
      interactions: counts(27, 420, 51, 9),
    },
  },
  {
    slug: 'podcast',
    typeName: 'Podcast',
    preview: {
      id: 6,
      title: 'Liderazgo y clima organizacional',
      subtitle: 'Charla con referentes de recursos humanos.',
      imageUrl: null,
      typeId: null,
      createdBy: DEMO_USERS.visitor.name,
      createdAt: daysAgo(20),
      interactions: counts(6, 150, 11, 1),
      externalLinks: [{ label: 'Escuchar en Spotify', url: 'https://open.spotify.com/' }],
    },
  },
  {
    slug: 'novedad',
    typeName: 'Novedad',
    preview: {
      id: 7,
      title: 'Actualización del protocolo de exámenes preocupacionales',
      subtitle: null,
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      typeId: null,
      createdBy: DEMO_USERS.publisher.name,
      createdAt: daysAgo(2),
      interactions: counts(4, 130, 9, 0),
    },
  },
  {
    slug: 'discusion',
    typeName: 'Discusión',
    preview: {
      id: 8,
      title: 'Buenas prácticas para onboarding remoto',
      subtitle: 'Compartan sus procesos y herramientas.',
      imageUrl: null,
      typeId: null,
      createdBy: DEMO_USERS.visitor.name,
      createdAt: daysAgo(8),
      interactions: counts(3, 88, 5, 4),
    },
  },
]

/** Valentina's (visitor) saved-content tab. */
export const DEMO_SAVED: DemoPublicationEntry[] = [BASE[0], BASE[1], BASE[4], BASE[5]]

/** Martín's (publisher) own publications, with full interaction counts. */
export const DEMO_MY_PUBLICATIONS: DemoPublicationEntry[] = BASE.filter(
  (entry) => entry.preview.createdBy === DEMO_USERS.publisher.name,
)

export interface DemoPreference {
  key: string
  label: string
  description: string
  defaultChecked: boolean
}

export const DEMO_PREFERENCES: DemoPreference[] = [
  {
    key: 'avisos-email',
    label: 'Avisos de interacciones vía correo',
    description: 'Recibí un correo cuando alguien interactúe con tus publicaciones o respuestas.',
    defaultChecked: true,
  },
  {
    key: 'notificaciones-dispositivos',
    label: 'Notificaciones a los dispositivos',
    description: 'Notificaciones push en los dispositivos donde uses el foro.',
    defaultChecked: true,
  },
]
