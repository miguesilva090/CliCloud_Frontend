import { useEffect, useMemo, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AsyncCombobox, type ComboboxItem } from '@/components/shared/async-combobox'
import { DateField } from '@/components/shared/date-field'
import { TimeField } from '@/components/shared/time-field'
import { fieldGap, inputClass, labelClass, selectTriggerClass } from '@/lib/form-styles'
import { getDataTrabalhoIsoDate } from '@/lib/utils/data-trabalho'
import { OrdemEntradaAdministrativoService } from '@/lib/services/consultas/ordem-entrada-administrativo-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { ClinicaService } from '@/lib/services/core/clinica-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type {
  OrdemEntradaRegistoDTO,
  OrdemEntradaTableDTO,
  SaveOrdemEntradaRegistoRequest,
} from '@/types/dtos/consultas/ordem-entrada.dtos'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import type { SalaTableDTO } from '@/types/dtos/consultas/sala.dtos'
import {
  useMedicosLight,
  useSalasAdmissao,
  useTiposAdmissao,
  useTiposConsulta,
} from '../../admissoes/queries/admissao-form-queries'
import {
  useOrdemEntradaHorasDisponiveis,
  useOrdemEntradaRegisto,
} from '../queries/ordem-entrada-registo-queries'

type OrdemEntradaModalMode = 'view' | 'edit' | 'create'

type FormState = {
  id: string | null
  utenteId: string
  utenteLabel: string
  utenteNumero: string
  organismoId: string
  organismoLabel: string
  medicoId: string
  medicoLabel: string
  especialidadeId: string
  especialidadeLabel: string
  salaId: string
  salaLabel: string
  tipoAdmissaoId: string
  tipoConsultaId: string
  data: string
  horaInicio: string
  duracao: string
  observacoes: string
  createdByNome: string
  dataHoraMarcacao: string
}

const emptyForm = (): FormState => ({
  id: null,
  utenteId: '',
  utenteLabel: '',
  utenteNumero: '',
  organismoId: '',
  organismoLabel: '',
  medicoId: '',
  medicoLabel: '',
  especialidadeId: '',
  especialidadeLabel: '',
  salaId: '',
  salaLabel: '',
  tipoAdmissaoId: '',
  tipoConsultaId: '',
  data: getDataTrabalhoIsoDate(),
  horaInicio: '',
  duracao: '',
  observacoes: '',
  createdByNome: '',
  dataHoraMarcacao: '',
})

function dateOnly(value?: string | null): string {
  if (!value) return ''
  return value.slice(0, 10)
}

function normalizeTime(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.length === 5 ? `${trimmed}:00` : trimmed
}

function timeHm(value?: string | null): string {
  if (!value) return ''
  return value.slice(0, 5)
}

function messageFromResponse(messages?: Record<string, string[]>): string | undefined {
  if (!messages) return undefined
  return Object.values(messages).flat().find(Boolean)
}

function buildOrganismoOptions(utente?: UtenteDTO | null) {
  if (!utente) return [] as ComboboxItem[]

  const items = new Map<string, ComboboxItem>()
  const add = (
    organismoId?: string | null,
    organismo?: { nome?: string | null; abreviatura?: string | null } | null,
    fallback?: string | null
  ) => {
    if (!organismoId || items.has(organismoId)) return
    const label =
      organismo?.abreviatura?.trim() ||
      organismo?.nome?.trim() ||
      fallback?.trim() ||
      organismoId
    items.set(organismoId, { value: organismoId, label })
  }

  add(utente.organismoId, utente.organismo)
  for (const linha of utente.subsistemaLinhas ?? []) {
    add(linha.organismoId, linha.organismo, linha.designacao)
  }

  return Array.from(items.values())
}

