import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { DateField } from '@/components/shared/date-field'
import { TimeField } from '@/components/shared/time-field'
import { fieldGap, formBlockGap, inputClass, labelClass } from '@/lib/form-styles'
import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'
import { TipoConsultaService } from '@/lib/services/tipos-consulta/tipo-consulta-service'
import { TipoAdmissaoService } from '@/lib/services/consultas/tipo-admissao-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { SalaService } from '@/lib/services/consultas/sala-service'
import { ClinicaService } from '@/lib/services/core/clinica-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { MarcacaoAdministrativoTableDTO } from '@/types/dtos/consultas/marcacoes-administrativo.dtos'
import type { SalaTableDTO } from '@/types/dtos/consultas/sala.dtos'
import {
  createEmptyMarcacaoForm,
  mapMarcacaoDtoToForm,
  mapMarcacaoFormToCreatePayload,
  mapMarcacaoFormToUpdatePayload,
  toTimeSpan,
  type MarcacaoAdministrativoFormState,
} from './marcacao-administrativo-form-utils'
import { getDataTrabalhoIsoDate } from '@/lib/utils/data-trabalho'
import { ListaEsperaAdministrativoService } from '@/lib/services/consultas/lista-espera-administrativo-service'
import {
  ListaEsperaSelecionarModal,
  type ListaEsperaSelecionada,
} from './lista-espera-selecionar-modal'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openAdmissaoFromMarcacaoInApp } from '@/utils/window-utils'
import { modules } from '@/config/modules'

type ModalMode = 'view' | 'create' | 'edit'
const listaEsperaPermId = modules.areaAdministrativa.permissions.listaEsperaConsultas.id

function getApiErrorMessage(info: unknown, fallback: string): string {
  const data = info as { messages?: unknown } | undefined
  const messages = data?.messages

  if (typeof messages === 'string') return messages
  if (Array.isArray(messages) && typeof messages[0] === 'string') return messages[0]
  if (messages && typeof messages === 'object') {
    const first = Object.values(messages as Record<string, string[]>)
      .flat()
      .find((x) => typeof x === 'string')
    if (first) return first
  }

  return fallback
}

