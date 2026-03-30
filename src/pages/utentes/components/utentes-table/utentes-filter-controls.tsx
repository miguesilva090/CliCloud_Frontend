import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function UtentesFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const nif = (table.getColumn('numeroContribuinte')?.getFilterValue() as string) ?? ''
  const numeroUtente = (table.getColumn('numeroUtente')?.getFilterValue() as string) ?? ''

  return (
    <div className='flex flex-wrap items-end gap-4'>
      <div className='space-y-2'>
        <Label>NIF</Label>
        <Input
          placeholder='Procurar por NIF...'
          value={nif}
          onChange={(e) =>
            table.getColumn('numeroContribuinte')?.setFilterValue(e.target.value)
          }
          className='w-full min-w-[180px] max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
      <div className='space-y-2'>
        <Label>Nº Utente</Label>
        <Input
          placeholder='Procurar por número de utente...'
          value={numeroUtente}
          onChange={(e) =>
            table.getColumn('numeroUtente')?.setFilterValue(e.target.value)
          }
          className='w-full min-w-[180px] max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}

