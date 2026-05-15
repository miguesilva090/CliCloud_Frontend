import { useEffect, useMemo, useState } from 'react'
import { format, isValid, startOfDay } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { modules } from '@/config/modules'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { toast } from '@/utils/toast-utils'
import type { HistoricoConsultaAdministrativoVista } from '@/lib/services/consultas/historico-consultas-administrativo-service/historico-consultas-administrativo-client'

const permId = modules.areaAdministrativa.permissions.consultas.id

/** Título único do modal no legado (todas as vistas administrativas de histórico). */
export const HISTORICO_CONSULTA_ENTRE_DATAS_TITLE = 'Histórico de Consulta entre Datas'

export type HistoricoAdmCriteria = {
  dataDe: Date | null
  dataAte: Date | null
  utenteId: string
  utenteLabel: string
  medicoId: string
  medicoLabel: string
  organismoId: string
  organismoLabel: string
}

export const emptyHistoricoAdmCriteria = (): HistoricoAdmCriteria => ({
  dataDe: null,
  dataAte: null,
  utenteId: '',
  utenteLabel: '',
  medicoId: '',
  medicoLabel: '',
  organismoId: '',
  organismoLabel: '',
})

function normalizeDay(d: Date | null | undefined): Date | null {
  if (!d || !isValid(d)) return null
  return startOfDay(d)
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vista: HistoricoConsultaAdministrativoVista
  criteria: HistoricoAdmCriteria
  onApply: (next: HistoricoAdmCriteria) => void
}

