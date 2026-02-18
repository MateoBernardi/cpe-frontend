import { SectionView } from '@features/content/views'

/**
 * Página de Novedades — Carrusel tipo Instagram.
 */
export default function NewsPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <SectionView sectionName="news" />
    </div>
  )
}
