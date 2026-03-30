import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemOrganismosFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const nome = (table.getColumn('nome')?.getFilterValue() as string) ?? ''
  const numeroContribuinte =
    (table.getColumn('numeroContribuinte')?.getFilterValue() as string) ?? ''

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
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
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
