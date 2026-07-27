import type { Publication } from '@features/foro'

export function Gallery({ images }: { images: Publication['images'] }) {
  if (!images || images.length === 0) return null
  return (
    <div className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((img) => (
        <div key={img.id} className="aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-slate-200/60">
          <img src={img.url} alt={img.altText ?? ''} className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  )
}
