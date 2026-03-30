import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageContainerProps = {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col gap-8 px-4 md:px-8 md:pb-24 md:pt-20 pt-14 md:mx-0 md:my-4 md:mr-4 md:rounded-xl pb-24',
        className
      )}
    >
      {children}
    </div>
  )
}

export default PageContainer
