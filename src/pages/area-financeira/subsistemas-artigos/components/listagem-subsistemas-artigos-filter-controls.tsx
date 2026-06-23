import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemSubsistemasArtigosFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const cartao =
    (table.getColumn('codigoCartaoInstituicao')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Cartão instituição:</Label>
        <Input
          placeholder='Procurar...'
          value={cartao}
          onChange={(e) =>
            table
              .getColumn('codigoCartaoInstituicao')
              ?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[280px] bg-background border border-input shadow-sm'
          maxLength={20}
        />
      </div>
    </div>
  )
}
