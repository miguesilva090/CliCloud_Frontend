import { useState } from 'react'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { DataTrabalhoSelector } from './data-trabalho-selector'

export function AppOptionsDrawer() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='transition-all duration-150 hover:scale-105 active:scale-95'
        >
          <Settings className='h-[1.2rem] w-[1.2rem]' />
          <span className='sr-only'>App options</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className={cn(
          'w-[400px] sm:w-[540px]',
          'transition-transform duration-200',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-right',
          'data-[state=open]:slide-in-from-right'
        )}
      >
        <SheetHeader className='animate-in fade-in-50 duration-300 delay-75'>
          <SheetTitle>Opções da Aplicação</SheetTitle>
          <SheetDescription>
            Configure as suas preferências aqui.
          </SheetDescription>
        </SheetHeader>
        <div
          className={cn(
            'mt-6 space-y-6',
            'animate-in fade-in-50 duration-300 delay-100'
          )}
        >
          <DataTrabalhoSelector />
        </div>
      </SheetContent>
    </Sheet>
  )
}
