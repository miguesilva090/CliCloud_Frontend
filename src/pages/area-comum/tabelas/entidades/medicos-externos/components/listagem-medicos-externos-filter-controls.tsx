import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemMedicosExternosFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const numeroContribuinte =
    (table.getColumn('numeroContribuinte')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Nº Contribuinte:</Label>
        <Input
          placeholder='Procurar por nº contribuinte...'
          value={numeroContribuinte}
          onChange={(e) =>
            table
              .getColumn('numeroContribuinte')
              ?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}
