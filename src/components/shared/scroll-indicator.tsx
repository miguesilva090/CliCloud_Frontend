import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ScrollIndicator() {
  const [showDownIndicator, setShowDownIndicator] = useState(false)
  const [showUpIndicator, setShowUpIndicator] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.querySelector('main')
      if (!mainContent) return

      const maxScroll = mainContent.scrollHeight - mainContent.clientHeight
      const currentScroll = mainContent.scrollTop

      setShowDownIndicator(currentScroll < maxScroll && maxScroll > 0)
      setShowUpIndicator(currentScroll > 0)
    }

    const mainContent = document.querySelector('main')
    if (!mainContent) return

    handleScroll()
    mainContent.addEventListener('scroll', handleScroll)

    return () => {
      mainContent.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      {showUpIndicator && (
        <div
          className={cn(
            'fixed top-20 left-1/2 -translate-x-1/2 z-[70]',
            'rounded-full bg-background/80 p-1.5 text-muted-foreground shadow-sm',
            'transition-opacity duration-200',
            'hover:cursor-pointer hover:bg-background hover:text-foreground'
          )}
          onClick={() => {
            const mainContent = document.querySelector('main')
            if (mainContent) {
              mainContent.scrollBy({ top: -200, behavior: 'smooth' })
            }
          }}
          aria-label='Scroll up'
        >
          <ChevronUp className='h-4 w-4' />
        </div>
      )}
      {showDownIndicator && (
        <div
          className={cn(
            'fixed bottom-16 left-1/2 -translate-x-1/2 z-[70]',
            'rounded-full bg-background/80 p-1.5 text-muted-foreground shadow-sm',
            'transition-opacity duration-200',
            'hover:cursor-pointer hover:bg-background hover:text-foreground'
          )}
          onClick={() => {
            const mainContent = document.querySelector('main')
            if (mainContent) {
              mainContent.scrollBy({ top: 200, behavior: 'smooth' })
            }
          }}
          aria-label='Scroll down'
        >
          <ChevronDown className='h-4 w-4' />
        </div>
      )}
    </>
  )
}
