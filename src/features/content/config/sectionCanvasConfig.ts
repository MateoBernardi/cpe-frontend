/**
 * Configuración del canvas visual para cada sección.
 * Define los slots de contenido, guías informativas y roles exactos
 * que coinciden con los componentes de renderizado reales.
 */

// ── Tipos ──

export interface TextSlotConfig {
  id: string
  role: string
  slotIndex: number   // n-ésimo ítem con ese rol (0 = primero, 1 = segundo, etc.)
  label: string       // etiqueta para mostrar en la UI
  placeholder: string // ejemplo/texto guía cuando está vacío
  display: 'heading' | 'subheading' | 'body' | 'label' | 'cta' | 'bullet'
  maxLength?: number
  multiple?: boolean  // permite agregar N ítems con este rol
}

export interface MediaSlotConfig {
  id: string
  role: string
  slotIndex: number
  label: string
  placeholder: string
  multiple?: boolean
  maxItems?: number          // límite de archivos para slots múltiples
  aspect?: string           // CSS aspect-ratio (e.g. "16/9")
  recommendedSize?: string  // e.g. "1920×1080"
  isBackground?: boolean
}

export interface SectionGuideConfig {
  description: string
  tips: string[]
  imageTip?: string
  colorTip?: string
}

export interface SectionCanvasConfig {
  displayName: string
  guide: SectionGuideConfig
  textSlots: TextSlotConfig[]
  mediaSlots: MediaSlotConfig[]
}

// ── Helpers para matchear contenido existente con slots ──

import type { AdminTextContent, AdminMediaContent } from '../models'

/** Obtiene el texto existente que corresponde a un slot (por rol + índice) */
export function matchTextToSlot(
  texts: AdminTextContent[],
  slot: TextSlotConfig,
): AdminTextContent | undefined {
  const matching = texts
    .filter((t) => t.role === slot.role)
    .sort((a, b) => a.order - b.order)
  return matching[slot.slotIndex]
}

/** Obtiene todos los textos con un rol dado */
export function matchAllTextsForRole(
  texts: AdminTextContent[],
  role: string,
): AdminTextContent[] {
  return texts
    .filter((t) => t.role === role)
    .sort((a, b) => a.order - b.order)
}