export function HistoricoConsultasAdministrativoFiltroModal({
  open,
  onOpenChange,
  vista,
  criteria,
  onApply,
}: Props) {
  const [local, setLocal] = useState<HistoricoAdmCriteria>(criteria)
  const [dataDeOpen, setDataDeOpen] = useState(false)
  const [dataAteOpen, setDataAteOpen] = useState(false)
  const [utComboOpen, setUtComboOpen] = useState(false)
  const [medComboOpen, setMedComboOpen] = useState(false)
  const [orgComboOpen, setOrgComboOpen] = useState(false)

  const [utSearch, setUtSearch] = useState('')
  const [medSearch, setMedSearch] = useState('')
  const [orgSearch, setOrgSearch] = useState('')
  const [debouncedUt] = useDebounce(utSearch, 300)
  const [debouncedMed] = useDebounce(medSearch, 300)
  const [debouncedOrg] = useDebounce(orgSearch, 300)

  useEffect(() => {
    if (open) {
      setLocal(criteria)
      setUtSearch('')
      setMedSearch('')
      setOrgSearch('')
      setUtComboOpen(false)
      setMedComboOpen(false)
      setOrgComboOpen(false)
    }
  }, [open, criteria])

  const { data: utentesRes, isFetching: utLoading } = useQuery({
    queryKey: ['utentes', 'light', 'historico-adm', debouncedUt],
    queryFn: () => UtentesService(permId).getUtentesLight(debouncedUt),
    enabled: open && vista === 'utentes',
  })
  const utenteItems = useMemo(() => {
    const list = (utentesRes?.info?.data ?? []) as Array<{
      id: string
      nome: string
      numeroUtente?: string | null
    }>
    return list.map((u) => ({
      value: u.id,
      label: u.nome,
      secondary: u.numeroUtente ?? undefined,
    }))
  }, [utentesRes])

  const { data: medicosRes, isFetching: medLoading } = useQuery({
    queryKey: ['medicos', 'light', 'historico-adm', debouncedMed],
    queryFn: () => MedicosService(permId).getMedicosLight(debouncedMed),
    enabled: open && vista === 'medicos',
  })
  const medicoItems = useMemo(() => {
    const list = (medicosRes?.info?.data ?? []) as Array<{ id: string; nome: string }>
    return list.map((m) => ({ value: m.id, label: m.nome }))
  }, [medicosRes])

  const { data: orgRes, isFetching: orgLoading } = useQuery({
    queryKey: ['organismos', 'light', 'historico-adm', debouncedOrg],
    queryFn: () => OrganismoService(permId).getOrganismoLight(debouncedOrg),
    enabled: open && vista === 'organismos',
  })
  const organismoItems = useMemo(() => {
    const list = (orgRes?.info?.data ?? []) as Array<{ id: string; nome: string }>
    return list.map((o) => ({ value: o.id, label: o.nome }))
  }, [orgRes])

  const handleConfirm = () => {
    const dataDe = normalizeDay(local.dataDe)
    const dataAte = normalizeDay(local.dataAte)

    if (!dataDe || !dataAte) {
      toast.error('Indique a data de início e a data de fim do intervalo.')
      return
    }
    if (dataDe.getTime() > dataAte.getTime()) {
      toast.error('A data de início não pode ser posterior à data de fim.')
      return
    }

    if (vista === 'utentes' && !local.utenteId.trim()) {
      toast.error('Selecione o utente.')
      return
    }
    if (vista === 'medicos' && !local.medicoId.trim()) {
      toast.error('Selecione o médico.')
      return
    }
    if (vista === 'organismos' && !local.organismoId.trim()) {
      toast.error('Selecione o organismo.')
      return
    }

    onApply({
      ...local,
      dataDe,
      dataAte,
    })
    onOpenChange(false)
  }

  const dateRangeRow = (
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label>Data de</Label>
        <Popover open={dataDeOpen} onOpenChange={setDataDeOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='outline'
              className={cn('h-9 w-full justify-start font-normal')}
            >
              {local.dataDe
                ? format(local.dataDe, 'dd-MM-yyyy', { locale: pt })
                : '—'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              locale={pt}
              selected={local.dataDe ?? undefined}
              onSelect={(d) => {
                setLocal((s) => ({ ...s, dataDe: normalizeDay(d) }))
                setDataDeOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className='space-y-2'>
        <Label>Data até</Label>
        <Popover open={dataAteOpen} onOpenChange={setDataAteOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='outline'
              className={cn('h-9 w-full justify-start font-normal')}
            >
              {local.dataAte
                ? format(local.dataAte, 'dd-MM-yyyy', { locale: pt })
                : '—'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              locale={pt}
              selected={local.dataAte ?? undefined}
              onSelect={(d) => {
                setLocal((s) => ({ ...s, dataAte: normalizeDay(d) }))
                setDataAteOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>{HISTORICO_CONSULTA_ENTRE_DATAS_TITLE}</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-2'>
          {vista === 'datas' ? dateRangeRow : null}

          {vista === 'utentes' ? (
            <>
              {dateRangeRow}
              <div className='space-y-2'>
                <Label>Utente</Label>
                <div className='flex gap-2'>
                  <div className='min-w-0 flex-1'>
                    <AsyncCombobox
                      placeholder='Utente…'
                      searchPlaceholder='Pesquisar…'
                      items={utenteItems}
                      value={local.utenteId}
                      onChange={(id) => {
                        const item = utenteItems.find((i) => i.value === id)
                        setLocal((s) => ({
                          ...s,
                          utenteId: id,
                          utenteLabel: item?.label ?? '',
                        }))
                      }}
                      searchValue={utSearch}
                      onSearchValueChange={setUtSearch}
                      isLoading={utLoading}
                      open={utComboOpen}
                      onOpenChange={setUtComboOpen}
                    />
                  </div>
                  <Button
                    type='button'
                    size='icon'
                    className='h-9 w-9 shrink-0'
                    title='Pesquisar utente'
                    onClick={() => setUtComboOpen(true)}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </>
          ) : null}

          {vista === 'medicos' ? (
            <>
              {dateRangeRow}
              <div className='space-y-2'>
                <Label>Cód. médico</Label>
                <div className='flex gap-2'>
                  <div className='min-w-0 flex-1'>
                    <AsyncCombobox
                      placeholder='Cód. médico…'
                      searchPlaceholder='Pesquisar médico…'
                      items={medicoItems}
                      value={local.medicoId}
                      onChange={(id) => {
                        const item = medicoItems.find((i) => i.value === id)
                        setLocal((s) => ({
                          ...s,
                          medicoId: id,
                          medicoLabel: item?.label ?? '',
                        }))
                      }}
                      searchValue={medSearch}
                      onSearchValueChange={setMedSearch}
                      isLoading={medLoading}
                      open={medComboOpen}
                      onOpenChange={setMedComboOpen}
                    />
                  </div>
                  <Button
                    type='button'
                    size='icon'
                    className='h-9 w-9 shrink-0'
                    title='Pesquisar médico'
                    onClick={() => setMedComboOpen(true)}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </>
          ) : null}

          {vista === 'organismos' ? (
            <>
              {dateRangeRow}
              <div className='space-y-2'>
                <Label>Organismo</Label>
                <div className='flex gap-2'>
                  <div className='min-w-0 flex-1'>
                    <AsyncCombobox
                      placeholder='Organismo…'
                      searchPlaceholder='Pesquisar…'
                      items={organismoItems}
                      value={local.organismoId}
                      onChange={(id) => {
                        const item = organismoItems.find((i) => i.value === id)
                        setLocal((s) => ({
                          ...s,
                          organismoId: id,
                          organismoLabel: item?.label ?? '',
                        }))
                      }}
                      searchValue={orgSearch}
                      onSearchValueChange={setOrgSearch}
                      isLoading={orgLoading}
                      open={orgComboOpen}
                      onOpenChange={setOrgComboOpen}
                    />
                  </div>
                  <Button
                    type='button'
                    size='icon'
                    className='h-9 w-9 shrink-0'
                    title='Pesquisar organismo'
                    onClick={() => setOrgComboOpen(true)}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <DialogFooter className='gap-2 sm:justify-end'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' onClick={handleConfirm}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function buildHistoricoAdmApiFilters(
  vista: HistoricoConsultaAdministrativoVista,
  c: HistoricoAdmCriteria
): Array<{ id: string; value: string }> {
  const f: Array<{ id: string; value: string }> = []
  if (!c.dataDe || !c.dataAte) {
    return f
  }
  f.push(
    { id: 'data_de', value: format(c.dataDe, 'yyyy-MM-dd') },
    { id: 'data_ate', value: format(c.dataAte, 'yyyy-MM-dd') }
  )

  if (vista === 'datas') {
    return f
  }
  if (vista === 'utentes' && c.utenteId.trim()) {
    f.push({ id: 'utenteid', value: c.utenteId.trim() })
    return f
  }
  if (vista === 'medicos' && c.medicoId.trim()) {
    f.push({ id: 'medicoid', value: c.medicoId.trim() })
    return f
  }
  if (vista === 'organismos' && c.organismoId.trim()) {
    f.push({ id: 'organismoid', value: c.organismoId.trim() })
    return f
  }
  return f
}

export function historicoAdmListQueryEnabled(
  vista: HistoricoConsultaAdministrativoVista,
  c: HistoricoAdmCriteria
): boolean {
  if (!c.dataDe || !c.dataAte) {
    return false
  }
  if (vista === 'datas') {
    return true
  }
  if (vista === 'utentes') {
    return !!c.utenteId.trim()
  }
  if (vista === 'medicos') {
    return !!c.medicoId.trim()
  }
  if (vista === 'organismos') {
    return !!c.organismoId.trim()
  }
  return false
}
