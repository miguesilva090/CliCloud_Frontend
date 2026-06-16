import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ListagemMotivosRetencaoFilterControls({
  table,
}: {
  table: {
    getColumn: (id: string) =>
      | {
          getFilterValue: () => unknown
          setFilterValue: (value: string) => void
        }
      | undefined
  }
}) {
  const codigo = (table.getColumn('codigo')?.getFilterValue() as string) ?? ''
  const descricao =
    (table.getColumn('descricao')?.getFilterValue() as string) ?? ''
  const tipoImposto =
    (table.getColumn('tipoImposto')?.getFilterValue() as string) ?? ''

  return (
    <div className='grid gap-4 sm:grid-cols-3'>
      <div className='space-y-2'>
        <Label>Código</Label>
        <Input
          value={codigo}
          onChange={(e) =>
            table.getColumn('codigo')?.setFilterValue(e.target.value)
          }
        />
      </div>
      <div className='space-y-2'>
        <Label>Descrição</Label>
        <Input
          value={descricao}
          onChange={(e) =>
            table.getColumn('descricao')?.setFilterValue(e.target.value)
          }
        />
      </div>
      <div className='space-y-2'>
        <Label>Imposto</Label>
        <Select
          value={tipoImposto || 'ALL'}
          onValueChange={(v) =>
            table.getColumn('tipoImposto')?.setFilterValue(v === 'ALL' ? '' : v)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Todos' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>Todos</SelectItem>
            <SelectItem value='IRS'>IRS</SelectItem>
            <SelectItem value='IRC'>IRC</SelectItem>
            <SelectItem value='IS'>IS</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
