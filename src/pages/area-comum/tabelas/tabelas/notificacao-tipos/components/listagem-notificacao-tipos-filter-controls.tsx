import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemNotificacaoTiposFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const designacaoTipo =
    (table.getColumn('designacaoTipo')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Designação:</Label>
        <Input
          placeholder='Procurar por designação...'
          value={designacaoTipo}
          onChange={(e) =>
            table.getColumn('designacaoTipo')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}
