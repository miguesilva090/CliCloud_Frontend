import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import {
  ArrowLeft,
  FileText,
  History,
  Plus,
  Printer,
  Receipt,
  SquareArrowOutUpRight,
} from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AsyncCombobox, type ComboboxItem } from '@/components/shared/async-combobox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fieldGap, formBlockGap, inputClass, labelClass, selectTriggerClass } from '@/lib/form-styles'
import { useAuthStore } from '@/stores/auth-store'
import type { TipoServicoLightDTO } from '@/types/dtos/servicos/tipo-servico.dtos'
import type { ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import {
  getCurrentInstanceId,
  openSubsistemasServicosFromAdmissao,
  updateWindowFormData,
} from '@/utils/window-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import type {
  AdmissaoTableDTO,
  CreateAdmissaoRequest,
  UpdateAdmissaoRequest,
} from '@/types/dtos/consultas/admissao.dtos'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import type { SalaTableDTO } from '@/types/dtos/consultas/sala.dtos'
import {
  createEmptyAdmissaoForm,
  formatMoneyPt,
  isencaoToTaxaModeradora,
  mapDtoToForm,
  mapFormToPayload,
  newLinhaServicoForm,
  resolveBeneficiarioApolice,
  sumLinhasTotal,
  buildUtenteOrganismoOptions,
  type AdmissaoFormState,
  type LinhaServicoForm,
  type TaxaModeradora,
} from './admissao-form-utils'
import { AdmissaoServicoLinhaModal } from './admissao-servico-linha-modal'
import {
  clearAdmissaoFormSessionDraft,
  persistAdmissaoFormSessionDraft,
  readAdmissaoFormSessionDraft,
} from './admissao-form-draft'
import {
  useDoencasSearch,
  useMedicosExternosLight,
  useMedicosLight,
  useMotivosConsulta,
  useSalasAdmissao,
  useServicosLightAdmissao,
  useSubsistemasPorOrganismo,
  useTiposAdmissao,
  useTiposConsulta,
  useTiposServicoLightAdmissao,
} from '../queries/admissao-form-queries'

type ModalMode = 'view' | 'create' | 'edit'
type TabKey = 'dados-utente' | 'dados-consulta' | 'registo-servicos'

/** Mesmo padrão que sinistrado-view-edit-modal (área administrativa). */
const BTN_SECONDARY_ACTION =
  'bg-slate-800 text-white shadow-sm hover:bg-slate-700'

function FuncionarioFooter({ nome }: { nome: string }) {
  return (
    <div className='mt-4 rounded-md border bg-muted/20 px-3 py-2'>
      <Label className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
        Funcionário
      </Label>
      <Input className={`${inputClass} mt-1 bg-muted/40`} readOnly value={nome} />
    </div>
  )
}

function icdCodeFromLabel(label: string): string {
  if (!label.trim()) return ''
  const sep = label.indexOf(' — ')
  return sep >= 0 ? label.slice(0, sep).trim() : label.trim()
}

