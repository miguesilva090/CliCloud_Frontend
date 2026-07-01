import { useMemo, useState } from 'react'
import { useUtentesLight } from '@/pages/area-comum/tabelas/entidades/utentes/queries/utentes-queries'
import { Eraser, Filter, Plus } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { toast } from '@/utils/toast-utils'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { COMUNICACAO_FATURAS_ESTADO_COM_OPCOES } from '../constants/comunicacao-faturas-estado-com'

export type ComunicacaoFaturasFilterDraft = {
  dataInicial?: Date
  dataFinal?: Date
  estadoComunicacao: string
  utenteId: string
  utenteLabel: string
}

type Props = {
  draft: ComunicacaoFaturasFilterDraft
  onDraftChange: (draft: ComunicacaoFaturasFilterDraft) => void
  onApply: () => void
  onClear: () => void
}

export function ComunicacaoFaturasFilterPanel({
  draft,
  onDraftChange,
  onApply,
  onClear,
}: Props) {
  const [utenteSearch, setUtenteSearch] = useState('')
  const [utenteSearchDebounced] = useDebounce(utenteSearch, 250)
  const utentesQuery = useUtentesLight(utenteSearchDebounced)

  const utenteItems = useMemo(() => {
    const list = utentesQuery.data?.info?.data ?? []
    const mapped = list.map((u) => ({
      value: u.id,
      label: [u.numeroUtente, u.nome].filter(Boolean).join(' — '),
    }))
    if (
      draft.utenteId &&
      draft.utenteLabel &&
      !mapped.some((item) => item.value === draft.utenteId)
    ) {
      return [{ value: draft.utenteId, label: draft.utenteLabel }, ...mapped]
    }
    return mapped
  }, [draft.utenteId, draft.utenteLabel, utentesQuery.data])

  const patch = (partial: Partial<ComunicacaoFaturasFilterDraft>) => {
    onDraftChange({ ...draft, ...partial })
  }

  return (
    <section className='rounded-md border border-border bg-card p-4'>
      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='space-y-1.5'>
          <Label className='text-xs text-muted-foreground'>Data Inicial</Label>
          <DatePicker
            value={draft.dataInicial}
            onChange={(date) => patch({ dataInicial: date })}
            displayFormat='dd-MM-yyyy'
            className='h-9'
          />
        </div>
        <div className='space-y-1.5'>
          <Label className='text-xs text-muted-foreground'>Data Final</Label>
          <DatePicker
            value={draft.dataFinal}
            onChange={(date) => patch({ dataFinal: date })}
            displayFormat='dd-MM-yyyy'
            className='h-9'
          />
        </div>
        <div className='space-y-1.5'>
          <Label className='text-xs text-muted-foreground'>Estado Com.</Label>
          <Select
            value={draft.estadoComunicacao || undefined}
            onValueChange={(value) => patch({ estadoComunicacao: value })}
          >
            <SelectTrigger className='h-9'>
              <SelectValue placeholder='Estado Com.' />
            </SelectTrigger>
            <SelectContent>
              {COMUNICACAO_FATURAS_ESTADO_COM_OPCOES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='mt-4 flex flex-col gap-3 lg:flex-row lg:items-end'>
        <div className='min-w-0 flex-1 space-y-1.5'>
          <Label className='text-xs text-muted-foreground'>Utente</Label>
          <div className='flex gap-1'>
            <AsyncCombobox
              className='min-w-0 flex-1'
              value={draft.utenteId}
              onChange={(id) => {
                const item = utenteItems.find((u) => u.value === id)
                patch({
                  utenteId: id,
                  utenteLabel: item?.label ?? '',
                })
              }}
              items={utenteItems}
              isLoading={utentesQuery.isFetching}
              placeholder='Utente...'
              searchPlaceholder='Pesquisar utente...'
              emptyText='Sem utentes'
              searchValue={utenteSearch}
              onSearchValueChange={setUtenteSearch}
            />
            <Button
              type='button'
              variant='secondary'
              size='icon'
              className='h-9 w-9 shrink-0'
              title='Novo utente'
              onClick={() =>
                toast.info('Registo de utente — módulo Utentes (fase 2).')
              }
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='flex shrink-0 flex-wrap items-center justify-end gap-2'>
          <Button
            type='button'
            size='sm'
            className='h-9 gap-2'
            onClick={onApply}
          >
            <Filter className='h-4 w-4' />
            Aplicar Filtros
          </Button>
          <Button
            type='button'
            size='sm'
            variant='outline'
            className='h-9 gap-2'
            onClick={onClear}
          >
            <Eraser className='h-4 w-4' />
            Limpar Filtros
          </Button>
        </div>
      </div>
    </section>
  )
}
