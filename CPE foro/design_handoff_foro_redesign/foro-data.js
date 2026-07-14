/* Foro — sample content (Spanish, consultancy for companies) */
window.FORO_CATEGORIES = [
  {
    id: "papers", cls: "cat-papers", name: "Papers", count: "24 publicaciones",
    blurb: "Investigación y documentos de fondo",
    items: [
      { title: "Traspaso generacional: cómo no romper lo que funciona", excerpt: "Los acuerdos, los tiempos y los roles que sostienen a la empresa cuando cambia la conducción.", author: "M. Robles", meta: "Jun 2026", link: "Foro - Paper.html" },
      { title: "Cómo medir la salud organizacional de una PyME", excerpt: "Seis indicadores blandos que predicen rotación, conflicto y estancamiento antes de que aparezcan en los números.", author: "Equipo CPE", meta: "May 2026" },
      { title: "Protocolo familiar: 7 acuerdos que evitan conflictos", excerpt: "Qué conviene dejar por escrito antes de que el patrimonio y los vínculos se mezclen en la mesa directiva.", author: "M. Robles", meta: "May 2026" },
      { title: "El primer no-familiar en el directorio", excerpt: "Cuándo incorporar una mirada externa y cómo darle peso real sin que sea solo decorativo.", author: "J. Funes", meta: "Abr 2026" },
    ]
  },
  {
    id: "podcasts", cls: "cat-podcasts", name: "Podcasts", count: "Episodios", featured: true,
    blurb: "Conversaciones con fundadores e invitados",
    items: [
      { title: "Ep. 12 — Cuando el fundador no quiere soltar", excerpt: "Hablamos con Marcela Robles sobre el duelo del fundador y cómo se construye una transición que no se sienta como un despojo.", author: "Marcela Robles", meta: "Jun 2026", link: "Foro - Podcast.html", podcast: true },
      { title: "Ep. 11 — Equipos que se articulan solos", excerpt: "Qué hace que un equipo deje de depender del dueño para tomar decisiones del día a día.", author: "Diego Acuña", meta: "May 2026" },
      { title: "Ep. 10 — La primera contratación de RRHH", excerpt: "El momento exacto en que una empresa familiar necesita profesionalizar a las personas.", author: "Sofía Pérez", meta: "May 2026" },
    ]
  },
  {
    id: "novedades", cls: "cat-novedades", name: "Novedades", count: "Al día",
    blurb: "Noticias y novedades de la clínica",
    items: [
      { title: "Abrimos inscripciones al programa de Liderazgo 2026", excerpt: "Doce semanas de trabajo con mandos medios de empresas en crecimiento. Cupos limitados.", author: "Comunicación", meta: "Hoy" },
      { title: "Nuevo informe: estado de las PyMEs familiares", excerpt: "Relevamos 180 empresas argentinas. Los datos sobre sucesión sorprenden.", author: "Comunicación", meta: "Ayer", link: "Foro - Novedad.html" },
      { title: "Sumamos dos consultoras al equipo de articulación", excerpt: "Conocé a las profesionales que se incorporan al área de equipos.", author: "Comunicación", meta: "3 días" },
    ]
  },
  {
    id: "foros", cls: "cat-foros", name: "Foros de discusión", count: "Comunidad",
    blurb: "Preguntas abiertas de la comunidad",
    foro: true,
    items: [
      { title: "¿Cómo manejan la convivencia de hermanos en la dirección?", excerpt: "Somos tres hermanos en la conducción y cada uno tira para un lado distinto. ¿Cómo lo resolvieron ustedes?", replies: 34, people: 18, link: "Foro - Discusion.html" },
      { title: "Sueldos en empresa familiar: ¿mercado o acuerdo?", excerpt: "¿Pagan según el mercado o según lo que la familia define? Me interesa cómo lo justifican puertas adentro.", replies: 51, people: 27 },
      { title: "Primer gerente externo: experiencias reales", excerpt: "Estamos por contratar un gerente general de afuera de la familia. Toda experiencia suma.", replies: 22, people: 14 },
    ]
  },
];

