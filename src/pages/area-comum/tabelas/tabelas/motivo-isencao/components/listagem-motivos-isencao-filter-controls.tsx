import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemMotivosIsencaoFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const codigo = (table.getColumn('codigo')?.getFilterValue() as string) ?? ''
  const descricao =
    (table.getColumn('descricao')?.getFilterValue() as string) ?? ''
  const norma = (table.getColumn('norma')?.getFilterValue() as string) ?? ''
  const mencao = (table.getColumn('mencao')?.getFilterValue() as string) ?? ''

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label>Número:</Label>
        <Input
          placeholder='De...'
          value={codigo}
          onChange={(e) =>
            table.getColumn('codigo')?.setFilterValue(e.target.value)
          }
          className='w-full bg-background border border-input shadow-sm'
        />
      </div>
      <div className='space-y-2'>
        <Label>Motivo:</Label>
        <Input
          placeholder='Procurar por motivo...'
          value={descricao}
          onChange={(e) =>
            table.getColumn('descricao')?.setFilterValue(e.target.value)
          }
          className='w-full bg-background border border-input shadow-sm'
        />
      </div>
      <div className='space-y-2'>
        <Label>Norma:</Label>
        <Input
          placeholder='Procurar por norma...'
          value={norma}
          onChange={(e) =>
            table.getColumn('norma')?.setFilterValue(e.target.value)
          }
          className='w-full bg-background border border-input shadow-sm'
        />
      </div>
      <div className='space-y-2'>
        <Label>Menção:</Label>
        <Input
          placeholder='Procurar por menção...'
          value={mencao}
          onChange={(e) =>
            table.getColumn('mencao')?.setFilterValue(e.target.value)
          }
          className='w-full bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}
