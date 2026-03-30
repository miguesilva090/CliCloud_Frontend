import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemTaxasIvaFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const descricao =
    (table.getColumn('descricao')?.getFilterValue() as string) ?? ''
  const taxa = (table.getColumn('taxa')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
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
      <div className='space-y-2'>
        <Label>Taxa:</Label>
        <Input
          type='number'
          placeholder='Procurar por taxa...'
          value={taxa}
          onChange={(e) => table.getColumn('taxa')?.setFilterValue(e.target.value)}
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}

