import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

/** Modal de filtros — alinhado às restantes listagens (pesquisa por nome). */
export function ListagemDocumentosModeloFilterControls({
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
        <Label>Nome:</Label>
        <Input
          placeholder='Procurar por nome...'
          value={nome}
          onChange={(e) =>
            table.getColumn('nome')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[240px] border border-input bg-background shadow-sm'
        />
      </div>
    </div>
  )
}
