import { Button } from '@/components/ui/button'
import { ChevronLeft, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'

type EntityFormPageHeaderProps = {
  title: string
  onBack: () => void
  onRefresh: () => void
  rightActions?: ReactNode
}

export function EntityFormPageHeader({
  title,
  onBack,
  onRefresh,
  rightActions,
}: EntityFormPageHeaderProps) {
  return (
    <div className='mb-4 rounded-xl border bg-background shadow-sm'>
      <div className='flex flex-nowrap items-center gap-x-3 overflow-x-auto px-4 py-3'>
        <div className='flex min-h-8 min-w-0 flex-shrink-0 items-center gap-2'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 shrink-0'
            onClick={onBack}
            title='Voltar'
          >
            <ChevronLeft className='h-5 w-5' aria-hidden />
          </Button>
          <h2 className='truncate text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg'>
            {title}
          </h2>
        </div>
        <div className='flex min-w-0 min-h-8 flex-1 flex-nowrap items-center justify-end gap-2 overflow-x-auto'>
          <Button type='button' variant='outline' size='sm' onClick={onRefresh} className='gap-2'>
            <RefreshCw className='h-4 w-4' aria-hidden />
            Atualizar
          </Button>
          {rightActions}
        </div>
      </div>
    </div>
  )
}
