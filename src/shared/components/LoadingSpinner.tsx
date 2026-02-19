interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-20 w-20',
  lg: 'h-28 w-28',
}

const textSizes = {
  sm: 'text-[10px]',
  md: 'text-base',
  lg: 'text-2xl',
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} logo-pulse flex items-center justify-center`}
      >
        <img src="/cpeLoading.png" className={`h-25 w-25 ${textSizes[size]}`} />
      </div>
    </div>
  )
}
