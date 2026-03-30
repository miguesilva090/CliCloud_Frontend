import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'

export function AtestadosFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const dataValue = (table.getColumn('data')?.getFilterValue() as string) ?? ''
  const idUtenteValue = (table.getColumn('idUtente')?.getFilterValue() as string) ?? ''
  const idMedicoValue = (table.getColumn('idMedico')?.getFilterValue() as string) ?? ''
  const intervaloValue = (table.getColumn('intervalo')?.getFilterValue() as string) === 'true'
  const dataFimValue = (table.getColumn('dataFim')?.getFilterValue() as string) ?? ''
  const idUtenteFimValue = (table.getColumn('idUtenteFim')?.getFilterValue() as string) ?? ''
  const idMedicoFimValue = (table.getColumn('idMedicoFim')?.getFilterValue() as string) ?? ''

  const dataDate = useMemo(() => {
    if (!dataValue) return undefined
    try {
      const d = parseISO(dataValue)
      return Number.isNaN(d.getTime()) ? undefined : d
    } catch {
      return undefined
    }
  }, [dataValue])

  const dataFimDate = useMemo(() => {
    if (!dataFimValue) return undefined
    try {
      const d = parseISO(dataFimValue)
      return Number.isNaN(d.getTime()) ? undefined : d
    } catch {
      return undefined
    }
  }, [dataFimValue])

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label>Data</Label>
          <DatePicker
            value={dataDate}
            onChange={(date) =>
              table.getColumn('data')?.setFilterValue(date ? format(date, 'yyyy-MM-dd') : '')
            }
            placeholder='Selecionar data…'
            className='h-8 w-full border border-input bg-background py-1.5 shadow-sm'
          />
        </div>
        <div className='space-y-2'>
          <Label>Id Utente</Label>
          <Input
            placeholder='Id utente…'
            value={idUtenteValue}
            onChange={(e) => table.getColumn('idUtente')?.setFilterValue(e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <Label>Id Médico</Label>
          <Input
            placeholder='Id médico…'
            value={idMedicoValue}
            onChange={(e) => table.getColumn('idMedico')?.setFilterValue(e.target.value)}
          />
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        <Checkbox
          id='intervalo-atestados'
          checked={intervaloValue}
          onCheckedChange={(checked) =>
            table.getColumn('intervalo')?.setFilterValue(checked ? 'true' : '')
          }
        />
        <Label htmlFor='intervalo-atestados' className='cursor-pointer font-normal'>
          Intervalo (mostrar campos de fim)
        </Label>
      </div>

      {intervaloValue && (
        <div className='grid gap-4 rounded-md border border-border/50 bg-muted/30 p-4 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Data fim</Label>
            <DatePicker
              value={dataFimDate}
              onChange={(date) =>
                table.getColumn('dataFim')?.setFilterValue(date ? format(date, 'yyyy-MM-dd') : '')
              }
              placeholder='Data fim…'
              className='h-8 w-full border border-input bg-background py-1.5 shadow-sm'
            />
          </div>
          <div className='space-y-2'>
            <Label>Id Utente fim</Label>
            <Input
              placeholder='Id utente fim…'
              value={idUtenteFimValue}
              onChange={(e) => table.getColumn('idUtenteFim')?.setFilterValue(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label>Id Médico fim</Label>
            <Input
              placeholder='Id médico fim…'
              value={idMedicoFimValue}
              onChange={(e) => table.getColumn('idMedicoFim')?.setFilterValue(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
