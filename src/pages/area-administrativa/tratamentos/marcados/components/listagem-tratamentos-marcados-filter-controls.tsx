import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  applyFiltersIfChanged,
  buildFiltersWithValue,
  type PageFilter,
} from '@/utils/page-data-utils'

const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'Por iniciar', label: 'Por iniciar' },
  { value: 'Iniciados', label: 'Iniciados' },
  { value: 'Terminados', label: 'Terminados' },
  { value: 'Suspensos', label: 'Suspensos' },
  { value: 'Provisorios', label: 'Provisórios' },
] as const

type Props = {
  filters: PageFilter[]
  onFiltersChange: (filters: PageFilter[]) => void
}

function filterVal(filters: PageFilter[], id: string) {
  return filters.find((f) => f.id === id)?.value ?? ''
}

function setFilter(
  filters: PageFilter[],
  onFiltersChange: (filters: PageFilter[]) => void,
  id: string,
  value: string
) {
  applyFiltersIfChanged(
    filters,
    buildFiltersWithValue(filters, id, value),
    onFiltersChange
  )
}

export function ListagemTratamentosMarcadosFilterControls({
  filters,
  onFiltersChange,
}: Props) {
  const designacao = filterVal(filters, 'designacao')
  const estadoRaw = filterVal(filters, 'filtroEstado')
  const estado = estadoRaw || 'todos'
  const dataInicDe = filterVal(filters, 'dataInicDe')
  const dataInicAte = filterVal(filters, 'dataInicAte')
  const dataFimDe = filterVal(filters, 'dataFimDe')
  const dataFimAte = filterVal(filters, 'dataFimAte')

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      <div className='space-y-2'>
        <Label>Designação</Label>
        <Input
          value={designacao}
          placeholder='Filtrar designação…'
          onChange={(e) =>
            setFilter(filters, onFiltersChange, 'designacao', e.target.value)
          }
          className='bg-background'
        />
      </div>
      <div className='space-y-2'>
        <Label>Estado</Label>
        <Select
          value={estado}
          onValueChange={(v) =>
            setFilter(
              filters,
              onFiltersChange,
              'filtroEstado',
              v === 'todos' ? '' : v
            )
          }
        >
          <SelectTrigger className='bg-background'>
            <SelectValue placeholder='Estado' />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Data início de</Label>
        <Input
          type='date'
          value={dataInicDe}
          onChange={(e) =>
            setFilter(filters, onFiltersChange, 'dataInicDe', e.target.value)
          }
          className='bg-background'
        />
      </div>
      <div className='space-y-2'>
        <Label>Data início até</Label>
        <Input
          type='date'
          value={dataInicAte}
          onChange={(e) =>
            setFilter(filters, onFiltersChange, 'dataInicAte', e.target.value)
          }
          className='bg-background'
        />
      </div>
      <div className='space-y-2'>
        <Label>Data fim de</Label>
        <Input
          type='date'
          value={dataFimDe}
          onChange={(e) =>
            setFilter(filters, onFiltersChange, 'dataFimDe', e.target.value)
          }
          className='bg-background'
        />
      </div>
      <div className='space-y-2'>
        <Label>Data fim até</Label>
        <Input
          type='date'
          value={dataFimAte}
          onChange={(e) =>
            setFilter(filters, onFiltersChange, 'dataFimAte', e.target.value)
          }
          className='bg-background'
        />
      </div>
    </div>
  )
}