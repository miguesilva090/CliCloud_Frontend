import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemEspecialidadesFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const nome = (table.getColumn('nome')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Designação:</Label>
        <Input
          placeholder='Procurar por designação...'
          value={nome}
          onChange={(e) => table.getColumn('nome')?.setFilterValue(e.target.value)}
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}

