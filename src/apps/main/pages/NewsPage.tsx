import { useEffect } from 'react'
import { SectionView } from '@features/content/views'
import { colors } from '../../../theme'

/**
 * Página de Novedades — Carrusel tipo Instagram.
 */
export default function NewsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <div className="min-h-screen pt-[15vh]" style={{ backgroundColor: colors.lightGray }}>
      <SectionView sectionName="news" />
    </div>
  )
}
