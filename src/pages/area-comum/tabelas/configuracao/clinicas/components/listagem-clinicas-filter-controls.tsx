import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemClinicasFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const nomeComercial =
    (table.getColumn('nomeComercial')?.getFilterValue() as string) ?? ''
  const abreviatura =
    (table.getColumn('abreviatura')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Nome Comercial:</Label>
        <Input
          placeholder='Procurar por nome comercial...'
          value={nomeComercial}
          onChange={(e) =>
            table.getColumn('nomeComercial')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>

      <div className='space-y-2'>
        <Label>Abreviatura:</Label>
        <Input
          placeholder='Procurar por abreviatura...'
          value={abreviatura}
          onChange={(e) =>
            table.getColumn('abreviatura')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}

