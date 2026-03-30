import { format } from 'date-fns'
import { Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type AtestadosFilterBarValues = {
  dataDe: string
  dataAte: string
  codUtenteDe: string
  codUtenteAte: string
  codMedicoDe: string
  codMedicoAte: string
  intervalo: boolean
}

const emptyValues: AtestadosFilterBarValues = {
  dataDe: '',
  dataAte: '',
  codUtenteDe: '',
  codUtenteAte: '',
  codMedicoDe: '',
  codMedicoAte: '',
  intervalo: false,
}

/** Parse yyyy-MM-dd como data local para a data ficar correta na caixa */
function parseDate(value: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return undefined
  const [y, m, d] = value.trim().split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function AtestadosFilterBar({
  values,
  onChange,
  onLimpar,
  onPesquisar,
}: {
  values: AtestadosFilterBarValues
  onChange: (v: AtestadosFilterBarValues) => void
  onLimpar: () => void
  onPesquisar: () => void
}) {
  const { intervalo } = values
  const set = (patch: Partial<AtestadosFilterBarValues>) =>
    onChange({ ...values, ...patch })

  return (
    <div className='rounded-xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex flex-wrap items-end gap-4'>
        {/* Data */}
        <div className='flex flex-col gap-1'>
          <Label className='text-xs text-muted-foreground'>Data:</Label>
          <div className='flex items-center gap-2'>
            <DatePicker
              value={parseDate(values.dataDe)}
              onChange={(d) => set({ dataDe: d ? format(d, 'yyyy-MM-dd') : '' })}
              placeholder='De…'
              displayFormat='dd/MM/yyyy'
              className='h-8 w-[130px] min-w-[130px] border border-input bg-background py-1.5 shadow-sm'
            />
            {intervalo && (
              <DatePicker
                value={parseDate(values.dataAte)}
                onChange={(d) =>
                  set({ dataAte: d ? format(d, 'yyyy-MM-dd') : '' })
                }
                placeholder='Até…'
                displayFormat='dd/MM/yyyy'
                className='h-8 w-[130px] min-w-[130px] border border-input bg-background py-1.5 shadow-sm'
              />
            )}
          </div>
        </div>

        {/* Cód. Utente */}
        <div className='flex flex-col gap-1'>
          <Label className='text-xs text-muted-foreground'>Cód. Utente:</Label>
          <div className='flex items-center gap-2'>
            <Input
              placeholder='De…'
              value={values.codUtenteDe}
              onChange={(e) => set({ codUtenteDe: e.target.value })}
              className='h-8 w-[100px]'
            />
            {intervalo && (
              <Input
                placeholder='Até…'
                value={values.codUtenteAte}
                onChange={(e) => set({ codUtenteAte: e.target.value })}
                className='h-8 w-[100px]'
              />
            )}
          </div>
        </div>

        {/* Cód. Médico */}
        <div className='flex flex-col gap-1'>
          <Label className='text-xs text-muted-foreground'>Cód. Médico:</Label>
          <div className='flex items-center gap-2'>
            <Input
              placeholder='De…'
              value={values.codMedicoDe}
              onChange={(e) => set({ codMedicoDe: e.target.value })}
              className='h-8 w-[100px]'
            />
            {intervalo && (
              <Input
                placeholder='Até…'
                value={values.codMedicoAte}
                onChange={(e) => set({ codMedicoAte: e.target.value })}
                className='h-8 w-[100px]'
              />
            )}
          </div>
        </div>

        {/* Intervalo */}
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='intervalo-bar'
            checked={intervalo}
            onCheckedChange={(c) => set({ intervalo: c === true })}
          />
          <Label
            htmlFor='intervalo-bar'
            className='cursor-pointer text-sm font-normal'
          >
            Intervalo
          </Label>
        </div>

        {/* Ações */}
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='destructive'
            size='sm'
            className='h-8 gap-1.5'
            onClick={onLimpar}
          >
            <Trash2 className='h-4 w-4' />
            Limpar Dados
          </Button>
          <Button
            type='button'
            size='sm'
            className='h-8 gap-1.5'
            onClick={onPesquisar}
          >
            <Search className='h-4 w-4' />
            Pesquisar
          </Button>
        </div>
      </div>
    </div>
  )
}

export { emptyValues as atestadosFilterBarEmptyValues }
