import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { DateField } from '@/components/shared/date-field'
import { fieldGap, formBlockGap, inputClass, labelClass } from '@/lib/form-styles'
import { ListaEsperaTratamentoAdministrativoService } from '@/lib/services/tratamentos/lista-espera-tratamento-administrativo-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { PrioridadeService } from '@/lib/services/prioridades/prioridade-service'
import { LocalTratamentoService } from '@/lib/services/locais-tratamento/local-tratamento-service'
import { EstadoListaEsperaService } from '@/lib/services/estados-lista-espera/estado-lista-espera-service'
import { PatologiaService } from '@/lib/services/patologias/patologia-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { ListaEsperaTratamentoTableDTO } from '@/types/dtos/tratamentos/lista-espera-tratamento-administrativo.dtos'
import { ListaEsperaTratamentoObservacoesModal } from './lista-espera-tratamento-observacoes-modal'
import { ListaEsperaTratamentoServicoLinhaModal } from './lista-espera-tratamento-servico-linha-modal'
import {
  applyProximoIdentificadorToForm,
  createEmptyListaEsperaTratamentoForm,
  mapDtoServicosToForm,
  mapListaEsperaTratamentoDtoToForm,
  mapListaEsperaTratamentoFormToCreatePayload,
  mapListaEsperaTratamentoFormToUpdatePayload,
  newListaEsperaServicoForm,
  type ListaEsperaTratamentoFormState,
  type ListaEsperaTratamentoServicoForm,
  type TaxaModeradoraOpcao,
} from './lista-espera-tratamento-form-utils'
import {
  useListaEsperaProximoIdentificador,
  useListaEsperaServicosLight,
  useListaEsperaSubsistemasPorOrganismo,
} from '../queries/lista-espera-tratamento-form-queries'
import {
  getCurrentInstanceId,
  openSubsistemasServicosFromListaEspera,
  updateWindowFormData,
} from '@/utils/window-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import {
  persistListaEsperaSubsistemasPickerContext,
  clearPendingServicosParaListaEspera,
  readPendingServicosParaListaEspera,
  subscribeServicosFromSubsistemasPicker,
} from '../lista-espera-subsistemas-servicos-flow'
import {
  clearListaEsperaTratamentoFormSessionDraft,
  persistListaEsperaTratamentoFormSessionDraft,
  readListaEsperaTratamentoFormSessionDraft,
} from './lista-espera-tratamento-form-draft'

type ModalMode = 'view' | 'create' | 'edit'
type TabKey = 'utente' | 'tratamento' | 'servicos'

function SectionTitle({ children }: { children: string }) {
  return <h4 className='mb-3 text-sm font-semibold text-primary'>{children}</h4>
}

function FormGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className='rounded-md border p-3'>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  )
}