export function AdmissaoViewEditModal({
  open,
  onOpenChange,
  mode,
  row,
  onSaved,
  renderAsPage = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  row: AdmissaoTableDTO | null
  onSaved?: () => void
  renderAsPage?: boolean
}) {
  const permId = modules.areaAdministrativa.permissions.admissoes.id
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const setWindowHasFormData = useWindowsStore((s) => s.setWindowHasFormData)
  const funcionarioNome = useAuthStore((s) => s.name || s.email || '')
  const readOnly = mode === 'view'
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('dados-utente')
  const [form, setForm] = useState<AdmissaoFormState>(createEmptyAdmissaoForm())
  const [obsModalOpen, setObsModalOpen] = useState(false)
  const [obsDraft, setObsDraft] = useState('')
  const [servicoModalOpen, setServicoModalOpen] = useState(false)
  const [editingLinha, setEditingLinha] = useState<LinhaServicoForm | null>(null)

  const [utenteSearch, setUtenteSearch] = useState('')
  const [medicoSearch, setMedicoSearch] = useState('')
  const [medicoExtSearch, setMedicoExtSearch] = useState('')
  const [doenca1Search, setDoenca1Search] = useState('')
  const [doenca2Search, setDoenca2Search] = useState('')
  const [organismoSearch, setOrganismoSearch] = useState('')
  const [salaSearch, setSalaSearch] = useState('')
  const [motivoSearch, setMotivoSearch] = useState('')
  const [tipoServicoSearch, setTipoServicoSearch] = useState('')
  const [debouncedUtenteSearch] = useDebounce(utenteSearch, 300)
  const [debouncedTipoServicoSearch] = useDebounce(tipoServicoSearch, 250)
  const [debouncedMedicoSearch] = useDebounce(medicoSearch, 300)
  const [debouncedMedicoExtSearch] = useDebounce(medicoExtSearch, 300)
  const [debouncedDoenca1] = useDebounce(doenca1Search, 300)
  const [debouncedDoenca2] = useDebounce(doenca2Search, 300)

  const patch = useCallback((partial: Partial<AdmissaoFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }))
  }, [])

  const tiposAdmissaoQuery = useTiposAdmissao(open)
  const tiposConsultaQuery = useTiposConsulta(open)
  const motivosQuery = useMotivosConsulta(open)
  const salasQuery = useSalasAdmissao(open)
  const organismoEfetivo = form.organismoAtivo ? form.organismoId : ''
  const subsistemasQuery = useSubsistemasPorOrganismo(organismoEfetivo, open && organismoEfetivo.length > 0)
  const servicosLightQuery = useServicosLightAdmissao('', open)
  const medicosQuery = useMedicosLight(debouncedMedicoSearch)
  const medicosExtQuery = useMedicosExternosLight(debouncedMedicoExtSearch)
  const doencas1Query = useDoencasSearch(debouncedDoenca1, open)
  const doencas2Query = useDoencasSearch(debouncedDoenca2, open)
  const tiposServicoQuery = useTiposServicoLightAdmissao(debouncedTipoServicoSearch, open)

  const utentesLightQuery = useQuery({
    queryKey: ['admissao-modal', 'utentes', debouncedUtenteSearch],
    queryFn: () => UtentesService('utentes').getUtentesLight(debouncedUtenteSearch || undefined),
    enabled: open && !readOnly,
    staleTime: 30_000,
  })

  const utenteItems: ComboboxItem[] = useMemo(
    () =>
      (utentesLightQuery.data?.info?.data ?? []).map((u) => ({
        value: u.id,
        label: u.nome,
        secondary: u.numeroUtente ?? undefined,
      })),
    [utentesLightQuery.data?.info?.data]
  )

  const [organismoOptions, setOrganismoOptions] = useState<ComboboxItem[]>([])

  const medicosItems = useMemo(
    () =>
      (medicosQuery.data?.info?.data ?? []).map((m) => ({
        value: m.id,
        label: m.nome,
        secondary: m.especialidadeNome ?? undefined,
      })),
    [medicosQuery.data?.info?.data]
  )

  const medicosExtItems = useMemo(
    () =>
      (medicosExtQuery.data?.info?.data ?? []).map((m) => ({
        value: m.id,
        label: m.nome,
      })),
    [medicosExtQuery.data?.info?.data]
  )

  const salasItems = useMemo(
    () =>
      (salasQuery.data ?? []).map((s: SalaTableDTO) => ({
        value: s.id,
        label: s.nome,
        secondary: String(s.numeroSala),
      })),
    [salasQuery.data]
  )

  const motivoItems = useMemo(
    () =>
      (motivosQuery.data ?? []).map((m) => ({
        value: m.id,
        label: m.designacao ?? m.id,
      })),
    [motivosQuery.data]
  )

  const doencaItems = (rows: { id: string; code?: string | null; title?: string }[]) =>
    rows.map((d) => ({
      value: d.id,
      label: [d.code, d.title].filter(Boolean).join(' — ') || d.id,
    }))

  const doenca1Items = useMemo(
    () => doencaItems(doencas1Query.data ?? []),
    [doencas1Query.data]
  )
  const doenca2Items = useMemo(
    () => doencaItems(doencas2Query.data ?? []),
    [doencas2Query.data]
  )

  const subsistemasPayload = subsistemasQuery.data?.info?.data
  const servicosLightAll = servicosLightQuery.data?.info?.data ?? []
  const servicosLight = useMemo(() => {
    if (!form.tipoServicoRegistoId) return servicosLightAll
    return servicosLightAll.filter(
      (s: ServicoLightDTO) => s.tipoServicoId === form.tipoServicoRegistoId
    )
  }, [servicosLightAll, form.tipoServicoRegistoId])
  const valorTotal = useMemo(() => sumLinhasTotal(form.linhasServico), [form.linhasServico])
  const icd91Display = icdCodeFromLabel(form.doencaPrincipalLabel)
  const icd92Display = icdCodeFromLabel(form.doencaSecundariaLabel)

  const tipoServicoItems = useMemo(
    () =>
      (tiposServicoQuery.data?.info?.data ?? []).map((t: TipoServicoLightDTO) => ({
        value: t.id,
        label: t.descricao,
      })),
    [tiposServicoQuery.data?.info?.data]
  )

  const handleSelectTipoServico = (value: string) => {
    const tipo = (tiposServicoQuery.data?.info?.data ?? []).find(
      (t: TipoServicoLightDTO) => t.id === value
    )
    patch({
      tipoServicoRegistoId: value,
      tipoServicoRegistoLabel: tipo?.descricao ?? value,
    })
  }

  const persistDraftForAuxTab = useCallback(() => {
    if (!renderAsPage) return
    const instanceId = getCurrentInstanceId()
    if (!instanceId) return
    persistAdmissaoFormSessionDraft(instanceId, {
      form,
      activeTab,
      organismoOptions,
      obsDraft,
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
    activeTab,
    organismoOptions,
    obsDraft,
    mode,
    row?.id,
    setWindowHasFormData,
  ])

  const openSubsistemasServicosList = () => {
    if (!organismoEfetivo) {
      toast.error('Selecione utente e organismo na aba «Dados do Utente».')
      setActiveTab('dados-utente')
      return
    }
    if (!renderAsPage) {
      toast.info('Abra a admissão num separador para gerir subsistemas de serviços.')
      return
    }
    if (!form.utenteId) {
      toast.error('Selecione o utente na aba «Dados do Utente».')
      setActiveTab('dados-utente')
      return
    }
    if (!form.medicoId) {
      toast.error('Selecione o médico na aba «Dados da Consulta».')
      setActiveTab('dados-consulta')
      return
    }
    const numLinhas = Number.parseInt(form.numLinhasInserir, 10)
    if (!Number.isFinite(numLinhas) || numLinhas < 1) {
      toast.error('Indique o nº de linhas (mínimo 1).')
      return
    }
    const admissaoInstanceId = getCurrentInstanceId()
    if (!admissaoInstanceId || admissaoInstanceId === 'default') {
      toast.error('Não foi possível identificar a admissão actual.')
      return
    }
    persistDraftForAuxTab()
    openSubsistemasServicosFromAdmissao(navigate, addWindow, {
      admissaoInstanceId,
      organismoId: organismoEfetivo,
      organismoLabel: form.organismoLabel,
    })
  }

  const openServicoModal = () => {
    if (!organismoEfetivo) {
      toast.error('Selecione utente e organismo na aba «Dados do Utente».')
      setActiveTab('dados-utente')
      return
    }
    setEditingLinha(null)
    setServicoModalOpen(true)
  }

  const hydrateUtente = async (utente: UtenteDTO, organismoIdOverride?: string) => {
    const orgOptions = buildUtenteOrganismoOptions(utente)
    setOrganismoOptions(orgOptions)
    const organismoId =
      organismoIdOverride ||
      form.organismoId ||
      utente.organismoId ||
      orgOptions[0]?.value ||
      ''
    const orgLabel = orgOptions.find((o) => o.value === organismoId)?.label ?? ''
    const { beneficiario, apolice } = resolveBeneficiarioApolice(utente, organismoId)
    patch({
      numeroUtente: utente.numeroUtente?.trim() ?? '',
      organismoId,
      organismoLabel: orgLabel,
      beneficiario,
      apolice,
      taxaModeradora: isencaoToTaxaModeradora(utente.tipoTaxaModeradora),
    })
  }

  const handleSelectUtente = async (utenteId: string) => {
    const selected = utenteItems.find((u) => u.value === utenteId)
    patch({ utenteId, utenteLabel: selected?.label ?? '' })
    try {
      const res = await UtentesService('utentes').getUtente(utenteId)
      if (res.info?.data) {
        await hydrateUtente(res.info.data)
        patch({ utenteLabel: res.info.data.nome ?? selected?.label ?? '' })
      }
    } catch {
      toast.error('Não foi possível carregar os dados do utente.')
    }
  }

  const handleSelectOrganismo = (organismoId: string) => {
    const label = organismoOptions.find((o) => o.value === organismoId)?.label ?? ''
    patch({ organismoId, organismoLabel: label })
  }

  const handleSelectMedico = async (medicoId: string) => {
    const item = medicosItems.find((m) => m.value === medicoId)
    patch({
      medicoId,
      medicoLabel: item?.label ?? '',
      especialidadeNome: item?.secondary ?? '',
    })
    try {
      const res = await MedicosService('saude').getMedico(medicoId)
      const medico = res.info?.data
      if (medico?.especialidadeId) {
        patch({
          especialidadeId: medico.especialidadeId,
          especialidadeNome: medico.especialidadeNome ?? item?.secondary ?? '',
        })
      }
    } catch {
      // keep light data
    }
  }

  useEffect(() => {
    if (!open) return
    const instanceId = renderAsPage ? getCurrentInstanceId() : ''
    const draft = instanceId ? readAdmissaoFormSessionDraft(instanceId) : null

    if (mode === 'create') {
      if (draft?.form && draft.mode === 'create') {
        setForm(draft.form)
        setOrganismoOptions(draft.organismoOptions ?? [])
        setObsDraft(draft.obsDraft ?? draft.form.obs ?? '')
        setActiveTab(draft.activeTab ?? 'dados-utente')
        return
      }
      setActiveTab('dados-utente')
      const empty = createEmptyAdmissaoForm()
      setForm(empty)
      setOrganismoOptions([])
      setObsDraft('')
      const tipos = tiposAdmissaoQuery.data ?? []
      const defaultTipo =
        tipos.find((t) => /especialidade/i.test(t.designacao) && !/fisio/i.test(t.designacao)) ??
        tipos[0]
      if (defaultTipo) {
        setForm((prev) => ({ ...prev, tipoAdmissaoId: defaultTipo.id }))
      }
      const tiposCons = tiposConsultaQuery.data ?? []
      if (tiposCons[0]) {
        setForm((prev) => ({ ...prev, tipoConsultaId: tiposCons[0].id }))
      }
      return
    }
    if (!row?.id) return
    if (draft?.form && draft.mode === mode && draft.rowId === row.id) {
      setForm(draft.form)
      setOrganismoOptions(draft.organismoOptions ?? [])
      setObsDraft(draft.obsDraft ?? draft.form.obs ?? '')
      setActiveTab(draft.activeTab ?? 'dados-utente')
      return
    }
    setActiveTab('dados-utente')
    setLoading(true)
    AdmissaoAdministrativoService(permId)
      .getById(row.id)
      .then(async (res) => {
        if (res.info?.status !== ResponseStatus.Success || !res.info.data) {
          toast.error('Não foi possível carregar a admissão.')
          return
        }
        const mapped = mapDtoToForm(res.info.data)
        setForm(mapped)
        setObsDraft(mapped.obs)
        try {
          const utRes = await UtentesService('utentes').getUtente(mapped.utenteId)
          if (utRes.info?.data) {
            setOrganismoOptions(buildUtenteOrganismoOptions(utRes.info.data))
          }
        } catch {
          // ignore
        }
      })
      .finally(() => setLoading(false))
  }, [open, mode, row?.id, permId])

  useEffect(() => {
    if (!open || mode !== 'create') return
    const tipos = tiposAdmissaoQuery.data ?? []
    if (!form.tipoAdmissaoId && tipos.length > 0) {
      const def =
        tipos.find((t) => /especialidade/i.test(t.designacao)) ?? tipos[0]
      patch({ tipoAdmissaoId: def.id })
    }
    const tiposC = tiposConsultaQuery.data ?? []
    if (!form.tipoConsultaId && tiposC[0]) {
      patch({ tipoConsultaId: tiposC[0].id })
    }
  }, [open, mode, tiposAdmissaoQuery.data, tiposConsultaQuery.data])

  const handleSave = async () => {
    if (!form.utenteId) {
      toast.error('Utente é obrigatório.')
      setActiveTab('dados-utente')
      return
    }
    if (!form.tipoAdmissaoId) {
      toast.error('Tipo de admissão é obrigatório.')
      setActiveTab('dados-consulta')
      return
    }
    setSaving(true)
    try {
      const payload = mapFormToPayload(form) as CreateAdmissaoRequest
      const res =
        mode === 'create'
          ? await AdmissaoAdministrativoService(permId).create(payload)
          : await AdmissaoAdministrativoService(permId).update(
              row!.id,
              payload as UpdateAdmissaoRequest
            )
      if (res.info?.status === ResponseStatus.Success) {
        toast.success(mode === 'create' ? 'Admissão criada.' : 'Admissão atualizada.')
        if (renderAsPage) {
          clearAdmissaoFormSessionDraft(getCurrentInstanceId())
        }
        onSaved?.()
        onOpenChange(false)
      } else {
        toast.error(res.info?.messages?.['']?.[0] ?? 'Erro ao gravar admissão.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleAddLinhas = () => {
    const count = Math.max(1, parseInt(form.numLinhasInserir, 10) || 1)
    const novas = Array.from({ length: count }, () => newLinhaServicoForm())
    patch({ linhasServico: [...form.linhasServico, ...novas] })
    setEditingLinha(null)
    setServicoModalOpen(true)
  }

  const handleConfirmLinha = (linha: LinhaServicoForm) => {
    if (editingLinha) {
      patch({
        linhasServico: form.linhasServico.map((l) => (l.id === editingLinha.id ? linha : l)),
      })
    } else {
      const emptyIdx = form.linhasServico.findIndex((l) => !l.servicoId && !l.descricao)
      if (emptyIdx >= 0) {
        const next = [...form.linhasServico]
        next[emptyIdx] = linha
        patch({ linhasServico: next })
      } else {
        patch({ linhasServico: [...form.linhasServico, linha] })
      }
    }
    setEditingLinha(null)
  }

  const removeSelectedLinhas = () => {
    patch({
      linhasServico: form.linhasServico.filter((l) => !l.selected),
    })
  }

  const title =
    mode === 'create' ? 'Nova admissão' : mode === 'edit' ? 'Editar admissão' : 'Admissão'

  const content = (
    <>
      <div className='sticky top-0 z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-background/95 pb-3 pt-1 backdrop-blur'>
        <h2 className='flex items-center gap-2 text-lg font-semibold leading-tight'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 shrink-0'
            onClick={() => onOpenChange(false)}
            title='Voltar'
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <span>{title}</span>
        </h2>
        <div className='flex flex-wrap items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => toast.info('Documento manual — fase 2 (faturação).')}
          >
            <FileText className='mr-2 h-4 w-4' />
            Documento Manual
          </Button>
          <Button
            type='button'
            variant='secondary'
            size='sm'
            className={BTN_SECONDARY_ACTION}
            disabled={readOnly}
            onClick={() => {
              setObsDraft(form.obs)
              setObsModalOpen(true)
            }}
          >
            Observações
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => toast.info('Transferência de histórico — fase 2.')}
          >
            <History className='mr-2 h-4 w-4' />
            Transf. Histórico
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled
            title='Processo organismo (legado — indisponível)'
          >
            <SquareArrowOutUpRight className='mr-2 h-4 w-4' />
            Processo Organismo
          </Button>
          {!readOnly ? (
            <Button
              type='button'
              size='sm'
              variant='destructive'
              disabled={saving || loading}
              onClick={handleSave}
            >
              <Plus className='mr-2 h-4 w-4' />
              Guardar
            </Button>
          ) : (
            <Button type='button' variant='outline' size='sm' onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <p className='py-8 text-sm text-muted-foreground'>A carregar...</p>
      ) : (
        <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabKey)}
              className='flex min-h-0 flex-1 flex-col overflow-hidden'
            >
              <TabsList className='mt-3 grid h-auto w-full shrink-0 grid-cols-3 gap-0 rounded-none border-b bg-transparent p-0'>
                <TabsTrigger
                  value='dados-utente'
                  className='rounded-none border-b-2 border-transparent py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none'
                >
                  Dados do Utente
                </TabsTrigger>
                <TabsTrigger
                  value='dados-consulta'
                  className='rounded-none border-b-2 border-transparent py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none'
                >
                  Dados da Consulta
                </TabsTrigger>
                <TabsTrigger
                  value='registo-servicos'
                  className='rounded-none border-b-2 border-transparent py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none'
                >
                  Registo de Serviços
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value='dados-utente'
                className='flex-1 overflow-y-auto py-4 data-[state=inactive]:hidden'
              >
                <div className='grid grid-cols-12 gap-4'>
                  <div className='col-span-12 lg:col-span-9 space-y-4 rounded-md border p-4'>
                    <div className='grid grid-cols-12 gap-3'>
                      <div className={`col-span-12 md:col-span-3 ${fieldGap}`}>
                        <Label className={labelClass}>Cód. Admissão</Label>
                        <Input
                          className={`${inputClass} bg-muted/50`}
                          readOnly
                          value={form.codigoAdmissao || (mode === 'create' ? '—' : '')}
                          placeholder='—'
                        />
                      </div>
                      <div className={`col-span-12 md:col-span-8 ${fieldGap}`}>
                        <Label className={labelClass}>Utente</Label>
                        <div className='flex gap-1'>
                          <AsyncCombobox
                            className='min-w-0 flex-1'
                            value={form.utenteId}
                            onChange={handleSelectUtente}
                          items={
                            form.utenteLabel && !utenteItems.some((i) => i.value === form.utenteId)
                              ? [{ value: form.utenteId, label: form.utenteLabel }, ...utenteItems]
                              : utenteItems
                          }
                          isLoading={utentesLightQuery.isFetching}
                          placeholder='Utente...'
                          searchPlaceholder='Pesquisar utente...'
                          emptyText='Sem utentes'
                          disabled={readOnly}
                          searchValue={utenteSearch}
                          onSearchValueChange={setUtenteSearch}
                          />
                          <Button
                            type='button'
                            variant='secondary'
                            size='icon'
                            className='h-9 w-9 shrink-0'
                            disabled={readOnly}
                            title='Novo utente'
                            onClick={() => toast.info('Registo de utente — módulo Utentes (fase 2).')}
                          >
                            <Plus className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                      <div className={`col-span-12 ${fieldGap}`}>
                        <div className='flex flex-wrap items-end gap-2'>
                          <label className='mb-2 flex shrink-0 items-center gap-2 text-sm'>
                            <Checkbox
                              disabled={readOnly}
                              checked={form.organismoAtivo}
                              onCheckedChange={(v) => {
                                const ativo = Boolean(v)
                                patch({
                                  organismoAtivo: ativo,
                                  organismoId: ativo ? form.organismoId : '',
                                  organismoLabel: ativo ? form.organismoLabel : '',
                                })
                              }}
                            />
                            Organismo
                          </label>
                          <div className='min-w-0 flex-1'>
                        <AsyncCombobox
                          value={form.organismoId}
                          onChange={handleSelectOrganismo}
                          items={
                            form.organismoLabel &&
                            !organismoOptions.some((i) => i.value === form.organismoId)
                              ? [
                                  { value: form.organismoId, label: form.organismoLabel },
                                  ...organismoOptions,
                                ]
                              : organismoOptions
                          }
                          placeholder={
                            form.utenteId ? 'Organismo...' : 'Selecione primeiro o utente'
                          }
                          searchPlaceholder='Pesquisar organismo...'
                          emptyText='Sem organismos'
                          disabled={readOnly || !form.utenteId || !form.organismoAtivo}
                          searchValue={organismoSearch}
                          onSearchValueChange={setOrganismoSearch}
                        />
                          </div>
                        </div>
                      </div>
                      <div className={`col-span-6 md:col-span-3 ${fieldGap}`}>
                        <Label className={labelClass}>Desconto (%)</Label>
                        <Input
                          className={inputClass}
                          disabled={readOnly}
                          value={form.desconto}
                          onChange={(e) => patch({ desconto: e.target.value })}
                        />
                      </div>
                      <div className='col-span-12 space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Checkbox
                            disabled={readOnly}
                            checked={form.taxaModeradoraAtiva}
                            onCheckedChange={(v) => patch({ taxaModeradoraAtiva: Boolean(v) })}
                          />
                          <Label className={labelClass}>Taxa moderadora</Label>
                        </div>
                        <RadioGroup
                          value={form.taxaModeradora}
                          onValueChange={(v) => patch({ taxaModeradora: v as TaxaModeradora })}
                          className='flex flex-wrap gap-4'
                          disabled={readOnly || !form.taxaModeradoraAtiva}
                        >
                          <div className='flex items-center gap-2'>
                            <RadioGroupItem value='isento' id='tx-isento' />
                            <Label htmlFor='tx-isento'>Isento</Label>
                          </div>
                          <div className='flex items-center gap-2'>
                            <RadioGroupItem value='nao-isento' id='tx-nao' />
                            <Label htmlFor='tx-nao'>Não isento</Label>
                          </div>
                          <div className='flex items-center gap-2'>
                            <RadioGroupItem value='e111' id='tx-e11' />
                            <Label htmlFor='tx-e11'>E11</Label>
                          </div>
                          <div className='flex items-center gap-2'>
                            <RadioGroupItem value='h' id='tx-h' />
                            <Label htmlFor='tx-h'>H</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className={`col-span-4 ${fieldGap}`}>
                        <Label className={labelClass}>Número utente</Label>
                        <Input className={inputClass} readOnly value={form.numeroUtente} />
                      </div>
                      <div className={`col-span-4 ${fieldGap}`}>
                        <Label className={labelClass}>Beneficiário</Label>
                        <Input className={inputClass} readOnly value={form.beneficiario} />
                      </div>
                      <div className={`col-span-4 ${fieldGap}`}>
                        <Label className={labelClass}>Apólice</Label>
                        <Input className={inputClass} readOnly value={form.apolice} />
                      </div>
                    </div>
                  </div>

                  <div className='col-span-12 lg:col-span-3 space-y-3 rounded-md border p-4'>
                    <div className='grid grid-cols-3 gap-2 text-center text-sm'>
                      <label className='flex flex-col items-center gap-1'>
                        <Checkbox
                          disabled={readOnly}
                          checked={form.presente}
                          onCheckedChange={(v) => patch({ presente: Boolean(v), confirmado: Boolean(v) })}
                        />
                        Presente
                      </label>
                      <label className='flex flex-col items-center gap-1'>
                        <Checkbox
                          disabled={readOnly}
                          checked={form.efetuada}
                          onCheckedChange={(v) => patch({ efetuada: Boolean(v), efetuado: Boolean(v) })}
                        />
                        Efectuada
                      </label>
                      <label className='flex flex-col items-center gap-1'>
                        <Checkbox
                          disabled={readOnly}
                          checked={form.faltou}
                          onCheckedChange={(v) => patch({ faltou: Boolean(v) })}
                        />
                        Faltou
                      </label>
                    </div>
                    <RadioGroup
                      value={
                        form.justificada ? '1' : form.naoJustificada ? '0' : ''
                      }
                      onValueChange={(v) =>
                        patch({
                          justificada: v === '1',
                          naoJustificada: v === '0',
                        })
                      }
                      className='flex gap-4'
                      disabled={readOnly}
                    >
                      <div className='flex items-center gap-2'>
                        <RadioGroupItem value='1' id='just-sim' />
                        <Label htmlFor='just-sim'>Justificada</Label>
                      </div>
                      <div className='flex items-center gap-2'>
                        <RadioGroupItem value='0' id='just-nao' />
                        <Label htmlFor='just-nao'>Não justificada</Label>
                      </div>
                    </RadioGroup>
                    <Textarea
                      placeholder='Justificação...'
                      rows={5}
                      disabled={readOnly}
                      value={form.motivoJustificacao}
                      onChange={(e) => patch({ motivoJustificacao: e.target.value })}
                    />
                  </div>
                </div>
                <FuncionarioFooter nome={funcionarioNome} />
              </TabsContent>

              <TabsContent
                value='dados-consulta'
                className='flex-1 overflow-y-auto py-4 data-[state=inactive]:hidden'
              >
                <div className='grid grid-cols-12 gap-4'>
                  <div className='col-span-12 lg:col-span-9 space-y-4 rounded-md border p-4'>
                    <h4 className='text-sm font-semibold'>Dados da Marcação</h4>
                    <div className={`grid grid-cols-12 ${formBlockGap}`}>
                      <div className={`col-span-4 ${fieldGap}`}>
                        <Label className={labelClass}>Data</Label>
                        <Input
                          type='date'
                          className={inputClass}
                          disabled={readOnly}
                          value={form.data}
                          onChange={(e) => patch({ data: e.target.value })}
                        />
                      </div>
                      <div className={`col-span-4 ${fieldGap}`}>
                        <Label className={labelClass}>Hora marc.</Label>
                        <Input
                          type='time'
                          className={inputClass}
                          disabled={readOnly}
                          value={form.horaInicio}
                          onChange={(e) => patch({ horaInicio: e.target.value })}
                        />
                      </div>
                      <div className={`col-span-4 ${fieldGap}`}>
                        <Label className={labelClass}>Hora saída</Label>
                        <Input
                          type='time'
                          className={inputClass}
                          disabled={readOnly}
                          value={form.horaFim}
                          onChange={(e) => patch({ horaFim: e.target.value })}
                        />
                      </div>
                      <div className={`col-span-4 ${fieldGap}`}>
                        <Label className={labelClass}>Sinistrado</Label>
                        <Input
                          className={inputClass}
                          disabled={readOnly}
                          value={form.sinistrado}
                          onChange={(e) => patch({ sinistrado: e.target.value })}
                        />
                      </div>
                      <div className={`col-span-4 ${fieldGap}`}>
                        <Label className={labelClass}>N.º chegada</Label>
                        <Input
                          className={inputClass}
                          disabled={readOnly}
                          value={form.numChegada}
                          onChange={(e) => patch({ numChegada: e.target.value })}
                        />
                      </div>
                      <div className={`col-span-4 ${fieldGap}`}>
                        <Label className={labelClass}>Hora chegada</Label>
                        <Input
                          type='time'
                          className={inputClass}
                          disabled={readOnly}
                          value={form.horaChegada}
                          onChange={(e) => patch({ horaChegada: e.target.value })}
                        />
                      </div>

                      <div className='col-span-12'>
                        <Label className={`${labelClass} mb-2 block`}>Tipo consulta</Label>
                        <RadioGroup
                          value={form.tipoConsultaId}
                          onValueChange={(v) => patch({ tipoConsultaId: v })}
                          className='flex flex-wrap gap-3'
                          disabled={readOnly}
                        >
                          {(tiposConsultaQuery.data ?? []).map((t) => (
                            <div key={t.id} className='flex items-center gap-2'>
                              <RadioGroupItem value={t.id} id={`tc-${t.id}`} />
                              <Label htmlFor={`tc-${t.id}`}>{t.designacao}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className={`col-span-8 ${fieldGap}`}>
                        <Label className={labelClass}>Médico</Label>
                        <AsyncCombobox
                          value={form.medicoId}
                          onChange={handleSelectMedico}
                          items={
                            form.medicoLabel && !medicosItems.some((i) => i.value === form.medicoId)
                              ? [{ value: form.medicoId, label: form.medicoLabel }, ...medicosItems]
                              : medicosItems
                          }
                          isLoading={medicosQuery.isFetching}
                          placeholder='Médico...'
                          searchPlaceholder='Pesquisar médico...'
                          emptyText='Sem médicos'
                          disabled={readOnly}
                          searchValue={medicoSearch}
                          onSearchValueChange={setMedicoSearch}
                        />
                      </div>
                      <div className={`col-span-4 ${fieldGap}`}>
                        <Label className={labelClass}>Sala</Label>
                        <AsyncCombobox
                          value={form.salaId}
                          onChange={(v) => {
                            const label =
                              salasItems.find((item) => item.value === v)?.label ?? ''
                            patch({ salaId: v, salaLabel: label })
                          }}
                          items={
                            form.salaLabel && !salasItems.some((i) => i.value === form.salaId)
                              ? [{ value: form.salaId, label: form.salaLabel }, ...salasItems]
                              : salasItems
                          }
                          isLoading={salasQuery.isLoading}
                          placeholder='Sala...'
                          searchPlaceholder='Pesquisar sala...'
                          emptyText='Sem salas'
                          disabled={readOnly}
                          searchValue={salaSearch}
                          onSearchValueChange={setSalaSearch}
                        />
                      </div>
                      <div className={`col-span-8 ${fieldGap}`}>
                        <Label className={labelClass}>Médico externo</Label>
                        <AsyncCombobox
                          value={form.medicoExternoId}
                          onChange={(v) => {
                            const label = medicosExtItems.find((m) => m.value === v)?.label ?? ''
                            patch({ medicoExternoId: v, medicoExternoLabel: label })
                          }}
                          items={
                            form.medicoExternoLabel &&
                            !medicosExtItems.some((i) => i.value === form.medicoExternoId)
                              ? [
                                  {
                                    value: form.medicoExternoId,
                                    label: form.medicoExternoLabel,
                                  },
                                  ...medicosExtItems,
                                ]
                              : medicosExtItems
                          }
                          isLoading={medicosExtQuery.isFetching}
                          placeholder='Médico externo...'
                          searchPlaceholder='Pesquisar...'
                          emptyText='Sem médicos externos'
                          disabled={readOnly}
                          searchValue={medicoExtSearch}
                          onSearchValueChange={setMedicoExtSearch}
                        />
                      </div>
                      <div className='col-span-4 flex items-end pb-1'>
                        <label className='flex items-center gap-2 text-sm'>
                          <Checkbox
                            disabled={readOnly}
                            checked={form.credencialExterna}
                            onCheckedChange={(v) => patch({ credencialExterna: Boolean(v) })}
                          />
                          Credencial externa
                        </label>
                      </div>
                      <div className={`col-span-4 ${fieldGap}`}>
                        <Label className={labelClass}>Credencial</Label>
                        <Input
                          className={inputClass}
                          disabled={readOnly}
                          value={form.credencial}
                          onChange={(e) => patch({ credencial: e.target.value })}
                        />
                      </div>
                      <div className={`col-span-8 ${fieldGap}`}>
                        <Label className={labelClass}>Especialidade</Label>
                        <Input className={inputClass} readOnly value={form.especialidadeNome} />
                      </div>

                      <div className='col-span-12'>
                        <Label className={`${labelClass} mb-2 block`}>Tipo admissão</Label>
                        <RadioGroup
                          value={form.tipoAdmissaoId}
                          onValueChange={(v) => patch({ tipoAdmissaoId: v })}
                          className='flex flex-wrap gap-4'
                          disabled={readOnly}
                        >
                          {(tiposAdmissaoQuery.data ?? []).map((t) => (
                            <div key={t.id} className='flex items-center gap-2'>
                              <RadioGroupItem value={t.id} id={`ta-${t.id}`} />
                              <Label htmlFor={`ta-${t.id}`}>{t.designacao}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className={`col-span-4 ${fieldGap}`}>
                        <Label className={labelClass}>Cód. tratamento</Label>
                        <Input
                          className={inputClass}
                          disabled={readOnly}
                          value={form.tratamentoCodigo}
                          onChange={(e) => patch({ tratamentoCodigo: e.target.value })}
                        />
                      </div>
                      <div className={`col-span-8 ${fieldGap}`}>
                        <Label className={labelClass}>Motivo de consulta</Label>
                        <AsyncCombobox
                          value={form.motivoConsultaId}
                          onChange={(v) => {
                            const label = motivoItems.find((m) => m.value === v)?.label ?? ''
                            patch({ motivoConsultaId: v, motivoConsultaLabel: label })
                          }}
                          items={
                            form.motivoConsultaLabel &&
                            !motivoItems.some((i) => i.value === form.motivoConsultaId)
                              ? [
                                  {
                                    value: form.motivoConsultaId,
                                    label: form.motivoConsultaLabel,
                                  },
                                  ...motivoItems,
                                ]
                              : motivoItems
                          }
                          placeholder='Motivo...'
                          searchPlaceholder='Pesquisar motivo...'
                          emptyText='Sem motivos'
                          disabled={readOnly}
                          searchValue={motivoSearch}
                          onSearchValueChange={setMotivoSearch}
                        />
                      </div>
                    </div>
                  </div>

                  <div className='col-span-12 space-y-3 rounded-md border p-4 lg:col-span-3'>
                    <label className='flex items-center gap-2 text-sm'>
                      <Checkbox
                        disabled={readOnly}
                        checked={form.usarPontosDescontos}
                        onCheckedChange={(v) => patch({ usarPontosDescontos: Boolean(v) })}
                      />
                      Usar cartão pontos/descontos
                    </label>
                    <div className={fieldGap}>
                      <Label className={labelClass}>Pontos</Label>
                      <Input
                        className={inputClass}
                        disabled={readOnly || !form.usarPontosDescontos}
                        value={form.pontos}
                        onChange={(e) => patch({ pontos: e.target.value })}
                      />
                    </div>
                    <div className={fieldGap}>
                      <Label className={labelClass}>Descontos (€)</Label>
                      <Input
                        className={inputClass}
                        disabled={readOnly || !form.usarPontosDescontos}
                        value={form.descontosEuro}
                        onChange={(e) => patch({ descontosEuro: e.target.value })}
                      />
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='w-full'
                      onClick={() => toast.info('Outras informações — fase 2.')}
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Outras informações
                    </Button>
                    <div className={`${fieldGap}`}>
                      <Label className={labelClass}>ICD91</Label>
                      <Input className={`${inputClass} bg-muted/40`} readOnly value={icd91Display} />
                      <AsyncCombobox
                        value={form.doencaPrincipalId}
                        onChange={(v) => {
                          const label = doenca1Items.find((d) => d.value === v)?.label ?? ''
                          patch({ doencaPrincipalId: v, doencaPrincipalLabel: label })
                        }}
                        items={
                          form.doencaPrincipalLabel &&
                          !doenca1Items.some((i) => i.value === form.doencaPrincipalId)
                            ? [
                                {
                                  value: form.doencaPrincipalId,
                                  label: form.doencaPrincipalLabel,
                                },
                                ...doenca1Items,
                              ]
                            : doenca1Items
                        }
                        isLoading={doencas1Query.isFetching}
                        placeholder='Doença principal...'
                        searchPlaceholder='Código ou título (min. 2 chars)...'
                        emptyText='Pesquise doença'
                        disabled={readOnly}
                        searchValue={doenca1Search}
                        onSearchValueChange={setDoenca1Search}
                        className='mt-1'
                      />
                    </div>
                    <div className={fieldGap}>
                      <Label className={labelClass}>ICD92</Label>
                      <Input className={`${inputClass} bg-muted/40`} readOnly value={icd92Display} />
                      <AsyncCombobox
                        value={form.doencaSecundariaId}
                        onChange={(v) => {
                          const label = doenca2Items.find((d) => d.value === v)?.label ?? ''
                          patch({ doencaSecundariaId: v, doencaSecundariaLabel: label })
                        }}
                        items={
                          form.doencaSecundariaLabel &&
                          !doenca2Items.some((i) => i.value === form.doencaSecundariaId)
                            ? [
                                {
                                  value: form.doencaSecundariaId,
                                  label: form.doencaSecundariaLabel,
                                },
                                ...doenca2Items,
                              ]
                            : doenca2Items
                        }
                        isLoading={doencas2Query.isFetching}
                        placeholder='Doença secundária...'
                        searchPlaceholder='Código ou título (min. 2 chars)...'
                        emptyText='Pesquise doença'
                        disabled={readOnly}
                        searchValue={doenca2Search}
                        onSearchValueChange={setDoenca2Search}
                        className='mt-1'
                      />
                    </div>
                  </div>
                </div>
                <FuncionarioFooter nome={funcionarioNome} />
              </TabsContent>

              <TabsContent
                value='registo-servicos'
                className='flex-1 overflow-y-auto py-4 data-[state=inactive]:hidden'
              >
                <div className='space-y-4'>
                  <div className='grid grid-cols-12 gap-3 rounded-md border p-3'>
                    <div className={`col-span-12 md:col-span-4 ${fieldGap}`}>
                      <Label className={labelClass}>Tipo serviço</Label>
                      <AsyncCombobox
                        value={form.tipoServicoRegistoId}
                        onChange={handleSelectTipoServico}
                        items={
                          form.tipoServicoRegistoId &&
                          form.tipoServicoRegistoLabel &&
                          !tipoServicoItems.some((i) => i.value === form.tipoServicoRegistoId)
                            ? [
                                {
                                  value: form.tipoServicoRegistoId,
                                  label: form.tipoServicoRegistoLabel,
                                },
                                ...tipoServicoItems,
                              ]
                            : tipoServicoItems
                        }
                        isLoading={tiposServicoQuery.isFetching}
                        placeholder='Tipo serviço...'
                        searchPlaceholder='Pesquisar tipo...'
                        emptyText='Sem tipos'
                        disabled={readOnly}
                        searchValue={tipoServicoSearch}
                        onSearchValueChange={setTipoServicoSearch}
                      />
                    </div>
                    <div className={`col-span-6 md:col-span-2 ${fieldGap}`}>
                      <Label className={labelClass}>Nº de linhas</Label>
                      <Input
                        className={inputClass}
                        disabled={readOnly}
                        value={form.numLinhasInserir}
                        onChange={(e) => patch({ numLinhasInserir: e.target.value })}
                      />
                    </div>
                    <div className='col-span-6 flex items-end md:col-span-2'>
                      <Button
                        type='button'
                        size='sm'
                        className='w-full'
                        disabled={readOnly}
                        onClick={openSubsistemasServicosList}
                      >
                        Serviços
                      </Button>
                    </div>
                    <div className={`col-span-6 md:col-span-4 ${fieldGap}`}>
                      <Label className={labelClass}>Nº documento</Label>
                      <Input
                        className={`${inputClass} bg-muted/40`}
                        readOnly
                        value={form.numDocumento}
                        placeholder='—'
                      />
                    </div>
                    <div className={`col-span-6 md:col-span-4 ${fieldGap}`}>
                      <Label className={labelClass}>Data recibo</Label>
                      <Input
                        className={`${inputClass} bg-muted/40`}
                        readOnly
                        value={form.dataRecibo}
                        placeholder='—'
                      />
                    </div>
                    <div className='col-span-12 flex flex-wrap gap-2 md:col-span-4 md:justify-end'>
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() => toast.info('Fatura recibo — fase 2 (faturação).')}
                      >
                        <Receipt className='mr-1.5 h-3.5 w-3.5' />
                        Fatura recibo
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() => toast.info('Reimprimir — fase 2.')}
                      >
                        <Printer className='mr-1.5 h-3.5 w-3.5' />
                        Reimprimir
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() => toast.info('Nota de crédito — fase 2.')}
                      >
                        Nota de crédito
                      </Button>
                    </div>
                  </div>

                  {!organismoEfetivo && form.utenteId ? (
                    <p className='text-sm text-amber-700'>
                      Selecione o organismo na aba «Dados do Utente» para carregar serviços com
                      preços do subsistema.
                    </p>
                  ) : null}

                  <div className='flex flex-wrap items-end justify-between gap-3 rounded-md border p-3'>
                    <div className={`min-w-[200px] flex-1 ${fieldGap}`}>
                      <Label className={labelClass}>Valor total (€)</Label>
                      <Input
                        className={`${inputClass} bg-muted/40 font-medium`}
                        readOnly
                        value={formatMoneyPt(valorTotal)}
                      />
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      <Button
                        type='button'
                        size='sm'
                        variant='emerald'
                        disabled={readOnly || !organismoEfetivo}
                        onClick={handleAddLinhas}
                      >
                        <Plus className='mr-1.5 h-3.5 w-3.5' />
                        Inserir
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant='destructive'
                        disabled={readOnly || !form.linhasServico.some((l) => l.selected)}
                        onClick={removeSelectedLinhas}
                      >
                        Remover
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        disabled={readOnly}
                        onClick={openServicoModal}
                      >
                        + Inserir linha
                      </Button>
                    </div>
                  </div>

                  <div className='max-h-[360px] overflow-auto rounded border'>
                    <table className='w-full min-w-[1100px] text-xs'>
                      <thead className='sticky top-0 z-[1] bg-muted/80'>
                        <tr>
                          <th className='w-8 px-1 py-1.5' />
                          <th className='px-1 py-1.5 text-left'>Cód.Serviço</th>
                          <th className='px-1 py-1.5 text-left'>Cód. Artigo</th>
                          <th className='px-1 py-1.5 text-left'>Descrição</th>
                          <th className='px-1 py-1.5 text-right'>Quant.</th>
                          <th className='px-1 py-1.5 text-right'>Valor Uni.</th>
                          <th className='px-1 py-1.5 text-right'>V. Org</th>
                          <th className='px-1 py-1.5 text-right'>Perc.</th>
                          <th className='px-1 py-1.5 text-right'>Val. Utente</th>
                          <th className='px-1 py-1.5 text-right'>Desc. Clinic</th>
                          <th className='px-1 py-1.5 text-left'>Nº Dente</th>
                          <th className='px-1 py-1.5 text-left'>Quadrante</th>
                          <th className='px-1 py-1.5 text-left'>Nº Cheque</th>
                          <th className='px-1 py-1.5 text-center'>Exame</th>
                          <th className='px-1 py-1.5 text-left'>Electro</th>
                          <th className='px-1 py-1.5 text-right'>Total</th>
                          <th className='px-1 py-1.5 text-right'>Opções</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.linhasServico.length === 0 ? (
                          <tr>
                            <td colSpan={17} className='px-2 py-6 text-center text-muted-foreground'>
                              Não existem dados a apresentar
                            </td>
                          </tr>
                        ) : (
                          form.linhasServico.map((linha) => (
                            <tr key={linha.id} className='border-t hover:bg-muted/20'>
                              <td className='px-1 py-1 text-center'>
                                <Checkbox
                                  disabled={readOnly}
                                  checked={linha.selected}
                                  onCheckedChange={(v) =>
                                    patch({
                                      linhasServico: form.linhasServico.map((l) =>
                                        l.id === linha.id ? { ...l, selected: Boolean(v) } : l
                                      ),
                                    })
                                  }
                                />
                              </td>
                              <td className='px-1 py-1'>{linha.codigoServico || '—'}</td>
                              <td className='px-1 py-1'>{linha.codigoArtigo || '—'}</td>
                              <td className='max-w-[120px] truncate px-1 py-1' title={linha.descricao}>
                                {linha.descricao || '—'}
                              </td>
                              <td className='px-1 py-1 text-right'>{linha.quantidade}</td>
                              <td className='px-1 py-1 text-right'>{linha.valorUnitario}</td>
                              <td className='px-1 py-1 text-right'>{linha.valorOrganismo}</td>
                              <td className='px-1 py-1 text-right'>{linha.percentagem}</td>
                              <td className='px-1 py-1 text-right'>{linha.valorUtente}</td>
                              <td className='px-1 py-1 text-right'>{linha.descClinica}</td>
                              <td className='px-1 py-1'>{linha.nrDente || '—'}</td>
                              <td className='px-1 py-1'>{linha.quadrante || '—'}</td>
                              <td className='px-1 py-1'>{linha.nrCheque || '—'}</td>
                              <td className='px-1 py-1 text-center'>{linha.exame ? '✓' : '—'}</td>
                              <td className='px-1 py-1'>{linha.electroDesc || '—'}</td>
                              <td className='px-1 py-1 text-right'>{linha.total}</td>
                              <td className='px-1 py-1 text-right'>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='sm'
                                  className='h-6 px-2'
                                  disabled={readOnly}
                                  onClick={() => {
                                    setEditingLinha(linha)
                                    setServicoModalOpen(true)
                                  }}
                                >
                                  Editar
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <FuncionarioFooter nome={funcionarioNome} />
                </div>
              </TabsContent>
        </Tabs>
      )}

      {!renderAsPage ? (
        <DialogFooter className='shrink-0 gap-2 border-t pt-3 sm:justify-end'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            {readOnly ? 'Fechar' : 'Cancelar'}
          </Button>
        </DialogFooter>
      ) : null}
    </>
  )

  return (
    <>
      {renderAsPage ? (
        <div className='space-y-4'>
          <div className='flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-md border bg-card p-4'>
            {content}
          </div>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className='flex max-h-[100vh] w-[96vw] flex-col overflow-hidden p-4 pt-3 sm:max-w-[96vw] 2xl:max-w-[min(98vw,1600px)] [&>button]:hidden'>
            {content}
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={obsModalOpen} onOpenChange={setObsModalOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Observações</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={8}
            disabled={readOnly}
            value={obsDraft}
            onChange={(e) => setObsDraft(e.target.value)}
          />
          <DialogFooter>
            <Button variant='outline' onClick={() => setObsModalOpen(false)}>
              Cancelar
            </Button>
            {!readOnly ? (
              <Button
                onClick={() => {
                  patch({ obs: obsDraft })
                  setObsModalOpen(false)
                }}
              >
                OK
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdmissaoServicoLinhaModal
        open={servicoModalOpen}
        onOpenChange={setServicoModalOpen}
        organismoId={organismoEfetivo}
        subsistemasPayload={subsistemasPayload}
        servicosLight={servicosLight}
        taxaModeradora={form.taxaModeradora}
        taxaModeradoraAtiva={form.taxaModeradoraAtiva}
        initialLinha={editingLinha}
        onConfirm={handleConfirmLinha}
      />

    </>
  )
}