/* extra pools to feed the infinite scroll */
/* sub-sections per category — power the dedicated category view (Verge-style) */
window.FORO_SUBSECTIONS = {
  papers: [
    { name: "Sucesión y traspaso", titles: ["Traspaso generacional: cómo no romper lo que funciona", "Sucesión sin herederos: vender, fusionar o profesionalizar", "El primer no-familiar en el directorio"] },
    { name: "Equipos y liderazgo", titles: ["Equipos que dejan de depender del dueño", "Reuniones que sirven: la agenda de una página", "Cómo medir la salud organizacional de una PyME"] },
    { name: "Finanzas y números", titles: ["El tablero de la empresa familiar en 5 números", "Sueldos en empresa familiar: criterios que funcionan", "Dividendos vs. reinversión: cómo decidir"] },
    { name: "Cultura y vínculos", titles: ["Protocolo familiar: 7 acuerdos que evitan conflictos", "Cultura no es el asado de fin de año", "Conflictos entre hermanos: marcos para resolverlos"] },
  ],
  podcasts: [
    { name: "Temporada 2 · 2026", titles: ["Ep. 12 — Cuando el fundador no quiere soltar", "Ep. 11 — Equipos que se articulan solos", "Ep. 10 — La primera contratación de RRHH"] },
    { name: "Sucesión", titles: ["Ep. 09 — Heredar una deuda y un apellido", "Ep. 07 — Cuando el hijo no quiere la empresa", "Ep. 08 — El consejo de familia que sí funciona"] },
    { name: "Profesionalización", titles: ["Ep. 06 — Profesionalizar sin perder el alma", "Ep. 05 — Tu primer gerente externo", "Ep. 04 — Del Excel al sistema de gestión"] },
  ],
  novedades: [
    { name: "Programas y formación", titles: ["Abrimos inscripciones al programa de Liderazgo 2026", "Webinar gratuito: armá tu protocolo familiar", "Publicamos las charlas del encuentro 2025"] },
    { name: "Informes y datos", titles: ["Nuevo informe: estado de las PyMEs familiares", "Caso de éxito: tres generaciones, una metalúrgica", "Relevamiento 2026: qué preocupa a las PyMEs"] },
    { name: "El equipo", titles: ["Sumamos dos consultoras al equipo de articulación", "Abrimos sede en Córdoba capital", "Conocé a quienes acompañan tu proceso"] },
  ],
  foros: [
    { name: "Familia y convivencia", titles: ["¿Cómo manejan la convivencia de hermanos en la dirección?", "Padres en la oficina después de jubilarse: ¿sí o no?", "Cómo evaluar a un familiar sin que se ofenda"] },
    { name: "Dinero y reglas", titles: ["Sueldos en empresa familiar: ¿mercado o acuerdo?", "¿Reparten dividendos o reinvierten todo?", "Quién firma los cheques cuando hay varios dueños"] },
    { name: "Profesionalización", titles: ["Primer gerente externo: experiencias reales", "¿Cómo arman un directorio que sirva?", "Vacaciones del dueño: ¿la empresa sobrevive?"] },
  ],
};

window.FORO_MORE = {
  papers: [
    "Reuniones que sirven: el método de la agenda de una página",
    "Sucesión sin herederos: vender, fusionar o profesionalizar",
    "El tablero de la empresa familiar en 5 números",
    "Cultura no es el asado de fin de año",
  ],
  podcasts: [
    "Ep. 09 — Heredar una deuda y un apellido",
    "Ep. 08 — El consejo de familia que sí funciona",
    "Ep. 07 — Cuando el hijo no quiere la empresa",
    "Ep. 06 — Profesionalizar sin perder el alma",
  ],
  novedades: [
    "Webinar gratuito: armá tu protocolo familiar",
    "Caso de éxito: tres generaciones, una metalúrgica",
    "Abrimos sede en Córdoba capital",
    "Publicamos las charlas del encuentro 2025",
  ],
  foros: [
    "¿Reparten dividendos o reinvierten todo?",
    "Padres en la oficina después de jubilarse: ¿sí o no?",
    "Cómo evaluar a un familiar sin que se ofenda",
    "Vacaciones del dueño: ¿la empresa sobrevive?",
  ],
};
