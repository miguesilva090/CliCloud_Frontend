import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemPatologiasFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const organismoNome =
    (table.getColumn('organismoNome')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Organismo:</Label>
        <Input
          placeholder='Procurar por organismo...'
          value={organismoNome}
          onChange={(e) =>
            table.getColumn('organismoNome')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}
