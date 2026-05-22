import { BookOpen, Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  applyFiltersIfChanged,
  type PageFilter,
} from '@/utils/page-data-utils'
import {
  buildEmailPreset,
  buildEstadoPreset,
  buildSmsPreset,
  mergePresetWithExisting,
} from '../utils/global-booking-filter-presets'

type Props = {
  filters: PageFilter[]
  onFiltersChange: (filters: Array<{ id: string; value: string }>) => void
}

/** Paridade PedidosConsultaLst.aspx — botões Estado / Email / Sms no topo. */
export function GlobalBookingToolbarPresets({ filters, onFiltersChange }: Props) {
  const applyPreset = (presetFlags: PageFilter[]) => {
    const next = mergePresetWithExisting(filters, presetFlags)
    applyFiltersIfChanged(filters, next, onFiltersChange)
  }

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type='button' size='sm' className='gap-1 bg-emerald-600 hover:bg-emerald-700'>
            <BookOpen className='h-4 w-4' />
            Todos
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => applyPreset(buildEstadoPreset(1))}>
            Todos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(buildEstadoPreset(2))}>
            Por Agendar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(buildEstadoPreset(3))}>
            Agendados
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(buildEstadoPreset(4))}>
            Recusados
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(buildEstadoPreset(5))}>
            Falha Comunicação Pedido
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(buildEstadoPreset(6))}>
            Falha Comunicação Agendado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type='button' size='sm' className='gap-1 bg-emerald-600 hover:bg-emerald-700'>
            <Mail className='h-4 w-4' />
            Todos
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => applyPreset(buildEmailPreset(1))}>
            Todos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(buildEmailPreset(2))}>
            Email - Sucesso Pedido
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(buildEmailPreset(3))}>
            Email - Falha Pedido
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(buildEmailPreset(4))}>
            Email - Sucesso Agendamento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(buildEmailPreset(5))}>
            Email - Falha Agendamento
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type='button' size='sm' className='gap-1 bg-emerald-600 hover:bg-emerald-700'>
            <MessageSquare className='h-4 w-4' />
            Todos
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => applyPreset(buildSmsPreset(1))}>
            Todos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(buildSmsPreset(2))}>
            Sms - Sucesso Pedido
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(buildSmsPreset(3))}>
            Sms - Falha Pedido
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(buildSmsPreset(4))}>
            Sms - Sucesso Agendamento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(buildSmsPreset(5))}>
            Sms - Falha Agendamento
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
