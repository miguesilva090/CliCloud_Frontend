import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [showLeftScroll, setShowLeftScroll] = React.useState(false)
  const [showRightScroll, setShowRightScroll] = React.useState(false)

  const checkScroll = React.useCallback(() => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
      setShowLeftScroll(scrollLeft > 0)
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth)
    }
  }, [])

  React.useEffect(() => {
    if (!containerRef.current) return

    // Initial check after render
    const timeoutId = setTimeout(() => {
      checkScroll()
    }, 0)

    // Watch for size changes
    const resizeObserver = new ResizeObserver(() => {
      checkScroll()
    })

    resizeObserver.observe(containerRef.current)

    window.addEventListener('resize', checkScroll)

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200
      const currentScroll = containerRef.current.scrollLeft
      const maxScroll =
        containerRef.current.scrollWidth - containerRef.current.clientWidth

      containerRef.current.scrollTo({
        left: Math.max(0, Math.min(currentScroll + scrollAmount, maxScroll)),
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className='relative w-full'>
      <div>
        {showLeftScroll && (
          <Button
            variant='ghost'
            size='icon'
            className='absolute left-0 top-1/2 -translate-y-1/2 z-10'
            onClick={() => scroll('left')}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
        )}

        <div
          ref={containerRef}
          className={cn(
            'overflow-x-auto scrollbar-hide',
            showLeftScroll && 'ml-8',
            showRightScroll && 'mr-8'
          )}
          onScroll={checkScroll}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <TabsPrimitive.List
            ref={ref}
            className={cn(
              'inline-flex h-auto items-center justify-start p-1 text-muted-foreground min-w-full bg-secondary/50 border border-border rounded-md',
              className
            )}
            {...props}
          >
            {children}
          </TabsPrimitive.List>
        </div>

        {showRightScroll && (
          <Button
            variant='ghost'
            size='icon'
            className='absolute right-0 top-1/2 -translate-y-1/2 z-10'
            onClick={() => scroll('right')}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex h-10 whitespace-nowrap items-center justify-center rounded-lg px-4 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    /** Lista de nomes de campos do form que estão nesta tab (ex.: "paisId,distritoId,rua"). Usado para navegação em erros de validação. */
    'data-fields'?: string
  }
>(({ className, value, 'data-fields': dataFields, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    value={value}
    data-tab={value}
    data-fields={dataFields}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
