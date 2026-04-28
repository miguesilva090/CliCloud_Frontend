import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemModelosAparelhoFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const marca = (table.getColumn('marcaAparelhoDesignacao')?.getFilterValue() as string) ?? ''
  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Marca:</Label>
        <Input placeholder='Procurar marca...' value={marca} onChange={(e) => table.getColumn('marcaAparelhoDesignacao')?.setFilterValue(e.target.value)} className='w-full max-w-[240px] bg-background border border-input shadow-sm' />
      </div>
    </div>
  )
}
