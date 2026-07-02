import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemSeguradorasFilterControls({
  table,
}: {
  table: unknown
  columns: unknown[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const t = table as {
    getColumn: (id: string) => { getFilterValue: () => unknown; setFilterValue: (v: string) => void } | undefined
  }
  const nome = (t.getColumn('nome')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Nome:</Label>
        <Input
          placeholder='Procurar por nome...'
          value={nome}
          onChange={(e) => t.getColumn('nome')?.setFilterValue(e.target.value)}
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}
