import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'
import { SinistradoService } from '@/lib/services/sinistrados/sinistrado-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { CodigosPostaisService } from '@/lib/services/base/codigospostais-service'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { SubsistemaServicoViewCreateModal } from '@/pages/area-comum/tabelas/consultas/servicos/subsistemas-servicos/modals/subsistema-servico-view-create-modal'
import type {
  SinistradoLinhaServicoDTO,
  SinistradoTableDTO,
} from '@/types/dtos/sinistrados/sinistrado.dtos'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import type { SubsistemaServicoTableDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'

type ModalMode = 'view' | 'create' | 'edit'
type TabKey = 'dados-sinistrado' | 'observacao-clinica' | 'faturacao'

function getAgeFromBirthDate(dateValue?: string | null): string {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  let age = today.getFullYear() - date.getFullYear()
  const monthDiff = today.getMonth() - date.getMonth()
  const dayDiff = today.getDate() - date.getDate()
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1
  return age >= 0 ? String(age) : ''
}

function getPrimaryAddress(utente: UtenteDTO): string {
  const rua = utente.rua?.nome?.trim() ?? ''
  const porta = utente.numeroPorta?.trim() ?? ''
  const andar = utente.andarRua?.trim() ?? ''
  return [rua, porta, andar].filter(Boolean).join(', ')
}

function looksLikeGuid(value?: string | null): boolean {
  if (!value) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  )
}

function getLegacyObservationHeader(date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `Utilizador - ${dd}/${mm}/${yyyy} ${hh}:${min}`
}

function parseLegacyHeaderDate(header: string): Date | null {
  const match = /^Utilizador\s*-\s*(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/i.exec(
    header.trim()
  )
  if (!match) return null
  const [, dd, mm, yyyy, hh, min] = match
  const date = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh),
    Number(min),
    0,
    0
  )
  return Number.isNaN(date.getTime()) ? null : date
}

function splitLatestEditableEntry(
  fullText: string,
  now = new Date()
): { historyText: string; editableText: string; editableHeader: string } {
  const trimmed = fullText.trim()
  if (!trimmed) {
    return { historyText: '', editableText: '', editableHeader: '' }
  }

  const sections = trimmed.split(/\n\s*\n/)
  if (sections.length < 2) {
    return { historyText: fullText, editableText: '', editableHeader: '' }
  }

  const header = sections[0]?.trim() ?? ''
  const content = sections[1]?.trim() ?? ''
  const createdAt = parseLegacyHeaderDate(header)
  if (!createdAt) {
    return { historyText: fullText, editableText: '', editableHeader: '' }
  }

  const ageMs = now.getTime() - createdAt.getTime()
  const within24h = ageMs >= 0 && ageMs <= 24 * 60 * 60 * 1000
  if (!within24h) {
    return { historyText: fullText, editableText: '', editableHeader: '' }
  }

  const remainder = sections.slice(2).join('\n\n').trim()
  return {
    historyText: remainder,
    editableText: content,
    editableHeader: header,
  }
}

