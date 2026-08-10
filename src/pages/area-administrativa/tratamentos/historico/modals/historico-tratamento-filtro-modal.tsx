import { useEffect, useMemo, useState } from 'react'
import { format, isValid, startOfDay, startOfMonth, endOfMonth } from 'date-fns'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { modules } from '@/config/modules'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { TIPO_TECNICO } from '@/pages/area-comum/tabelas/entidades/tecnicos/constants/tipo-tecnico'
import type { HistoricoTratamentoModo } from '@/types/dtos/tratamentos/historico-tratamento-administrativo.dtos'
import type { TableFilter } from '@/types/dtos/common/table-filters.dtos'
import { toast } from '@/utils/toast-utils'

const perm = modules.areaAdministrativa.permissions.consultas.id

export type HistoricoTratCriteria = {
  dataFimDe: Date | null
  dataFimAte: Date | null
  utenteId: string
  utenteLabel: string
  fisioterapeutaId: string
  fisioterapeutaLabel: string
  auxiliarId: string
  auxiliarLabel: string
  outroTecnicoId: string
  outroTecnicoLabel: string
  organismoId: string
  organismoLabel: string
  credencial: string
}

export function emptyHistoricoTratCriteria(): HistoricoTratCriteria {
  const now = new Date()
  return {
    dataFimDe: startOfMonth(now),
    dataFimAte: endOfMonth(now),
    utenteId: '',
    utenteLabel: '',
    fisioterapeutaId: '',
    fisioterapeutaLabel: '',
    auxiliarId: '',
    auxiliarLabel: '',
    outroTecnicoId: '',
    outroTecnicoLabel: '',
    organismoId: '',
    organismoLabel: '',
    credencial: '',
  }
}

export function historicoTratListEnabled(
  modo: HistoricoTratamentoModo,
  c: HistoricoTratCriteria
): boolean {
  switch (modo) {
    case 'datas':
      return !!(c.dataFimDe && c.dataFimAte)
    case 'utentes':
      return !!c.utenteId
    case 'fisioterapeuta':
      return !!c.fisioterapeutaId
    case 'auxiliar':
      return !!c.auxiliarId
    case 'outro':
      return !!c.outroTecnicoId
    case 'organismo':
      return !!c.organismoId
    case 'credencial':
      return !!c.credencial.trim()
    default:
      return false
  }
}

export function buildHistoricoTratApiFilters(
  c: HistoricoTratCriteria
): TableFilter[] {
  const filters: TableFilter[] = []
  if (c.dataFimDe && isValid(c.dataFimDe)) {
    filters.push({
      id: 'dataFimDe',
      value: format(startOfDay(c.dataFimDe), 'yyyy-MM-dd'),
    })
  }
  if (c.dataFimAte && isValid(c.dataFimAte)) {
    filters.push({
      id: 'dataFimAte',
      value: format(startOfDay(c.dataFimAte), 'yyyy-MM-dd'),
    })
  }
  if (c.credencial.trim()) {
    filters.push({ id: 'credencial', value: c.credencial.trim() })
  }
  return filters
}

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
  modo: HistoricoTratamentoModo
  criteria: HistoricoTratCriteria
  onApply: (next: HistoricoTratCriteria) => void
}

