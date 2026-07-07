import { Label } from '@/components/ui/label'
import { DateField } from '@/components/shared/date-field'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  applyFiltersIfChanged,
  buildFiltersWithValue,
  type PageFilter,
} from '@/utils/page-data-utils'

type Props = {
  filters: PageFilter[]
  onFiltersChange: (filters: Array<{ id: string; value: string }>) => void
}

function BoolPair({
  label,
  simId,
  naoId,
  filters,
  onPatch,
}: {
  label: string
  simId: string
  naoId: string
  filters: PageFilter[]
  onPatch: (id: string, value: string) => void
}) {
  const sim = filters.find((f) => f.id === simId)?.value === '1'
  const nao = filters.find((f) => f.id === naoId)?.value === '1'

  return (
    <div className='rounded-md border p-2 space-y-1'>
      <span className='text-xs font-medium text-muted-foreground'>{label}</span>
      <div className='flex gap-4'>
        <label className='flex items-center gap-1.5 text-sm'>
          <Checkbox
            checked={sim}
            onCheckedChange={(v) => {
              onPatch(simId, v ? '1' : '')
              if (v) onPatch(naoId, '')
            }}
          />
          Sim
        </label>
        <label className='flex items-center gap-1.5 text-sm'>
          <Checkbox
            checked={nao}
            onCheckedChange={(v) => {
              onPatch(naoId, v ? '1' : '')
              if (v) onPatch(simId, '')
            }}
          />
          Não
        </label>
      </div>
    </div>
  )
}

export function GlobalBookingFilterControls({ filters, onFiltersChange }: Props) {
  const dataDe = filters.find((f) => f.id === 'dataDe')?.value ?? ''
  const dataAte = filters.find((f) => f.id === 'dataAte')?.value ?? ''

  const patch = (id: string, value: string) => {
    applyFiltersIfChanged(
      filters,
      buildFiltersWithValue(filters, id, value),
      onFiltersChange
    )
  }

  const clearBoolFilters = () => {
    const ids = [
      'agendadoSim',
      'agendadoNao',
      'recusadoSim',
      'recusadoNao',
      'emailPedidoSim',
      'emailPedidoNao',
      'smsPedidoSim',
      'smsPedidoNao',
      'emailAgendadoSim',
      'emailAgendadoNao',
      'smsAgendadoSim',
      'smsAgendadoNao',
    ]
    let next = filters.filter((f) => !ids.includes(f.id))
    applyFiltersIfChanged(filters, next, onFiltersChange)
  }

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap gap-2'>
        <Button type='button' variant='outline' size='sm' onClick={clearBoolFilters}>
          Limpar filtros
        </Button>
      </div>

      <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
        <BoolPair
          label='Agendado'
          simId='agendadoSim'
          naoId='agendadoNao'
          filters={filters}
          onPatch={patch}
        />
        <BoolPair
          label='Recusado'
          simId='recusadoSim'
          naoId='recusadoNao'
          filters={filters}
          onPatch={patch}
        />
        <BoolPair
          label='Email pedido'
          simId='emailPedidoSim'
          naoId='emailPedidoNao'
          filters={filters}
          onPatch={patch}
        />
        <BoolPair
          label='SMS pedido'
          simId='smsPedidoSim'
          naoId='smsPedidoNao'
          filters={filters}
          onPatch={patch}
        />
        <BoolPair
          label='Email agendamento'
          simId='emailAgendadoSim'
          naoId='emailAgendadoNao'
          filters={filters}
          onPatch={patch}
        />
        <BoolPair
          label='SMS agendamento'
          simId='smsAgendadoSim'
          naoId='smsAgendadoNao'
          filters={filters}
          onPatch={patch}
        />
      </div>

      <div className='grid gap-3 sm:grid-cols-2 max-w-md'>
        <div>
          <Label className='text-xs text-muted-foreground'>Data de</Label>
          <DateField
            className='mt-1 w-full'
            value={dataDe}
            onChange={(v) => patch('dataDe', v)}
          />
        </div>
        <div>
          <Label className='text-xs text-muted-foreground'>Data até</Label>
          <DateField
            className='mt-1 w-full'
            value={dataAte}
            onChange={(v) => patch('dataAte', v)}
          />
        </div>
      </div>
    </div>
  )
}
