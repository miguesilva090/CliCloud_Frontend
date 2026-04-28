import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { CalendarIcon, PlusCircle, FileText, History, ChevronDown, ChevronUp, Search, Pencil } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useCreateTratamento, useGetTratamentosByUtente } from '../queries/tratamentos-queries'
import {
  useLocaisTratamentoLight,
  useMedicosLight,
  useOrganismosLight,
  usePatologiasLight,
  usePeriocidadesTratamentoLight,
  usePrioridadesLight,
} from '../utils/tratamentos-lookups'
import type { ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import type { SubsistemaServicoDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { ServicoViewCreateModal } from '@/pages/area-comum/tabelas/consultas/servicos/servicos/modals/servico-view-create-modal'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import state from '@/states/state'
import { useGetEvolucaoTratamentoPaginated } from '../queries/evolucao-tratamento-queries'
import type {
  EvolucaoTratamentoTableDTO,
  EvolucaoTratamentoReportDTO,
} from '@/types/dtos/tratamentos/evolucao-tratamento.dtos'
import { EvolucaoTratamentoService } from '@/lib/services/tratamentos/evolucao-tratamento-service'
import { toast } from '@/utils/toast-utils'
import { navigateManagedWindow } from '@/utils/window-utils'
import { TratamentoService } from '@/lib/services/tratamentos/tratamento-service'
import { useGetHistoriasClinicasPaginated } from '@/pages/area-clinica/processo-clinico/tabelas/historia-clinica/queries/historia-clinica-queries'
import type {
  CreateHistoriaClinicaRequest,
  HistoriaClinicaTableDTO,
  UpdateHistoriaClinicaRequest,
} from '@/types/dtos/saude/historia-clinica.dtos'
import { HistoriaClinicaService } from '@/lib/services/historia-clinica/historia-clinica-service'
import { useGetUtente } from '@/pages/utentes/queries/utentes-queries'
import type { GSResponse } from '@/types/api/responses'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

type TratamentosTabProps = {
  utenteId: string
  isActive?: boolean
}

type DraftServicoTratamento = {
  id: string
  descricao: string
  quantidade: number
  valorUtente?: number | null
}

export function TratamentosTab({ utenteId, isActive = true }: TratamentosTabProps) {
  const fichaClinicaPermissionId = modules.areaClinica.permissions.fichaClinica.id
  const { canView, canAdd, canChange } =
    useAreaComumEntityListPermissions(fichaClinicaPermissionId)
  const navigate = useNavigate()
  const [novoOpen, setNovoOpen] = useState(false)
  const [data, setData] = useState<Date | null>(null)
  const [numSessoes, setNumSessoes] = useState<string>('1')
  const [patologia, setPatologia] = useState<string>('')
  const [obs, setObs] = useState<string>('')
  const [prioridade, setPrioridade] = useState<string>('')
  const [periodicidade, setPeriodicidade] = useState<string>('')
  const [organismo, setOrganismo] = useState<string>('')
  const [localTratamento, setLocalTratamento] = useState<string>('')
  const [medico, setMedico] = useState<string>('')
  const [especificacaoTecnica, setEspecificacaoTecnica] = useState<string>('')
  const [sendEmail, setSendEmail] = useState<boolean>(false)

  const { data: tratamentos = [], isLoading, isError } = useGetTratamentosByUtente(utenteId)
  const createMutation = useCreateTratamento(utenteId)

  const { data: organismos = [] } = useOrganismosLight()
  const { data: prioridades = [] } = usePrioridadesLight()
  const { data: patologias = [] } = usePatologiasLight()
  const { data: medicos = [] } = useMedicosLight()
  const { data: locaisTratamento = [] } = useLocaisTratamentoLight()
  const { data: periocidades = [] } = usePeriocidadesTratamentoLight()

  const [draftServicos, setDraftServicos] = useState<DraftServicoTratamento[]>([])
  const [servicoModalOpen, setServicoModalOpen] = useState(false)
  const [servicoSearchModal, setServicoSearchModal] = useState('')
  const [_servicoSelecionadoModal, setServicoSelecionadoModal] = useState<ServicoLightDTO | null>(
    null,
  )
  // Estados usados no modal de seleção de serviços (podem ser expandidos futuramente).
  const [_quantidadeServicoModal, setQuantidadeServicoModal] = useState('1')
  const [_valorUtenteServicoModal, setValorUtenteServicoModal] = useState('')
  const [selectedServicosIds, setSelectedServicosIds] = useState<string[]>([])
  const [novoServicoModalOpen, setNovoServicoModalOpen] = useState(false)

  const [selectedSubsistemaIds, setSelectedSubsistemaIds] = useState<string[]>([])

  const queryClient = useQueryClient()
  const userId = state.UserId ?? null
  // Dados do utente (para obter médico por omissão, tal como na aba principal de História Clínica)
  const utenteQuery = useGetUtente(utenteId)
  const utente = utenteQuery.data?.info?.data as { medicoId?: string | null } | undefined
  const medicoIdFromUtente = utente?.medicoId ?? null
  const medicoIdHistoria = medicoIdFromUtente ?? (state.UserId || null)

  // História clínica para o bloco dentro da aba Tratamentos
  const {
    data: historiaResumoData,
    isLoading: isLoadingHistoriaResumo,
    isError: isErrorHistoriaResumo,
    error: errorHistoriaResumo,
  } = useGetHistoriasClinicasPaginated(
    1,
    50,
    utenteId ? [{ id: 'utenteId', value: utenteId }] : [],
    [],
  )

  const historiasResumo = (historiaResumoData?.info?.data ?? []) as HistoriaClinicaTableDTO[]
  const errorHistoriaResumoMessage =
    errorHistoriaResumo instanceof Error
      ? errorHistoriaResumo.message
      : errorHistoriaResumo
        ? String(errorHistoriaResumo)
        : ''

  // Texto editável da História Clínica (última entrada até 24h, ou nova)
  const [obsHistoria, setObsHistoria] = useState('')
  const [editingHistoriaId, setEditingHistoriaId] = useState<string | null>(null)
  const [hasHistoriaChanges, setHasHistoriaChanges] = useState(false)

  // Limpar estado quando muda o utente
  useEffect(() => {
    setObsHistoria('')
    setEditingHistoriaId(null)
    setHasHistoriaChanges(false)
  }, [utenteId])

  // Determinar última entrada dentro de 24h (mesma regra da aba principal)
  const deletableHistoryIdResumo = useMemo(() => {
    if (!historiasResumo.length) return null
    const sorted = [...historiasResumo].sort((a, b) => {
      const da = new Date(a.createdOn).getTime()
      const db = new Date(b.createdOn).getTime()
      return db - da
    })
    const last = sorted[0]
    if (!last) return null
    const created = new Date(last.createdOn)
    const now = new Date()
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
    return diffHours <= 24 ? last.id : null
  }, [historiasResumo])

  const editableHistoryResumo = useMemo(
    () =>
      deletableHistoryIdResumo
        ? historiasResumo.find((h) => h.id === deletableHistoryIdResumo) ?? null
        : null,
    [deletableHistoryIdResumo, historiasResumo],
  )

  // Pré-preencher texto com a entrada editável quando existir.
  // Sempre que o último registo (dentro de 24h) mudar – seja gravado nesta aba
  // ou na aba principal de História Clínica – sincronizamos a caixa de texto
  // com esse conteúdo, tal como no legado.
  useEffect(() => {
    if (editableHistoryResumo) {
      setEditingHistoriaId(editableHistoryResumo.id)
      setObsHistoria(editableHistoryResumo.obs ?? '')
      setHasHistoriaChanges(false)
    } else {
      setEditingHistoriaId(null)
      setObsHistoria('')
      setHasHistoriaChanges(false)
    }
  }, [editableHistoryResumo])

  const createHistoriaMutation = useMutation({
    mutationFn: async (payload: CreateHistoriaClinicaRequest) => {
      return HistoriaClinicaService('historia-clinica').create(payload)
    },
    onSuccess: async () => {
      toast.success('História clínica guardada com sucesso.')
      // Depois de criar, limpamos o texto para que a próxima entrada
      // seja carregada a partir do histórico (última entrada em 24h)
      setObsHistoria('')
      setEditingHistoriaId(null)
      setHasHistoriaChanges(false)
      await queryClient.invalidateQueries({
        queryKey: ['historias-clinicas-paginated'],
      })
    },
    onError: (error: unknown) => {
      console.error('Erro ao guardar história clínica (Tratamentos):', error)
      const message =
        error instanceof Error ? error.message : 'Falha ao guardar história clínica.'
      toast.error(message)
    },
  })

  const updateHistoriaMutation = useMutation({
    mutationFn: async (payload: UpdateHistoriaClinicaRequest) => {
      return HistoriaClinicaService('historia-clinica').update(payload.id, payload)
    },
    onSuccess: async () => {
      toast.success('História clínica atualizada com sucesso.')
      // Sincronizar novamente com o histórico após atualização
      setEditingHistoriaId(null)
      setHasHistoriaChanges(false)
      await queryClient.invalidateQueries({
        queryKey: ['historias-clinicas-paginated'],
      })
    },
    onError: (error: unknown) => {
      console.error('Erro ao atualizar história clínica (Tratamentos):', error)
      const message =
        error instanceof Error ? error.message : 'Falha ao atualizar história clínica.'
      toast.error(message)
    },
  })

  const toggleAltaMutation = useMutation({
    mutationFn: async ({ id, alta }: { id: string; alta: boolean }) => {
      const res = await TratamentoService().setAlta(id, alta)
      const info = res.info as GSResponse<string> | null
      if (info && info.status !== 0) {
        const msgs = info.messages ?? {}
        const firstMsg =
          (Object.values(msgs).flat() as string[])[0] ?? 'Erro ao atualizar alta do tratamento.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['tratamentos', 'by-utente', utenteId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['evolucao-tratamento', 'paginated', utenteId],
      })
    },
    onError: (error: unknown) => {
      console.error('Erro ao atualizar alta do tratamento:', error)
      const message = error instanceof Error ? error.message : 'Falha ao atualizar alta.'
      toast.error(message)
    },
  })

  const handleToggleAlta = (id: string, alta: boolean) => {
    if (!id) return
    toggleAltaMutation.mutate({ id, alta })
  }

  const handleSaveHistoria = () => {
    if (!utenteId) {
      toast.error('Selecione um utente antes de guardar a história clínica.')
      return
    }
    if (!medicoIdHistoria) {
      toast.error(
        'Não foi possível identificar o médico. Associe um médico ao utente ou inicie sessão com um utilizador médico.'
      )
      return
    }
    if (!obsHistoria.trim()) {
      // Nada para guardar
      return
    }

    if (!hasHistoriaChanges) {
      // Texto igual ao último registo carregado – não gravar de novo
      return
    }

    if (editableHistoryResumo && editingHistoriaId === editableHistoryResumo.id) {
      const payload: UpdateHistoriaClinicaRequest = {
        id: editableHistoryResumo.id,
        utenteId: editableHistoryResumo.utenteId,
        medicoId: editableHistoryResumo.medicoId,
        especialidadeId: editableHistoryResumo.especialidadeId ?? null,
        data: editableHistoryResumo.data,
        hora: editableHistoryResumo.hora ?? '',
        obs: obsHistoria,
      }
      updateHistoriaMutation.mutate(payload)
      return
    }

    const now = new Date()
    const data = now.toISOString().slice(0, 10)
    const hora = now.toTimeString().slice(0, 5)

    const payloadCreate: CreateHistoriaClinicaRequest = {
      utenteId,
      medicoId: medicoIdHistoria,
      especialidadeId: null,
      data,
      hora,
      obs: obsHistoria,
    }

    createHistoriaMutation.mutate(payloadCreate)
  }

  // Auto‑save ao sair da aba Tratamentos 
  useEffect(() => {
    if (isActive === false && obsHistoria.trim() && hasHistoriaChanges) {
      handleSaveHistoria()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  const [activeSubTab, setActiveSubTab] = useState<string>('ficha')

  const { data: servicosLightData } = useQuery({
    queryKey: ['servicos-light-tratamento', servicoSearchModal],
    queryFn: async () => {
      const res = await ServicoService().getServicoLight(servicoSearchModal)
      return (res.info?.data ?? []) as ServicoLightDTO[]
    },
    staleTime: 5 * 60 * 1000,
  })
  const servicosLight = servicosLightData ?? []

  const { data: subsistemasResponse } = useQuery({
    queryKey: ['subsistemas-servicos-tratamento'],
    queryFn: async () => {
      const res = await SubsistemaServicoService('tratamentos').getSubsistemaServico()
      return (res.info?.data ?? []) as SubsistemaServicoDTO[]
    },
    enabled: servicoModalOpen,
    staleTime: 5 * 60 * 1000,
  })
  const subsistemasAll = (subsistemasResponse as SubsistemaServicoDTO[] | undefined) ?? []

  const servicosMap = useMemo(() => {
    const map = new Map<string, ServicoLightDTO>()
    for (const s of servicosLight) {
      map.set(s.id, s)
    }
    return map
  }, [servicosLight])

  const subsistemasFiltered = useMemo(() => {
    const base = organismo
      ? subsistemasAll.filter((s) => s.organismoId === organismo)
      : subsistemasAll
    if (!servicoSearchModal.trim()) return base
    const q = servicoSearchModal.trim().toLowerCase()
    return base.filter((s) => {
      const serv = servicosMap.get(s.servicoId)
      const label = `${serv?.designacao ?? ''} ${s.subsistemaId}`.toLowerCase()
      return label.includes(q)
    })
  }, [subsistemasAll, organismo, servicoSearchModal, servicosMap])

  // Evoluções de tratamento existentes para o utente (para coluna "Alta" e relatório)
  const { data: evolucoesPage } = useGetEvolucaoTratamentoPaginated(utenteId, 1, 100)
  const evolucoes = (evolucoesPage?.info?.data ?? []) as EvolucaoTratamentoTableDTO[]

  const evolucaoByTratamentoId = useMemo(() => {
    const map = new Map<string, EvolucaoTratamentoTableDTO>()
    for (const e of evolucoes) {
      map.set(e.tratamentoId, e)
    }
    return map
  }, [evolucoes])

  const tratamentosAtivos = useMemo(() => tratamentos, [tratamentos])

  const tratamentosHistorico = useMemo(
    () => tratamentos.filter((t) => !!t.dataFim),
    [tratamentos],
  )

  const [showHistorico, setShowHistorico] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [detalheOpen, setDetalheOpen] = useState(false)
  const [detalheLoading, setDetalheLoading] = useState(false)
  const [detalheEspecificacao, setDetalheEspecificacao] = useState<string>('')
  const [detalheTecnicos, setDetalheTecnicos] = useState<string>('')

  const handleVerEspecificacao = async (tId: string) => {
    try {
      setDetalheOpen(true)
      setDetalheLoading(true)
      const client = TratamentoService()
      const res = await client.getById(tId)
      const info = res.info as
        | {
            data?: {
              obs?: string | null
              tecObs?: string | null
            } | null
          }
        | null
      const data = info?.data
      setDetalheEspecificacao(data?.obs ?? '')
      setDetalheTecnicos(data?.tecObs ?? '')
    } catch (error) {
      console.error('Erro ao carregar especificação técnica do tratamento:', error)
      toast.error('Erro ao carregar especificação técnica do tratamento.')
      setDetalheEspecificacao('')
      setDetalheTecnicos('')
    } finally {
      setDetalheLoading(false)
    }
  }

  const handleOpenView = async (t: (typeof tratamentos)[number], readOnly: boolean) => {
    // Preenche campos básicos a partir da linha selecionada
    setIsViewMode(readOnly)

    const dataInic = t.dataInic ? new Date(t.dataInic) : t.createdOn ? new Date(t.createdOn) : null
    setData(dataInic)
    setNumSessoes(t.numSessao != null ? String(t.numSessao) : '')
    setOrganismo(t.organismoId ?? '')
    setLocalTratamento(t.localTratamentoId ?? '')
    setMedico(t.medicoId ?? '')

    // Resolver patologia por nome, se existir
    const patologiaMatch = patologias.find((p) => p.designacao === (t.nomePatologia ?? ''))
    setPatologia(patologiaMatch?.id ?? '')

    // Especificação técnica vem do tratamento completo (obs)
    try {
      const client = TratamentoService()
      const res = await client.getById(t.id)
      const info = res.info as
        | {
            data?: {
              obs?: string | null
            } | null
          }
        | null
      const data = info?.data
      setEspecificacaoTecnica(data?.obs ?? '')
    } catch (error) {
      console.error('Erro ao carregar especificação técnica do tratamento:', error)
      toast.error('Erro ao carregar especificação técnica do tratamento.')
      setEspecificacaoTecnica('')
    }

    setObs('')
    setNovoOpen(true)
  }

  const handleOpenEvolucaoImprimir = async (evolucaoId: string) => {
    try {
      const client = EvolucaoTratamentoService()
      const res = await client.getReportData(evolucaoId)

      const info = res.info as
        | {
            data?: EvolucaoTratamentoReportDTO | null
            status?: number
            messages?: Record<string, string[]>
          }
        | null

      if (!info || !info.data) {
        toast.error(
          'Nenhum registo de Evolução de Tratamento encontrado para este tratamento.',
          'Aviso'
        )
        return
      }

      // Abre o viewer genérico de relatórios, passando o DTO como dataset
      // O .mrt correspondente deve chamar-se "evolucao-tratamento.mrt"
      navigateManagedWindow(
        navigate,
        '/reports/viewer?reportName=evolucao-tratamento',
        { state: { data: info.data } }
      )
    } catch (error) {
      toast.error(
        'Erro ao carregar os dados da evolução de tratamento para o relatório.',
        'Erro'
      )
    }
  }

  // Navegação para a página de Evolução é feita noutros handlers específicos.

  const handleOpenNovo = () => {
    if (!utenteId) return
    setIsViewMode(false)
    setData(new Date())
    setNumSessoes('1')
    setPatologia('')
    setObs('')
    setPrioridade('')
    setPeriodicidade('')
    setOrganismo('')
    setLocalTratamento('')
    setMedico('')
    setEspecificacaoTecnica('')
    setSendEmail(false)
    setNovoOpen(true)
  }

  const handlePrescrever = () => {
    if (isViewMode) {
      // Em modo ver não prescreve nada
      setNovoOpen(false)
      return
    }
    if (!utenteId || createMutation.isPending) return

    const patologiaSelecionada = patologias.find((p) => p.id === patologia)
    const nomePatologia = patologiaSelecionada?.designacao ?? null

    createMutation.mutate(
      {
        data: data ? data.toISOString() : null,
        numSessao: numSessoes ? Number(numSessoes) : null,
        organismoId: organismo || null,
        localTratamentoId: localTratamento || null,
        medicoId: medico || null,
        nomePatologia,
        // No legado, o texto principal do tratamento (Especificação Técnica)
        // é o que volta quando abrimos o tratamento em modo ver/editar.
        // Por isso aqui gravamos a especificação técnica em Obs.
        obs: especificacaoTecnica || null,
        sendEmail,
      },
      {
        onSuccess: () => {
          setNovoOpen(false)
        },
      }
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      {/* Bloco de História Clínica dentro da aba Tratamentos: coluna esquerda (histórico) + direita (edição) */}
      <div className='rounded-lg border bg-card p-3'>
        <h3 className='mb-3 text-sm font-semibold text-teal-700'>História Clínica</h3>
        {!utenteId ? (
          <p className='text-xs text-muted-foreground'>
            Selecione um utente para ver a história clínica.
          </p>
        ) : (
          <div className='grid gap-3 md:grid-cols-2'>
            <div className='flex flex-col gap-1'>
              <span className='text-[11px] font-medium text-muted-foreground'>
                Histórico
              </span>
              {isLoadingHistoriaResumo ? (
                <div className='rounded-md bg-muted/40 p-2 text-xs text-muted-foreground'>
                  A carregar história clínica…
                </div>
              ) : isErrorHistoriaResumo ? (
                <div className='rounded-md bg-muted/40 p-2 text-xs text-destructive'>
                  {errorHistoriaResumoMessage || 'Erro ao carregar história clínica.'}
                </div>
              ) : historiasResumo.length === 0 ? (
                <div className='rounded-md bg-muted/40 p-2 text-xs text-muted-foreground'>
                  Não existem entradas de história clínica para este utente.
                </div>
              ) : (
                <div className='max-h-48 space-y-2 overflow-y-auto rounded-md bg-muted/40 p-2 text-xs'>
                  {historiasResumo.map((h) => {
                    const dataLabel = h.data ? format(new Date(h.data), 'dd/MM/yyyy') : '-'
                    const horaLabel = h.hora ?? ''
                    const dataHora =
                      horaLabel && dataLabel !== '-' ? `${dataLabel} ${horaLabel}` : dataLabel
                    const medicoNome = h.medicoNome ?? ''
                    const esp = h.especialidadeNome ?? ''
                    const titulo = esp ? `${medicoNome} - ${esp}` : medicoNome || 'Médico'

                    return (
                      <div key={h.id} className='rounded border border-border bg-background p-2'>
                        <div className='flex justify-between gap-2'>
                          <span className='font-semibold'>{titulo}</span>
                          <span className='text-[10px] text-muted-foreground'>{dataHora}</span>
                        </div>
                        <div className='mt-1 whitespace-pre-wrap'>
                          {h.obs && h.obs.trim().length > 0 ? h.obs : '-'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className='flex flex-col gap-1'>
              <span className='text-[11px] font-medium text-muted-foreground'>
                Nova entrada 
              </span>
              <Textarea
                className='min-h-[120px]'
                disabled={!utenteId}
                value={obsHistoria}
                onChange={(e) => {
                  setObsHistoria(e.target.value)
                  setHasHistoriaChanges(true)
                }}
                placeholder={
                  deletableHistoryIdResumo
                    ? 'Edite a última entrada (até 24h) ou escreva para nova.'
                    : 'Escreva aqui para criar uma nova entrada de história clínica.'
                }
              />
            </div>
          </div>
        )}
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className='flex flex-col gap-2'>
      <TabsList className='w-full justify-start bg-transparent border-none p-0 shadow-none'>
        <TabsTrigger value='ficha' className='tabs-pill px-2 py-1'>
          Ficha Tratamento
        </TabsTrigger>
        <TabsTrigger value='evolucao' className='tabs-pill px-2 py-1'>
          Evolução Tratamento
        </TabsTrigger>
      </TabsList>

      <TabsContent value='ficha' className='mt-0 rounded-lg border bg-card p-4 text-sm'>
        <div className='flex items-center justify-between border-b pb-3'>
          <h3 className='text-base font-semibold text-teal-700'>Tratamentos</h3>
          <Button size='sm' onClick={handleOpenNovo} disabled={!utenteId || !canAdd}>
            <PlusCircle className='mr-2 h-4 w-4' />
            Prescrever Novo Tratamento
          </Button>
        </div>

        <div className='space-y-4'>
          <div>
            <h4 className='mb-2 text-sm font-semibold text-teal-700'>Tratamentos Ativos</h4>
            <div className='overflow-x-auto rounded-md border bg-background'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-start'>Data Prescrição</TableHead>
                    <TableHead className='text-start'>Organismo</TableHead>
                    <TableHead className='text-start'>Local Tratamento</TableHead>
                    <TableHead className='text-center'>Nº Sessões</TableHead>
                    <TableHead className='text-start'>Médico</TableHead>
                    <TableHead className='text-start'>Patologia</TableHead>
                    <TableHead className='text-center'>Alta</TableHead>
                    <TableHead className='text-center'>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!utenteId ? (
                    <TableRow>
                      <TableCell colSpan={7} className='py-8 text-center text-muted-foreground'>
                        Selecione um utente para ver os tratamentos.
                      </TableCell>
                    </TableRow>
                  ) : isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className='py-8 text-center text-muted-foreground'>
                        A carregar tratamentos...
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={7} className='py-8 text-center text-destructive'>
                        Ocorreu um erro ao carregar os tratamentos.
                      </TableCell>
                    </TableRow>
                  ) : tratamentosAtivos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='py-6 text-center text-muted-foreground'>
                        Nenhum tratamento ativo para este utente.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tratamentosAtivos.map((t) => {
                      const dataPrescricao = t.createdOn
                        ? format(new Date(t.createdOn), 'dd/MM/yyyy')
                        : '-'
                      const organismoNome = t.organismoNome ?? '-'
                      const localTratamentoNome = t.localTratamentoNome ?? '-'
                      const medicoNome = t.medicoNome ?? '-'
                      // Regra alinhada com o legado:
                      // só permite editar quando o tratamento vem de lista de espera
                      // (VemListEsp diferente de 0/null) e o médico da linha é o médico em sessão.
                      const isFromWaitList = t.vemListEsp != null && t.vemListEsp !== 0
                      const isOwner = !!userId && !!t.medicoId && t.medicoId === userId
                      const podeEditar = isFromWaitList && isOwner

                      return (
                        <TableRow
                          key={t.id}
                          className='cursor-pointer hover:bg-muted/40'
                          onClick={() => void handleVerEspecificacao(t.id)}
                        >
                          <TableCell>{dataPrescricao}</TableCell>
                          <TableCell>{organismoNome}</TableCell>
                          <TableCell>{localTratamentoNome}</TableCell>
                          <TableCell className='text-center'>{t.numSessao ?? '-'}</TableCell>
                          <TableCell>{medicoNome}</TableCell>
                          <TableCell>{t.nomePatologia ?? '-'}</TableCell>
                          <TableCell className='text-center'>
                            <input
                              type='checkbox'
                              className='h-3 w-3'
                              checked={!!t.dataFim}
                              onChange={(e) => handleToggleAlta(t.id, e.target.checked)}
                              disabled={toggleAltaMutation.isPending || !canChange}
                            />
                          </TableCell>
                          <TableCell className='text-center'>
                            <div className='flex items-center justify-center gap-1'>
                              {canView ? (
                                <Button
                                variant='outline'
                                size='icon'
                                className='h-7 w-7'
                                title={podeEditar ? 'Editar tratamento' : 'Ver tratamento'}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  void handleOpenView(t, !podeEditar)
                                }}
                              >
                                {podeEditar ? (
                                  <Pencil className='h-3 w-3' />
                                ) : (
                                  <Search className='h-3 w-3' />
                                )}
                                </Button>
                              ) : null}
                              {canView ? (
                                <Button
                                variant='outline'
                                size='icon'
                                className='h-7 w-7'
                                title='Relatório Evolução'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const evolucao = evolucaoByTratamentoId.get(t.id)
                                  if (evolucao?.id) {
                                    void handleOpenEvolucaoImprimir(evolucao.id)
                                  } else {
                                    toast.error(
                                      'Nenhum registo de Evolução de Tratamento encontrado para este tratamento.',
                                      'Aviso',
                                    )
                                  }
                                }}
                              >
                                <FileText className='h-3 w-3' />
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <button
              type='button'
              className='mt-2 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-background px-3 py-1 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-primary/5'
              onClick={() => setShowHistorico((prev) => !prev)}
            >
              <History className='h-3 w-3' />
              Histórico de Tratamentos
              {showHistorico ? (
                <ChevronUp className='h-3 w-3' />
              ) : (
                <ChevronDown className='h-3 w-3' />
              )}
            </button>

            {showHistorico && (
            <div className='mt-3 overflow-x-auto rounded-md border bg-background'>
              <h4 className='border-b bg-muted/40 px-3 py-2 text-sm font-semibold text-teal-700'>
                Histórico de Tratamentos
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-start'>Data Prescrição</TableHead>
                    <TableHead className='text-start'>Organismo</TableHead>
                    <TableHead className='text-start'>Local Tratamento</TableHead>
                    <TableHead className='text-center'>Nº Sessões</TableHead>
                    <TableHead className='text-start'>Médico</TableHead>
                    <TableHead className='text-start'>Patologia</TableHead>
                    <TableHead className='text-center'>Alta</TableHead>
                    <TableHead className='text-center'>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tratamentosHistorico.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='py-6 text-center text-muted-foreground'>
                        Nenhum tratamento em histórico para este utente.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tratamentosHistorico.map((t) => {
                      const dataPrescricao = t.createdOn
                        ? format(new Date(t.createdOn), 'dd/MM/yyyy')
                        : '-'
                      const organismoNome = t.organismoNome ?? '-'
                      const localTratamentoNome = t.localTratamentoNome ?? '-'
                      const medicoNome = t.medicoNome ?? '-'
                      const isFromWaitList = t.vemListEsp != null && t.vemListEsp !== 0
                      const isOwner = !!userId && !!t.medicoId && t.medicoId === userId
                      const podeEditar = isFromWaitList && isOwner

                      return (
                        <TableRow
                          key={t.id}
                          className='cursor-pointer hover:bg-muted/40'
                          onClick={() => void handleVerEspecificacao(t.id)}
                        >
                          <TableCell>{dataPrescricao}</TableCell>
                          <TableCell>{organismoNome}</TableCell>
                          <TableCell>{localTratamentoNome}</TableCell>
                          <TableCell className='text-center'>{t.numSessao ?? '-'}</TableCell>
                          <TableCell>{medicoNome}</TableCell>
                          <TableCell>{t.nomePatologia ?? '-'}</TableCell>
                          <TableCell className='text-center'>
                            <input
                              type='checkbox'
                              className='h-3 w-3'
                              checked={!!t.dataFim}
                              onChange={(e) => handleToggleAlta(t.id, e.target.checked)}
                              disabled={toggleAltaMutation.isPending || !canChange}
                            />
                          </TableCell>
                          <TableCell className='text-center'>
                            <div className='flex items-center justify-center gap-1'>
                              {canView ? (
                                <Button
                                variant='outline'
                                size='icon'
                                className='h-7 w-7'
                                title={podeEditar ? 'Editar tratamento' : 'Ver tratamento'}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  void handleOpenView(t, !podeEditar)
                                }}
                              >
                                {podeEditar ? (
                                  <Pencil className='h-3 w-3' />
                                ) : (
                                  <Search className='h-3 w-3' />
                                )}
                                </Button>
                              ) : null}
                              {canView ? (
                                <Button
                                variant='outline'
                                size='icon'
                                className='h-7 w-7'
                                title='Relatório Evolução'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const evolucao = evolucaoByTratamentoId.get(t.id)
                                  if (evolucao?.id) {
                                    void handleOpenEvolucaoImprimir(evolucao.id)
                                  } else {
                                    toast.error(
                                      'Nenhum registo de Evolução de Tratamento encontrado para este tratamento.',
                                      'Aviso',
                                    )
                                  }
                                }}
                              >
                                <FileText className='h-3 w-3' />
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            )}
          </div>
        </div>

        <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
          <DialogContent className='sm:max-w-5xl'>
            <DialogHeader>
              <DialogTitle>Prescrever Novo Tratamento</DialogTitle>
            </DialogHeader>

            <div className='flex flex-col gap-3 py-2'>
              {/* Linha 1: Data, Nº Sessões, Prioridade, Periodicidade */}
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-4'>
                <div className='flex flex-col gap-1.5'>
                  <span className='text-[11px] font-medium text-muted-foreground'>Data</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !data && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {data ? format(data, 'dd/MM/yyyy') : 'Escolher data'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={data ?? undefined}
                        onSelect={(d) => setData(d ?? null)}
                        initialFocus
                        locale={pt}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <span className='text-[11px] font-medium text-muted-foreground'>Nº Sessões</span>
                  <Input
                    type='number'
                    min={1}
                    value={numSessoes}
                    onChange={(e) => setNumSessoes(e.target.value)}
                  />
                </div>

                <div className='flex flex-col gap-1.5'>
                  <span className='text-[11px] font-medium text-muted-foreground'>Prioridade</span>
                  <Select
                    value={prioridade}
                    onValueChange={setPrioridade}
                    disabled={isViewMode}
                  >
                    <SelectTrigger className='h-8 text-xs'>
                      <SelectValue placeholder='Prioridade...' />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridades.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <span className='text-[11px] font-medium text-muted-foreground'>Periodicidade</span>
                  <Select
                    value={periodicidade}
                    onValueChange={setPeriodicidade}
                    disabled={isViewMode}
                  >
                    <SelectTrigger className='h-8 text-xs'>
                      <SelectValue placeholder='Periodicidade...' />
                    </SelectTrigger>
                    <SelectContent>
                      {periocidades.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Linha 2: Organismo, Local Tratamento */}
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div className='flex flex-col gap-1.5'>
                  <span className='text-[11px] font-medium text-muted-foreground'>Organismo</span>
                  <Select
                    value={organismo}
                    onValueChange={setOrganismo}
                    disabled={isViewMode}
                  >
                    <SelectTrigger className='h-8 text-xs'>
                      <SelectValue placeholder='Organismo...' />
                    </SelectTrigger>
                    <SelectContent>
                      {organismos.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <span className='text-[11px] font-medium text-muted-foreground'>Local Tratamento</span>
                  <Select
                    value={localTratamento}
                    onValueChange={setLocalTratamento}
                    disabled={isViewMode}
                  >
                    <SelectTrigger className='h-8 text-xs'>
                      <SelectValue placeholder='Local Tratamento...' />
                    </SelectTrigger>
                    <SelectContent>
                      {locaisTratamento.map((lt) => (
                        <SelectItem key={lt.id} value={lt.id}>
                          {lt.designacao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Linha 3: Patologias, Médico */}
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div className='flex flex-col gap-1.5'>
                  <span className='text-[11px] font-medium text-muted-foreground'>Patologias</span>
                  <Select
                    value={patologia}
                    onValueChange={setPatologia}
                    disabled={isViewMode}
                  >
                    <SelectTrigger className='h-8 text-xs'>
                      <SelectValue placeholder='Patologias...' />
                    </SelectTrigger>
                    <SelectContent>
                      {patologias.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.designacao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <span className='text-[11px] font-medium text-muted-foreground'>Médico</span>
                  <Select value={medico} onValueChange={setMedico} disabled={isViewMode}>
                    <SelectTrigger className='h-8 text-xs'>
                      <SelectValue placeholder='Médico...' />
                    </SelectTrigger>
                    <SelectContent>
                      {medicos.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Grelha de serviços prescritos */}
              <div className='mt-2 rounded-md border'>
                <div className='flex items-center justify-between border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground'>
                  <span>Serviços Prescritos</span>
                  <div className='flex flex-wrap gap-2'>
                    <Button variant='outline' size='sm' className='h-7 px-2 text-[11px]'>
                      Ver Ficheiros
                    </Button>
                    <Button variant='outline' size='sm' className='h-7 px-2 text-[11px]'>
                      Anexar Ficheiros
                    </Button>
                  <Button
                      variant='outline'
                      size='sm'
                      className='h-7 px-2 text-[11px]'
                      disabled={isViewMode || !canAdd}
                      onClick={() => {
                        if (isViewMode) return
                        setServicoSearchModal('')
                        setServicoSelecionadoModal(null)
                        setQuantidadeServicoModal('1')
                        setValorUtenteServicoModal('')
                      setSelectedSubsistemaIds([])
                        setServicoModalOpen(true)
                      }}
                    >
                      Inserir
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-7 px-2 text-[11px] text-destructive hover:text-destructive'
                      disabled={isViewMode || !canChange || selectedServicosIds.length === 0}
                      onClick={() => {
                        if (isViewMode || !selectedServicosIds.length) return
                        if (!selectedServicosIds.length) return
                        setDraftServicos((prev) =>
                          prev.filter((s) => !selectedServicosIds.includes(s.id)),
                        )
                        setSelectedServicosIds([])
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-10 text-center'>
                          <input type='checkbox' className='h-3 w-3' disabled />
                        </TableHead>
                        <TableHead className='text-start'>Código</TableHead>
                        <TableHead className='text-start'>Subsistema</TableHead>
                        <TableHead className='text-start'>Designação</TableHead>
                        <TableHead className='text-center'>Duração</TableHead>
                        <TableHead className='text-center'>Ordem</TableHead>
                        <TableHead className='text-center'>Fisioter.</TableHead>
                        <TableHead className='text-center'>Auxiliar</TableHead>
                        <TableHead className='text-center'>Opções</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {draftServicos.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className='py-4 text-center text-xs text-muted-foreground'
                          >
                            Não existem dados a apresentar.
                          </TableCell>
                        </TableRow>
                      ) : (
                        draftServicos.map((s, index) => (
                          <TableRow key={s.id}>
                            <TableCell className='text-center'>
                              <input
                                type='checkbox'
                                className='h-3 w-3'
                                checked={selectedServicosIds.includes(s.id)}
                                disabled={isViewMode}
                                onChange={(e) => {
                                  if (isViewMode) return
                                  const checked = e.target.checked
                                  setSelectedServicosIds((prev) =>
                                    checked ? [...prev, s.id] : prev.filter((id) => id !== s.id),
                                  )
                                }}
                              />
                            </TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>{s.descricao}</TableCell>
                            <TableCell className='text-center'>-</TableCell>
                            <TableCell className='text-center'>{index + 1}</TableCell>
                            <TableCell className='text-center'>-</TableCell>
                            <TableCell className='text-center'>-</TableCell>
                            <TableCell className='text-center'>-</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Especificação Técnica */}
              <div className='flex flex-col gap-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium text-muted-foreground'>
                    Especificação Técnica
                  </span>
                  {!isViewMode && (
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-7 px-2 text-[11px]'
                      disabled={!canChange}
                    >
                      Atualizar Esp. Técnica
                    </Button>
                  )}
                </div>
                <Textarea
                  className='min-h-[80px]'
                  value={especificacaoTecnica}
                  onChange={(e) => {
                    if (isViewMode) return
                    setEspecificacaoTecnica(e.target.value)
                  }}
                  readOnly={isViewMode}
                  placeholder='Especificação Técnica...'
                />
              </div>

              {/* Observações gerais do tratamento */}
              <div className='flex flex-col gap-1'>
                <span className='text-xs font-medium text-muted-foreground'>Observações</span>
                <Textarea
                  value={obs}
                  onChange={(e) => {
                    if (isViewMode) return
                    setObs(e.target.value)
                  }}
                  readOnly={isViewMode}
                  placeholder='Notas adicionais sobre o tratamento.'
                />
              </div>

              {!isViewMode && canChange && (
                <div className='flex items-center gap-2'>
                  <input
                    id='tratamento-send-email'
                    type='checkbox'
                    className='h-4 w-4'
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                  />
                  <Label htmlFor='tratamento-send-email'>Enviar email</Label>
                </div>
              )}
            </div>

            <DialogFooter>
              {isViewMode ? (
                <div className='flex w-full justify-end'>
                  <Button type='button' variant='outline' onClick={() => setNovoOpen(false)}>
                    Fechar
                  </Button>
                </div>
              ) : (
                <div className='flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex flex-wrap gap-2'>
                    <Button type='button' variant='outline' size='sm'>
                      Modelo 2
                    </Button>
                    <Button type='button' variant='outline' size='sm'>
                      Imprimir
                    </Button>
                    <Button type='button' variant='outline' size='sm'>
                      Mod. Solic. Credencial SNS
                    </Button>
                    <Button type='button' variant='outline' size='sm'>
                      Observações
                    </Button>
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setNovoOpen(false)}
                      disabled={createMutation.isPending}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handlePrescrever}
                      disabled={!utenteId || !canAdd || createMutation.isPending}
                    >
                      {createMutation.isPending ? 'A guardar…' : 'Prescrever'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={detalheOpen} onOpenChange={setDetalheOpen}>
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle>Especificação e Informação</DialogTitle>
            </DialogHeader>
            {detalheLoading ? (
              <div className='py-6 text-center text-sm text-muted-foreground'>
                A carregar especificação do tratamento...
              </div>
            ) : (
              <Tabs defaultValue='especificacao'>
                <TabsList className='mb-3'>
                  <TabsTrigger value='especificacao'>Especificação Técnica</TabsTrigger>
                  <TabsTrigger value='tecnicos'>Informação dos Técnicos</TabsTrigger>
                </TabsList>
                <TabsContent value='especificacao' className='mt-0'>
                  <div className='space-y-2'>
                    <span className='text-xs font-medium text-muted-foreground'>
                      Especificação Técnica
                    </span>
                    <Textarea
                      className='min-h-[180px]'
                      value={detalheEspecificacao}
                      readOnly
                    />
                  </div>
                </TabsContent>
                <TabsContent value='tecnicos' className='mt-0'>
                  <div className='space-y-2'>
                    <span className='text-xs font-medium text-muted-foreground'>
                      Informação dos Técnicos
                    </span>
                    <Textarea
                      className='min-h-[180px]'
                      value={detalheTecnicos}
                      readOnly
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}
            <DialogFooter>
              <Button type='button' onClick={() => setDetalheOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>

      <TabsContent
        value='evolucao'
        className='mt-0 rounded-lg border bg-card p-4 text-sm'
      >
        <div className='flex items-center justify-between border-b pb-3'>
          <h3 className='text-base font-semibold text-teal-700'>Evolução de Tratamentos</h3>
          <p className='text-xs text-muted-foreground'>
            Selecione um tratamento para registar ou consultar a evolução.
          </p>
        </div>

        <div className='mt-3 overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-start'>Data Prescrição</TableHead>
                <TableHead className='text-start'>Cód. Trat.</TableHead>
                <TableHead className='text-start'>Organismo</TableHead>
                <TableHead className='text-center'>Nº Sessões</TableHead>
                <TableHead className='text-start'>Data Inicial</TableHead>
                <TableHead className='text-start'>Data Final</TableHead>
                <TableHead className='text-center'>Alta</TableHead>
                <TableHead className='text-center'>Serviços</TableHead>
                <TableHead className='text-center'>Relatório</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!utenteId ? (
                <TableRow>
                  <TableCell colSpan={9} className='py-8 text-center text-muted-foreground'>
                    Selecione um utente para ver as evoluções de tratamento.
                  </TableCell>
                </TableRow>
              ) : isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className='py-8 text-center text-muted-foreground'>
                    A carregar tratamentos...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={9} className='py-8 text-center text-destructive'>
                    Ocorreu um erro ao carregar os tratamentos.
                  </TableCell>
                </TableRow>
              ) : tratamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className='py-8 text-center text-muted-foreground'>
                    Nenhum tratamento registado para este utente.
                  </TableCell>
                </TableRow>
              ) : (
                tratamentos.map((t, index) => {
                  const dataPrescricao = t.createdOn
                    ? format(new Date(t.createdOn), 'dd/MM/yyyy')
                    : '-'
                  const organismoNome = t.organismoNome ?? '-'
                  const numSess = t.numSessao ?? '-'
                  const dataInic = t.dataInic ? format(new Date(t.dataInic), 'dd/MM/yyyy') : '-'
                  const dataFim = t.dataFim ? format(new Date(t.dataFim), 'dd/MM/yyyy') : '-'

                  const evolucao = evolucaoByTratamentoId.get(t.id)
                  const temAlta = !!evolucao?.dataAlta

                  return (
                    <TableRow key={t.id}>
                      <TableCell>{dataPrescricao}</TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{organismoNome}</TableCell>
                      <TableCell className='text-center'>{numSess}</TableCell>
                      <TableCell>{dataInic}</TableCell>
                      <TableCell>{dataFim}</TableCell>
                      <TableCell className='text-center'>
                        <input type='checkbox' className='h-3 w-3' checked={temAlta} readOnly />
                      </TableCell>
                      <TableCell className='text-center'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          disabled={!evolucao}
                          onClick={() => {
                            if (!evolucao) return
                            handleOpenEvolucaoImprimir(evolucao.id)
                          }}
                        >
                          <FileText className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* Modal para escolher subsistemas de serviços (similar ao legado) */}
      <Dialog open={servicoModalOpen} onOpenChange={setServicoModalOpen}>
        <DialogContent className='sm:max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Selecionar subsistemas de serviços</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-3 py-2'>
            <div className='flex flex-col gap-1'>
              <span className='text-[11px] font-medium text-muted-foreground'>
                Pesquisar por serviço / subsistema
              </span>
              <Input
                value={servicoSearchModal}
                onChange={(e) => {
                  setServicoSearchModal(e.target.value)
                  setServicoSelecionadoModal(null)
                }}
                placeholder='Introduza o nome do serviço ou código de subsistema...'
                className='h-8 text-xs'
              />
            </div>
            <div className='overflow-x-auto rounded-md border bg-muted/30'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-8 text-center'>
                      <Checkbox
                        className='h-3 w-3'
                        checked={
                          subsistemasFiltered.length > 0 &&
                          selectedSubsistemaIds.length === subsistemasFiltered.length
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSubsistemaIds(subsistemasFiltered.map((s) => s.id))
                          } else {
                            setSelectedSubsistemaIds([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className='text-start'>Serviço</TableHead>
                    <TableHead className='text-center'>Val. Serv. (EUR)</TableHead>
                    <TableHead className='text-center'>Val. Org. (EUR)</TableHead>
                    <TableHead className='text-center'>Val. Utente (EUR)</TableHead>
                    <TableHead className='text-center'>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subsistemasFiltered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className='py-4 text-center text-[11px] text-muted-foreground'
                      >
                        Não existem subsistemas de serviços para os filtros atuais.
                      </TableCell>
                    </TableRow>
                  ) : (
                    subsistemasFiltered.map((s) => {
                      const serv = servicosMap.get(s.servicoId)
                      const checked = selectedSubsistemaIds.includes(s.id)
                      return (
                        <TableRow
                          key={s.id}
                          className='cursor-pointer hover:bg-muted/60'
                          onClick={() => {
                            setSelectedSubsistemaIds((prev) =>
                              checked ? prev.filter((id) => id !== s.id) : [...prev, s.id],
                            )
                          }}
                        >
                          <TableCell className='text-center'>
                            <Checkbox
                              className='h-3 w-3'
                              checked={checked}
                              onCheckedChange={(value) => {
                                const isChecked = value === true
                                setSelectedSubsistemaIds((prev) =>
                                  isChecked
                                    ? [...prev, s.id]
                                    : prev.filter((id) => id !== s.id),
                                )
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell>{serv?.designacao ?? '-'}</TableCell>
                          <TableCell className='text-center'>
                            {s.valorServico.toFixed(2)}
                          </TableCell>
                          <TableCell className='text-center'>
                            {s.valorOrganismo.toFixed(2)}
                          </TableCell>
                          <TableCell className='text-center'>
                            {s.valorUtente.toFixed(2)}
                          </TableCell>
                          <TableCell className='text-center'>
                            {s.inativo ? 'Inativo' : 'Ativo'}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <div className='flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setNovoServicoModalOpen(true)}
              >
                Novo serviço
              </Button>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setServicoModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size='sm'
                  disabled={selectedSubsistemaIds.length === 0}
                  onClick={() => {
                    if (selectedSubsistemaIds.length === 0) return
                    const selecionados = subsistemasAll.filter((s) =>
                      selectedSubsistemaIds.includes(s.id),
                    )
                    if (!selecionados.length) return

                    setDraftServicos((prev) => {
                      const baseIndex = prev.length
                      const novos = selecionados.map((s, idx) => {
                        const serv = servicosMap.get(s.servicoId)
                        return {
                          id: `${Date.now()}-${baseIndex + idx + 1}`,
                          descricao: serv?.designacao ?? s.servicoId,
                          quantidade: 1,
                          valorUtente: s.valorUtente,
                        }
                      })
                      return [...prev, ...novos]
                    })

                    setServicoModalOpen(false)
                    setSelectedSubsistemaIds([])
                  }}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para criar um novo serviço (reutiliza o da área comum) */}
      <ServicoViewCreateModal
        open={novoServicoModalOpen}
        onOpenChange={(openModal: boolean) => {
          setNovoServicoModalOpen(openModal)
          if (!openModal) {
            void queryClient.invalidateQueries({ queryKey: ['servicos-light-tratamento'] })
          }
        }}
        mode='create'
        viewData={null}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ['servicos-light-tratamento'] })
        }}
      />
    </Tabs>
    </div>
  )
}



