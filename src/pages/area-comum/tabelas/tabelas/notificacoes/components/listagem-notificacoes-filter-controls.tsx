import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemNotificacoesFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const titulo = (table.getColumn('titulo')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Título:</Label>
        <Input
          placeholder='Procurar por título...'
          value={titulo}
          onChange={(e) => table.getColumn('titulo')?.setFilterValue(e.target.value)}
          className='w-full max-w-[280px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}
