import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemDoencasFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const keyword = (table.getColumn('title')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Título / Código:</Label>
        <Input
          placeholder='Procurar por título ou código...'
          value={keyword}
          onChange={(e) =>
            table.getColumn('title')?.setFilterValue(e.target.value || undefined)
          }
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}