export function ListaEsperaTratamentoViewEditModal({
  open,
  onOpenChange,
  mode,
  row,
  listPermId,
  onSaved,
  onSuccess,
  renderAsPage = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  row: ListaEsperaTratamentoTableDTO | null
  listPermId: string
  onSaved?: () => void
  onSuccess?: () => void
  renderAsPage?: boolean
}) {
  const readOnly = mode === 'view'
  const isActive = renderAsPage || open
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const setWindowHasFormData = useWindowsStore((s) => s.setWindowHasFormData)
  const urlInstanceId = searchParams.get('instanceId')
  const pickerHubRef = useRef<string | null>(null)
  const [pickerHubSync, setPickerHubSync] = useState(0)
  const [form, setForm] = useState<ListaEsperaTratamentoFormState>(() =>
    createEmptyListaEsperaTratamentoForm()
  )
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('utente')
  const [obsModalOpen, setObsModalOpen] = useState(false)
  const [createObsModalOpen, setCreateObsModalOpen] = useState(false)
  const [createObsDraft, setCreateObsDraft] = useState('')
  const [ordemModalOpen, setOrdemModalOpen] = useState(false)
  const [ordemDraft, setOrdemDraft] = useState('')
  const [servicos, setServicos] = useState<ListaEsperaTratamentoServicoForm[]>([])
  const [servicoModalOpen, setServicoModalOpen] = useState(false)
  const [editingServico, setEditingServico] = useState<ListaEsperaTratamentoServicoForm | null>(
    null
  )
  const [utSearch, setUtSearch] = useState('')
  const [medSearch, setMedSearch] = useState('')
  const [orgSearch, setOrgSearch] = useState('')
  const [patSearch, setPatSearch] = useState('')
  const [debouncedUt] = useDebounce(utSearch, 300)
  const [debouncedMed] = useDebounce(medSearch, 300)
  const [debouncedOrg] = useDebounce(orgSearch, 300)
  const [debouncedPat] = useDebounce(patSearch, 300)

  const patch = (partial: Partial<ListaEsperaTratamentoFormState>) =>
    setForm((prev) => ({ ...prev, ...partial }))

  const detailQuery = useQuery({
    queryKey: ['lista-espera-tratamento-administrativo', row?.id],
    queryFn: () => ListaEsperaTratamentoAdministrativoService(listPermId).getById(row!.id),
    enabled: isActive && (mode === 'view' || mode === 'edit') && !!row?.id,
  })

  const proximoIdentificadorQuery = useListaEsperaProximoIdentificador(
    listPermId,
    isActive && mode === 'create'
  )

  const subsistemasQuery = useListaEsperaSubsistemasPorOrganismo(
    form.organismoId,
    isActive && !readOnly
  )
  const servicosLightQuery = useListaEsperaServicosLight(isActive && !readOnly)

  useEffect(() => {
    if (!isActive) return

    const instanceId =
      renderAsPage && urlInstanceId && urlInstanceId !== 'default' ? urlInstanceId : ''
    const draft = instanceId ? readListaEsperaTratamentoFormSessionDraft(instanceId) : null

    if (mode === 'create') {
      if (draft?.form && draft.mode === 'create') {
        setForm(draft.form)
        setServicos(draft.servicos ?? [])
        setCreateObsDraft(draft.createObsDraft ?? draft.form.obs ?? '')
        setActiveTab(draft.activeTab ?? 'utente')
        return
      }
      setForm(createEmptyListaEsperaTratamentoForm())
      setServicos([])
      setActiveTab('utente')
      return
    }

    if (draft?.form && draft.mode === mode && draft.rowId === row?.id) {
      setForm(draft.form)
      setServicos(draft.servicos ?? [])
      setCreateObsDraft(draft.createObsDraft ?? draft.form.obs ?? '')
      setActiveTab(draft.activeTab ?? 'utente')
      return
    }

    const dto = detailQuery.data?.info?.data
    if (dto) {
      setForm(mapListaEsperaTratamentoDtoToForm(dto))
      setServicos(mapDtoServicosToForm(dto.servicos))
    }
  }, [isActive, mode, detailQuery.data, renderAsPage, urlInstanceId, row?.id])

  useEffect(() => {
    const preview = proximoIdentificadorQuery.data
    if (!isActive || mode !== 'create' || !preview) return
    setForm((prev) => {
      if (prev.codigoListaEspera) return prev
      return { ...prev, ...applyProximoIdentificadorToForm(preview) }
    })
  }, [isActive, mode, proximoIdentificadorQuery.data])

  useEffect(() => {
    if (!isActive || readOnly || !form.utenteId) return

    let cancelled = false
    void UtentesService(listPermId)
      .getUtente(form.utenteId)
      .then((res) => {
        if (cancelled) return
        const utente = res.info?.data
        if (!utente) return

        const linha =
          utente.subsistemaLinhas?.find((l) => l.organismoId === form.organismoId) ??
          utente.subsistemaLinhas?.[0]

        patch({
          numeroUtente: utente.numeroUtente ?? '',
          organismoId: linha?.organismoId ?? utente.organismoId ?? form.organismoId,
          organismoLabel:
            linha?.organismo?.nome ?? utente.organismo?.nome ?? form.organismoLabel,
          numeroBeneficiario: linha?.numeroBeneficiario ?? '',
          numeroApolice: linha?.numeroApolice ?? '',
        })
      })
      .catch(() => {
        /* utente auxiliar — não bloquear formulário */
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.utenteId, isActive, readOnly, listPermId])

  const utentesQuery = useQuery({
    queryKey: ['let-form', 'utentes', debouncedUt],
    queryFn: () => UtentesService(listPermId).getUtentesLight(debouncedUt),
    enabled: isActive && !readOnly && mode === 'create',
  })

  const medicosQuery = useQuery({
    queryKey: ['let-form', 'medicos', debouncedMed],
    queryFn: () => MedicosService(listPermId).getMedicosLight(debouncedMed),
    enabled: isActive && !readOnly,
  })

  const orgQuery = useQuery({
    queryKey: ['let-form', 'org', debouncedOrg],
    queryFn: () => OrganismoService(listPermId).getOrganismoLight(debouncedOrg),
    enabled: isActive && !readOnly,
  })

  const prioridadesQuery = useQuery({
    queryKey: ['let-form', 'prioridades'],
    queryFn: async () => {
      const res = await PrioridadeService(listPermId).getPrioridadesLight()
      return res.info?.data ?? []
    },
    enabled: isActive && !readOnly,
  })

  const locaisQuery = useQuery({
    queryKey: ['let-form', 'locais'],
    queryFn: async () => {
      const res = await LocalTratamentoService(listPermId).getLocaisTratamentoLight()
      return res.info?.data ?? []
    },
    enabled: isActive && !readOnly,
  })

  const estadosQuery = useQuery({
    queryKey: ['let-form', 'estados'],
    queryFn: async () => {
      const res = await EstadoListaEsperaService(listPermId).getEstadosListaEsperaLight()
      return res.info?.data ?? []
    },
    enabled: isActive && !readOnly,
  })

  const patologiasQuery = useQuery({
    queryKey: ['let-form', 'patologias', debouncedPat],
    queryFn: () => PatologiaService(listPermId).getPatologiasLight(debouncedPat),
    enabled: isActive && !readOnly,
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

  const orgItems = useMemo(() => {
    const list = orgQuery.data?.info?.data ?? []
    return list.map((o) => ({ value: o.id, label: o.nome }))
  }, [orgQuery.data])

  const patologiaItems = useMemo(() => {
    const list = patologiasQuery.data?.info?.data ?? []
    return list.map((p) => ({ value: p.id, label: p.designacao ?? '' }))
  }, [patologiasQuery.data])

  const closeAfterSave = () => {
    if (renderAsPage) {
      const instanceId = getCurrentInstanceId()
      if (instanceId && instanceId !== 'default') {
        clearListaEsperaTratamentoFormSessionDraft(instanceId)
      }
    }
    onSaved?.()
    if (onSuccess) onSuccess()
    else onOpenChange(false)
  }

  const handleSave = async () => {
    if (readOnly) return
    if (mode === 'create' && !form.utenteId) {
      toast.error('Selecione o utente.')
      setActiveTab('utente')
      return
    }

    setSaving(true)
    try {
      if (mode === 'create') {
        const res = await ListaEsperaTratamentoAdministrativoService(listPermId).create(
          mapListaEsperaTratamentoFormToCreatePayload(form, servicos)
        )
        if (res.info?.status === ResponseStatus.Success) {
          toast.success('Registo criado.')
          closeAfterSave()
        } else {
          toast.error(res.info?.messages?.[0] ?? 'Não foi possível guardar.')
        }
      } else if (row?.id) {
        const res = await ListaEsperaTratamentoAdministrativoService(listPermId).update(
          row.id,
          mapListaEsperaTratamentoFormToUpdatePayload(form, servicos)
        )
        if (res.info?.status === ResponseStatus.Success) {
          toast.success('Registo actualizado.')
          closeAfterSave()
        } else {
          toast.error(res.info?.messages?.[0] ?? 'Não foi possível guardar.')
        }
      }
    } catch {
      toast.error('Erro ao guardar.')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenObservacoes = () => {
    if (mode === 'create' && row?.id == null) {
      setCreateObsDraft('')
      setCreateObsModalOpen(true)
      return
    }
    if (row?.id) {
      setObsModalOpen(true)
    }
  }

  const handleConfirmCreateObs = () => {
    const texto = createObsDraft.trim()
    if (!texto) {
      setCreateObsModalOpen(false)
      return
    }
    const merged = form.obs.trim() ? `${form.obs.trim()}\n${texto}` : texto
    patch({ obs: merged })
    setCreateObsDraft('')
    setCreateObsModalOpen(false)
  }

  const handleAlterarOrdem = () => {
    setOrdemDraft(form.ordemAtual)
    setOrdemModalOpen(true)
  }

  const handleConfirmOrdem = async () => {
    const ordem = Number.parseInt(ordemDraft, 10)
    if (!ordem || ordem <= 0) {
      toast.error('N.º ordem inválido.')
      return
    }

    try {
      const res = await ListaEsperaTratamentoAdministrativoService(listPermId).verificarOrdemDisponivel(
        ordem,
        row?.id
      )
      if (res.info?.status !== ResponseStatus.Success || !res.info.data) {
        toast.error('N.º ordem indisponível.')
        return
      }
      patch({ ordemAtual: String(ordem) })
      setOrdemModalOpen(false)
    } catch {
      toast.error('Não foi possível validar o n.º ordem.')
    }
  }

  const openServicoModal = (linha?: ListaEsperaTratamentoServicoForm) => {
    if (!form.organismoId) {
      toast.error('Selecione o organismo na aba Utente.')
      setActiveTab('utente')
      return
    }
    setEditingServico(linha ?? newListaEsperaServicoForm(servicos.length + 1))
    setServicoModalOpen(true)
  }

  const handleConfirmSubsistemasSelecionados = useCallback(
    (novos: ListaEsperaTratamentoServicoForm[]) => {
      setServicos((prev) =>
        [...prev, ...novos].sort((a, b) => a.ordem - b.ordem)
      )
      setActiveTab('servicos')
    },
    []
  )

  useEffect(() => {
    if (!isActive) {
      pickerHubRef.current = null
      return
    }
    if (!renderAsPage && !pickerHubRef.current) {
      pickerHubRef.current = crypto.randomUUID()
      setPickerHubSync((s) => s + 1)
    }
  }, [isActive, renderAsPage])

  const listaEsperaPickerHubId = useMemo(() => {
    if (!isActive) return null
    if (renderAsPage) {
      return urlInstanceId && urlInstanceId !== 'default' ? urlInstanceId : null
    }
    return pickerHubRef.current
  }, [isActive, renderAsPage, urlInstanceId, pickerHubSync])

  useEffect(() => {
    if (!isActive || !listaEsperaPickerHubId) return
    return subscribeServicosFromSubsistemasPicker(
      listaEsperaPickerHubId,
      handleConfirmSubsistemasSelecionados
    )
  }, [isActive, listaEsperaPickerHubId, handleConfirmSubsistemasSelecionados])

  /** Fallback: pending no sessionStorage (ex. sem rascunho ao abrir subsistemas). */
  useEffect(() => {
    if (!isActive || !listaEsperaPickerHubId) return
    const pending = readPendingServicosParaListaEspera(listaEsperaPickerHubId)
    if (!pending?.length) return
    const draft = readListaEsperaTratamentoFormSessionDraft(listaEsperaPickerHubId)
    const jaNoRascunho = (draft?.servicos?.length ?? 0) >= pending.length
    clearPendingServicosParaListaEspera(listaEsperaPickerHubId)
    if (jaNoRascunho) return
    handleConfirmSubsistemasSelecionados(pending)
  }, [isActive, listaEsperaPickerHubId, handleConfirmSubsistemasSelecionados])

  const persistDraftForAuxTab = useCallback(() => {
    if (!renderAsPage) return
    const instanceId = getCurrentInstanceId()
    if (!instanceId || instanceId === 'default') return
    persistListaEsperaTratamentoFormSessionDraft(instanceId, {
      form,
      servicos,
      activeTab,
      createObsDraft,
      mode,
      rowId: row?.id ?? null,
    })
    const windowId = useWindowsStore
      .getState()
      .windows.find((w) => w.instanceId === instanceId)?.id
    if (windowId) {
      updateWindowFormData(windowId, Boolean(form.utenteId), setWindowHasFormData)
    }
  }, [
    renderAsPage,
    form,
    servicos,
    activeTab,
    createObsDraft,
    mode,
    row?.id,
    setWindowHasFormData,
  ])

  const openSubsistemasServicosList = () => {
    if (!form.organismoId) {
      toast.error('Selecione o organismo na aba Utente.')
      setActiveTab('utente')
      return
    }
    const hubId = renderAsPage
      ? (() => {
          const id = getCurrentInstanceId()
          return id !== 'default' ? id : null
        })()
      : (pickerHubRef.current ??
          (() => {
            const id = crypto.randomUUID()
            pickerHubRef.current = id
            setPickerHubSync((s) => s + 1)
            return id
          })())
    if (!hubId) {
      toast.error(
        'Não foi possível identificar o separador da lista de espera. Recarregue a página ou reabra o formulário.'
      )
      return
    }
    const proximaOrdem =
      servicos.length === 0 ? 1 : Math.max(...servicos.map((s) => s.ordem), 0) + 1
    persistDraftForAuxTab()
    persistListaEsperaSubsistemasPickerContext(hubId, {
      proximaOrdem,
      servicosLight: servicosLightQuery.data?.info?.data ?? [],
    })
    openSubsistemasServicosFromListaEspera(navigate, addWindow, {
      listaEsperaInstanceId: hubId,
      organismoId: form.organismoId,
      organismoLabel: form.organismoLabel,
    })
  }

  const handleConfirmServico = (linha: ListaEsperaTratamentoServicoForm) => {
    setServicos((prev) => {
      const exists = prev.some((s) => s.id === linha.id)
      if (exists) return prev.map((s) => (s.id === linha.id ? linha : s))
      return [...prev, linha].sort((a, b) => a.ordem - b.ordem)
    })
  }

  const handleRemoveServicos = () => {
    setServicos((prev) => prev.filter((s) => !s.selected))
  }

  const title = 'Lista de Espera'

  const content = (
    <>
      <div className='sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background/95 pb-2 pt-1 backdrop-blur'>
        <h2 className='flex items-center gap-2 text-lg font-semibold text-primary'>
          {(renderAsPage || mode !== 'view') && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={() => onOpenChange(false)}
              title='Voltar'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
          )}
          <span>{title}</span>
        </h2>
        <div className='flex items-center gap-2'>
          {!readOnly ? (
            <>
              <Button
                type='button'
                variant='secondary'
                size='sm'
                className='bg-teal-700 text-white shadow-sm hover:bg-teal-600'
                onClick={handleOpenObservacoes}
              >
                Observações
              </Button>
              <Button
                type='button'
                variant='destructive'
                size='sm'
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? 'A guardar…' : 'Guardar'}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className='grid grid-cols-12 gap-3 py-3'>
        <div className='col-span-12 sm:col-span-6 lg:col-span-2 space-y-1.5'>
          <Label className={labelClass}>Cód. Lista Espera</Label>
          <Input className={inputClass} readOnly value={form.codigoListaEspera || '—'} />
        </div>
        <div className='col-span-12 sm:col-span-6 lg:col-span-2 space-y-1.5'>
          <Label className={labelClass}>N.º Ordem Original</Label>
          <Input className={inputClass} readOnly value={form.ordemOriginal || '—'} />
        </div>
        <div className='col-span-12 sm:col-span-6 lg:col-span-2 space-y-1.5'>
          <Label className={labelClass}>N.º Ordem Actual</Label>
          <Input className={inputClass} readOnly value={form.ordemAtual || '—'} />
        </div>
        <div className='col-span-12 sm:col-span-6 lg:col-span-3 flex items-end'>
          <Button type='button' variant='default' size='sm' onClick={handleAlterarOrdem}>
            Alterar n.º Ordem
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabKey)}
        className='flex min-h-0 flex-1 flex-col overflow-hidden'
      >
        <TabsList>
          <TabsTrigger value='utente'>Utente</TabsTrigger>
          <TabsTrigger value='tratamento'>Tratamento</TabsTrigger>
          <TabsTrigger value='servicos'>Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value='utente' className='overflow-y-auto py-3'>
          <FormGroup title='Utente'>
            <div className={formBlockGap}>
              <div className='grid grid-cols-12 gap-3'>
                <div className='col-span-12 md:col-span-4 space-y-1.5'>
                  <Label className={labelClass}>Utente *</Label>
                  {readOnly || mode === 'edit' ? (
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
                      placeholder='Selecionar utente…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  )}
                </div>
                <div className='col-span-12 md:col-span-4 space-y-1.5'>
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
                      placeholder='Selecionar organismo…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <Label className={labelClass}>Taxa Moderadora</Label>
                <RadioGroup
                  value={form.taxaModeradoraOpcao}
                  onValueChange={(v) =>
                    patch({ taxaModeradoraOpcao: v as TaxaModeradoraOpcao })
                  }
                  className='flex flex-wrap gap-4'
                  disabled={readOnly}
                >
                  <div className='flex items-center gap-2'>
                    <RadioGroupItem value='isento' id='let-tm-isento' />
                    <Label htmlFor='let-tm-isento' className='font-normal'>
                      Isento
                    </Label>
                  </div>
                  <div className='flex items-center gap-2'>
                    <RadioGroupItem value='nao-isento' id='let-tm-nao-isento' />
                    <Label htmlFor='let-tm-nao-isento' className='font-normal'>
                      Não Isento
                    </Label>
                  </div>
                  <div className='flex items-center gap-2'>
                    <RadioGroupItem value='f11' id='let-tm-f11' />
                    <Label htmlFor='let-tm-f11' className='font-normal'>
                      F11
                    </Label>
                  </div>
                  <div className='flex items-center gap-2'>
                    <RadioGroupItem value='h' id='let-tm-h' />
                    <Label htmlFor='let-tm-h' className='font-normal'>
                      H
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className='grid grid-cols-12 gap-3'>
                <div className='col-span-12 md:col-span-4 space-y-1.5'>
                  <Label className={labelClass}>N.º Utente</Label>
                  <Input className={inputClass} readOnly value={form.numeroUtente || '—'} />
                </div>
                <div className='col-span-12 md:col-span-4 space-y-1.5'>
                  <Label className={labelClass}>N.º Beneficiário</Label>
                  <Input className={inputClass} readOnly value={form.numeroBeneficiario || '—'} />
                </div>
                <div className='col-span-12 md:col-span-4 space-y-1.5'>
                  <Label className={labelClass}>N.º Apólice</Label>
                  <Input className={inputClass} readOnly value={form.numeroApolice || '—'} />
                </div>
              </div>

              <div className='grid grid-cols-12 gap-3'>
                <div className='col-span-12 md:col-span-4 space-y-1.5'>
                  <Label className={labelClass}>Credencial</Label>
                  <Input
                    className={inputClass}
                    readOnly={readOnly}
                    value={form.credencial}
                    onChange={(e) => patch({ credencial: e.target.value })}
                  />
                </div>
                <div className='col-span-12 md:col-span-4 space-y-1.5'>
                  <Label className={labelClass}>Validade Credencial</Label>
                  <DateField
                    className={inputClass}
                    readOnly={readOnly}
                    value={form.validadeCredencial}
                    onChange={(v) => patch({ validadeCredencial: v })}
                  />
                </div>
                <div className='col-span-12 md:col-span-4 space-y-1.5'>
                  <Label className={labelClass}>Valor taxa moderadora</Label>
                  <Input
                    className={inputClass}
                    readOnly={readOnly}
                    type='number'
                    value={form.taxaModeradora}
                    onChange={(e) => patch({ taxaModeradora: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </FormGroup>
        </TabsContent>

        <TabsContent value='tratamento' className='overflow-y-auto py-3'>
          <div className={formBlockGap}>
            <FormGroup title='Tratamento'>
              <div className='grid grid-cols-12 gap-3'>
                <div className='col-span-12 md:col-span-2 space-y-1.5'>
                  <Label className={labelClass}>Designação</Label>
                  <Input
                    className={inputClass}
                    readOnly={readOnly}
                    value={form.designacao}
                    onChange={(e) => patch({ designacao: e.target.value })}
                  />
                </div>
                <div className='col-span-12 md:col-span-8 space-y-1.5'>
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
                      placeholder='Selecionar médico…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  )}
                </div>
                <div className='col-span-12 md:col-span-2 space-y-1.5'>
                  <Label className={labelClass}>Local tratamento</Label>
                  {readOnly ? (
                    <Input
                      className={inputClass}
                      readOnly
                      value={form.localTratamentoLabel || '—'}
                    />
                  ) : (
                    <Select
                      value={form.localTratamentoId || '__none__'}
                      onValueChange={(v) =>
                        patch({ localTratamentoId: v === '__none__' ? '' : v })
                      }
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder='—' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='__none__'>—</SelectItem>
                        {(locaisQuery.data ?? []).map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.designacao || '-'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </FormGroup>

            <FormGroup title='Sessões'>
              <div className='grid grid-cols-12 gap-3'>
                <div className='col-span-12 md:col-span-2 space-y-1.5'>
                  <Label className={labelClass}>N.º sessão</Label>
                  <Input
                    className={inputClass}
                    readOnly={readOnly}
                    type='number'
                    value={form.numSessoes}
                    onChange={(e) => patch({ numSessoes: e.target.value })}
                  />
                </div>
                <div className='col-span-12 md:col-span-2 space-y-1.5'>
                  <Label className={labelClass}>Hora desejada</Label>
                  <Input
                    className={inputClass}
                    readOnly={readOnly}
                    value={form.horaDesejada}
                    onChange={(e) => patch({ horaDesejada: e.target.value })}
                    placeholder='HH:mm'
                  />
                </div>
                <div className='col-span-12 md:col-span-2 space-y-1.5'>
                  <Label className={labelClass}>Data</Label>
                  <Input className={inputClass} readOnly value={form.dataEntrada || '—'} />
                </div>
                <div className='col-span-12 md:col-span-3 space-y-1.5'>
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
                <div className='col-span-12 md:col-span-3 space-y-1.5'>
                  <Label className={labelClass}>Estado</Label>
                  {readOnly ? (
                    <Input className={inputClass} readOnly value={form.estadoLabel || '—'} />
                  ) : (
                    <Select
                      value={form.estadoListaEsperaId || '__none__'}
                      onValueChange={(v) =>
                        patch({ estadoListaEsperaId: v === '__none__' ? '' : v })
                      }
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder='—' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='__none__'>—</SelectItem>
                        {(estadosQuery.data ?? []).map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.descricao || '-'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </FormGroup>

            <FormGroup title='Faltas permitidas'>
              <div className='grid grid-cols-12 gap-3'>
                <div className='col-span-12 md:col-span-3 space-y-1.5'>
                  <Label className={labelClass}>N.º máximo</Label>
                  <Input
                    className={inputClass}
                    readOnly={readOnly}
                    type='number'
                    value={form.nFaltMax}
                    onChange={(e) => patch({ nFaltMax: e.target.value })}
                  />
                </div>
                <div className='col-span-12 md:col-span-3 space-y-1.5'>
                  <Label className={labelClass}>N.º máx. consecutivo</Label>
                  <Input
                    className={inputClass}
                    readOnly={readOnly}
                    type='number'
                    value={form.nFaltComax}
                    onChange={(e) => patch({ nFaltComax: e.target.value })}
                  />
                </div>
              </div>
            </FormGroup>
          </div>
        </TabsContent>

        <TabsContent value='servicos' className='overflow-y-auto py-3'>
          <FormGroup title='Serviços'>
            <div className='grid grid-cols-12 gap-3'>
              <div className='col-span-12 md:col-span-2 space-y-1.5'>
                <Label className={labelClass}>Tempo tratamento</Label>
                <Input
                  className={inputClass}
                  readOnly={readOnly}
                  value={form.duracaoTotal}
                  onChange={(e) => patch({ duracaoTotal: e.target.value })}
                  placeholder='HH:mm'
                />
              </div>
              <div className='col-span-12 md:col-span-5 space-y-1.5'>
                <Label className={labelClass}>Patologias</Label>
                {readOnly ? (
                  <Input className={inputClass} readOnly value={form.patologiaLabel || '—'} />
                ) : (
                  <AsyncCombobox
                    value={form.patologiaId}
                    onChange={(id) => {
                      const label = patologiaItems.find((i) => i.value === id)?.label ?? ''
                      patch({ patologiaId: id, patologiaLabel: label })
                    }}
                    searchValue={patSearch}
                    onSearchValueChange={setPatSearch}
                    items={patologiaItems}
                    isLoading={patologiasQuery.isFetching}
                    placeholder='Patologias…'
                    searchPlaceholder='Pesquisar…'
                    emptyText='Sem resultados'
                  />
                )}
              </div>
              {!readOnly ? (
                <div className='col-span-12 flex flex-wrap items-end justify-end gap-2 md:col-span-5'>
                  <Button type='button' variant='secondary' size='sm' disabled>
                    Especificação Técnica
                  </Button>
                  <Button type='button' variant='default' size='sm' onClick={openSubsistemasServicosList}>
                    <Plus className='mr-1 h-4 w-4' />
                    Inserir
                  </Button>
                  <Button
                    type='button'
                    variant='destructive'
                    size='sm'
                    disabled={!servicos.some((s) => s.selected)}
                    onClick={handleRemoveServicos}
                  >
                    <Trash2 className='mr-1 h-4 w-4' />
                    Remover
                  </Button>
                </div>
              ) : null}
            </div>

            <div className='mt-4 overflow-hidden rounded-md border'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/40 text-left'>
                  <tr>
                    {!readOnly ? <th className='w-10 p-2' /> : null}
                    <th className='p-2'>Código</th>
                    <th className='p-2'>Designação</th>
                    <th className='p-2'>Subsistema</th>
                    <th className='p-2'>Duração</th>
                    <th className='p-2'>Ordem</th>
                    {!readOnly ? <th className='p-2'>Opções</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {servicos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={readOnly ? 5 : 7}
                        className='p-6 text-center text-muted-foreground'
                      >
                        Não existem dados a apresentar
                      </td>
                    </tr>
                  ) : (
                    servicos.map((linha) => (
                      <tr key={linha.id} className='border-t'>
                        {!readOnly ? (
                          <td className='p-2'>
                            <Checkbox
                              checked={linha.selected}
                              onCheckedChange={(checked) =>
                                setServicos((prev) =>
                                  prev.map((s) =>
                                    s.id === linha.id ? { ...s, selected: checked === true } : s
                                  )
                                )
                              }
                            />
                          </td>
                        ) : null}
                        <td className='p-2'>{linha.codigoServico || '—'}</td>
                        <td className='p-2'>{linha.designacao || '—'}</td>
                        <td className='p-2'>{linha.subsistemaDesignacao || '—'}</td>
                        <td className='p-2'>{linha.duracao || '—'}</td>
                        <td className='p-2'>{linha.ordem}</td>
                        {!readOnly ? (
                          <td className='p-2'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => openServicoModal(linha)}
                            >
                              Editar
                            </Button>
                          </td>
                        ) : null}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </FormGroup>
        </TabsContent>
      </Tabs>

      <Dialog open={createObsModalOpen} onOpenChange={setCreateObsModalOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Observações</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div>
              <Label>Histórico</Label>
              <Textarea readOnly value={form.obs} rows={6} className='mt-1' />
            </div>
            <div>
              <Label>Nova observação</Label>
              <Textarea
                value={createObsDraft}
                onChange={(e) => setCreateObsDraft(e.target.value)}
                rows={4}
                className='mt-1'
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setCreateObsModalOpen(false)}>
              Fechar
            </Button>
            <Button type='button' onClick={handleConfirmCreateObs}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ordemModalOpen} onOpenChange={setOrdemModalOpen}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Alterar n.º Ordem</DialogTitle>
          </DialogHeader>
          <div className={fieldGap}>
            <Label className={labelClass}>N.º Ordem</Label>
            <Input
              className={inputClass}
              type='number'
              value={ordemDraft}
              onChange={(e) => setOrdemDraft(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setOrdemModalOpen(false)}>
              Fechar
            </Button>
            <Button type='button' onClick={handleConfirmOrdem}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ListaEsperaTratamentoObservacoesModal
        open={obsModalOpen}
        onOpenChange={setObsModalOpen}
        listaEsperaId={row?.id ?? null}
        utenteLabel={form.utenteLabel || row?.utenteNome || undefined}
        listPermId={listPermId}
        readOnly={readOnly}
        onSaved={onSaved}
      />

      <ListaEsperaTratamentoServicoLinhaModal
        open={servicoModalOpen}
        onOpenChange={setServicoModalOpen}
        organismoId={form.organismoId}
        subsistemasPayload={subsistemasQuery.data?.info?.data}
        servicosLight={servicosLightQuery.data?.info?.data ?? []}
        initialLinha={editingServico}
        onConfirm={handleConfirmServico}
      />
    </>
  )

  if (renderAsPage) {
    return (
      <div className='space-y-4'>
        <div className='rounded-md border bg-card p-4'>{content}</div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[96vh] w-[96vw] max-w-[1600px] flex-col overflow-hidden p-4 pt-3 [&>button]:hidden'>
        {content}
        {readOnly ? (
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