export function HistoricoTratamentoFiltroModal({
  open,
  onOpenChange,
  modo,
  criteria,
  onApply,
}: Props) {
  const [local, setLocal] = useState(criteria)
  const [utSearch, setUtSearch] = useState('')
  const [tecSearch, setTecSearch] = useState('')
  const [orgSearch, setOrgSearch] = useState('')
  const [debUt] = useDebounce(utSearch, 300)
  const [debTec] = useDebounce(tecSearch, 300)
  const [debOrg] = useDebounce(orgSearch, 300)

  useEffect(() => {
    if (!open) return
    setLocal(criteria)
    // Sync só ao abrir o modal (evita reset em loop com nova referência de criteria)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const utQuery = useQuery({
    queryKey: ['hist-trat-ut', debUt],
    queryFn: () => UtentesService(perm).getUtentesLight(debUt),
    enabled: open && (modo === 'utentes' || modo === 'datas'),
  })

  const tipoTec =
    modo === 'fisioterapeuta'
      ? TIPO_TECNICO.Fisioterapeuta
      : modo === 'auxiliar'
        ? TIPO_TECNICO.Auxiliar
        : modo === 'outro'
          ? TIPO_TECNICO.Outro
          : null

  const tecQuery = useQuery({
    queryKey: ['hist-trat-tec', tipoTec, debTec],
    queryFn: async () => {
      const res = await TecnicoService(perm).getTecnicosPaginated({
        pageNumber: 1,
        pageSize: 40,
        filters: [
          { id: 'tipoTecnico', value: String(tipoTec) },
          ...(debTec.trim() ? [{ id: 'nome', value: debTec.trim() }] : []),
        ],
      })
      return res.info?.data ?? []
    },
    enabled: open && tipoTec != null,
  })

  const orgQuery = useQuery({
    queryKey: ['hist-trat-org', debOrg],
    queryFn: () => OrganismoService(perm).getOrganismoLight(debOrg),
    enabled: open && modo === 'organismo',
  })

  const utItems = useMemo(
    () =>
      (utQuery.data?.info?.data ?? []).map((u: { id: string; nome?: string }) => ({
        value: u.id,
        label: u.nome ?? u.id,
      })),
    [utQuery.data]
  )

  const tecItems = useMemo(
    () =>
      (tecQuery.data ?? []).map((t: { id: string; nome?: string | null }) => ({
        value: t.id,
        label: t.nome ?? t.id,
      })),
    [tecQuery.data]
  )

  const orgItems = useMemo(
    () =>
      (orgQuery.data?.info?.data ?? []).map((o: { id: string; nome?: string }) => ({
        value: o.id,
        label: o.nome ?? o.id,
      })),
    [orgQuery.data]
  )

  const apply = () => {
    if (!historicoTratListEnabled(modo, local)) {
      toast.error('Preencha os filtros obrigatórios do modo.')
      return
    }
    onApply(local)
    onOpenChange(false)
  }

  const iso = (d: Date | null) =>
    d && isValid(d) ? format(d, 'yyyy-MM-dd') : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Histórico de Tratamentos — filtros</DialogTitle>
        </DialogHeader>

        <div className='space-y-3 py-2'>
          {(modo === 'datas' ||
            modo === 'utentes' ||
            modo === 'fisioterapeuta' ||
            modo === 'auxiliar' ||
            modo === 'outro' ||
            modo === 'organismo') && (
            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1'>
                <Label>Data conclusão de</Label>
                <Input
                  type='date'
                  value={iso(local.dataFimDe)}
                  onChange={(e) =>
                    setLocal((p) => ({
                      ...p,
                      dataFimDe: e.target.value
                        ? startOfDay(new Date(e.target.value))
                        : null,
                    }))
                  }
                />
              </div>
              <div className='space-y-1'>
                <Label>Data conclusão até</Label>
                <Input
                  type='date'
                  value={iso(local.dataFimAte)}
                  onChange={(e) =>
                    setLocal((p) => ({
                      ...p,
                      dataFimAte: e.target.value
                        ? startOfDay(new Date(e.target.value))
                        : null,
                    }))
                  }
                />
              </div>
            </div>
          )}

          {modo === 'utentes' && (
            <div className='space-y-1'>
              <Label>Utente</Label>
              <AsyncCombobox
                value={local.utenteId}
                onChange={(id) => {
                  const label = utItems.find((i) => i.value === id)?.label ?? ''
                  setLocal((p) => ({ ...p, utenteId: id, utenteLabel: label }))
                }}
                searchValue={utSearch}
                onSearchValueChange={setUtSearch}
                items={utItems}
                isLoading={utQuery.isFetching}
                placeholder='Selecione…'
                searchPlaceholder='Pesquisar…'
                emptyText='Sem resultados'
              />
            </div>
          )}

          {(modo === 'fisioterapeuta' ||
            modo === 'auxiliar' ||
            modo === 'outro') && (
            <div className='space-y-1'>
              <Label>
                {modo === 'fisioterapeuta'
                  ? 'Fisioterapeuta'
                  : modo === 'auxiliar'
                    ? 'Auxiliar'
                    : 'Terapeuta Ocup./Fala'}
              </Label>
              <AsyncCombobox
                value={
                  modo === 'fisioterapeuta'
                    ? local.fisioterapeutaId
                    : modo === 'auxiliar'
                      ? local.auxiliarId
                      : local.outroTecnicoId
                }
                onChange={(id) => {
                  const label = tecItems.find((i) => i.value === id)?.label ?? ''
                  setLocal((p) => {
                    if (modo === 'fisioterapeuta')
                      return {
                        ...p,
                        fisioterapeutaId: id,
                        fisioterapeutaLabel: label,
                      }
                    if (modo === 'auxiliar')
                      return { ...p, auxiliarId: id, auxiliarLabel: label }
                    return { ...p, outroTecnicoId: id, outroTecnicoLabel: label }
                  })
                }}
                searchValue={tecSearch}
                onSearchValueChange={setTecSearch}
                items={tecItems}
                isLoading={tecQuery.isFetching}
                placeholder='Selecione…'
                searchPlaceholder='Pesquisar…'
                emptyText='Sem resultados'
              />
            </div>
          )}

          {modo === 'organismo' && (
            <div className='space-y-1'>
              <Label>Organismo</Label>
              <AsyncCombobox
                value={local.organismoId}
                onChange={(id) => {
                  const label = orgItems.find((i) => i.value === id)?.label ?? ''
                  setLocal((p) => ({
                    ...p,
                    organismoId: id,
                    organismoLabel: label,
                  }))
                }}
                searchValue={orgSearch}
                onSearchValueChange={setOrgSearch}
                items={orgItems}
                isLoading={orgQuery.isFetching}
                placeholder='Selecione…'
                searchPlaceholder='Pesquisar…'
                emptyText='Sem resultados'
              />
            </div>
          )}

          {modo === 'credencial' && (
            <div className='space-y-1'>
              <Label>Credencial</Label>
              <Input
                value={local.credencial}
                onChange={(e) =>
                  setLocal((p) => ({ ...p, credencial: e.target.value }))
                }
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' onClick={apply}>
            Pesquisar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
