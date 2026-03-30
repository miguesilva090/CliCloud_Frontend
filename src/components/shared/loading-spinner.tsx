import { cn } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm' | 'lg'
  className?: string
  title?: string
  description?: string
}

export function LoadingSpinner({
  size = 'default',
  className,
  title = 'A carregar...',
  description = 'Por favor aguarde',
  ...props
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    default: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={cn('flex flex-col items-center gap-4', className)}
      {...props}
    >
      {/* Animated icon */}
      <div className='relative'>
        <div
          className={cn(
            'bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20',
            sizeClasses[size]
          )}
        >
          <Icons.settings
            className={cn('text-primary animate-spin', iconSizes[size])}
          />
        </div>
        {/* Pulsing ring effect */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping',
            sizeClasses[size]
          )}
        ></div>
      </div>

      {/* Loading text */}
      <div className='text-center'>
        <p className='text-sm font-medium text-foreground mb-1'>{title}</p>
        <p className='text-xs text-muted-foreground'>{description}</p>
      </div>

      {/* Progress dots */}
      <div className='flex gap-1'>
        <div className='w-2 h-2 bg-primary rounded-full animate-bounce'></div>
        <div
          className='w-2 h-2 bg-primary rounded-full animate-bounce'
          style={{ animationDelay: '0.1s' }}
        ></div>
        <div
          className='w-2 h-2 bg-primary rounded-full animate-bounce'
          style={{ animationDelay: '0.2s' }}
        ></div>
      </div>
    </div>
  )
}
