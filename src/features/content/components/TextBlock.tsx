import type { TextContent } from '../models'
import { colors } from '../../../theme'

interface TextBlockProps {
  text: TextContent
}

export default function TextBlock({ text }: TextBlockProps) {
  return (
    <div className="space-y-1">
      {text.title && (
        <h3 className="text-base sm:text-lg font-semibold font-primary" style={{ color: colors.blueDark }}>{text.title}</h3>
      )}
      <p className="text-sm sm:text-base leading-relaxed" style={{ color: colors.blueMid }}>{text.body}</p>
      {text.role && (
        <span className="inline-block rounded px-2 py-0.5 text-xs" style={{ backgroundColor: colors.lightGray, color: colors.blueMid }}>
          {text.role}
        </span>
      )}
    </div>
  )
}