function mapRegistoToForm(dto: OrdemEntradaRegistoDTO): FormState {
  return {
    id: dto.id,
    utenteId: dto.utenteId,
    utenteLabel: dto.utenteNome ?? '',
    utenteNumero: dto.utenteNumero ?? '',
    organismoId: dto.organismoId ?? '',
    organismoLabel: dto.organismoNome ?? '',
    medicoId: dto.medicoId ?? '',
    medicoLabel: dto.medicoNome ?? '',
    especialidadeId: dto.especialidadeId ?? '',
    especialidadeLabel: dto.especialidadeDesignacao ?? '',
    salaId: dto.salaId ?? '',
    salaLabel: dto.salaNome ?? '',
    tipoAdmissaoId: dto.tipoAdmissaoId ?? '',
    tipoConsultaId: dto.tipoConsultaId ?? '',
    data: dateOnly(dto.data) || getDataTrabalhoIsoDate(),
    horaInicio: timeHm(dto.horaInicio),
    duracao: '',
    observacoes: dto.obs ?? '',
    createdByNome: dto.createdByNome ?? '',
    dataHoraMarcacao: dto.dataHoraMarcacao ?? '',
  }
}

export function OrdemEntradaRegistoModal({
  open,
  onOpenChange,
  mode,
  row,
  listPermId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: OrdemEntradaModalMode
  row: OrdemEntradaTableDTO | null
  listPermId: string
  onSaved?: () => void
}) {
  const readOnly = mode === 'view'
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [utenteSearch, setUtenteSearch] = useState('')
  const [medicoSearch, setMedicoSearch] = useState('')
  const [salaSearch, setSalaSearch] = useState('')
  const [debouncedUtenteSearch] = useDebounce(utenteSearch, 300)
  const [debouncedMedicoSearch] = useDebounce(medicoSearch, 300)

  const registoQuery = useOrdemEntradaRegisto(
    row?.id ?? null,
    open && mode !== 'create' && Boolean(row?.id)
  )
  const tiposAdmissaoQuery = useTiposAdmissao(open)
  const tiposConsultaQuery = useTiposConsulta(open)
  const medicosQuery = useMedicosLight(debouncedMedicoSearch)
  const salasQuery = useSalasAdmissao(open)

  const clinicaQuery = useQuery({
    queryKey: ['ordem-entrada-registo', 'clinica-current'],
    queryFn: () => ClinicaService(listPermId).getClinicaCurrent(),
    enabled: open,
  })

  const utentesLightQuery = useQuery({
    queryKey: ['ordem-entrada-registo', 'utentes', debouncedUtenteSearch],
    queryFn: () => UtentesService(listPermId).getUtentesLight(debouncedUtenteSearch || undefined),
    enabled: open && !readOnly,
    staleTime: 30_000,
  })

  const utenteQuery = useQuery({
    queryKey: ['ordem-entrada-registo', 'utente', form.utenteId],
    queryFn: () => UtentesService(listPermId).getUtente(form.utenteId),
    enabled: open && Boolean(form.utenteId),
    staleTime: 30_000,
  })

  const horasQuery = useOrdemEntradaHorasDisponiveis(
    form.medicoId && form.tipoConsultaId && form.data
      ? {
          medicoId: form.medicoId,
          tipoConsultaId: form.tipoConsultaId,
          data: `${form.data}T00:00:00`,
          admissaoId: form.id,
        }
      : null,
    open && !readOnly
  )

  useEffect(() => {
    if (!open) return
    if (mode === 'create') {
      setForm(emptyForm())
      setUtenteSearch('')
      setMedicoSearch('')
      setSalaSearch('')
    }
  }, [mode, open])

  useEffect(() => {
    const dto = registoQuery.data?.info?.data
    if (!open || !dto || mode === 'create') return
    setForm(mapRegistoToForm(dto))
  }, [mode, open, registoQuery.data?.info?.data])

  const utenteItems: ComboboxItem[] = useMemo(() => {
    const items = (utentesLightQuery.data?.info?.data ?? []).map((u) => ({
      value: u.id,
      label: u.nome,
      secondary: u.numeroUtente ?? undefined,
    }))
    if (form.utenteId && form.utenteLabel && !items.some((i) => i.value === form.utenteId)) {
      items.unshift({
        value: form.utenteId,
        label: form.utenteLabel,
        secondary: form.utenteNumero || undefined,
      })
    }
    return items
  }, [
    form.utenteId,
    form.utenteLabel,
    form.utenteNumero,
    utentesLightQuery.data?.info?.data,
  ])

  const medicosItems: ComboboxItem[] = useMemo(() => {
    const items = (medicosQuery.data?.info?.data ?? []).map((m) => ({
      value: m.id,
      label: m.nome,
      secondary: m.especialidadeNome ?? undefined,
    }))
    if (form.medicoId && form.medicoLabel && !items.some((i) => i.value === form.medicoId)) {
      items.unshift({
        value: form.medicoId,
        label: form.medicoLabel,
        secondary: form.especialidadeLabel || undefined,
      })
    }
    return items
  }, [
    form.especialidadeLabel,
    form.medicoId,
    form.medicoLabel,
    medicosQuery.data?.info?.data,
  ])

  const organismoItems: ComboboxItem[] = useMemo(() => {
    const items = buildOrganismoOptions(utenteQuery.data?.info?.data)
    if (
      form.organismoId &&
      form.organismoLabel &&
      !items.some((i) => i.value === form.organismoId)
    ) {
      items.unshift({ value: form.organismoId, label: form.organismoLabel })
    }
    return items
  }, [form.organismoId, form.organismoLabel, utenteQuery.data?.info?.data])

  const salasItems: ComboboxItem[] = useMemo(() => {
    const items: ComboboxItem[] = (salasQuery.data ?? []).map((s: SalaTableDTO) => ({
      value: s.id,
      label: s.nome,
      secondary: String(s.numeroSala),
    }))
    if (form.salaId && form.salaLabel && !items.some((i) => i.value === form.salaId)) {
      items.unshift({ value: form.salaId, label: form.salaLabel })
    }
    return items
  }, [form.salaId, form.salaLabel, salasQuery.data])

  useEffect(() => {
    if (!open || readOnly || form.organismoId || organismoItems.length === 0) return
    setForm((prev) => ({
      ...prev,
      organismoId: organismoItems[0].value,
      organismoLabel: organismoItems[0].label,
    }))
  }, [form.organismoId, organismoItems, open, readOnly])

  const horasInfo = horasQuery.data?.info?.data
  const gestaoSalasAtiva = clinicaQuery.data?.info?.data?.gestaoSalas === true
  const mostrarSala = gestaoSalasAtiva || Boolean(form.salaId)
  const horaItems = useMemo(() => {
    const values = [...(horasInfo?.horasPossiveis ?? [])]
    if (form.horaInicio && !values.includes(form.horaInicio)) {
      values.unshift(form.horaInicio)
    }
    return values
  }, [form.horaInicio, horasInfo?.horasPossiveis])

  const patch = (partial: Partial<FormState>) =>
    setForm((prev) => ({
      ...prev,
      ...partial,
    }))

  const validate = (): boolean => {
    if (!form.utenteId) {
      toast.error('Indique o utente.')
      return false
    }
    if (!form.organismoId) {
      toast.error('Indique o organismo.')
      return false
    }
    if (!form.medicoId) {
      toast.error('Indique o médico.')
      return false
    }
    if (!form.tipoAdmissaoId) {
      toast.error('Indique o tipo de admissão.')
      return false
    }
    if (!form.tipoConsultaId) {
      toast.error('Indique o tipo de consulta.')
      return false
    }
    if (!form.data) {
      toast.error('Indique a data.')
      return false
    }
    if (!form.horaInicio) {
      toast.error('Indique a hora.')
      return false
    }
    if (horasInfo?.horarioFlexivel && !form.duracao) {
      toast.error('Indique a duração para horário flexível.')
      return false
    }
    if (gestaoSalasAtiva && !form.salaId) {
      toast.error('Indique a sala.')
      return false
    }
    return true
  }

  const buildPayload = (): SaveOrdemEntradaRegistoRequest => ({
    utenteId: form.utenteId,
    organismoId: form.organismoId,
    medicoId: form.medicoId,
    tipoAdmissaoId: form.tipoAdmissaoId,
    tipoConsultaId: form.tipoConsultaId,
    salaId: form.salaId || null,
    data: `${form.data}T00:00:00`,
    horaInicio: normalizeTime(form.horaInicio),
    duracao: form.duracao ? normalizeTime(form.duracao) : null,
    observacoes: form.observacoes.trim() || null,
  })

  const handleSave = async () => {
    if (readOnly || !validate()) return

    setSaving(true)
    try {
      const client = OrdemEntradaAdministrativoService(listPermId)
      const res =
        mode === 'edit' && form.id
          ? await client.updateRegisto(form.id, buildPayload())
          : await client.createRegisto(buildPayload())

      if (res.info?.status === ResponseStatus.Success) {
        toast.success(mode === 'edit' ? 'Registo alterado.' : 'Registo criado.')
        onOpenChange(false)
        onSaved?.()
      } else {
        toast.error(messageFromResponse(res.info?.messages) ?? 'Não foi possível guardar.')
      }
    } catch {
      toast.error('Erro ao guardar o registo.')
    } finally {
      setSaving(false)
    }
  }

  const loading = registoQuery.isLoading && mode !== 'create'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? 'Adicionar entrada de marcação'
              : mode === 'edit'
                ? 'Alterar entrada de marcação'
                : 'Consultar entrada de marcação'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className='py-8 text-center text-sm text-muted-foreground'>A carregar…</div>
        ) : (
          <div className='space-y-4'>
            <div className='grid gap-3 md:grid-cols-2'>
              <div className={fieldGap}>
                <Label className={labelClass}>Utente</Label>
                <AsyncCombobox
                  value={form.utenteId}
                  onChange={(value) => {
                    const selected = utenteItems.find((u) => u.value === value)
                    patch({
                      utenteId: value,
                      utenteLabel: selected?.label ?? '',
                      utenteNumero: selected?.secondary ?? '',
                      organismoId: '',
                      organismoLabel: '',
                    })
                  }}
                  items={utenteItems}
                  isLoading={utentesLightQuery.isLoading}
                  placeholder='Selecionar utente'
                  searchPlaceholder='Pesquisar utente…'
                  emptyText='Sem utentes.'
                  disabled={readOnly}
                  searchValue={utenteSearch}
                  onSearchValueChange={setUtenteSearch}
                />
              </div>

              <div className={fieldGap}>
                <Label className={labelClass}>Organismo</Label>
                <Select
                  value={form.organismoId}
                  onValueChange={(value) => {
                    const selected = organismoItems.find((o) => o.value === value)
                    patch({ organismoId: value, organismoLabel: selected?.label ?? '' })
                  }}
                  disabled={readOnly || organismoItems.length === 0}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder='Selecionar organismo' />
                  </SelectTrigger>
                  <SelectContent>
                    {organismoItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              <div className={fieldGap}>
                <Label className={labelClass}>Médico</Label>
                <AsyncCombobox
                  value={form.medicoId}
                  onChange={(value) => {
                    const selected = medicosQuery.data?.info?.data?.find((m) => m.id === value)
                    patch({
                      medicoId: value,
                      medicoLabel: selected?.nome ?? medicosItems.find((m) => m.value === value)?.label ?? '',
                      especialidadeId: selected?.especialidadeId ?? '',
                      especialidadeLabel: selected?.especialidadeNome ?? '',
                      horaInicio: '',
                    })
                  }}
                  items={medicosItems}
                  isLoading={medicosQuery.isLoading}
                  placeholder='Selecionar médico'
                  searchPlaceholder='Pesquisar médico…'
                  emptyText='Sem médicos.'
                  disabled={readOnly}
                  searchValue={medicoSearch}
                  onSearchValueChange={setMedicoSearch}
                />
              </div>

              <div className={fieldGap}>
                <Label className={labelClass}>Especialidade</Label>
                <Input
                  className={inputClass}
                  value={form.especialidadeLabel}
                  readOnly
                  placeholder='Preenchida pelo médico'
                />
              </div>

              {mostrarSala ? (
                <div className={fieldGap}>
                  <Label className={labelClass}>
                    Sala{gestaoSalasAtiva ? ' *' : ''}
                  </Label>
                  <AsyncCombobox
                    value={form.salaId}
                    onChange={(value) => {
                      const selected = salasItems.find((s) => s.value === value)
                      patch({
                        salaId: value,
                        salaLabel: selected?.label ?? '',
                      })
                    }}
                    items={salasItems}
                    isLoading={salasQuery.isLoading}
                    placeholder='Selecionar sala'
                    searchPlaceholder='Pesquisar sala…'
                    emptyText='Sem salas.'
                    disabled={readOnly}
                    searchValue={salaSearch}
                    onSearchValueChange={setSalaSearch}
                  />
                </div>
              ) : null}
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              <div className={fieldGap}>
                <Label className={labelClass}>Tipo admissão</Label>
                <Select
                  value={form.tipoAdmissaoId}
                  onValueChange={(value) => patch({ tipoAdmissaoId: value })}
                  disabled={readOnly}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder='Selecionar tipo admissão' />
                  </SelectTrigger>
                  <SelectContent>
                    {(tiposAdmissaoQuery.data ?? []).map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.designacao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={fieldGap}>
                <Label className={labelClass}>Tipo consulta</Label>
                <Select
                  value={form.tipoConsultaId}
                  onValueChange={(value) => patch({ tipoConsultaId: value, horaInicio: '' })}
                  disabled={readOnly}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder='Selecionar tipo consulta' />
                  </SelectTrigger>
                  <SelectContent>
                    {(tiposConsultaQuery.data ?? []).map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.designacao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid gap-3 md:grid-cols-3'>
              <div className={fieldGap}>
                <Label className={labelClass}>Data</Label>
                <DateField
                  className={inputClass}
                  value={form.data}
                  disabled={readOnly}
                  onChange={(v) => patch({ data: v, horaInicio: '' })}
                />
              </div>

              <div className={fieldGap}>
                <Label className={labelClass}>Hora</Label>
                {horasInfo?.horarioFlexivel ? (
                  <TimeField
                    className={inputClass}
                    value={form.horaInicio}
                    disabled={readOnly}
                    readOnly={readOnly}
                    onChange={(v) => patch({ horaInicio: v })}
                  />
                ) : (
                  <Select
                    value={form.horaInicio}
                    onValueChange={(value) => patch({ horaInicio: value })}
                    disabled={readOnly || horasQuery.isLoading || horaItems.length === 0}
                  >
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue
                        placeholder={horasQuery.isLoading ? 'A carregar…' : 'Selecionar hora'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {horaItems.map((hora) => (
                        <SelectItem key={hora} value={hora}>
                          {hora}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className={fieldGap}>
                <Label className={labelClass}>Duração</Label>
                <TimeField
                  className={inputClass}
                  value={form.duracao}
                  disabled={readOnly || !horasInfo?.horarioFlexivel}
                  readOnly={readOnly}
                  onChange={(v) => patch({ duracao: v })}
                  placeholder={horasInfo?.intervalo ? timeHm(horasInfo.intervalo) : undefined}
                />
              </div>
            </div>

            <div className={fieldGap}>
              <Label className={labelClass}>Observações</Label>
              <Textarea
                value={form.observacoes}
                disabled={readOnly || mode === 'edit'}
                rows={4}
                onChange={(e) => patch({ observacoes: e.target.value })}
              />
            </div>

            {mode !== 'create' ? (
              <div className='rounded-md border bg-muted/20 p-3'>
                <div className='mb-2 text-sm font-semibold'>Histórico</div>
                <div className='grid gap-3 md:grid-cols-2'>
                  <div className={fieldGap}>
                    <Label className={labelClass}>Utilizador</Label>
                    <Input className={inputClass} value={form.createdByNome} readOnly />
                  </div>
                  <div className={fieldGap}>
                    <Label className={labelClass}>Data/Hora</Label>
                    <Input className={inputClass} value={form.dataHoraMarcacao} readOnly />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            {readOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!readOnly ? (
            <Button type='button' disabled={saving || loading} onClick={handleSave}>
              {saving ? 'A guardar…' : 'Guardar'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
