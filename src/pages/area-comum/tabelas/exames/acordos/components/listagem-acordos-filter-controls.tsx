import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemAcordosFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const codigoSubsistema =
    (table.getColumn('codigoSubsistema')?.getFilterValue() as string) ?? ''
  const tipoExameDesignacao =
    (table.getColumn('tipoExameDesignacao')?.getFilterValue() as string) ?? ''
  const organismoNome =
    (table.getColumn('organismoNome')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Cód. Subsistema:</Label>
        <Input
          placeholder='Procurar...'
          value={codigoSubsistema}
          onChange={(e) =>
            table.getColumn('codigoSubsistema')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[200px] bg-background border border-input shadow-sm'
        />
      </div>
      <div className='space-y-2'>
        <Label>Tipo Exame:</Label>
        <Input
          placeholder='Procurar...'
          value={tipoExameDesignacao}
          onChange={(e) =>
            table.getColumn('tipoExameDesignacao')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[200px] bg-background border border-input shadow-sm'
        />
      </div>
      <div className='space-y-2'>
        <Label>Organismo:</Label>
        <Input
          placeholder='Procurar...'
          value={organismoNome}
          onChange={(e) =>
            table.getColumn('organismoNome')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[200px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}

