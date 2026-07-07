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
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { DateField } from '@/components/shared/date-field'
import { TimeField } from '@/components/shared/time-field'
import { fieldGap, formBlockGap, inputClass, labelClass } from '@/lib/form-styles'
import { ListaEsperaAdministrativoService } from '@/lib/services/consultas/lista-espera-administrativo-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { PrioridadeService } from '@/lib/services/prioridades/prioridade-service'
import { TipoConsultaService } from '@/lib/services/tipos-consulta/tipo-consulta-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { ListaEsperaTableDTO } from '@/types/dtos/consultas/lista-espera-administrativo.dtos'
import { getDataTrabalhoIsoDate } from '@/lib/utils/data-trabalho'
import {
  createEmptyListaEsperaForm,
  mapListaEsperaDtoToForm,
  mapListaEsperaFormToCreatePayload,
  mapListaEsperaFormToUpdatePayload,
  type ListaEsperaFormState,
} from './lista-espera-form-utils'

type ModalMode = 'view' | 'create' | 'edit'

export function ListaEsperaViewEditModal({
  open,
  onOpenChange,
  mode,
  row,
  listPermId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  row: ListaEsperaTableDTO | null
  listPermId: string
  onSaved?: () => void
}) {
  const readOnly = mode === 'view'
  const [form, setForm] = useState<ListaEsperaFormState>(() =>
    createEmptyListaEsperaForm(getDataTrabalhoIsoDate())
  )
  const [saving, setSaving] = useState(false)
  const [utSearch, setUtSearch] = useState('')
  const [medSearch, setMedSearch] = useState('')
  const [espSearch, setEspSearch] = useState('')
  const [orgSearch, setOrgSearch] = useState('')
  const [debouncedUt] = useDebounce(utSearch, 300)
  const [debouncedMed] = useDebounce(medSearch, 300)
  const [debouncedEsp] = useDebounce(espSearch, 300)
  const [debouncedOrg] = useDebounce(orgSearch, 300)

  const patch = (partial: Partial<ListaEsperaFormState>) =>
    setForm((prev) => ({ ...prev, ...partial }))

  const detailQuery = useQuery({
    queryKey: ['lista-espera-administrativo', row?.id],
    queryFn: () => ListaEsperaAdministrativoService(listPermId).getById(row!.id),
    enabled: open && (mode === 'view' || mode === 'edit') && !!row?.id,
  })

  useEffect(() => {
    if (!open) return
    if (mode === 'create') {
      setForm(createEmptyListaEsperaForm(getDataTrabalhoIsoDate()))
      return
    }
    const dto = detailQuery.data?.info?.data
    if (dto) setForm(mapListaEsperaDtoToForm(dto))
  }, [open, mode, detailQuery.data])

  const utentesQuery = useQuery({
    queryKey: ['le-form', 'utentes', debouncedUt],
    queryFn: () => UtentesService(listPermId).getUtentesLight(debouncedUt),
    enabled: open && !readOnly,
  })

  const medicosQuery = useQuery({
    queryKey: ['le-form', 'medicos', debouncedMed],
    queryFn: () => MedicosService(listPermId).getMedicosLight(debouncedMed),
    enabled: open && !readOnly,
  })

  const espQuery = useQuery({
    queryKey: ['le-form', 'esp', debouncedEsp],
    queryFn: () => EspecialidadeService(listPermId).getEspecialidadesLight(debouncedEsp),
    enabled: open && !readOnly,
  })

  const orgQuery = useQuery({
    queryKey: ['le-form', 'org', debouncedOrg],
    queryFn: () => OrganismoService(listPermId).getOrganismoLight(debouncedOrg),
    enabled: open && !readOnly,
  })

  const tiposConsultaQuery = useQuery({
    queryKey: ['le-form', 'tipos-consulta'],
    queryFn: async () => {
      const res = await TipoConsultaService().getAllTiposConsulta()
      return res.info?.data ?? []
    },
    enabled: open && !readOnly,
  })

  const prioridadesQuery = useQuery({
    queryKey: ['le-form', 'prioridades'],
    queryFn: async () => {
      const res = await PrioridadeService(listPermId).getPrioridadesLight()
      return res.info?.data ?? []
    },
    enabled: open && !readOnly,
  })

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

  const orgItems = useMemo(() => {
    const list = (orgQuery.data?.info?.data ?? []) as Array<{ id: string; nome: string }>
    return list.map((o) => ({ value: o.id, label: o.nome }))
  }, [orgQuery.data])

  const title =
    mode === 'create' ? 'Nova lista de espera' : mode === 'edit' ? 'Editar' : 'Lista de espera'

  const handleSave = async () => {
    if (!form.utenteId) {
      toast.error('Selecione o utente.')
      return
    }
    if (!form.especialidadeId) {
      toast.error('Selecione a especialidade.')
      return
    }
    if (!form.data) {
      toast.error('Indique a data.')
      return
    }

    setSaving(true)
    try {
      if (mode === 'create') {
        const res = await ListaEsperaAdministrativoService(listPermId).create(
          mapListaEsperaFormToCreatePayload(form)
        )
        if (res.info?.status === ResponseStatus.Success) {
          toast.success('Registo criado.')
          onOpenChange(false)
          onSaved?.()
        } else {
          toast.error(res.info?.messages?.[0] ?? 'Não foi possível criar.')
        }
      } else if (mode === 'edit' && row?.id) {
        const res = await ListaEsperaAdministrativoService(listPermId).update(
          row.id,
          mapListaEsperaFormToUpdatePayload(form)
        )
        if (res.info?.status === ResponseStatus.Success) {
          toast.success('Registo atualizado.')
          onOpenChange(false)
          onSaved?.()
        } else {
          toast.error(res.info?.messages?.[0] ?? 'Não foi possível atualizar.')
        }
      }
    } catch {
      toast.error('Erro ao guardar.')
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
          <div className={fieldGap}>
            <Label className={labelClass}>Utente</Label>
            {readOnly ? (
              <Input className={inputClass} readOnly value={form.utenteLabel || '—'} />
            ) : (
              <AsyncCombobox
                value={form.utenteId}
                onChange={(id) => {
                  const label = utenteItems.find((i) => i.value === id)?.label ?? ''
                  patch({ utenteId: id, utenteLabel: label })
                }}
                searchValue={utSearch}
                onSearchValueChange={setUtSearch}
                items={utenteItems}
                isLoading={utentesQuery.isFetching}
                placeholder='Utente…'
                searchPlaceholder='Pesquisar…'
                emptyText='Sem resultados'
              />
            )}
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            <div className={fieldGap}>
              <Label className={labelClass}>Especialidade *</Label>
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
                  placeholder='Especialidade…'
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
                  searchPlaceholder='Pesquisar…'
                  emptyText='Sem resultados'
                />
              )}
            </div>
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
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
                  searchPlaceholder='Pesquisar…'
                  emptyText='Sem resultados'
                />
              )}
            </div>
            <div className={fieldGap}>
              <Label className={labelClass}>Tipo consulta</Label>
              {readOnly ? (
                <Input className={inputClass} readOnly value={form.tipoConsultaLabel || '—'} />
              ) : (
                <Select
                  value={form.tipoConsultaId || '__none__'}
                  onValueChange={(v) => patch({ tipoConsultaId: v === '__none__' ? '' : v })}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder='—' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='__none__'>—</SelectItem>
                    {(tiposConsultaQuery.data ?? []).map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {(t as { designacao?: string; nome?: string }).designacao ??
                          (t as { nome?: string }).nome ??
                          t.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            <div className={fieldGap}>
              <Label className={labelClass}>Prioridade</Label>
              {readOnly ? (
                <Input className={inputClass} readOnly value={form.prioridadeLabel || '—'} />
              ) : (
                <Select
                  value={form.prioridadeId || '__none__'}
                  onValueChange={(v) => patch({ prioridadeId: v === '__none__' ? '' : v })}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder='—' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='__none__'>—</SelectItem>
                    {(prioridadesQuery.data ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.descricao || '-'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Label className={labelClass}>Hora início</Label>
              <TimeField
                className={inputClass}
                readOnly={readOnly}
                disabled={readOnly}
                value={form.horaInicio}
                onChange={(v) => patch({ horaInicio: v })}
              />
            </div>
            <div className={fieldGap}>
              <Label className={labelClass}>Hora fim</Label>
              <TimeField
                className={inputClass}
                readOnly={readOnly}
                disabled={readOnly}
                value={form.horaFim}
                onChange={(v) => patch({ horaFim: v })}
              />
            </div>
          </div>

          <div className={fieldGap}>
            <Label className={labelClass}>Credencial</Label>
            <Input
              className={inputClass}
              readOnly={readOnly}
              value={form.credencial}
              onChange={(e) => patch({ credencial: e.target.value })}
            />
          </div>

          <div className={fieldGap}>
            <Label className={labelClass}>Observações</Label>
            <Textarea
              readOnly={readOnly}
              value={form.obs}
              onChange={(e) => patch({ obs: e.target.value })}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            {readOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!readOnly ? (
            <Button type='button' disabled={saving || detailQuery.isLoading} onClick={handleSave}>
              {saving ? 'A guardar…' : 'Guardar'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