export function SinistradoViewEditModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
  renderAsPage = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: SinistradoTableDTO | null
  onSuccess?: () => void
  renderAsPage?: boolean
}) {
  const queryClient = useQueryClient()
  const [codigoSinistro, setCodigoSinistro] = useState('')
  const [utenteId, setUtenteId] = useState('')
  const [estadoSinistroId, setEstadoSinistroId] = useState('')
  const [dataAcidente, setDataAcidente] = useState('')
  const [dataParticipacao, setDataParticipacao] = useState('')
  const [numeroProcesso, setNumeroProcesso] = useState('')
  const [enviadoPor, setEnviadoPor] = useState('')
  const [tipoAcidente, setTipoAcidente] = useState('')
  const [diagnostico, setDiagnostico] = useState('')
  const [responsabilidade, setResponsabilidade] = useState('')
  const [participacao, setParticipacao] = useState(false)
  const [termoResponsabilidade, setTermoResponsabilidade] = useState(false)
  const [idade, setIdade] = useState('')
  const [profissao, setProfissao] = useState('')
  const [telefone, setTelefone] = useState('')
  const [morada, setMorada] = useState('')
  const [estadoCivil, setEstadoCivil] = useState('')
  const [codPostal, setCodPostal] = useState('')
  const [localidade, setLocalidade] = useState('')
  const [telemovel, setTelemovel] = useState('')
  const [apolice, setApolice] = useState('')
  const [seguradora, setSeguradora] = useState('')
  const [dataPrimeiraObservacao, setDataPrimeiraObservacao] = useState('')
  const [internado, setInternado] = useState(false)
  const [rx, setRx] = useState(false)
  const [medicacao, setMedicacao] = useState(false)
  const [restricoes, setRestricoes] = useState('')
  const [resultado, setResultado] = useState('')
  const [tempoRecuperacao, setTempoRecuperacao] = useState('')
  const [recorrencia, setRecorrencia] = useState('')
  const [outro, setOutro] = useState('')
  const [lancado, setLancado] = useState('')
  const [estadoAtual, setEstadoAtual] = useState('')
  const [ipp, setIpp] = useState('')
  const [artigo, setArtigo] = useState('')
  const [dataUltimoTratamento, setDataUltimoTratamento] = useState('')
  const [dataAlta, setDataAlta] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [observacoesModalOpen, setObservacoesModalOpen] = useState(false)
  const [observacoesInput, setObservacoesInput] = useState('')
  const [observacoesHistoryView, setObservacoesHistoryView] = useState('')
  const [observacoesEditableHeader, setObservacoesEditableHeader] = useState('')
  const [relatorio, setRelatorio] = useState('')
  const [relatorioModalOpen, setRelatorioModalOpen] = useState(false)
  const [relatorioInput, setRelatorioInput] = useState('')
  const [relatorioHistoryView, setRelatorioHistoryView] = useState('')
  const [relatorioEditableHeader, setRelatorioEditableHeader] = useState('')
  const [subsistemasModalOpen, setSubsistemasModalOpen] = useState(false)
  const [subsistemaCrudOpen, setSubsistemaCrudOpen] = useState(false)
  const [subsistemaCrudMode, setSubsistemaCrudMode] = useState<'view' | 'create' | 'edit'>(
    'view'
  )
  const [selectedSubsistemaRow, setSelectedSubsistemaRow] =
    useState<SubsistemaServicoTableDTO | null>(null)
  const [linhasServico, setLinhasServico] = useState<SinistradoLinhaServicoDTO[]>([])
  const [activeTab, setActiveTab] = useState<TabKey>('dados-sinistrado')
  const [utenteSearch, setUtenteSearch] = useState('')
  const [utenteLabel, setUtenteLabel] = useState('')
  const isView = mode === 'view'

  const utentesLightQuery = useQuery({
    queryKey: ['sinistrados-modal', 'utentes-light', utenteSearch],
    queryFn: () => UtentesService('utentes').getUtentesLight(utenteSearch || undefined),
    enabled: open && !isView,
    staleTime: 30_000,
  })

  const utenteItems = useMemo(
    () =>
      (utentesLightQuery.data?.info?.data ?? []).map((u) => ({
        value: u.id,
        label: u.nome,
        secondary: u.numeroUtente ?? u.numeroContribuinte ?? undefined,
      })),
    [utentesLightQuery.data?.info?.data]
  )
  const canAddServicos = Boolean(apolice.trim())

  const subsistemasQuery = useQuery({
    queryKey: ['sinistrados-modal', 'subsistemas-servicos'],
    queryFn: () =>
      SubsistemaServicoService().getSubsistemaServicoPaginated({
        pageNumber: 1,
        pageSize: 100,
        sorting: [],
        filters: [{ id: 'inativo', value: '0' }],
      }),
    enabled: subsistemasModalOpen,
    staleTime: 30_000,
  })

  const servicosLightQuery = useQuery({
    queryKey: ['sinistrados-modal', 'servicos-light'],
    queryFn: () => ServicoService().getServicoLight(),
    enabled: subsistemasModalOpen,
    staleTime: 30_000,
  })

  const hydrateFromUtente = async (utente: UtenteDTO) => {
    const telefoneContacto =
      utente.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 1)?.valor ?? ''
    const telemovelContacto =
      utente.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 2)?.valor ?? ''
    const telefoneFallback = telefoneContacto || telemovelContacto || ''
    const telemovelFallback = telemovelContacto || telefoneContacto || ''
    const apoliceFromSubsistema = utente.subsistemaLinhas?.[0]?.numeroApolice ?? ''
    const utenteAny = utente as UtenteDTO & {
      codigoPostal?: { codigo?: string | null; localidade?: string | null } | null
    }
    let codigoPostalTexto =
      utenteAny.codigoPostal?.codigo?.trim() ||
      (!looksLikeGuid(utente.codigoPostalId) ? (utente.codigoPostalId ?? '') : '')

    if (!codigoPostalTexto && utente.codigoPostalId && looksLikeGuid(utente.codigoPostalId)) {
      try {
        const cpResponse = await CodigosPostaisService('utility').getCodigoPostal(
          utente.codigoPostalId
        )
        codigoPostalTexto = cpResponse.info.data?.codigo ?? ''
      } catch {
        // keep empty when postal code lookup fails
      }
    }
    const localidadeTexto =
      utenteAny.codigoPostal?.localidade?.trim() ||
      utente.freguesia?.nome ||
      utente.concelho?.nome ||
      ''
    setIdade(getAgeFromBirthDate(utente.dataNascimento))
    setProfissao(utente.profissao?.descricao ?? '')
    setTelefone(telefoneFallback)
    setTelemovel(telemovelFallback)
    setEstadoCivil(utente.estadoCivil?.descricao ?? '')
    setMorada(getPrimaryAddress(utente))
    setCodPostal(codigoPostalTexto)
    setLocalidade(localidadeTexto)
    setApolice(apoliceFromSubsistema)
    setSeguradora(utente.seguradora?.nome ?? '')
  }

  const handleSelectUtente = async (selectedUtenteId: string) => {
    setUtenteId(selectedUtenteId)
    const selected = utenteItems.find((u) => u.value === selectedUtenteId)
    setUtenteLabel(selected?.label ?? '')
    try {
      const response = await UtentesService('utentes').getUtente(selectedUtenteId)
      if (response.info.data) {
        await hydrateFromUtente(response.info.data)
        setUtenteLabel(response.info.data.nome ?? selected?.label ?? '')
      }
    } catch {
      toast.error('Não foi possível carregar os dados do utente selecionado.')
    }
  }

  const handleOpenSubsistemasModal = () => {
    if (!utenteId.trim()) {
      toast.error('Selecione primeiro o utente.')
      return
    }
    if (!canAddServicos) {
      toast.error('Só pode adicionar serviços quando o utente tiver nº de apólice.')
      return
    }
    setSubsistemasModalOpen(true)
  }

  const handleSelectSubsistemaServico = (row: SubsistemaServicoTableDTO) => {
    const servicoId = row.servicoId ?? ''
    const servicoLabel =
      servicosLightQuery.data?.info?.data?.find((s) => s.id === servicoId)?.designacao ??
      servicoId
    setLinhasServico((prev) => [
      ...prev,
      {
        codigoServico: servicoId,
        designacaoServico: servicoLabel,
        quantidade: 1,
        valorServico: Number(row.valorServico ?? 0),
        valorContratado: Number(row.valorUtente ?? 0),
      },
    ])
    setSubsistemasModalOpen(false)
    toast.success('Serviço inserido no sinistrado.')
  }

  const handleOpenSubsistemaCrud = (
    mode: 'view' | 'create' | 'edit',
    row: SubsistemaServicoTableDTO | null = null
  ) => {
    setSelectedSubsistemaRow(row)
    setSubsistemaCrudMode(mode)
    setSubsistemaCrudOpen(true)
  }

  const handleLoadConsultasTratamentos = async () => {
    if (!utenteId.trim()) {
      toast.error('Selecione primeiro o utente.')
      return
    }

    try {
      const response =
        await SinistradoService().getUnbilledServicesByUtenteId(utenteId.trim())
      const linhas = response.info.data ?? []

      if (linhas.length === 0) {
        toast.info('Sem consultas/tratamentos para o utente selecionado.')
        return
      }

      setLinhasServico((prev) => {
        const merged = [...prev]
        for (const linha of linhas) {
          const exists = merged.some(
            (p) =>
              p.codigoServico === linha.codigoServico &&
              (p.tratamentoId ?? '') === (linha.tratamentoId ?? '') &&
              (p.admissaoId ?? '') === (linha.admissaoId ?? '')
          )
          if (!exists) {
            merged.push(linha)
          }
        }
        return merged
      })
      toast.success('Consultas e tratamentos carregados para faturação.')
    } catch {
      toast.error('Não foi possível carregar consultas e tratamentos do utente.')
    }
  }

  useEffect(() => {
    if (!open) return
    if (mode === 'create') {
      setCodigoSinistro('')
      setUtenteId('')
      setEstadoSinistroId('')
      setDataAcidente('')
      setDataParticipacao('')
      setNumeroProcesso('')
      setEnviadoPor('')
      setTipoAcidente('')
      setDiagnostico('')
      setResponsabilidade('')
      setParticipacao(false)
      setTermoResponsabilidade(false)
      setIdade('')
      setProfissao('')
      setTelefone('')
      setMorada('')
      setEstadoCivil('')
      setCodPostal('')
      setLocalidade('')
      setTelemovel('')
      setApolice('')
      setSeguradora('')
      setDataPrimeiraObservacao('')
      setInternado(false)
      setRx(false)
      setMedicacao(false)
      setRestricoes('')
      setResultado('')
      setTempoRecuperacao('')
      setRecorrencia('')
      setOutro('')
      setLancado('')
      setEstadoAtual('')
      setIpp('')
      setArtigo('')
      setDataUltimoTratamento('')
      setDataAlta('')
      setObservacoes('')
      setRelatorio('')
      setLinhasServico([])
      setActiveTab('dados-sinistrado')
      setUtenteSearch('')
      setUtenteLabel('')
      return
    }

    setCodigoSinistro(viewData?.codigoSinistro ?? '')
    setUtenteId(viewData?.utenteId ?? '')
    setDataAcidente(viewData?.dataAcidente?.slice(0, 10) ?? '')

    if (viewData?.id) {
      SinistradoService()
        .getById(viewData.id)
        .then((response) => {
          const dto = response.info.data
          if (!dto) return
          setEstadoSinistroId(dto.estadoSinistroId ?? '')
          setDataAcidente(dto.dataAcidente?.slice(0, 10) ?? '')
          setDataParticipacao(dto.dataParticipacao?.slice(0, 10) ?? '')
          setNumeroProcesso(dto.numeroProcesso ?? '')
          setObservacoes(dto.observacoes ?? '')
          setRelatorio(dto.relatorio ?? '')
          setLinhasServico(dto.linhasServico ?? [])
        })
        .catch(() => {
          // keep defaults when hydrate fails
        })
    }
  }, [open, mode, viewData])

  useEffect(() => {
    if (!open || !utenteId) return
    if (mode === 'create') return
    void (async () => {
      try {
        const response = await UtentesService('utentes').getUtente(utenteId)
        if (response.info.data) {
          await hydrateFromUtente(response.info.data)
          setUtenteLabel(response.info.data.nome ?? '')
        }
      } catch {
        // keep current values if utente hydrate fails
      }
    })()
  }, [open, utenteId, mode])

  const handleSave = async () => {
    if (isView) return
    if (!codigoSinistro.trim() || !utenteId.trim()) {
      toast.error('Código de sinistro e utente são obrigatórios.')
      return
    }

    const service = SinistradoService()
    const payload = {
      utenteId: utenteId.trim(),
      estadoSinistroId: estadoSinistroId.trim() || undefined,
      dataAcidente: dataAcidente || undefined,
      dataParticipacao: dataParticipacao || undefined,
      numeroProcesso: numeroProcesso.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
      relatorio: relatorio.trim() || undefined,
      linhasServico,
    }

    const response =
      mode === 'edit' && viewData?.id
        ? await service.update(viewData.id, payload)
        : await service.create({
            ...payload,
            codigoSinistro: codigoSinistro.trim(),
          })

    if (response.info.status === ResponseStatus.Success) {
      toast.success(mode === 'edit' ? 'Sinistrado atualizado.' : 'Sinistrado criado.')
      onOpenChange(false)
      onSuccess?.()
    } else {
      toast.error(response.info.messages?.['$']?.[0] ?? 'Falha ao guardar sinistrado.')
    }
  }

  const handleOpenRelatorioModal = () => {
    const split = splitLatestEditableEntry(relatorio)
    setRelatorioHistoryView(split.historyText)
    setRelatorioInput(split.editableText)
    setRelatorioEditableHeader(split.editableHeader)
    setRelatorioModalOpen(true)
  }

  const handleOpenObservacoesModal = () => {
    const split = splitLatestEditableEntry(observacoes)
    setObservacoesHistoryView(split.historyText)
    setObservacoesInput(split.editableText)
    setObservacoesEditableHeader(split.editableHeader)
    setObservacoesModalOpen(true)
  }

  const handleConfirmObservacoes = () => {
    if (!observacoesInput.trim()) {
      setObservacoesModalOpen(false)
      return
    }
    const merged = [
      observacoesEditableHeader || getLegacyObservationHeader(),
      observacoesInput.trim(),
      observacoesHistoryView.trim(),
    ]
      .filter(Boolean)
      .join('\n\n')
    setObservacoes(merged)
    setObservacoesInput('')
    setObservacoesModalOpen(false)
  }

  const handleConfirmRelatorio = () => {
    if (!relatorioInput.trim()) {
      setRelatorioModalOpen(false)
      return
    }
    const merged = [
      relatorioEditableHeader || getLegacyObservationHeader(),
      relatorioInput.trim(),
      relatorioHistoryView.trim(),
    ]
      .filter(Boolean)
      .join('\n\n')
    setRelatorio(merged)
    setRelatorioInput('')
    setRelatorioModalOpen(false)
  }

  const handlePrintRelatorio = () => {
    const printSource = relatorio.trim() || relatorioInput.trim()
    if (!printSource) {
      toast.error('Sem conteúdo para imprimir no relatório.')
      return
    }
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) {
      toast.error('Não foi possível abrir a janela de impressão.')
      return
    }
    const escaped = printSource
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br />')
    printWindow.document.write(
      `<html><head><title>Relatório Médico</title></head><body><h2>Relatório Médico</h2><div>${escaped}</div></body></html>`
    )
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const handlePrintObservacoes = () => {
    const printSource = observacoes.trim() || observacoesInput.trim()
    if (!printSource) {
      toast.error('Sem conteúdo para imprimir nas observações.')
      return
    }
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) {
      toast.error('Não foi possível abrir a janela de impressão.')
      return
    }
    const escaped = printSource
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br />')
    printWindow.document.write(
      `<html><head><title>Observações</title></head><body><h2>Observações</h2><div>${escaped}</div></body></html>`
    )
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const content = (
    <>
        <div className='sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background/95 pb-2 pt-1 backdrop-blur'>
          <div className='space-y-0 text-left'>
            <h2 className='flex items-center gap-2 text-lg leading-tight font-semibold'>
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
              <span>
                {mode === 'create'
                  ? 'Adicionar Sinistrado'
                  : mode === 'edit'
                    ? 'Editar Sinistrado'
                    : 'Sinistrado'}
              </span>
            </h2>
            <p className='sr-only'>Ver ou editar sinistrado.</p>
          </div>
          <div className='flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='secondary'
              size='sm'
              className='bg-slate-800 text-white shadow-sm hover:bg-slate-700'
              onClick={handleOpenObservacoesModal}
            >
            Observações
            </Button>
            <Button type='button' variant='outline' size='sm'>
              Listagens
            </Button>
            {!isView ? (
              <Button type='button' variant='destructive' size='sm' onClick={handleSave}>
                Guardar
              </Button>
            ) : null}
          </div>
        </div>

        <div className='rounded-md border p-3'>
          <h4 className='mb-3 text-sm font-semibold'>Dados do Acidente</h4>
          <div className='grid grid-cols-12 gap-3'>
            <div className='col-span-2 space-y-1.5'>
              <Label>Nº Sinistrado</Label>
              <Input disabled={isView || mode === 'edit'} value={codigoSinistro} onChange={(e) => setCodigoSinistro(e.target.value)} placeholder='Nº sinistrado' />
            </div>
            <div className='col-span-2 space-y-1.5'>
              <Label>Data Acidente</Label>
              <Input disabled={isView} type='date' value={dataAcidente} onChange={(e) => setDataAcidente(e.target.value)} />
            </div>
            <div className='col-span-2 space-y-1.5'>
              <Label>Data Participação</Label>
              <Input disabled={isView} type='date' value={dataParticipacao} onChange={(e) => setDataParticipacao(e.target.value)} />
            </div>
            <div className='col-span-3 space-y-1.5'>
              <Label>Cód. Tipo Acidente</Label>
              <Input disabled={isView} value={tipoAcidente} onChange={(e) => setTipoAcidente(e.target.value)} placeholder='Cód. Tipo Acidente...' />
            </div>
            <div className='col-span-3 space-y-1.5'>
              <Label>Cód. Diagnóstico</Label>
              <Input disabled={isView} value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} placeholder='Cód. Diagnóstico...' />
            </div>
            <div className='col-span-4 space-y-1.5'>
              <Label>Enviado Por</Label>
              <Input disabled={isView} value={enviadoPor} onChange={(e) => setEnviadoPor(e.target.value)} placeholder='Enviado por...' />
            </div>
            <div className='col-span-2 space-y-1.5'>
              <Label>Nº Processo</Label>
              <Input disabled={isView} value={numeroProcesso} onChange={(e) => setNumeroProcesso(e.target.value)} placeholder='Nº processo' />
            </div>
            <div className='col-span-3 space-y-1.5'>
              <Label>Cód. Responsabilidade</Label>
              <Input disabled={isView} value={responsabilidade} onChange={(e) => setResponsabilidade(e.target.value)} placeholder='Cód. Responsabilidade...' />
            </div>
            <div className='col-span-3 flex items-center gap-6 pt-1'>
              <div className='flex items-center gap-2'>
                <Checkbox disabled={isView} checked={participacao} onCheckedChange={(v) => setParticipacao(Boolean(v))} />
                <Label>Participação</Label>
              </div>
              <div className='flex items-center gap-2'>
                <Checkbox disabled={isView} checked={termoResponsabilidade} onCheckedChange={(v) => setTermoResponsabilidade(Boolean(v))} />
                <Label>Termo de Responsabilidade</Label>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className='flex-1 min-h-0 flex flex-col overflow-hidden pt-1'>
          <TabsList>
            <TabsTrigger value='dados-sinistrado'>Dados do Sinistrado</TabsTrigger>
            <TabsTrigger value='observacao-clinica'>Dados da Observação Clínica</TabsTrigger>
            <TabsTrigger value='faturacao'>Faturação</TabsTrigger>
          </TabsList>

          <TabsContent value='dados-sinistrado' className='flex-1 overflow-y-auto py-3'>
            <div className='rounded-md border p-3'>
              <h4 className='mb-3 text-sm font-semibold'>Dados do Sinistrado</h4>
              <div className='grid grid-cols-12 gap-3'>
                <div className='col-span-6 space-y-1.5'>
                  <Label>Sinistrado/Utente</Label>
                  <AsyncCombobox
                    value={utenteId}
                    onChange={handleSelectUtente}
                    items={
                      utenteLabel && !utenteItems.some((i) => i.value === utenteId)
                        ? [{ value: utenteId, label: utenteLabel }, ...utenteItems]
                        : utenteItems
                    }
                    isLoading={utentesLightQuery.isFetching}
                    placeholder={utenteLabel || 'Sinistrado/Utente...'}
                    searchPlaceholder='Pesquisar utente...'
                    emptyText='Sem utentes'
                    disabled={isView}
                    searchValue={utenteSearch}
                    onSearchValueChange={setUtenteSearch}
                  />
                </div>
                <div className='col-span-2 space-y-1.5'><Label>Idade</Label><Input disabled value={idade} onChange={(e) => setIdade(e.target.value)} /></div>
                <div className='col-span-4 space-y-1.5'><Label>Profissão</Label><Input disabled value={profissao} onChange={(e) => setProfissao(e.target.value)} /></div>
                <div className='col-span-2 space-y-1.5'><Label>Telefone</Label><Input disabled value={telefone} onChange={(e) => setTelefone(e.target.value)} /></div>
                <div className='col-span-6 space-y-1.5'><Label>Morada</Label><Input disabled value={morada} onChange={(e) => setMorada(e.target.value)} /></div>
                <div className='col-span-2 space-y-1.5'><Label>Estado Civil</Label><Input disabled value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} /></div>
                <div className='col-span-4 space-y-1.5'><Label>Cód. Postal</Label><Input disabled value={codPostal} onChange={(e) => setCodPostal(e.target.value)} /></div>
                <div className='col-span-6 space-y-1.5'><Label>Localidade</Label><Input disabled value={localidade} onChange={(e) => setLocalidade(e.target.value)} /></div>
                <div className='col-span-2 space-y-1.5'><Label>Telemóvel</Label><Input disabled value={telemovel} onChange={(e) => setTelemovel(e.target.value)} /></div>
                <div className='col-span-4 space-y-1.5'><Label>Nº Apólice</Label><Input disabled value={apolice} onChange={(e) => setApolice(e.target.value)} /></div>
                <div className='col-span-8 space-y-1.5'><Label>Seguradora</Label><Input disabled value={seguradora} onChange={(e) => setSeguradora(e.target.value)} /></div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='observacao-clinica' className='flex-1 overflow-y-auto py-3'>
            <div className='grid grid-cols-12 gap-3'>
              <div className='col-span-6 rounded-md border p-3'>
                <h4 className='mb-3 text-sm font-semibold'>Dados da Observação Clínica</h4>
                <div className='grid grid-cols-12 gap-3'>
                  <div className='col-span-4 space-y-1.5'><Label>Data Primeira Observação</Label><Input disabled={isView} type='date' value={dataPrimeiraObservacao} onChange={(e) => setDataPrimeiraObservacao(e.target.value)} /></div>
                  <div className='col-span-8 flex items-end gap-4 pb-1'>
                    <div className='flex items-center gap-2'><Checkbox disabled={isView} checked={internado} onCheckedChange={(v) => setInternado(Boolean(v))} /><Label>Internado</Label></div>
                    <div className='flex items-center gap-2'><Checkbox disabled={isView} checked={rx} onCheckedChange={(v) => setRx(Boolean(v))} /><Label>RX</Label></div>
                    <div className='flex items-center gap-2'><Checkbox disabled={isView} checked={medicacao} onCheckedChange={(v) => setMedicacao(Boolean(v))} /><Label>Medicação</Label></div>
                  </div>
                  <div className='col-span-12 space-y-1'><Label>Restrições</Label><Textarea className='min-h-[100px]' disabled={isView} value={restricoes} onChange={(e) => setRestricoes(e.target.value)} /></div>
                  <div className='col-span-12 space-y-1.5'><Label>Resultado</Label><Input disabled={isView} value={resultado} onChange={(e) => setResultado(e.target.value)} /></div>
                  <div className='col-span-6 space-y-1.5'><Label>Tempo de Recuperação Previsto (Dias)</Label><Input disabled={isView} value={tempoRecuperacao} onChange={(e) => setTempoRecuperacao(e.target.value)} /></div>
                  <div className='col-span-6 flex items-end justify-center gap-4'>
                    <Button
                      type='button'
                      variant='secondary'
                      size='lg'
                      className='bg-slate-800 text-white shadow-sm hover:bg-slate-700'
                      onClick={handleOpenRelatorioModal}
                    >
                      Relatório Médico
                    </Button>
                    <Button type='button' variant='default' size='lg'>Incapacidades</Button>
                  </div>
                </div>
              </div>
              <div className='col-span-6 rounded-md border p-2'>
                <h4 className='mb-2 text-sm font-semibold'>Outras Informações</h4>
                <div className='grid grid-cols-12 gap-2'>
                  <div className='col-span-6 space-y-1'><Label>Recorreu</Label><Input disabled={isView} value={recorrencia} onChange={(e) => setRecorrencia(e.target.value)} /></div>
                  <div className='col-span-6 space-y-1'><Label>Outro</Label><Input disabled={isView} value={outro} onChange={(e) => setOutro(e.target.value)} /></div>
                  <div className='col-span-6 space-y-1'><Label>Lançado</Label><Input disabled={isView} value={lancado} onChange={(e) => setLancado(e.target.value)} /></div>
                  <div className='col-span-6 space-y-1'><Label>Cód. Estado</Label><Input disabled={isView} value={estadoSinistroId} onChange={(e) => setEstadoSinistroId(e.target.value)} placeholder='Estado (GUID)' /></div>
                  <div className='col-span-12 space-y-1'><Label>Estado Atual</Label><Input disabled={isView} value={estadoAtual} onChange={(e) => setEstadoAtual(e.target.value)} /></div>
                  <div className='col-span-6 space-y-1'><Label>Incapacidade Permanente Parcial %</Label><Input disabled={isView} value={ipp} onChange={(e) => setIpp(e.target.value)} /></div>
                  <div className='col-span-6 space-y-1'><Label>Artigo</Label><Input disabled={isView} value={artigo} onChange={(e) => setArtigo(e.target.value)} /></div>
                  <div className='col-span-6 space-y-1'><Label>Data do Último Tratamento</Label><Input disabled={isView} type='date' value={dataUltimoTratamento} onChange={(e) => setDataUltimoTratamento(e.target.value)} /></div>
                  <div className='col-span-6 space-y-1'><Label>Data Alta</Label><Input disabled={isView} type='date' value={dataAlta} onChange={(e) => setDataAlta(e.target.value)} /></div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='faturacao' className='flex-1 overflow-y-auto py-3'>
            <div className='rounded-md border p-3'>
              {utenteId.trim() && !canAddServicos ? (
                <div className='mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                  O utente selecionado não tem número de apólice preenchido. Pode carregar
                  consultas/tratamentos do histórico, mas a inserção manual de serviços fica
                  indisponível sem nº de apólice.
                </div>
              ) : null}
              <div className='mb-3 flex items-center justify-end gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={isView}
                  onClick={handleLoadConsultasTratamentos}
                >
                  Consultas e/ou Tratamentos
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  disabled={isView || !canAddServicos}
                  onClick={handleOpenSubsistemasModal}
                >
                  Inserir
                </Button>
                <Button type='button' variant='outline' size='sm' disabled={isView || linhasServico.length === 0} onClick={() => setLinhasServico((prev) => prev.slice(0, -1))}>Remover</Button>
              </div>
              <div className='max-h-64 overflow-auto rounded border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/40'>
                    <tr>
                      <th className='px-2 py-1 text-left'>Cód. Serviço</th><th className='px-2 py-1 text-left'>Designação</th><th className='px-2 py-1 text-left'>Quantidade</th><th className='px-2 py-1 text-left'>Valor Serviço</th><th className='px-2 py-1 text-left'>Valor Contratado</th><th className='px-2 py-1 text-left'>Data</th><th className='px-2 py-1 text-left'>Nº Fatura</th><th className='px-2 py-1 text-left'>Dt. da Fatura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhasServico.length === 0 ? (
                      <tr><td className='px-2 py-2 text-muted-foreground' colSpan={8}>Sem linhas de serviço.</td></tr>
                    ) : (
                      linhasServico.map((linha, index) => (
                        <tr key={linha.id ?? `linha-${index}`} className='border-t'>
                          <td className='px-2 py-1'>{linha.codigoServico || '-'}</td><td className='px-2 py-1'>{linha.designacaoServico || '-'}</td><td className='px-2 py-1'>{linha.quantidade ?? 0}</td><td className='px-2 py-1'>{linha.valorServico ?? 0}</td><td className='px-2 py-1'>{linha.valorContratado ?? 0}</td><td className='px-2 py-1'>{linha.dataServico?.slice(0, 10) || '-'}</td><td className='px-2 py-1'>{linha.numeroTFatura || 'Não faturado'}</td><td className='px-2 py-1'>{linha.dataFatura?.slice(0, 10) || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className='mt-3 rounded-md border p-3'>
              <div className='flex justify-end'>
                <div className='w-72 space-y-1.5'>
                  <Label>Valor Faturação</Label>
                  <Input disabled value={linhasServico.reduce((acc, l) => acc + Number(l.valorContratado ?? 0), 0).toFixed(2)} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={subsistemasModalOpen} onOpenChange={setSubsistemasModalOpen}>
          <DialogContent className='w-[92vw] sm:max-w-6xl'>
            <DialogHeader>
              <DialogTitle>Subsistemas de Serviços</DialogTitle>
            </DialogHeader>
            <div className='space-y-3'>
              <div className='flex items-center justify-end gap-2'>
                <Button type='button' variant='outline' onClick={() => handleOpenSubsistemaCrud('create', null)}>
                  Adicionar
                </Button>
              </div>
              <div className='max-h-[420px] overflow-auto rounded border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/40'>
                    <tr>
                      <th className='px-2 py-1 text-left'>Serviço</th>
                      <th className='px-2 py-1 text-left'>Val. Serviço</th>
                      <th className='px-2 py-1 text-left'>Val. Utente</th>
                      <th className='px-2 py-1 text-left'>Estado</th>
                      <th className='px-2 py-1 text-right'>Opções</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(subsistemasQuery.data?.info?.data ?? []).map((row) => {
                      const servicoNome =
                        servicosLightQuery.data?.info?.data?.find((s) => s.id === row.servicoId)
                          ?.designacao ?? row.servicoId
                      return (
                        <tr key={row.id} className='border-t'>
                          <td className='px-2 py-1'>{servicoNome}</td>
                          <td className='px-2 py-1'>{Number(row.valorServico ?? 0).toFixed(2)}</td>
                          <td className='px-2 py-1'>{Number(row.valorUtente ?? 0).toFixed(2)}</td>
                          <td className='px-2 py-1'>{row.inativo ? 'Inativo' : 'Ativo'}</td>
                          <td className='px-2 py-1'>
                            <div className='flex justify-end gap-1'>
                              <Button type='button' size='sm' variant='outline' onClick={() => handleOpenSubsistemaCrud('view', row)}>
                                Ver
                              </Button>
                              <Button type='button' size='sm' variant='outline' onClick={() => handleOpenSubsistemaCrud('edit', row)}>
                                Editar
                              </Button>
                              <Button type='button' size='sm' onClick={() => handleSelectSubsistemaServico(row)}>
                                Selecionar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setSubsistemasModalOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <SubsistemaServicoViewCreateModal
          open={subsistemaCrudOpen}
          onOpenChange={setSubsistemaCrudOpen}
          mode={subsistemaCrudMode}
          viewData={selectedSubsistemaRow}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['sinistrados-modal', 'subsistemas-servicos'] })
          }}
        />

        <Dialog open={relatorioModalOpen} onOpenChange={setRelatorioModalOpen}>
          <DialogContent className='sm:max-w-4xl'>
            <DialogHeader>
              <DialogTitle>Relatório Médico</DialogTitle>
            </DialogHeader>
            <div className='space-y-3'>
              <Textarea
                className='min-h-[220px]'
                value={relatorioHistoryView}
                readOnly
                placeholder='Sem histórico de relatório médico.'
              />
              <Textarea
                className='min-h-[220px]'
                value={relatorioInput}
                onChange={(e) => setRelatorioInput(e.target.value)}
                placeholder='Relatório Médico...'
                disabled={isView}
              />
            </div>
            <DialogFooter>
              {!isView ? (
                <Button type='button' onClick={handleConfirmRelatorio}>
                  OK
                </Button>
              ) : null}
              <Button type='button' variant='outline' onClick={() => setRelatorioModalOpen(false)}>
                Cancelar
              </Button>
              <Button type='button' variant='secondary' onClick={handlePrintRelatorio}>
                Imprimir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={observacoesModalOpen} onOpenChange={setObservacoesModalOpen}>
          <DialogContent className='sm:max-w-4xl'>
            <DialogHeader>
              <DialogTitle>Observações</DialogTitle>
            </DialogHeader>
            <div className='space-y-3'>
              <Textarea
                className='min-h-[220px]'
                value={observacoesHistoryView}
                readOnly
                placeholder='Sem histórico de observações.'
              />
              <Textarea
                className='min-h-[220px]'
                value={observacoesInput}
                onChange={(e) => setObservacoesInput(e.target.value)}
                placeholder='Observações...'
                disabled={isView}
              />
            </div>
            <DialogFooter>
              {!isView ? (
                <Button type='button' onClick={handleConfirmObservacoes}>
                  OK
                </Button>
              ) : null}
              <Button type='button' variant='outline' onClick={() => setObservacoesModalOpen(false)}>
                Cancelar
              </Button>
              <Button type='button' variant='secondary' onClick={handlePrintObservacoes}>
                Imprimir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {isView ? 'Fechar' : 'Cancelar'}
          </Button>
        </DialogFooter>
    </>
  )

  if (renderAsPage) {
    return (
      <div className='space-y-4'>
        <div className='rounded-md border bg-card p-4'>
          {content}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[96vw] sm:max-w-[96vw] 2xl:max-w-[1600px] max-h-[100vh] overflow-hidden flex flex-col p-4 pt-3 [&>button]:hidden'>
        {content}
      </DialogContent>
    </Dialog>
  )
}
