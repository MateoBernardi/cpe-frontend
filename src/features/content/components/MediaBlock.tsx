import type { MediaContent } from '../models'
import { colors } from '../../../theme'

interface MediaBlockProps {
  media: MediaContent
}

export default function MediaBlock({ media }: MediaBlockProps) {
  const isImage = media.mimeType?.startsWith('image/')
  const isVideo = media.mimeType?.startsWith('video/')

  return (
    <div className="overflow-hidden rounded-lg">
      {isImage && (
        <img
          src={media.url}
          alt={media.role ?? 'Media'}
          className="h-auto w-full object-cover"
          loading="lazy"
        />
      )}
      {isVideo && (
        <video
          src={media.url}
          controls
          className="h-auto w-full"
        />
      )}
      {!isImage && !isVideo && (
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg p-4 text-sm hover:underline"
          style={{ backgroundColor: colors.lightGray, color: colors.tealMid }}
        >
          {media.url}
        </a>
      )}
      {media.role && (
        <span className="mt-1 inline-block text-xs" style={{ color: colors.blueMid }}>{media.role}</span>
      )}
    </div>
  )
}
