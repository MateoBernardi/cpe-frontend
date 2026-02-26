import type { TextContent } from '../models'

interface TextBlockProps {
  text: TextContent
}

export default function TextBlock({ text }: TextBlockProps) {
  return (
    <div className="space-y-1">
      {text.title && (
        <h3 className="text-base sm:text-lg font-semibold text-slate-900">{text.title}</h3>
      )}
      <p className="text-slate-700 text-sm sm:text-base leading-relaxed">{text.body}</p>
      {text.role && (
        <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          {text.role}
        </span>
      )}
    </div>
  )
}
