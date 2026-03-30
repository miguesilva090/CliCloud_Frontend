import { PrintOption } from '@/types/data-table'
import { Printer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PrintDropdownProps {
  options?: PrintOption[]
  className?: string
}

export function PrintDropdown({ options, className }: PrintDropdownProps) {
  if (!options?.length) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <Printer className='h-4 w-4 sm:mr-2' />
          <span className='hidden sm:inline-block'>Imprimir</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        side='bottom'
        className={cn('w-[200px]', className)}
      >
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onClick={option.onClick}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
