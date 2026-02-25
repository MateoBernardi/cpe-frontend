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
        '01 — Título: máximo 8 palabras. Atacá el problema #1 de tu cliente. Evitá frases genéricas.',
        '02 — Subtítulo: mostrá la transformación. Dónde están hoy → dónde van a estar.',
        '03 — CTA Primario: un solo botón. Específico al resultado. Ej: "Solicitar presupuesto".',
        '04 — CTA Secundario: bajo compromiso, para los que no están listos. Ej: "Ver cómo funciona".',
        '05 — Barra de confianza: un dato específico o logos. Ej: "Más de 200 empresas atendidas".',
        'Si un CTA no tiene texto, no se renderiza en la página.',
        'Test de 5 segundos: ¿Qué hace tu empresa? ¿Por qué me importa? ¿Qué hago ahora?',
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
      description: 'Carrusel horizontal de tarjetas. Cada tarjeta combina una imagen miniatura con un texto/noticia.',
      tips: [
        'Cada texto (párrafo) crea una nueva tarjeta en el carrusel.',
        'Cada miniatura se asocia a su tarjeta por orden: la 1ra imagen va con el 1er texto, etc.',
        'El encabezado se muestra arriba del carrusel con flechas de navegación.',
        'Podés agregar tantas novedades como quieras — el carrusel se extiende horizontalmente.',
      ],
      imageTip: 'Resolución recomendada: 800×500 px (16:10). Las imágenes se muestran en la parte superior de cada tarjeta.',
      colorTip: 'Fondo teal claro (teal-50). Las tarjetas son blancas con sombra.',
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
        'Cada viñeta se lista con un punto teal. Si subís íconos, aparecen en vez del punto.',
        'Los íconos se asignan por orden: el 1er ícono va con la 1ra viñeta, etc.',
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
      description: 'Sección de 2 columnas: textos informativos + estimador de presupuesto a la izquierda, formulario de contacto a la derecha.',
      tips: [
        'El encabezado y los párrafos explican el servicio.',
        'El CTA aparece destacado en teal.',
        'El texto "info" se muestra abajo del formulario en una tarjeta informativa con ícono.',
        'Las etiquetas del formulario (label_*) personalizan los nombres de los campos.',
        'El estimador de presupuesto es automático — no requiere configuración.',
      ],
      colorTip: 'Fondo teal claro (teal-50). Formulario con bordes y campos teal.',
    },
    textSlots: [
      { id: 'cf-heading', role: 'heading', slotIndex: 0, label: 'Título de sección', placeholder: 'Ej: Contactanos', display: 'heading' },
      { id: 'cf-paragraph', role: 'paragraph', slotIndex: 0, label: 'Párrafo informativo', placeholder: 'Texto explicativo de la sección...', display: 'body', multiple: true },
      { id: 'cf-cta', role: 'cta', slotIndex: 0, label: 'Llamada a la acción', placeholder: 'Ej: Consultanos sin compromiso', display: 'cta' },
      { id: 'cf-info', role: 'info', slotIndex: 0, label: 'Información adicional', placeholder: 'Texto informativo que aparece debajo del formulario', display: 'body' },
      { id: 'cf-lbl-name', role: 'label_name', slotIndex: 0, label: 'Etiqueta: Nombre', placeholder: 'Nombre', display: 'label' },
      { id: 'cf-lbl-email', role: 'label_email', slotIndex: 0, label: 'Etiqueta: Email', placeholder: 'Email', display: 'label' },
      { id: 'cf-lbl-location', role: 'label_location', slotIndex: 0, label: 'Etiqueta: Localidad', placeholder: 'Localidad', display: 'label' },
      { id: 'cf-lbl-phone', role: 'label_phone', slotIndex: 0, label: 'Etiqueta: Teléfono', placeholder: 'Teléfono', display: 'label' },
      { id: 'cf-lbl-employees', role: 'label_employees', slotIndex: 0, label: 'Etiqueta: Empleados', placeholder: 'N.º de empleados', display: 'label' },
      { id: 'cf-lbl-message', role: 'label_message', slotIndex: 0, label: 'Etiqueta: Mensaje', placeholder: 'Mensaje', display: 'label' },
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
        'Abajo se muestra un formulario de postulación con preguntas personalizables.',
        'Las etiquetas (label_*) cambian las preguntas del formulario de CV.',
        'El formulario incluye zona de subida de CV con drag-and-drop.',
      ],
      imageTip: 'Resolución recomendada: 800×600 px (4:3).',
    },
    textSlots: [
      { id: 'ss-heading', role: 'heading', slotIndex: 0, label: 'Título del servicio', placeholder: 'Ej: Selección de Personal', display: 'heading' },
      { id: 'ss-subtitle', role: 'subtitle', slotIndex: 0, label: 'Objetivo', placeholder: 'Descripción del objetivo del servicio', display: 'subheading' },
      { id: 'ss-paragraph', role: 'paragraph', slotIndex: 0, label: 'Párrafo', placeholder: 'Párrafo descriptivo del servicio...', display: 'body', multiple: true },
      { id: 'ss-bullet', role: 'bullet', slotIndex: 0, label: 'Eje de trabajo', placeholder: 'Ej: Búsqueda y preselección', display: 'bullet', multiple: true },
      { id: 'ss-lbl-area', role: 'label_area', slotIndex: 0, label: 'Pregunta: Área de trabajo', placeholder: '¿En qué área te gustaría trabajar?', display: 'label' },
      { id: 'ss-lbl-exp', role: 'label_experience', slotIndex: 0, label: 'Pregunta: Experiencia', placeholder: '¿Cuántos años de experiencia tenés?', display: 'label' },
      { id: 'ss-lbl-mod', role: 'label_modality', slotIndex: 0, label: 'Pregunta: Modalidad', placeholder: '¿Qué modalidad de trabajo preferís?', display: 'label' },
      { id: 'ss-lbl-avail', role: 'label_availability', slotIndex: 0, label: 'Pregunta: Disponibilidad', placeholder: '¿Cuándo podrías incorporarte?', display: 'label' },
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
}

/** Obtiene la config del canvas, o undefined si la sección no tiene config */
export function getCanvasConfig(sectionName: string): SectionCanvasConfig | undefined {
  return CANVAS_CONFIGS[sectionName]
}
