import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type DashboardPageContainerProps = {
  children: ReactNode
  className?: string
}

/**
 * Container component for dashboard pages that ensures proper spacing
 * to account for the windows manager footer at the bottom.
 *
 * Uses pb-40 (160px) on mobile to provide enough space when RecentPagesGrid
 * is visible, and pb-14 (56px) on desktop to ensure content is visible above
 * the fixed windows manager bar (48px height + 8px safety margin).
 * Uses padding-bottom instead of margin-bottom because the windows bar is fixed.
 */
export function DashboardPageContainer({
  children,
  className,
}: DashboardPageContainerProps) {
  return (
    <div
      className={cn(
        'px-4 md:px-8 md:pb-14 md:pt-20 pt-4 md:mx-0 md:my-4 md:mr-4 md:rounded-xl pb-40',
        className
      )}
    >
      {children}
    </div>
  )
}

export default DashboardPageContainer
