/**
 * Hosts que NO disparan el interstitial de salida.
 *
 * El foro deja que cualquier publisher cargue links externos arbitrarios en
 * sus publicaciones, y esos links se renderizan como botones dentro de la
 * página — visualmente indistinguibles de la navegación propia del sitio. El
 * speedbump existe para que quede claro cuándo se está saliendo del sitio y
 * hacia dónde.
 *
 * Lo que pasa sin modal:
 *  - el propio dominio (incluidos `www.` y la API);
 *  - las plataformas que el producto ya embebe o linkea de forma nativa
 *    (YouTube en las novedades, Spotify en los podcasts) — el usuario ya sabe
 *    que un episodio se escucha en Spotify;
 *  - las redes oficiales de CPE, que son chrome del sitio, no contenido
 *    cargado por terceros;
 *  - los destinos de "compartir", donde el click ya es una acción deliberada
 *    de irse a otra plataforma.
 *
 * Nada de esto sustituye a `isSafeHttpUrl`: el speedbump es UX, y el chequeo
 * de esquema sigue siendo la defensa contra `javascript:`/`data:`.
 */
const TRUSTED_HOSTS: readonly string[] = [
  // Propios
  'clinicaparaempresas.com',
  // Plataformas de contenido que el sitio ya integra
  'youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'spotify.com',
  // Redes oficiales + destinos de compartir
  'instagram.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'wa.me',
  'whatsapp.com',
]

/**
 * Compara por sufijo de dominio, no por igualdad: `open.spotify.com` y
 * `api.clinicaparaempresas.com` cuentan como confiables, pero
 * `clinicaparaempresas.com.phishing.net` NO (termina en `.phishing.net`, y el
 * chequeo exige que el host sea el dominio o un subdominio real de él).
 */
export function isTrustedExternalHost(url: string): boolean {
  let host: string
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return false
  }
  return TRUSTED_HOSTS.some((trusted) => host === trusted || host.endsWith(`.${trusted}`))
}

/** Host legible para mostrarle al usuario a dónde va ("open.spotify.com"). Cadena vacía si la URL no parsea. */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
