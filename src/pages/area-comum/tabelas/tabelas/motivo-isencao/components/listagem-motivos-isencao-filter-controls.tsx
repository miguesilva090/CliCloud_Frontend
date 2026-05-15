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

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Código:</Label>
        <Input
          placeholder='Procurar por código...'
          value={codigo}
          onChange={(e) =>
            table.getColumn('codigo')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
      <div className='space-y-2'>
        <Label>Descrição:</Label>
        <Input
          placeholder='Procurar por descrição...'
          value={descricao}
          onChange={(e) =>
            table.getColumn('descricao')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}
