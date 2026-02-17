import type { MediaContent } from '../models'

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
          src={media.mediaUrl}
          alt={media.role ?? 'Media'}
          className="h-auto w-full object-cover"
          loading="lazy"
        />
      )}
      {isVideo && (
        <video
          src={media.mediaUrl}
          controls
          className="h-auto w-full"
        />
      )}
      {!isImage && !isVideo && (
        <a
          href={media.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg bg-gray-50 p-4 text-sm text-blue-600 hover:underline"
        >
          {media.mediaUrl}
        </a>
      )}
      {media.role && (
        <span className="mt-1 inline-block text-xs text-gray-400">{media.role}</span>
      )}
    </div>
  )
}
