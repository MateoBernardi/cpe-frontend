import { useState } from 'react'
import type { Publication } from '@features/foro'
import { ImageLightbox } from './ImageLightbox'

export function Gallery({ images }: { images: Publication['images'] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!images || images.length === 0) return null
  return (
    <>
      <div className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            className="group aspect-[4/3] overflow-hidden rounded-xl border-none p-0 ring-1 ring-slate-200/60"
            onClick={() => setOpenIndex(i)}
            aria-label={`Ampliar imagen ${i + 1} de ${images.length}`}
          >
            <img
              src={img.url}
              alt={img.altText ?? ''}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105"
            />
          </button>
        ))}
      </div>
      <ImageLightbox images={images} index={openIndex} onClose={() => setOpenIndex(null)} onIndexChange={setOpenIndex} />
    </>
  )
}