export function MarcacaoAdministrativoViewEditModal({
  open,
  onOpenChange,
  mode,
  row,
  listPermId,
  defaultMedicoId,
  defaultEspecialidadeId,
  defaultData,
  defaultHoraInicio,
  initialCreatePrefill,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  row: MarcacaoAdministrativoTableDTO | null
  listPermId: string
  defaultMedicoId?: string
  defaultEspecialidadeId?: string
  defaultData?: string
  defaultHoraInicio?: string
  initialCreatePrefill?: Partial<MarcacaoAdministrativoFormState> | null
  onSaved?: () => void
}) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const readOnly = mode === 'view'
  const [form, setForm] = useState<MarcacaoAdministrativoFormState>(() =>
    createEmptyMarcacaoForm(getDataTrabalhoIsoDate())
  )
  const [saving, setSaving] = useState(false)
  const [lePickerOpen, setLePickerOpen] = useState(false)
  const [lePickerComMedico, setLePickerComMedico] = useState(false)
  const utenteLocked = form.vemListaEspera && !!form.listaEsperaId
  const [obsHistorico, setObsHistorico] = useState('')
  const [novaObservacao, setNovaObservacao] = useState('')
  const [utSearch, setUtSearch] = useState('')
  const [medSearch, setMedSearch] = useState('')
  const [espSearch, setEspSearch] = useState('')
  const [orgSearch, setOrgSearch] = useState('')
  const [salaSearch, setSalaSearch] = useState('')
  const [debouncedUt] = useDebounce(utSearch, 300)
  const [debouncedMed] = useDebounce(medSearch, 300)
  const [debouncedEsp] = useDebounce(espSearch, 300)
  const [debouncedOrg] = useDebounce(orgSearch, 300)

  const patch = (partial: Partial<MarcacaoAdministrativoFormState>) =>
    setForm((prev) => ({ ...prev, ...partial }))

  const detailQuery = useQuery({
    queryKey: ['marcacao-administrativo', row?.id],
    queryFn: () => MarcacoesAdministrativoService(listPermId).getById(row!.id),
    enabled: open && (mode === 'view' || mode === 'edit') && !!row?.id,
  })

  useEffect(() => {
    if (!open) return
    if (mode === 'create') {
      setObsHistorico('')
      setNovaObservacao('')
      setForm(
        createEmptyMarcacaoForm(defaultData ?? getDataTrabalhoIsoDate(), {
          medicoId: defaultMedicoId ?? '',
          medicoLabel: '',
          especialidadeId: defaultEspecialidadeId ?? '',
          especialidadeLabel: '',
          horaInicio: defaultHoraInicio ?? '',
          ...initialCreatePrefill,
        })
      )
      return
    }
    const dto = detailQuery.data?.info?.data
    if (dto) {
      const mapped = mapMarcacaoDtoToForm(dto)
      if (row?.utenteNome) mapped.utenteLabel = row.utenteNome
      if (row?.medicoNome) mapped.medicoLabel = row.medicoNome
      if (row?.especialidadeDesignacao) mapped.especialidadeLabel = row.especialidadeDesignacao
      if (row?.organismoNome) mapped.organismoLabel = row.organismoNome
      setForm(mapped)
    }
  }, [
    open,
    mode,
    detailQuery.data,
    row,
    defaultMedicoId,
    defaultEspecialidadeId,
    defaultData,
    defaultHoraInicio,
    initialCreatePrefill,
  ])

  const detailDto = detailQuery.data?.info?.data
  const admissaoId = detailDto?.admissaoId ?? null

  useEffect(() => {
    if (!open || !admissaoId) {
      setObsHistorico('')
      setNovaObservacao('')
      return
    }
    let cancelled = false
    void AdmissaoAdministrativoService(listPermId)
      .getObservacoes(admissaoId)
      .then((res) => {
        if (cancelled) return
        if (res.info?.status === ResponseStatus.Success) {
          setObsHistorico(res.info.data?.observacoes ?? '')
        }
      })
      .catch(() => {
        if (!cancelled) setObsHistorico('')
      })
    return () => {
      cancelled = true
    }
  }, [open, admissaoId, listPermId])

  const utentesQuery = useQuery({
    queryKey: ['marcacao-form', 'utentes', debouncedUt],
    queryFn: () => UtentesService(listPermId).getUtentesLight(debouncedUt),
    enabled: open && !readOnly,
  })

  const medicosQuery = useQuery({
    queryKey: ['marcacao-form', 'medicos', debouncedMed],
    queryFn: () => MedicosService(listPermId).getMedicosLight(debouncedMed),
    enabled: open && !readOnly,
  })

  const espQuery = useQuery({
    queryKey: ['marcacao-form', 'esp', debouncedEsp],
    queryFn: () => EspecialidadeService(listPermId).getEspecialidadesLight(debouncedEsp),
    enabled: open && !readOnly,
  })

  const orgQuery = useQuery({
    queryKey: ['marcacao-form', 'org', debouncedOrg],
    queryFn: () => OrganismoService(listPermId).getOrganismoLight(debouncedOrg),
    enabled: open && !readOnly,
  })

  const clinicaQuery = useQuery({
    queryKey: ['marcacao-form', 'clinica-current'],
    queryFn: () => ClinicaService(listPermId).getClinicaCurrent(),
    enabled: open,
  })

  const salasQuery = useQuery({
    queryKey: ['marcacao-form', 'salas'],
    queryFn: async () => {
      const res = await SalaService(listPermId).getSalasPaginated({
        pageNumber: 1,
        pageSize: 300,
        sorting: [{ id: 'nome', desc: false }],
      })
      const payload = res.info?.data as
        | { data?: SalaTableDTO[] }
        | SalaTableDTO[]
        | undefined
      if (Array.isArray(payload)) return payload
      return payload?.data ?? []
    },
    enabled: open && !readOnly,
    staleTime: 5 * 60_000,
  })

  const tiposConsultaQuery = useQuery({
    queryKey: ['marcacao-form', 'tipos-consulta'],
    queryFn: async () => {
      const res = await TipoConsultaService().getAllTiposConsulta()
      return res.info?.data ?? []
    },
    enabled: open,
  })

  const tiposAdmissaoQuery = useQuery({
    queryKey: ['marcacao-form', 'tipos-admissao'],
    queryFn: async () => {
      const res = await TipoAdmissaoService().getAllTiposAdmissao()
      return res.info?.data ?? []
    },
    enabled: open && !readOnly,
  })

  const tipoConsultaLabel = useMemo(() => {
    if (detailDto?.tipoConsultaDesignacao) return detailDto.tipoConsultaDesignacao
    if (!form.tipoConsultaId) return '—'
    const t = (tiposConsultaQuery.data ?? []).find((x) => x.id === form.tipoConsultaId) as
      | { designacao?: string; nome?: string }
      | undefined
    return t?.designacao ?? t?.nome ?? form.tipoConsultaId
  }, [form.tipoConsultaId, tiposConsultaQuery.data, detailDto?.tipoConsultaDesignacao])

  const orgItems = useMemo(() => {
    const list = (orgQuery.data?.info?.data ?? []) as Array<{ id: string; nome: string }>
    return list.map((o) => ({ value: o.id, label: o.nome }))
  }, [orgQuery.data])

  const salaItems = useMemo(() => {
    const list = salasQuery.data ?? []
    return list.map((s) => ({
      value: s.id,
      label: s.nome,
      secondary: String(s.numeroSala),
    }))
  }, [salasQuery.data])

  const utenteItems = useMemo(() => {
    const list = (utentesQuery.data?.info?.data ?? []) as Array<{
      id: string
      nome: string
      numeroUtente?: string | null
    }>
    return list.map((u) => ({
      value: u.id,
      label: u.nome,
      secondary: u.numeroUtente ?? undefined,
    }))
  }, [utentesQuery.data])

  const medicoItems = useMemo(() => {
    const list = (medicosQuery.data?.info?.data ?? []) as Array<{ id: string; nome: string }>
    return list.map((m) => ({ value: m.id, label: m.nome }))
  }, [medicosQuery.data])

  const espItems = useMemo(() => {
    const list = espQuery.data?.info?.data ?? []
    return list.map((e) => ({ value: e.id, label: e.nome }))
  }, [espQuery.data])

  const title =
    mode === 'create' || mode === 'edit' ? 'Marcações' : 'Marcação'
  const gestaoSalasAtiva = clinicaQuery.data?.info?.data?.gestaoSalas === true

  const tiposConsultaLegado = useMemo(() => {
    const list = tiposConsultaQuery.data ?? []
    const labels: Record<number, string> = {
      1: '1ª consulta',
      2: 'Subsequente',
      3: 'AV. Final',
      4: 'Pós Operatório',
    }
    return [1, 2, 3, 4]
      .map((cod) => {
        const item = list.find(
          (t) => (t as { codigoLegado?: number }).codigoLegado === cod
        )
        return item
          ? {
              cod,
              id: item.id,
              label:
                (item as { designacao?: string }).designacao ?? labels[cod] ?? String(cod),
            }
          : null
      })
      .filter((x): x is { cod: number; id: string; label: string } => x != null)
  }, [tiposConsultaQuery.data])

  const tipoConsultaCodigo =
    tiposConsultaLegado.find((t) => t.id === form.tipoConsultaId)?.cod ?? 1

  const aplicarListaEspera = (le: ListaEsperaSelecionada) => {
    const obsAtual = form.obs.trim()
    const obsLe = le.obs?.trim() ?? ''
    patch({
      listaEsperaId: le.listaEsperaId,
      vemListaEspera: true,
      utenteId: le.utenteId,
      utenteLabel: le.utenteLabel,
      organismoId: le.organismoId ?? form.organismoId,
      organismoLabel: le.organismoLabel ?? form.organismoLabel,
      credencial: le.credencial ?? form.credencial,
      tipoConsultaId: le.tipoConsultaId || form.tipoConsultaId,
      horaInicio: le.horaInicio || form.horaInicio,
      obs: obsLe ? (obsAtual ? `${obsAtual}\n${obsLe}` : obsLe) : obsAtual,
    })
  }

  const handleAbrirAdmissao = async () => {
    const marcacaoId = row?.id ?? detailQuery.data?.info?.data?.id
    if (!marcacaoId) return

    if (!admissaoId) {
      try {
        const syncRes = await MarcacoesAdministrativoService(listPermId).sincronizarAdmissao(
          marcacaoId
        )
        if (syncRes.info?.status === ResponseStatus.Success && syncRes.info.data) {
          await detailQuery.refetch()
        } else {
          toast.error(
            getApiErrorMessage(syncRes.info, 'Não foi possível ligar a marcação à admissão.')
          )
          return
        }
      } catch {
        toast.error('Erro ao sincronizar admissão.')
        return
      }
    }

    openAdmissaoFromMarcacaoInApp(
      navigate,
      addWindow,
      marcacaoId,
      form.utenteLabel || row?.utenteNome
    )
  }

  const handleSave = async () => {
    if (!form.utenteId) {
      toast.error('Selecione o utente.')
      return
    }
    if (!form.organismoId) {
      toast.error('Selecione o organismo.')
      return
    }
    if (!form.data || !form.horaInicio) {
      toast.error('Indique data e hora.')
      return
    }
    if (gestaoSalasAtiva && !form.salaId) {
      toast.error('Sala é obrigatória.')
      return
    }

    setSaving(true)
    try {
      if (mode === 'create') {
        if (form.listaEsperaId && form.vemListaEspera) {
          const res = await ListaEsperaAdministrativoService(listaEsperaPermId).converterMarcacao(
            form.listaEsperaId,
            {
              dataMarcacao: form.data ? `${form.data}T00:00:00` : undefined,
              horaInicio: toTimeSpan(form.horaInicio) as string,
              horaFim: toTimeSpan(form.horaFim),
              tipoAdmissaoId: form.tipoAdmissaoId || undefined,
              obs: form.obs || undefined,
              manterNaListaEspera: false,
            }
          )
          if (res.info?.status === ResponseStatus.Success) {
            toast.success('Marcação criada a partir da lista de espera.')
            onOpenChange(false)
            onSaved?.()
          } else {
            toast.error(getApiErrorMessage(res.info, 'Não foi possível marcar.'))
          }
        } else {
          const res = await MarcacoesAdministrativoService(listPermId).create(
            mapMarcacaoFormToCreatePayload(form)
          )
          if (res.info?.status === ResponseStatus.Success) {
            toast.success('Marcação criada.')
            onOpenChange(false)
            onSaved?.()
          } else {
            toast.error(getApiErrorMessage(res.info, 'Não foi possível criar a marcação.'))
          }
        }
      } else if (mode === 'edit' && row?.id) {
        const res = await MarcacoesAdministrativoService(listPermId).update(
          row.id,
          mapMarcacaoFormToUpdatePayload(form)
        )
        if (res.info?.status === ResponseStatus.Success) {
          if (admissaoId && novaObservacao.trim()) {
            await AdmissaoAdministrativoService(listPermId).appendObservacao(admissaoId, {
              texto: novaObservacao.trim(),
            })
          }
          toast.success('Marcação atualizada.')
          setNovaObservacao('')
          onOpenChange(false)
          onSaved?.()
        } else {
          toast.error(getApiErrorMessage(res.info, 'Não foi possível atualizar a marcação.'))
        }
      }
    } catch {
      toast.error('Erro ao guardar a marcação.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className={formBlockGap}>
          {readOnly && detailDto ? (
            <div className='grid gap-2 rounded-md border bg-muted/30 p-3 text-sm sm:grid-cols-3'>
              <div>
                <span className='text-muted-foreground'>Confirmado: </span>
                {detailDto.confirmado ? 'Sim' : 'Não'}
              </div>
              <div>
                <span className='text-muted-foreground'>Efetuado: </span>
                {detailDto.efetuado ? 'Sim' : 'Não'}
              </div>
              <div>
                <span className='text-muted-foreground'>Estado: </span>
                {detailDto.statusConsulta ?? '—'}
              </div>
            </div>
          ) : null}

          <div className='grid gap-3 sm:grid-cols-12'>
            <div className={`${fieldGap} sm:col-span-3`}>
              <Label className={labelClass}>Cód. Utente</Label>
              <Input
                className={inputClass}
                readOnly
                value={detailDto?.utenteNumero ?? row?.utenteNumero ?? ''}
              />
            </div>
            <div className={`${fieldGap} sm:col-span-9`}>
              <Label className={labelClass}>Utente</Label>
              {readOnly ? (
                <Input className={inputClass} readOnly value={form.utenteLabel || form.utenteId} />
              ) : (
                <AsyncCombobox
                  value={form.utenteId}
                  disabled={utenteLocked}
                  onChange={(id) => {
                    const label = utenteItems.find((i) => i.value === id)?.label ?? ''
                    patch({ utenteId: id, utenteLabel: label })
                  }}
                  searchValue={utSearch}
                  onSearchValueChange={setUtSearch}
                  items={utenteItems}
                  isLoading={utentesQuery.isFetching}
                  placeholder='Utente…'
                  searchPlaceholder='Pesquisar utente…'
                  emptyText='Sem resultados'
                />
              )}
            </div>
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            <div className={fieldGap}>
              <Label className={labelClass}>Especialidade</Label>
              {readOnly ? (
                <Input className={inputClass} readOnly value={form.especialidadeLabel || '—'} />
              ) : (
                <AsyncCombobox
                  value={form.especialidadeId}
                  onChange={(id) => {
                    const label = espItems.find((i) => i.value === id)?.label ?? ''
                    patch({ especialidadeId: id, especialidadeLabel: label })
                  }}
                  searchValue={espSearch}
                  onSearchValueChange={setEspSearch}
                  items={espItems}
                  isLoading={espQuery.isFetching}
                  placeholder='Opcional'
                  searchPlaceholder='Pesquisar…'
                  emptyText='Sem resultados'
                />
              )}
            </div>
            <div className={fieldGap}>
              <Label className={labelClass}>Médico</Label>
              {readOnly ? (
                <Input className={inputClass} readOnly value={form.medicoLabel || '—'} />
              ) : (
                <AsyncCombobox
                  value={form.medicoId}
                  onChange={(id) => {
                    const label = medicoItems.find((i) => i.value === id)?.label ?? ''
                    patch({ medicoId: id, medicoLabel: label })
                  }}
                  searchValue={medSearch}
                  onSearchValueChange={setMedSearch}
                  items={medicoItems}
                  isLoading={medicosQuery.isFetching}
                  placeholder='Opcional'
                  searchPlaceholder='Pesquisar médico…'
                  emptyText='Sem resultados'
                />
              )}
            </div>
          </div>

          <div className='grid gap-3 sm:grid-cols-3'>
            <div className={fieldGap}>
              <Label className={labelClass}>Data</Label>
              <DateField
                className={inputClass}
                readOnly={readOnly}
                value={form.data}
                onChange={(v) => patch({ data: v })}
              />
            </div>
            <div className={fieldGap}>
              <Label className={labelClass}>Hora</Label>
              <TimeField
                className={inputClass}
                readOnly={readOnly}
                disabled={readOnly}
                value={form.horaInicio}
                onChange={(v) => patch({ horaInicio: v })}
              />
            </div>
            <div className={fieldGap}>
              <Label className={labelClass}>Duração</Label>
              <TimeField
                className={inputClass}
                readOnly={readOnly}
                disabled={readOnly}
                value={form.horaFim}
                onChange={(v) => patch({ horaFim: v })}
              />
            </div>
          </div>

          {!readOnly ? (
            <div className={fieldGap}>
              <Label className={labelClass}>
                Sala{gestaoSalasAtiva ? ' *' : ''}
              </Label>
              <AsyncCombobox
                value={form.salaId}
                onChange={(id) => {
                  const label = salaItems.find((item) => item.value === id)?.label ?? ''
                  patch({ salaId: id, salaLabel: label })
                }}
                searchValue={salaSearch}
                onSearchValueChange={setSalaSearch}
                items={
                  form.salaLabel && !salaItems.some((item) => item.value === form.salaId)
                    ? [{ value: form.salaId, label: form.salaLabel }, ...salaItems]
                    : salaItems
                }
                isLoading={salasQuery.isFetching}
                placeholder='Selecionar sala…'
                searchPlaceholder='Pesquisar sala…'
                emptyText='Sem salas'
              />
            </div>
          ) : null}

          {readOnly ? (
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className={fieldGap}>
                <Label className={labelClass}>Tipo consulta</Label>
                <Input className={inputClass} readOnly value={tipoConsultaLabel} />
              </div>
              <div className={fieldGap}>
                <Label className={labelClass}>Tipo admissão</Label>
                <Input className={inputClass} readOnly value={form.tipoAdmissaoId || '—'} />
              </div>
            </div>
          ) : null}

          {readOnly && detailDto?.salaNome ? (
            <div className={fieldGap}>
              <Label className={labelClass}>Sala</Label>
              <Input className={inputClass} readOnly value={detailDto.salaNome} />
            </div>
          ) : null}

          <div className={fieldGap}>
            <Label className={labelClass}>Organismo</Label>
            {readOnly ? (
              <Input className={inputClass} readOnly value={form.organismoLabel || '—'} />
            ) : (
              <AsyncCombobox
                value={form.organismoId}
                onChange={(id) => {
                  const label = orgItems.find((i) => i.value === id)?.label ?? ''
                  patch({ organismoId: id, organismoLabel: label })
                }}
                searchValue={orgSearch}
                onSearchValueChange={setOrgSearch}
                items={orgItems}
                isLoading={orgQuery.isFetching}
                placeholder='Opcional'
                searchPlaceholder='Pesquisar organismo…'
                emptyText='Sem resultados'
              />
            )}
          </div>

          <div className='grid gap-3 sm:grid-cols-12 sm:items-end'>
            <div className={`${fieldGap} sm:col-span-8`}>
              <Label className={labelClass}>Credencial / Req. (ex. exames sem papel)</Label>
              <Input
                className={inputClass}
                readOnly={readOnly}
                value={form.credencial}
                onChange={(e) => patch({ credencial: e.target.value })}
              />
            </div>
            {!readOnly ? (
              <div className='flex flex-wrap gap-4 sm:col-span-4 sm:justify-end'>
                <label className='flex items-center gap-2 text-sm'>
                  <Checkbox disabled title='Em breve' />
                  Enviar Email
                </label>
                <label className='flex items-center gap-2 text-sm'>
                  <Checkbox
                    checked={form.vemListaEspera}
                    onCheckedChange={(v) => {
                      const on = v === true
                      patch({ vemListaEspera: on })
                      if (on) {
                        setLePickerComMedico(false)
                        setLePickerOpen(true)
                      } else {
                        patch({ listaEsperaId: '' })
                      }
                    }}
                  />
                  Lista Espera
                </label>
              </div>
            ) : null}
          </div>

          {!readOnly && tiposConsultaLegado.length > 0 ? (
            <div className={fieldGap}>
              <Label className={labelClass}>Tipo consulta</Label>
              <RadioGroup
                value={String(tipoConsultaCodigo)}
                onValueChange={(v) => {
                  const cod = Number(v)
                  const item = tiposConsultaLegado.find((t) => t.cod === cod)
                  if (item) patch({ tipoConsultaId: item.id })
                }}
                className='flex flex-wrap gap-4'
              >
                {tiposConsultaLegado.map((t) => (
                  <label key={t.cod} className='flex items-center gap-2 text-sm'>
                    <RadioGroupItem value={String(t.cod)} />
                    {t.label}
                  </label>
                ))}
              </RadioGroup>
            </div>
          ) : null}

          {!readOnly && (tiposAdmissaoQuery.data?.length ?? 0) > 0 ? (
            <div className={fieldGap}>
              <Label className={labelClass}>Tipo admissão</Label>
              <RadioGroup
                value={form.tipoAdmissaoId || tiposAdmissaoQuery.data![0].id}
                onValueChange={(v) => patch({ tipoAdmissaoId: v })}
                className='flex flex-wrap gap-4'
              >
                {(tiposAdmissaoQuery.data ?? []).slice(0, 2).map((t) => (
                  <label key={t.id} className='flex items-center gap-2 text-sm'>
                    <RadioGroupItem value={t.id} />
                    {(t as { designacao?: string; nome?: string }).designacao ??
                      (t as { nome?: string }).nome ??
                      t.id}
                  </label>
                ))}
              </RadioGroup>
            </div>
          ) : null}

          {obsHistorico ? (
            <div className={fieldGap}>
              <Label className={labelClass}>Histórico de observações</Label>
              <Textarea readOnly value={obsHistorico} rows={4} className='bg-muted/40' />
            </div>
          ) : null}

          <div className={fieldGap}>
            <Label className={labelClass}>
              {mode === 'edit' && admissaoId ? 'Nova observação' : 'Observações'}
            </Label>
            {mode === 'edit' && admissaoId ? (
              <Textarea
                readOnly={readOnly}
                value={novaObservacao}
                onChange={(e) => setNovaObservacao(e.target.value)}
                rows={3}
                placeholder='Texto acrescentado ao histórico ao guardar…'
              />
            ) : (
              <Textarea
                readOnly={readOnly}
                value={form.obs}
                onChange={(e) => patch({ obs: e.target.value })}
                rows={4}
              />
            )}
          </div>
        </div>

        <DialogFooter className='flex-wrap gap-2 sm:justify-between'>
          <div className='flex flex-wrap gap-2'>
            {(mode === 'view' || mode === 'edit') && row?.id ? (
              <Button type='button' variant='secondary' onClick={handleAbrirAdmissao}>
                Abrir admissão
              </Button>
            ) : null}
            {!readOnly ? (
              <Button
                type='button'
                variant='secondary'
                onClick={() => {
                  setLePickerComMedico(true)
                  setLePickerOpen(true)
                }}
              >
                Lista de espera
              </Button>
            ) : null}
          </div>
          <div className='flex gap-2'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              {readOnly ? 'Fechar' : 'Cancelar'}
            </Button>
            {!readOnly ? (
              <Button
                type='button'
                disabled={saving || detailQuery.isLoading}
                onClick={handleSave}
              >
                {saving ? 'A guardar…' : 'Adicionar'}
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>

      <ListaEsperaSelecionarModal
        open={lePickerOpen}
        onOpenChange={setLePickerOpen}
        listPermId={listaEsperaPermId}
        medicoAgendaId={
          lePickerComMedico ? form.medicoId || defaultMedicoId : undefined
        }
        onSelected={aplicarListaEspera}
      />
    </Dialog>
  )
}