/** Obtiene el/los media que corresponden a un slot */
export function matchMediaToSlot(
  media: AdminMediaContent[],
  slot: MediaSlotConfig,
): AdminMediaContent[] {
  const matching = media
    .filter((m) => m.role === slot.role)
    .sort((a, b) => a.order - b.order)
  if (slot.multiple) return matching
  const item = matching[slot.slotIndex]
  return item ? [item] : []
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Configuraciones por sección
// Los roles acá deben coincidir EXACTAMENTE con lo que
// buscan los componentes de renderizado (sectionHelpers).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const CANVAS_CONFIGS: Record<string, SectionCanvasConfig> = {

  // ── HERO ──
  hero: {
    displayName: 'Portada Principal',
    guide: {
      description: 'La portada tiene 5 segundos para captar al visitante. Seguimos la fórmula de hero efectiva: título directo al dolor del cliente, subtítulo que muestre la transformación, dos botones de acción y una barra de confianza.',
      tips: [
        '01 — Título: máximo 8 palabras.',
        '02 — Subtítulo',
        '03 — CTA Primario: un solo botón. Envía hacia la sección de contacto.',
        '04 — CTA Secundario: Envía hacia la sección de servicios.',
        '05 — Barra de confianza: un dato específico que genere confianza (ej: cantidad de clientes, años de experiencia, etc.).',
        'Si un CTA no tiene texto, no se renderiza en la página.',
      ],
      imageTip: 'Resolución recomendada: 1920×1080 px (16:9). Formato: JPG o WebP. Se aplica zoom sutil a la imagen activa del carrusel.',
      colorTip: 'Se superpone un degradado oscuro sobre las imágenes para garantizar legibilidad del texto blanco.',
    },
    textSlots: [
      { id: 'hero-headline', role: 'headline', slotIndex: 0, label: 'Título principal (8 palabras máx.)', placeholder: 'Ej: Soluciones de salud laboral para tu empresa', display: 'heading', maxLength: 80 },
      { id: 'hero-subheading', role: 'subheading', slotIndex: 0, label: 'Subtítulo (transformación)', placeholder: 'Ej: Dejá de improvisar con la salud de tu equipo', display: 'subheading', maxLength: 150 },
      { id: 'hero-cta', role: 'cta', slotIndex: 0, label: 'CTA Primario (botón principal)', placeholder: 'Solicitar presupuesto', display: 'cta', maxLength: 40 },
      { id: 'hero-cta2', role: 'cta_secondary', slotIndex: 0, label: 'CTA Secundario (bajo compromiso)', placeholder: 'Ver cómo funciona', display: 'cta', maxLength: 40 },
      { id: 'hero-trust', role: 'trust', slotIndex: 0, label: 'Barra de confianza', placeholder: 'Ej: Más de 200 empresas confían en nosotros', display: 'body', maxLength: 80 },
    ],
    mediaSlots: [
      { id: 'hero-bg', role: 'background', slotIndex: 0, label: 'Imágenes de fondo (carrusel)', placeholder: 'Arrastrá imágenes para el carrusel de fondo', multiple: true, aspect: '16/9', recommendedSize: '1920×1080', isBackground: true },
    ],
  },

  // ── SECONDARY HERO ──
  secondary_hero: {
    displayName: 'Portada Secundaria',
    guide: {
      description: 'Sección con título centrado, imagen destacada y un llamado a la acción. Aparece al final de la página principal.',
      tips: [
        'El encabezado se centra en la parte superior.',
        'La imagen se muestra debajo del texto, centrada, con proporción 16:9.',
        'El texto CTA aparece dentro de una tarjeta destacada.',
      ],
      imageTip: 'Resolución recomendada: 1200×675 px (16:9). La imagen se muestra con bordes redondeados y sombra.',
      colorTip: 'Fondo gris claro (slate-50). La tarjeta CTA tiene fondo azul suave.',
    },
    textSlots: [
      { id: 'sh-heading', role: 'heading', slotIndex: 0, label: 'Encabezado', placeholder: 'Ej: Tu socio estratégico en salud laboral', display: 'heading', maxLength: 100 },
      { id: 'sh-subtitle', role: 'subtitle', slotIndex: 0, label: 'Subtítulo', placeholder: 'Ej: Más de 15 años de experiencia', display: 'subheading', maxLength: 100 },
      { id: 'sh-cta', role: 'cta', slotIndex: 0, label: 'Texto del CTA', placeholder: 'Ej: ¿Necesitás una solución personalizada?', display: 'cta', maxLength: 120 },
    ],
    mediaSlots: [
      { id: 'sh-photo', role: 'photo', slotIndex: 0, label: 'Imagen destacada', placeholder: 'Imagen principal de esta sección', aspect: '16/9', recommendedSize: '1200×675', maxItems: 1 },
    ],
  },

  // ── ABOUT ──
  about: {
    displayName: 'Nosotros',
    guide: {
      description: 'Sección con grilla de 4 columnas: bio+texto, foto, bio+texto, foto. Presentación del equipo o la empresa.',
      tips: [
        'Se muestran 2 perfiles: cada uno consta de un nombre/rol (bio), un párrafo descriptivo y una foto.',
        'Las fotos se muestran en proporción 3:4 (vertical/retrato).',
        'Los textos aparecen en tarjetas con fondo punteado decorativo.',
      ],
      imageTip: 'Resolución recomendada: 600×800 px (3:4, retrato). Las fotos se muestran con bordes redondeados.',
      colorTip: 'Fondo gris claro. Los puntos decorativos son teal semitransparente.',
    },
    textSlots: [
      { id: 'ab-heading', role: 'heading', slotIndex: 0, label: 'Título de sección', placeholder: 'Ej: Quiénes somos', display: 'heading' },
      { id: 'ab-bio-1', role: 'bio', slotIndex: 0, label: 'Nombre / Rol (persona 1)', placeholder: 'Ej: Dra. María López — Directora', display: 'label' },
      { id: 'ab-para-1', role: 'paragraph', slotIndex: 0, label: 'Descripción (persona 1)', placeholder: 'Descripción breve de la persona o área', display: 'body' },
      { id: 'ab-bio-2', role: 'bio', slotIndex: 1, label: 'Nombre / Rol (persona 2)', placeholder: 'Ej: Lic. Carlos Ruiz — Coordinador', display: 'label' },
      { id: 'ab-para-2', role: 'paragraph', slotIndex: 1, label: 'Descripción (persona 2)', placeholder: 'Descripción breve de la persona o área', display: 'body' },
    ],
    mediaSlots: [
      { id: 'ab-photo-1', role: 'photo', slotIndex: 0, label: 'Foto persona 1', placeholder: 'Foto de perfil', aspect: '3/4', recommendedSize: '600×800', maxItems: 1 },
      { id: 'ab-photo-2', role: 'photo', slotIndex: 1, label: 'Foto persona 2', placeholder: 'Foto de perfil', aspect: '3/4', recommendedSize: '600×800', maxItems: 1 },
    ],
  },

  // ── NEWS ──
  news: {
    displayName: 'Novedades',
    guide: {
      description: 'Lista vertical de novedades. Cada novedad tiene una imagen opcional, un título y un párrafo descriptivo, separadas por líneas divisorias.',
      tips: [
        'Cada texto (párrafo) crea una nueva novedad en la lista.',
        'Cada miniatura se asocia a su novedad por orden: la 1ra imagen va con el 1er texto, etc.',
        'El encabezado se muestra centrado arriba de la lista.',
        'Podés agregar tantas novedades como quieras — se apilan verticalmente.',
        'Si un párrafo tiene título (campo Title), se muestra como encabezado de la novedad.',
      ],
      imageTip: 'Resolución recomendada: 1200×675 px (16:9). Las imágenes se muestran a ancho completo con bordes redondeados.',
      colorTip: 'Fondo gris claro (#eeeeee). Texto sobre fondo directo, sin tarjetas.',
    },
    textSlots: [
      { id: 'nw-heading', role: 'heading', slotIndex: 0, label: 'Título de sección', placeholder: 'Ej: Novedades', display: 'heading' },
      { id: 'nw-paragraph', role: 'paragraph', slotIndex: 0, label: 'Texto de novedad', placeholder: 'Escribí el contenido de la novedad...', display: 'body', multiple: true },
    ],
    mediaSlots: [
      { id: 'nw-thumbnail', role: 'thumbnail', slotIndex: 0, label: 'Imagen de novedad', placeholder: 'Imagen para la tarjeta', multiple: true, aspect: '16/10', recommendedSize: '800×500' },
    ],
  },

  // ── INFO PRIMARY ──
  info_primary: {
    displayName: 'Información Principal',
    guide: {
      description: 'Sección de 2 columnas: diagrama/imagen a la izquierda y lista de puntos clave a la derecha.',
      tips: [
        'La imagen o diagrama se muestra en la columna izquierda.',
        'Cada viñeta se lista con un punto.',
      ],
      imageTip: 'Diagrama: hasta 600×600 px. Íconos: 40×40 px (SVG o PNG transparente recomendado).',
      colorTip: 'Fondo slate-100. Puntos de viñeta teal-800.',
    },
    textSlots: [
      { id: 'ip-heading', role: 'heading', slotIndex: 0, label: 'Título de sección', placeholder: 'Ej: Nuestros servicios', display: 'heading' },
      { id: 'ip-bullet', role: 'bullet', slotIndex: 0, label: 'Viñeta', placeholder: 'Descripción del punto clave', display: 'bullet', multiple: true },
    ],
    mediaSlots: [
      { id: 'ip-diagram', role: 'diagram', slotIndex: 0, label: 'Diagrama / Imagen principal', placeholder: 'Imagen o diagrama de la sección', aspect: '1/1', recommendedSize: '600×600', maxItems: 1 },
      { id: 'ip-icon', role: 'icon', slotIndex: 0, label: 'Íconos (uno por viñeta)', placeholder: 'Ícono para viñeta', multiple: true, recommendedSize: '40×40' },
    ],
  },

  // ── INFO SECONDARY ──
  info_secondary: {
    displayName: 'Información Secundaria',
    guide: {
      description: 'Sección con acordeones (colapsables) a la izquierda y un gráfico dona interactivo a la derecha. Cada porción de la dona representa un párrafo.',
      tips: [
        'Cada "párrafo" crea una porción en la dona y un ítem colapsable.',
        'Cada "cita" es la descripción que se despliega al hacer clic en el colapsable.',
        'Las citas se emparejan con los párrafos por orden (1ra cita → 1er párrafo, etc.).',
        'La dona se genera automáticamente — no se necesitan imágenes.',
        'Máximo recomendado: 5 secciones para que la dona sea legible.',
      ],
      colorTip: 'La dona usa colores de la paleta: teal, cyan, indigo. Fondo blanco.',
    },
    textSlots: [
      { id: 'is-heading', role: 'heading', slotIndex: 0, label: 'Título de sección', placeholder: 'Ej: ¿Qué hacemos?', display: 'heading' },
      { id: 'is-paragraph', role: 'paragraph', slotIndex: 0, label: 'Título de servicio (porción de dona)', placeholder: 'Ej: Intervención directa', display: 'body', multiple: true },
      { id: 'is-quote', role: 'quote', slotIndex: 0, label: 'Descripción (se despliega al hacer clic)', placeholder: 'Descripción detallada del servicio...', display: 'body', multiple: true },
    ],
    mediaSlots: [],
  },

  // ── CONTACT FORM ──
  contact_form: {
    displayName: 'Formulario de Contacto',
    guide: {
      description: 'Formulario de contacto centrado con un texto informativo debajo.',
      tips: [
        'El texto "info" se muestra abajo del formulario en una tarjeta informativa con ícono.',
        'Los campos del formulario no son editables desde el panel — se envían directamente al backend.',
      ],
      colorTip: 'Fondo teal claro (teal-50). Formulario con bordes y campos teal.',
    },
    textSlots: [
      { id: 'cf-info', role: 'info', slotIndex: 0, label: 'Información adicional', placeholder: 'Texto informativo que aparece debajo del formulario', display: 'body' },
      // Los campos del formulario no son editables desde el admin — se envían directamente al backend
    ],
    mediaSlots: [],
  },

  // ── SERVICE: INTERVENCIÓN DIRECTA ──
  service_intervencion: {
    displayName: 'Servicio: Intervención Directa',
    guide: {
      description: 'Página de servicio con 2 columnas: tarjeta de texto (título, objetivo, párrafos, viñetas) a la izquierda, imagen a la derecha.',
      tips: [
        'El subtítulo se muestra en una caja teal como "Objetivo".',
        'Los párrafos se listan debajo del objetivo.',
        'Las viñetas se listan al final bajo el título "Ejes de trabajo".',
        'La imagen se muestra con bordes redondeados y un fondo decorativo teal.',
      ],
      imageTip: 'Resolución recomendada: 800×600 px (4:3). Se muestra con bordes redondeados.',
    },
    textSlots: [
      { id: 'si-heading', role: 'heading', slotIndex: 0, label: 'Título del servicio', placeholder: 'Ej: Intervención Directa', display: 'heading' },
      { id: 'si-subtitle', role: 'subtitle', slotIndex: 0, label: 'Objetivo', placeholder: 'Descripción del objetivo del servicio', display: 'subheading' },
      { id: 'si-paragraph', role: 'paragraph', slotIndex: 0, label: 'Párrafo', placeholder: 'Párrafo descriptivo del servicio...', display: 'body', multiple: true },
      { id: 'si-bullet', role: 'bullet', slotIndex: 0, label: 'Eje de trabajo', placeholder: 'Ej: Diagnóstico organizacional', display: 'bullet', multiple: true },
    ],
    mediaSlots: [
      { id: 'si-photo', role: 'photo', slotIndex: 0, label: 'Foto del servicio', placeholder: 'Imagen ilustrativa', aspect: '4/3', recommendedSize: '800×600', maxItems: 1 },
    ],
  },

  service_seleccion: {
    displayName: 'Servicio: Selección de Personal',
    guide: {
      description: 'Página de servicio + formulario de postulación. Mismo layout de detalle arriba, formulario de CV abajo.',
      tips: [
        'El layout superior es igual a los otros servicios (título, objetivo, párrafos, viñetas, foto).',
        'El formulario incluye zona de subida de CV con drag-and-drop.',
      ],
      imageTip: 'Resolución recomendada: 800×600 px (4:3).',
    },
    textSlots: [
      { id: 'ss-heading', role: 'heading', slotIndex: 0, label: 'Título del servicio', placeholder: 'Ej: Selección de Personal', display: 'heading' },
      { id: 'ss-subtitle', role: 'subtitle', slotIndex: 0, label: 'Objetivo', placeholder: 'Descripción del objetivo del servicio', display: 'subheading' },
      { id: 'ss-paragraph', role: 'paragraph', slotIndex: 0, label: 'Párrafo', placeholder: 'Párrafo descriptivo del servicio...', display: 'body', multiple: true },
      { id: 'ss-bullet', role: 'bullet', slotIndex: 0, label: 'Eje de trabajo', placeholder: 'Ej: Búsqueda y preselección', display: 'bullet', multiple: true },
      { id: 'ss-form-heading', role: 'form_heading', slotIndex: 0, label: 'Título del formulario', placeholder: 'Ej: ¿Querés sumarte a nuestro equipo?', display: 'heading' },
      { id: 'ss-form-paragraph', role: 'form_paragraph', slotIndex: 0, label: 'Párrafo del formulario', placeholder: 'Texto introductorio del formulario de postulación', display: 'body' },
      // Los campos del formulario de postulación no son editables desde el admin — se envían directamente al backend
    ],
    mediaSlots: [
      { id: 'ss-photo', role: 'photo', slotIndex: 0, label: 'Foto del servicio', placeholder: 'Imagen ilustrativa', aspect: '4/3', recommendedSize: '800×600', maxItems: 1 },
    ],
  },

  service_acompanamiento: {
    displayName: 'Servicio: Acompañamiento',
    guide: {
      description: 'Página de servicio con el mismo layout que Intervención Directa: tarjeta de texto + imagen.',
      tips: [
        'El subtítulo se muestra como "Objetivo" en una caja teal.',
        'Los párrafos y viñetas listan los ejes de trabajo.',
        'La imagen se muestra a la derecha con fondo decorativo.',
      ],
      imageTip: 'Resolución recomendada: 800×600 px (4:3).',
    },
    textSlots: [
      { id: 'sa-heading', role: 'heading', slotIndex: 0, label: 'Título del servicio', placeholder: 'Ej: Acompañamiento a las Personas', display: 'heading' },
      { id: 'sa-subtitle', role: 'subtitle', slotIndex: 0, label: 'Objetivo', placeholder: 'Descripción del objetivo del servicio', display: 'subheading' },
      { id: 'sa-paragraph', role: 'paragraph', slotIndex: 0, label: 'Párrafo', placeholder: 'Párrafo descriptivo del servicio...', display: 'body', multiple: true },
      { id: 'sa-bullet', role: 'bullet', slotIndex: 0, label: 'Eje de trabajo', placeholder: 'Ej: Coaching ejecutivo', display: 'bullet', multiple: true },
    ],
    mediaSlots: [
      { id: 'sa-photo', role: 'photo', slotIndex: 0, label: 'Foto del servicio', placeholder: 'Imagen ilustrativa', aspect: '4/3', recommendedSize: '800×600', maxItems: 1 },
    ],
  },

  // ── TRASPASO GENERACIONAL ──
  traspaso_generacional: {
    displayName: 'Servicio: Traspaso Generacional',
    guide: {
      description: 'Página de servicio con el mismo layout que los demás servicios: tarjeta de texto a la izquierda + imagen a la derecha.',
      tips: [
        'El subtítulo se muestra como "Objetivo" en una caja teal.',
        'Los párrafos y viñetas listan los ejes de trabajo.',
        'La imagen se muestra a la derecha con fondo decorativo.',
      ],
      imageTip: 'Resolución recomendada: 800×600 px (4:3).',
    },
    textSlots: [
      { id: 'tg-heading', role: 'heading', slotIndex: 0, label: 'Título del servicio', placeholder: 'Ej: Traspaso Generacional', display: 'heading' },
      { id: 'tg-subtitle', role: 'subtitle', slotIndex: 0, label: 'Objetivo', placeholder: 'Descripción del objetivo del servicio', display: 'subheading' },
      { id: 'tg-paragraph', role: 'paragraph', slotIndex: 0, label: 'Párrafo', placeholder: 'Párrafo descriptivo del servicio...', display: 'body', multiple: true },
      { id: 'tg-bullet', role: 'bullet', slotIndex: 0, label: 'Eje de trabajo', placeholder: 'Ej: Planificación sucesoria', display: 'bullet', multiple: true },
    ],
    mediaSlots: [
      { id: 'tg-photo', role: 'photo', slotIndex: 0, label: 'Foto del servicio', placeholder: 'Imagen ilustrativa', aspect: '4/3', recommendedSize: '800×600', maxItems: 1 },
    ],
  },

  // ── SERVICE: CLÍNICA PARA EMPRESARIOS ──
  service_clinica_empresarios: {
    displayName: 'Servicio: Clínica para Empresarios',
    guide: {
      description: 'Página de servicio con el mismo layout: tarjeta de texto (título, objetivo, párrafos, viñetas) a la izquierda + imagen a la derecha.',
      tips: [
        'El subtítulo se muestra como "Objetivo" en una caja teal.',
        'Los párrafos y viñetas listan los detalles del servicio.',
        'La imagen se muestra a la derecha con fondo decorativo.',
      ],
      imageTip: 'Resolución recomendada: 800×600 px (4:3).',
    },
    textSlots: [
      { id: 'sce-heading', role: 'heading', slotIndex: 0, label: 'Título del servicio', placeholder: 'Ej: Clínica para Empresarios', display: 'heading' },
      { id: 'sce-subtitle', role: 'subtitle', slotIndex: 0, label: 'Objetivo', placeholder: 'Descripción del objetivo del servicio', display: 'subheading' },
      { id: 'sce-paragraph', role: 'paragraph', slotIndex: 0, label: 'Párrafo', placeholder: 'Párrafo descriptivo del servicio...', display: 'body', multiple: true },
      { id: 'sce-bullet', role: 'bullet', slotIndex: 0, label: 'Eje de trabajo', placeholder: 'Ej: Diagnóstico integral', display: 'bullet', multiple: true },
    ],
    mediaSlots: [
      { id: 'sce-photo', role: 'photo', slotIndex: 0, label: 'Foto del servicio', placeholder: 'Imagen ilustrativa', aspect: '4/3', recommendedSize: '800×600', maxItems: 1 },
    ],
  },

  // ── TEASER: CIRCUITO INTEGRADO ──
  teaser_circuit: {
    displayName: 'Teaser: Circuito Integrado',
    guide: {
      description: 'Sección del Venn diagram interactivo en la página principal. Solo se edita el título — la visualización animada se genera automáticamente.',
      tips: [
        'El encabezado se muestra debajo de la animación del circuito.',
        'La animación de círculos no es editable — es un componente visual fijo.',
      ],
    },
    textSlots: [
      { id: 'tc-heading', role: 'heading', slotIndex: 0, label: 'Título del circuito', placeholder: 'Ej: Circuito integrado de acción.', display: 'heading', maxLength: 60 },
    ],
    mediaSlots: [],
  },

  // ── TEASER: CLÍNICA PARA EMPRESARIOS ──
  teaser_clinica: {
    displayName: 'Teaser: Clínica para Empresarios',
    guide: {
      description: 'Sección teaser en la página principal para el servicio Clínica para Empresarios. Ícono a la izquierda, información a la derecha.',
      tips: [
        'El encabezado es el título grande del teaser.',
        'El subtítulo es una frase corta descriptiva.',
        'El CTA es el texto del botón que lleva a la página del servicio.',
        'La ilustración/ícono se genera automáticamente.',
      ],
    },
    textSlots: [
      { id: 'tcl-heading', role: 'heading', slotIndex: 0, label: 'Título', placeholder: 'Ej: Clínica para Empresarios.', display: 'heading', maxLength: 60 },
      { id: 'tcl-subtitle', role: 'subtitle', slotIndex: 0, label: 'Subtítulo', placeholder: 'Ej: Atención integral para quienes lideran empresas.', display: 'subheading', maxLength: 120 },
      { id: 'tcl-cta', role: 'cta', slotIndex: 0, label: 'Texto del botón', placeholder: 'Ej: Conocé más', display: 'cta', maxLength: 40 },
    ],
    mediaSlots: [],
  },

  // ── TEASER: TRASPASO GENERACIONAL ──
  teaser_traspaso: {
    displayName: 'Teaser: Traspaso Generacional',
    guide: {
      description: 'Sección teaser en la página principal para el servicio Traspaso Generacional. Información a la izquierda, ícono a la derecha.',
      tips: [
        'El encabezado es el título grande del teaser.',
        'El subtítulo es una frase corta descriptiva.',
        'El CTA es el texto del botón que lleva a la página del servicio.',
        'La ilustración/ícono se genera automáticamente.',
      ],
    },
    textSlots: [
      { id: 'tt-heading', role: 'heading', slotIndex: 0, label: 'Título', placeholder: 'Ej: Traspaso Generacional.', display: 'heading', maxLength: 60 },
      { id: 'tt-subtitle', role: 'subtitle', slotIndex: 0, label: 'Subtítulo', placeholder: 'Ej: Acompañamos la transición entre generaciones.', display: 'subheading', maxLength: 120 },
      { id: 'tt-cta', role: 'cta', slotIndex: 0, label: 'Texto del botón', placeholder: 'Ej: Conocé más', display: 'cta', maxLength: 40 },
    ],
    mediaSlots: [],
  },
}

/** Obtiene la config del canvas, o undefined si la sección no tiene config */
export function getCanvasConfig(sectionName: string): SectionCanvasConfig | undefined {
  return CANVAS_CONFIGS[sectionName]
}
