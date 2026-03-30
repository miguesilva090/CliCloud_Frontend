import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'

interface AppLoaderProps {
  isLoading: boolean
  onComplete?: () => void
  title?: string
  description?: string
  icon?: keyof typeof Icons
  className?: string
  hideDelay?: number
}

export function AppLoader({
  isLoading,
  onComplete,
  title = 'A carregar...',
  description = 'Por favor aguarde',
  icon = 'settings',
  className,
  hideDelay = 100,
}: AppLoaderProps) {
  const [isVisible, setIsVisible] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true)
    } else {
      // Add a small delay before hiding to ensure smooth transition
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, hideDelay)
      return () => clearTimeout(timer)
    }
  }, [isLoading, onComplete, hideDelay])

  if (!isVisible) return null

  const IconComponent = Icons[icon]

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <div className='flex flex-col items-center gap-4'>
        {/* Animated icon */}
        <div className='relative'>
          <div className='w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20'>
            <IconComponent className='h-8 w-8 text-primary animate-spin' />
          </div>
          {/* Pulsing ring effect */}
          <div className='absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping'></div>
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
    </div>
  )
}
