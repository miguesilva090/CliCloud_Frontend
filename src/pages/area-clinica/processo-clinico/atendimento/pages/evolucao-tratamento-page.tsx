import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { pt } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { EvolucaoTratamentoDTO } from '@/types/dtos/tratamentos/evolucao-tratamento.dtos'
import type { EvolucaoTratamentoFicheiroDTO } from '@/types/dtos/tratamentos/evolucao-tratamento-ficheiro.dtos'
import {
  useGetEvolucaoTratamentoById,
  useCreateEvolucaoTratamento,
  useUpdateEvolucaoTratamento,
} from '../ficha-clinica/queries/evolucao-tratamento-queries'
import {
  useGetEvolucaoTratamentoFicheiros,
  useCreateEvolucaoTratamentoFicheiro,
  useDeleteEvolucaoTratamentoFicheiro,
} from '../queries/evolucao-tratamento-ficheiros-queries'
import { BodyChartTab } from '../ficha-clinica/tabs/BodyChartTab'
import { useAuthStore } from '@/stores/auth-store'

export function EvolucaoTratamentoPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nomeUtilizador = useAuthStore((state) => state.name) || 'Utilizador'
  const tratamentoId = searchParams.get('tratamentoId') ?? ''
  const utenteId = searchParams.get('utenteId') ?? ''
  const tratamentoDesignacao = searchParams.get('designacao') ?? '-'
  const organismoNome = searchParams.get('organismo') ?? '-'
  const numSessao = searchParams.get('numSessao') ?? '-'
  const evolucaoIdFromUrl = searchParams.get('evolucaoId') ?? ''
  const [evolucaoId, setEvolucaoId] = useState<string>(evolucaoIdFromUrl)

  const queryClient = useQueryClient()
  const idParaFetch = evolucaoIdFromUrl || evolucaoId
  const { data: evolucaoCarregada } = useGetEvolucaoTratamentoById(idParaFetch)
  const createEvolucao = useCreateEvolucaoTratamento(utenteId)
  const updateEvolucao = useUpdateEvolucaoTratamento(utenteId)

  const [saving, setSaving] = useState(false)
  const loadedEvolucaoIdRef = useRef<string>('')

  const [pacienteInformadoInicial, setPacienteInformadoInicial] = useState(false)
  const [pacienteMotivadoInicial, setPacienteMotivadoInicial] = useState(false)
  const [pacienteColaboranteInicial, setPacienteColaboranteInicial] = useState(false)
  const [avaliacaoSubjetivaInicial, setAvaliacaoSubjetivaInicial] = useState('')
  const [observacoesAvaliacaoInicial, setObservacoesAvaliacaoInicial] = useState('')
  const [valorDorInicial, setValorDorInicial] = useState<string>('')
  const [tipoInicioDorInicial, setTipoInicioDorInicial] = useState<string>('')
  const [tipoDorInicial, setTipoDorInicial] = useState('')
  const [exameFisicoRegiaoInicial, setExameFisicoRegiaoInicial] = useState('')
  const [patologiaInicial, setPatologiaInicial] = useState('')
  const [edemaInicial, setEdemaInicial] = useState(false)
  const [observacoesEdemaInicial, setObservacoesEdemaInicial] = useState('')
  const [elasticidadeInicial, setElasticidadeInicial] = useState(false)
  const [observacoesElasticidadeInicial, setObservacoesElasticidadeInicial] = useState('')
  const [parestesiasInicial, setParestesiasInicial] = useState(false)
  const [dorIrradiadaInicial, setDorIrradiadaInicial] = useState(false)
  const [cicatrizInicial, setCicatrizInicial] = useState(false)
  const [fraquezaMuscularInicial, setFraquezaMuscularInicial] = useState(false)
  const [zonaFraquezaInicialDescricao, setZonaFraquezaInicialDescricao] = useState('')
  const [marchaAutonomaInicial, setMarchaAutonomaInicial] = useState<string>('')
  const [observacoesMarchaAutonomaInicial, setObservacoesMarchaAutonomaInicial] = useState('')
  const [goniometriaInicial, setGoniometriaInicial] = useState('')
  const [testeMuscularInicial, setTesteMuscularInicial] = useState('')
  const [autonomiaInicial, setAutonomiaInicial] = useState('')
  const [objetivosEspecificosInicial, setObjetivosEspecificosInicial] = useState('')
  const [sessoesPropostasInicial, setSessoesPropostasInicial] = useState('')
  const [tempoNecessarioInicial, setTempoNecessarioInicial] = useState('')

  const [pacienteInformadoFinal, setPacienteInformadoFinal] = useState(false)
  const [pacienteMotivadoFinal, setPacienteMotivadoFinal] = useState(false)
  const [pacienteColaboranteFinal, setPacienteColaboranteFinal] = useState(false)
  const [avaliacaoSubjetivaFinal, setAvaliacaoSubjetivaFinal] = useState('')
  const [observacoesAvaliacaoFinal, setObservacoesAvaliacaoFinal] = useState('')
  const [valorDorFinal, setValorDorFinal] = useState<string>('')
  const [tipoInicioDorFinal, setTipoInicioDorFinal] = useState<string>('')
  const [tipoDorFinal, setTipoDorFinal] = useState('')
  const [exameFisicoRegiaoFinalId, setExameFisicoRegiaoFinalId] = useState('')
  const [patologiaFinalId, setPatologiaFinalId] = useState('')
  const [edemaFinal, setEdemaFinal] = useState(false)
  const [observacoesEdemaFinal, setObservacoesEdemaFinal] = useState('')
  const [elasticidadeFinal, setElasticidadeFinal] = useState(false)
  const [observacoesElasticidadeFinal, setObservacoesElasticidadeFinal] = useState('')
  const [parestesiasFinal, setParestesiasFinal] = useState(false)
  const [dorIrradiadaFinal, setDorIrradiadaFinal] = useState(false)
  const [cicatrizFinal, setCicatrizFinal] = useState(false)
  const [fraquezaMuscularFinal, setFraquezaMuscularFinal] = useState(false)
  const [zonaFraquezaFinalDescricao, setZonaFraquezaFinalDescricao] = useState('')
  const [marchaAutonomaFinal, setMarchaAutonomaFinal] = useState<string>('')
  const [observacoesMarchaAutonomaFinal, setObservacoesMarchaAutonomaFinal] = useState('')
  const [goniometriaFinal, setGoniometriaFinal] = useState('')
  const [testeMuscularFinal, setTesteMuscularFinal] = useState('')
  const [autonomiaFinal, setAutonomiaFinal] = useState('')
  const [sessoesPropostasFinal, setSessoesPropostasFinal] = useState('')
  const [tempoNecessarioFinal, setTempoNecessarioFinal] = useState('')

  const [dataAlta, setDataAlta] = useState<Date | null>(null)
  const [escalaDorAlta, setEscalaDorAlta] = useState<string>('')
  const [objetivosAlcancados, setObjetivosAlcancados] = useState('')
  const [novosObjetivos, setNovosObjetivos] = useState('')
  const [motivoAltaId, setMotivoAltaId] = useState('')
  const [indicacoesParaUtenteAlta, setIndicacoesParaUtenteAlta] = useState('')
  const [observacaoClinica, setObservacaoClinica] = useState('')

  type DocumentoEvolucao = {
    id: number
    titulo: string
    data: string
    ficheiroNome: string
  }

  const [documentos, setDocumentos] = useState<DocumentoEvolucao[]>([])
  const [docModalOpen, setDocModalOpen] = useState(false)
  const [docTitulo, setDocTitulo] = useState('')
  const [docFile, setDocFile] = useState<File | null>(null)

  useEffect(() => {
    if (!evolucaoCarregada || !idParaFetch || loadedEvolucaoIdRef.current === idParaFetch) return
    loadedEvolucaoIdRef.current = idParaFetch
    setObservacaoClinica(evolucaoCarregada.observacaoClinica ?? '')
    setPacienteInformadoInicial(evolucaoCarregada.pacienteInformadoInicial ?? false)
    setPacienteMotivadoInicial(evolucaoCarregada.pacienteMotivadoInicial ?? false)
    setPacienteColaboranteInicial(evolucaoCarregada.pacienteColaboranteInicial ?? false)
    setAvaliacaoSubjetivaInicial('')
    setObservacoesAvaliacaoInicial(evolucaoCarregada.observacoesAvaliacaoInicial ?? '')
    setValorDorInicial(evolucaoCarregada.valorDorInicial != null ? String(evolucaoCarregada.valorDorInicial) : '')
    setTipoInicioDorInicial(evolucaoCarregada.tipoInicioDorInicial != null ? String(evolucaoCarregada.tipoInicioDorInicial) : '')
    setTipoDorInicial(evolucaoCarregada.tipoDorInicial ?? '')
    setExameFisicoRegiaoInicial(evolucaoCarregada.exameFisicoRegiaoInicial ?? '')
    setPatologiaInicial(evolucaoCarregada.patologiaInicial ?? '')
    setEdemaInicial(evolucaoCarregada.edemaInicial ?? false)
    setObservacoesEdemaInicial(evolucaoCarregada.observacoesEdemaInicial ?? '')
    setElasticidadeInicial(evolucaoCarregada.elasticidadeInicial ?? false)
    setObservacoesElasticidadeInicial(evolucaoCarregada.observacoesElasticidadeInicial ?? '')
    setParestesiasInicial(evolucaoCarregada.parestesiasInicial ?? false)
    setDorIrradiadaInicial(evolucaoCarregada.dorIrradiadaInicial ?? false)
    setCicatrizInicial(evolucaoCarregada.cicatrizInicial ?? false)
    setFraquezaMuscularInicial(evolucaoCarregada.fraquezaMuscularInicial ?? false)
    setZonaFraquezaInicialDescricao(evolucaoCarregada.zonaFraquezaInicialDescricao ?? '')
    setMarchaAutonomaInicial(evolucaoCarregada.marchaAutonomaInicial != null ? String(evolucaoCarregada.marchaAutonomaInicial) : '')
    setObservacoesMarchaAutonomaInicial(evolucaoCarregada.observacoesMarchaAutonomaInicial ?? '')
    setGoniometriaInicial(evolucaoCarregada.goniometriaInicial ?? '')
    setTesteMuscularInicial(evolucaoCarregada.testeMuscularInicial ?? '')
    setAutonomiaInicial(evolucaoCarregada.autonomiaInicial ?? '')
    setObjetivosEspecificosInicial(evolucaoCarregada.objetivosEspecificosInicial ?? '')
    setSessoesPropostasInicial(evolucaoCarregada.sessoesPropostasInicial ?? '')
    setTempoNecessarioInicial(evolucaoCarregada.tempoNecessarioInicial ?? '')
    setPacienteInformadoFinal(evolucaoCarregada.pacienteInformadoFinal ?? false)
    setPacienteMotivadoFinal(evolucaoCarregada.pacienteMotivadoFinal ?? false)
    setPacienteColaboranteFinal(evolucaoCarregada.pacienteColaboranteFinal ?? false)
    setAvaliacaoSubjetivaFinal(evolucaoCarregada.avaliacaoSubjetivaFinal ?? '')
    setObservacoesAvaliacaoFinal(evolucaoCarregada.observacoesAvaliacaoFinal ?? '')
    setValorDorFinal(evolucaoCarregada.valorDorFinal != null ? String(evolucaoCarregada.valorDorFinal) : '')
    setTipoInicioDorFinal(evolucaoCarregada.tipoInicioDorFinal != null ? String(evolucaoCarregada.tipoInicioDorFinal) : '')
    setTipoDorFinal(evolucaoCarregada.tipoDorFinal ?? '')
    setExameFisicoRegiaoFinalId(evolucaoCarregada.exameFisicoRegiaoFinalId ?? '')
    setPatologiaFinalId(evolucaoCarregada.patologiaFinalId ?? '')
    setEdemaFinal(evolucaoCarregada.edemaFinal ?? false)
    setObservacoesEdemaFinal(evolucaoCarregada.observacoesEdemaFinal ?? '')
    setElasticidadeFinal(evolucaoCarregada.elasticidadeFinal ?? false)
    setObservacoesElasticidadeFinal(evolucaoCarregada.observacoesElasticidadeFinal ?? '')
    setParestesiasFinal(evolucaoCarregada.parestesiasFinal ?? false)
    setDorIrradiadaFinal(evolucaoCarregada.dorIrradiadaFinal ?? false)
    setCicatrizFinal(evolucaoCarregada.cicatrizFinal ?? false)
    setFraquezaMuscularFinal(evolucaoCarregada.fraquezaMuscularFinal ?? false)
    setZonaFraquezaFinalDescricao(evolucaoCarregada.zonaFraquezaFinalDescricao ?? '')
    setMarchaAutonomaFinal(evolucaoCarregada.marchaAutonomaFinal != null ? String(evolucaoCarregada.marchaAutonomaFinal) : '')
    setObservacoesMarchaAutonomaFinal(evolucaoCarregada.observacoesMarchaAutonomaFinal ?? '')
    setGoniometriaFinal(evolucaoCarregada.goniometriaFinal ?? '')
    setTesteMuscularFinal(evolucaoCarregada.testeMuscularFinal ?? '')
    setAutonomiaFinal(evolucaoCarregada.autonomiaFinal ?? '')
    setSessoesPropostasFinal(evolucaoCarregada.sessoesPropostasFinal ?? '')
    setTempoNecessarioFinal(evolucaoCarregada.tempoNecessarioFinal ?? '')
    setDataAlta(evolucaoCarregada.dataAlta ? new Date(evolucaoCarregada.dataAlta) : null)
    setEscalaDorAlta(evolucaoCarregada.escalaDorAlta != null ? String(evolucaoCarregada.escalaDorAlta) : '')
    setObjetivosAlcancados(evolucaoCarregada.objetivosAlcancados ?? '')
    setNovosObjetivos(evolucaoCarregada.novosObjetivos ?? '')
    setMotivoAltaId(evolucaoCarregada.motivoAltaId ?? '')
    setIndicacoesParaUtenteAlta(evolucaoCarregada.indicacoesParaUtenteAlta ?? '')
  }, [evolucaoCarregada, idParaFetch])

  useEffect(() => {
    if (!evolucaoIdFromUrl) loadedEvolucaoIdRef.current = ''
  }, [evolucaoIdFromUrl])

  const { data: documentosRemotos = [], isLoading: docsLoading } =
    useGetEvolucaoTratamentoFicheiros(evolucaoId)
  const createDoc = useCreateEvolucaoTratamentoFicheiro(evolucaoId)
  useDeleteEvolucaoTratamentoFicheiro(evolucaoId)

  const handleAddDocumento = () => {
    void (async () => {
      const id = await ensureEvolucaoId()
      if (!id) return
      setDocTitulo('')
      setDocFile(null)
      setDocModalOpen(true)
    })()
  }

  const handleConfirmDocumento = () => {
    if (!evolucaoId || !docTitulo || !docFile) return

    const now = new Date()
    const local: DocumentoEvolucao = {
      id: documentos.length + 1,
      titulo: docTitulo,
      data: format(now, 'dd/MM/yyyy'),
      ficheiroNome: docFile.name,
    }
    setDocumentos((prev) => [...prev, local])

    void createDoc.mutateAsync({
      titulo: docTitulo,
      fileName: docFile.name,
      storagePath: docFile.name,
      contentType: docFile.type || undefined,
      tamanhoBytes: docFile.size,
    })

    setDocModalOpen(false)
  }

  const getLabelEscalaDor = (valor: string) => {
    const v = Number(valor)
    if (Number.isNaN(v)) return ''
    if (v === 0) return 'Sem dor'
    if (v <= 3) return 'Dor ligeira'
    if (v <= 6) return 'Dor moderada'
    if (v <= 8) return 'Dor intensa'
    return 'Dor muito intensa'
  }

  const ensureEvolucaoId = async () => {
    if (evolucaoId || !tratamentoId || !utenteId) return evolucaoId

    const res = await createEvolucao.mutateAsync({
      tratamentoId,
      // utenteId é injectado pelo hook
    } as unknown as Omit<EvolucaoTratamentoDTO, 'id' | 'utenteId'>)

    const newId = (res.info?.data as string | undefined) ?? ''
    if (!newId) return evolucaoId

    setEvolucaoId(newId)
    const params = new URLSearchParams(window.location.search)
    params.set('evolucaoId', newId)
    navigate(`${window.location.pathname}?${params.toString()}`, { replace: true })

    return newId
  }

  const handleSave = async () => {
    if (!tratamentoId || !utenteId) return
    setSaving(true)
    try {
      const now = new Date()
      const timestamp = format(now, 'dd/MM/yyyy HH:mm')
      const baseMensagem = avaliacaoSubjetivaInicial.trim()
      const novaEntrada = baseMensagem ? `${nomeUtilizador} - ${timestamp}
${baseMensagem}` : ''
      const historicoCombinado = novaEntrada
        ? observacaoClinica
          ? `${observacaoClinica}

${novaEntrada}`
          : novaEntrada
        : observacaoClinica

      const payload: Omit<EvolucaoTratamentoDTO, 'id'> = {
        tratamentoId,
        utenteId,
        pacienteInformadoInicial,
        pacienteMotivadoInicial,
        pacienteColaboranteInicial,
        avaliacaoSubjetivaInicial: avaliacaoSubjetivaInicial || null,
        observacoesAvaliacaoInicial: observacoesAvaliacaoInicial || null,
        valorDorInicial: valorDorInicial ? Number(valorDorInicial) : null,
        tipoInicioDorInicial: tipoInicioDorInicial ? Number(tipoInicioDorInicial) : null,
        tipoDorInicial: tipoDorInicial || null,
        exameFisicoRegiaoInicial: exameFisicoRegiaoInicial || null,
        patologiaInicial: patologiaInicial || null,
        edemaInicial,
        tipoEdemaInicial: null,
        regiaoEdemaInicialDescricao: null,
        observacoesEdemaInicial: observacoesEdemaInicial || null,
        elasticidadeInicial,
        observacoesElasticidadeInicial: observacoesElasticidadeInicial || null,
        parestesiasInicial,
        zonaParestesiasInicialDescricao: null,
        dorIrradiadaInicial,
        zonaDorIrradiadaInicialDescricao: null,
        cicatrizInicial,
        zonaCicatrizInicialDescricao: null,
        fraquezaMuscularInicial,
        zonaFraquezaInicialDescricao: zonaFraquezaInicialDescricao || null,
        marchaAutonomaInicial: marchaAutonomaInicial ? Number(marchaAutonomaInicial) : null,
        observacoesMarchaAutonomaInicial: observacoesMarchaAutonomaInicial || null,
        goniometriaInicial: goniometriaInicial || null,
        testeMuscularInicial: testeMuscularInicial || null,
        autonomiaInicial: autonomiaInicial || null,
        objetivosEspecificosInicial: objetivosEspecificosInicial || null,
        sessoesPropostasInicial: sessoesPropostasInicial || null,
        tempoNecessarioInicial: tempoNecessarioInicial || null,
        pacienteInformadoFinal,
        pacienteMotivadoFinal,
        pacienteColaboranteFinal,
        avaliacaoSubjetivaFinal: avaliacaoSubjetivaFinal || null,
        observacoesAvaliacaoFinal: observacoesAvaliacaoFinal || null,
        valorDorFinal: valorDorFinal ? Number(valorDorFinal) : null,
        tipoInicioDorFinal: tipoInicioDorFinal ? Number(tipoInicioDorFinal) : null,
        tipoDorFinal: tipoDorFinal || null,
        exameFisicoRegiaoFinalId: exameFisicoRegiaoFinalId || null,
        patologiaFinalId: patologiaFinalId || null,
        edemaFinal,
        tipoEdemaFinal: null,
        regiaoEdemaFinalDescricao: null,
        observacoesEdemaFinal: observacoesEdemaFinal || null,
        elasticidadeFinal,
        observacoesElasticidadeFinal: observacoesElasticidadeFinal || null,
        parestesiasFinal,
        zonaParestesiasFinalDescricao: null,
        dorIrradiadaFinal,
        zonaDorIrradiadaFinalDescricao: null,
        cicatrizFinal,
        zonaCicatrizFinalDescricao: null,
        fraquezaMuscularFinal,
        zonaFraquezaFinalDescricao: zonaFraquezaFinalDescricao || null,
        marchaAutonomaFinal: marchaAutonomaFinal ? Number(marchaAutonomaFinal) : null,
        observacoesMarchaAutonomaFinal: observacoesMarchaAutonomaFinal || null,
        goniometriaFinal: goniometriaFinal || null,
        testeMuscularFinal: testeMuscularFinal || null,
        autonomiaFinal: autonomiaFinal || null,
        sessoesPropostasFinal: sessoesPropostasFinal || null,
        tempoNecessarioFinal: tempoNecessarioFinal || null,
        dataAlta: dataAlta ? dataAlta.toISOString() : null,
        escalaDorAlta: escalaDorAlta ? Number(escalaDorAlta) : null,
        objetivosAlcancados: objetivosAlcancados || null,
        novosObjetivos: novosObjetivos || null,
        motivoAltaId: motivoAltaId || null,
        indicacoesParaUtenteAlta: indicacoesParaUtenteAlta || null,
        observacaoClinica: historicoCombinado || null,
      }

      const idAtual = idParaFetch || evolucaoId
      if (idAtual) {
        await updateEvolucao.mutateAsync({
          id: idAtual,
          data: { ...payload, id: idAtual },
        })
        void queryClient.invalidateQueries({ queryKey: ['evolucao-tratamento', 'by-id', idAtual] })
      } else {
        const res = await createEvolucao.mutateAsync(
          payload as unknown as Omit<EvolucaoTratamentoDTO, 'id' | 'utenteId'>,
        )
        const newId = (res.info?.data as string | undefined) ?? ''
        if (newId) {
          setEvolucaoId(newId)
          const params = new URLSearchParams(window.location.search)
          params.set('evolucaoId', newId)
          navigate(`${window.location.pathname}?${params.toString()}`, { replace: true })
        }
      }
      setObservacaoClinica(historicoCombinado ?? observacaoClinica)
      setAvaliacaoSubjetivaInicial('')
      setObservacoesAvaliacaoInicial('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHead title='Evolução de Tratamento | CliCloud' />
      <DashboardPageContainer>
        <div className='flex flex-col gap-3 rounded-lg border bg-card/95 p-4 shadow-sm'>
          <div className='flex items-center justify-between rounded-md bg-teal-700 px-4 py-2 text-white'>
            <h2 className='text-sm font-semibold'>Evolução de Tratamento</h2>
            <Button
              size='sm'
              variant='secondary'
              onClick={handleSave}
              disabled={saving || !tratamentoId}
            >
              {saving ? 'A guardar…' : 'Guardar Evolução de Tratamento'}
            </Button>
          </div>

          <div className='grid grid-cols-1 gap-3 rounded-md border bg-card p-3 text-xs sm:grid-cols-3'>
            <div>
              <span className='block text-[11px] font-medium text-muted-foreground'>Cód. Tratamento</span>
              <Input className='h-7 text-xs' value={tratamentoId.slice(0, 8)} readOnly />
            </div>
            <div>
              <span className='block text-[11px] font-medium text-muted-foreground'>Cód. Utente</span>
              <Input className='h-7 text-xs' value={utenteId.slice(0, 8)} readOnly />
            </div>
            <div>
              <span className='block text-[11px] font-medium text-muted-foreground'>Tratamento</span>
              <Input className='h-7 text-xs' value={`${tratamentoDesignacao} · ${organismoNome} · Nº Sessões: ${numSessao}`} readOnly />
            </div>
          </div>

          <Tabs defaultValue='avaliacao-inicial' className='text-xs'>
            <TabsList className='w-full justify-start overflow-x-auto'>
              <TabsTrigger value='avaliacao-inicial'>Avaliação Inicial</TabsTrigger>
              <TabsTrigger value='avaliacao-final'>Avaliação Final</TabsTrigger>
              <TabsTrigger value='observacao-medica'>Observação Médica</TabsTrigger>
              <TabsTrigger value='body-chart'>Body Chart</TabsTrigger>
              <TabsTrigger value='documentos'>Documentos</TabsTrigger>
            </TabsList>

            {/* ── AVALIAÇÃO INICIAL ── */}
            <TabsContent value='avaliacao-inicial' className='mt-3'>
              <Tabs defaultValue='ini-avaliacao' className='text-xs'>
                <TabsList className='w-full justify-start overflow-x-auto'>
                  <TabsTrigger value='ini-avaliacao'>Avaliação</TabsTrigger>
                  <TabsTrigger value='ini-exame'>Exame Físico</TabsTrigger>
                  <TabsTrigger value='ini-objetivos'>Objetivos de Reabilitação</TabsTrigger>
                </TabsList>

                <TabsContent value='ini-avaliacao' className='mt-3 space-y-3 rounded-md border p-4'>
                  <h4 className='text-[11px] font-semibold uppercase text-teal-700'>
                     Avaliação
                  </h4>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                    <label className='flex items-center gap-2'>
                      <Checkbox checked={pacienteInformadoInicial} onCheckedChange={(v) => setPacienteInformadoInicial(v === true)} />
                      <span>Paciente informado</span>
                    </label>
                    <label className='flex items-center gap-2'>
                      <Checkbox checked={pacienteMotivadoInicial} onCheckedChange={(v) => setPacienteMotivadoInicial(v === true)} />
                      <span>Paciente motivado</span>
                    </label>
                    <label className='flex items-center gap-2'>
                      <Checkbox checked={pacienteColaboranteInicial} onCheckedChange={(v) => setPacienteColaboranteInicial(v === true)} />
                      <span>Paciente colaborante</span>
                    </label>
                  </div>
                  <span className='block text-[11px] font-semibold uppercase text-teal-700'>
                    Avaliação Subjetiva
                  </span>
                  <div className='grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Avaliação subjetiva
                      </span>
                      <Textarea
                        className='min-h-[80px] resize-none'
                        placeholder='Historial...'
                        value={avaliacaoSubjetivaInicial}
                        onChange={(e) => setAvaliacaoSubjetivaInicial(e.target.value)}
                      />
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Historial
                      </span>
                      <Textarea
                        className='min-h-[80px] max-h-[200px] resize-none overflow-y-auto'
                        value={observacaoClinica}
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>Observações</span>
                    <Textarea className='min-h-[60px] resize-none' value={observacoesAvaliacaoInicial} onChange={(e) => setObservacoesAvaliacaoInicial(e.target.value)} />
                  </div>
                  <span className='block text-[11px] font-semibold uppercase text-teal-700'>Dor</span>
                  <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>Início da dor</span>
                      <div className='flex gap-4 text-[11px]'>
                        <label className='flex items-center gap-1'>
                          <input type='radio' name='inicio-dor-ini' className='h-3 w-3' checked={tipoInicioDorInicial === '1'} onChange={() => setTipoInicioDorInicial('1')} />
                          Súbito
                        </label>
                        <label className='flex items-center gap-1'>
                          <input type='radio' name='inicio-dor-ini' className='h-3 w-3' checked={tipoInicioDorInicial === '2'} onChange={() => setTipoInicioDorInicial('2')} />
                          Gradual
                        </label>
                      </div>
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>Tipo de dor</span>
                      <Textarea className='min-h-[50px] resize-none' value={tipoDorInicial} onChange={(e) => setTipoDorInicial(e.target.value)} />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>Escala numérica da dor (0–10)</span>
                    <input type='range' min={0} max={10} step={1} value={valorDorInicial || '0'} onChange={(e) => setValorDorInicial(e.target.value)} className='block w-full accent-teal-600' />
                    <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
                      <span>0</span><span>5</span><span>10</span>
                    </div>
                    <span className='text-[11px] font-medium text-teal-700'>
                      Valor: {valorDorInicial || '0'} – {getLabelEscalaDor(valorDorInicial || '0')}
                    </span>
                  </div>
                </TabsContent>

                <TabsContent value='ini-exame' className='mt-3 space-y-4 rounded-md border p-4'>
                  <h4 className='text-[11px] font-semibold uppercase text-teal-700'>
                    Exame Físico
                  </h4>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>Região</span>
                      <Select value={exameFisicoRegiaoInicial} onValueChange={setExameFisicoRegiaoInicial}>
                        <SelectTrigger className='h-8 text-xs'><SelectValue placeholder='Região...' /></SelectTrigger>
                        <SelectContent><SelectItem value='placeholder'>–</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>Patologia</span>
                      <Select value={patologiaInicial} onValueChange={setPatologiaInicial}>
                        <SelectTrigger className='h-8 text-xs'><SelectValue placeholder='Patologia...' /></SelectTrigger>
                        <SelectContent><SelectItem value='placeholder'>–</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='space-y-1 rounded-md border p-3'>
                    <label className='flex items-center gap-2'>
                      <Checkbox checked={edemaInicial} onCheckedChange={(v) => setEdemaInicial(v === true)} />
                      <span className='font-medium'>Edema</span>
                    </label>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>Observações</span>
                    <Textarea className='min-h-[50px] resize-none' value={observacoesEdemaInicial} onChange={(e) => setObservacoesEdemaInicial(e.target.value)} />
                  </div>

                  <div className='space-y-1 rounded-md border p-3'>
                    <label className='flex items-center gap-2'>
                      <Checkbox checked={elasticidadeInicial} onCheckedChange={(v) => setElasticidadeInicial(v === true)} />
                      <span className='font-medium'>Alterações sensibilidade</span>
                    </label>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>Observações</span>
                    <Textarea className='min-h-[50px] resize-none' value={observacoesElasticidadeInicial} onChange={(e) => setObservacoesElasticidadeInicial(e.target.value)} />
                  </div>

                  <div className='space-y-1 rounded-md border p-3'>
                    <div className='flex gap-6'>
                      <label className='flex items-center gap-2'>
                        <Checkbox checked={parestesiasInicial} onCheckedChange={(v) => setParestesiasInicial(v === true)} />
                        <span className='font-medium'>Parestesias</span>
                      </label>
                      <label className='flex items-center gap-2'>
                        <Checkbox checked={dorIrradiadaInicial} onCheckedChange={(v) => setDorIrradiadaInicial(v === true)} />
                        <span className='font-medium'>Dor irradiada</span>
                      </label>
                    </div>
                  </div>

                  <div className='space-y-1 rounded-md border p-3'>
                    <span className='block text-[11px] font-medium'>Marcha Autónoma</span>
                    <div className='flex gap-4 text-[11px]'>
                      <label className='flex items-center gap-1'>
                        <input type='radio' name='marcha-ini' className='h-3 w-3' checked={marchaAutonomaInicial === '1'} onChange={() => setMarchaAutonomaInicial('1')} />
                        Sim
                      </label>
                      <label className='flex items-center gap-1'>
                        <input type='radio' name='marcha-ini' className='h-3 w-3' checked={marchaAutonomaInicial === '2'} onChange={() => setMarchaAutonomaInicial('2')} />
                        C/ Auxiliar
                      </label>
                      <label className='flex items-center gap-1'>
                        <input type='radio' name='marcha-ini' className='h-3 w-3' checked={marchaAutonomaInicial === '3'} onChange={() => setMarchaAutonomaInicial('3')} />
                        Não
                      </label>
                    </div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>Observações</span>
                    <Textarea className='min-h-[50px] resize-none' value={observacoesMarchaAutonomaInicial} onChange={(e) => setObservacoesMarchaAutonomaInicial(e.target.value)} />
                  </div>

                  <div className='space-y-1 rounded-md border p-3'>
                    <div className='flex gap-6'>
                      <label className='flex items-center gap-2'>
                        <Checkbox checked={cicatrizInicial} onCheckedChange={(v) => setCicatrizInicial(v === true)} />
                        <span className='font-medium'>Cicatriz</span>
                      </label>
                      <label className='flex items-center gap-2'>
                        <Checkbox checked={fraquezaMuscularInicial} onCheckedChange={(v) => setFraquezaMuscularInicial(v === true)} />
                        <span className='font-medium'>Fraqueza muscular</span>
                      </label>
                    </div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>Qualificação muscular</span>
                    <Textarea className='min-h-[50px] resize-none' value={zonaFraquezaInicialDescricao} onChange={(e) => setZonaFraquezaInicialDescricao(e.target.value)} />
                  </div>

                  
                </TabsContent>

                <TabsContent value='ini-objetivos' className='mt-3 space-y-3 rounded-md border p-4'>
                  <h4 className='text-[11px] font-semibold uppercase text-teal-700'>
                    Objetivos de Reabilitação
                  </h4>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-1'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>Objetivos específicos</span>
                      <Textarea className='min-h-[60px] resize-none min-w-full' value={objetivosEspecificosInicial} onChange={(e) => setObjetivosEspecificosInicial(e.target.value)} />
                    </div>
                  </div>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>Nº sessões propostas</span>
                      <Input value={sessoesPropostasInicial} onChange={(e) => setSessoesPropostasInicial(e.target.value)} />
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>Tempo necessário</span>
                      <Input value={tempoNecessarioInicial} onChange={(e) => setTempoNecessarioInicial(e.target.value)} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* ── AVALIAÇÃO FINAL ── */}
            <TabsContent value='avaliacao-final' className='mt-3'>
              <Tabs defaultValue='fin-avaliacao' className='text-xs'>
                <TabsList className='w-full justify-start overflow-x-auto'>
                  <TabsTrigger value='fin-avaliacao'>Avaliação</TabsTrigger>
                  <TabsTrigger value='fin-exame'>Exame Físico</TabsTrigger>
                  <TabsTrigger value='fin-objetivos'>Objetivos de Reabilitação</TabsTrigger>
                  <TabsTrigger value='fin-alta'>Alta</TabsTrigger>
                </TabsList>

                {/* Avaliação Final – Avaliação */}
                <TabsContent value='fin-avaliacao' className='mt-3 space-y-3 rounded-md border p-4'>
                  <h4 className='text-[11px] font-semibold uppercase text-teal-700'>
                     Avaliação
                  </h4>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                    <label className='flex items-center gap-2'>
                      <Checkbox
                        checked={pacienteInformadoFinal}
                        onCheckedChange={(v) => setPacienteInformadoFinal(v === true)}
                      />
                      <span>Paciente informado</span>
                    </label>
                    <label className='flex items-center gap-2'>
                      <Checkbox
                        checked={pacienteMotivadoFinal}
                        onCheckedChange={(v) => setPacienteMotivadoFinal(v === true)}
                      />
                      <span>Paciente motivado</span>
                    </label>
                    <label className='flex items-center gap-2'>
                      <Checkbox
                        checked={pacienteColaboranteFinal}
                        onCheckedChange={(v) => setPacienteColaboranteFinal(v === true)}
                      />
                      <span>Paciente colaborante</span>
                    </label>
                  </div>

                  <span className='block text-[11px] font-semibold uppercase text-teal-700'>
                    Avaliação Subjetiva
                  </span>
                  <div className='grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Avaliação subjetiva
                      </span>
                      <Textarea
                        className='min-h-[80px] resize-none'
                        value={avaliacaoSubjetivaFinal}
                        onChange={(e) => setAvaliacaoSubjetivaFinal(e.target.value)}
                      />
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Observações
                      </span>
                      <Textarea
                        className='min-h-[80px] resize-none'
                        value={observacoesAvaliacaoFinal}
                        onChange={(e) => setObservacoesAvaliacaoFinal(e.target.value)}
                      />
                    </div>
                  </div>

                  <span className='block text-[11px] font-semibold uppercase text-teal-700'>Dor</span>
                  <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Início da dor
                      </span>
                      <div className='flex gap-4 text-[11px]'>
                        <label className='flex items-center gap-1'>
                          <input
                            type='radio'
                            name='inicio-dor-fin'
                            className='h-3 w-3'
                            checked={tipoInicioDorFinal === '1'}
                            onChange={() => setTipoInicioDorFinal('1')}
                          />
                          Súbito
                        </label>
                        <label className='flex items-center gap-1'>
                          <input
                            type='radio'
                            name='inicio-dor-fin'
                            className='h-3 w-3'
                            checked={tipoInicioDorFinal === '2'}
                            onChange={() => setTipoInicioDorFinal('2')}
                          />
                          Gradual
                        </label>
                      </div>
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Tipo de dor
                      </span>
                      <Textarea
                        className='min-h-[50px] resize-none'
                        value={tipoDorFinal}
                        onChange={(e) => setTipoDorFinal(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Escala numérica da dor (0–10)
                    </span>
                    <input
                      type='range'
                      min={0}
                      max={10}
                      step={1}
                      value={valorDorFinal || '0'}
                      onChange={(e) => setValorDorFinal(e.target.value)}
                      className='block w-full accent-teal-600'
                    />
                    <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                    <span className='text-[11px] font-medium text-teal-700'>
                      Valor: {valorDorFinal || '0'} – {getLabelEscalaDor(valorDorFinal || '0')}
                    </span>
                  </div>
                </TabsContent>

                {/* Avaliação Final – Exame Físico */}
                <TabsContent value='fin-exame' className='mt-3 space-y-4 rounded-md border p-4'>
                  <h4 className='text-[11px] font-semibold uppercase text-teal-700'>
                    Exame Físico
                  </h4>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Região
                      </span>
                      <Select
                        value={exameFisicoRegiaoFinalId}
                        onValueChange={setExameFisicoRegiaoFinalId}
                      >
                        <SelectTrigger className='h-8 text-xs'>
                          <SelectValue placeholder='Região...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='placeholder'>–</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Patologia
                      </span>
                      <Select value={patologiaFinalId} onValueChange={setPatologiaFinalId}>
                        <SelectTrigger className='h-8 text-xs'>
                          <SelectValue placeholder='Patologia...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='placeholder'>–</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='space-y-1 rounded-md border p-3'>
                    <label className='flex items-center gap-2'>
                      <Checkbox
                        checked={edemaFinal}
                        onCheckedChange={(v) => setEdemaFinal(v === true)}
                      />
                      <span className='font-medium'>Edema</span>
                    </label>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Observações
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={observacoesEdemaFinal}
                      onChange={(e) => setObservacoesEdemaFinal(e.target.value)}
                    />
                  </div>

                  <div className='space-y-1 rounded-md border p-3'>
                    <label className='flex items-center gap-2'>
                      <Checkbox
                        checked={elasticidadeFinal}
                        onCheckedChange={(v) => setElasticidadeFinal(v === true)}
                      />
                      <span className='font-medium'>Alterações sensibilidade</span>
                    </label>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Observações
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={observacoesElasticidadeFinal}
                      onChange={(e) => setObservacoesElasticidadeFinal(e.target.value)}
                    />
                  </div>

                  <div className='space-y-1 rounded-md border p-3'>
                    <div className='flex gap-6'>
                      <label className='flex items-center gap-2'>
                        <Checkbox
                          checked={parestesiasFinal}
                          onCheckedChange={(v) => setParestesiasFinal(v === true)}
                        />
                        <span className='font-medium'>Parestesias</span>
                      </label>
                      <label className='flex items-center gap-2'>
                        <Checkbox
                          checked={dorIrradiadaFinal}
                          onCheckedChange={(v) => setDorIrradiadaFinal(v === true)}
                        />
                        <span className='font-medium'>Dor irradiada</span>
                      </label>
                    </div>
                  </div>

                  <div className='space-y-1 rounded-md border p-3'>
                    <span className='block text-[11px] font-medium'>Marcha Autónoma</span>
                    <div className='flex gap-4 text-[11px]'>
                      <label className='flex items-center gap-1'>
                        <input
                          type='radio'
                          name='marcha-fin'
                          className='h-3 w-3'
                          checked={marchaAutonomaFinal === '1'}
                          onChange={() => setMarchaAutonomaFinal('1')}
                        />
                        Sim
                      </label>
                      <label className='flex items-center gap-1'>
                        <input
                          type='radio'
                          name='marcha-fin'
                          className='h-3 w-3'
                          checked={marchaAutonomaFinal === '2'}
                          onChange={() => setMarchaAutonomaFinal('2')}
                        />
                        C/ Auxiliar
                      </label>
                      <label className='flex items-center gap-1'>
                        <input
                          type='radio'
                          name='marcha-fin'
                          className='h-3 w-3'
                          checked={marchaAutonomaFinal === '3'}
                          onChange={() => setMarchaAutonomaFinal('3')}
                        />
                        Não
                      </label>
                    </div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Observações
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={observacoesMarchaAutonomaFinal}
                      onChange={(e) => setObservacoesMarchaAutonomaFinal(e.target.value)}
                    />
                  </div>

                  <div className='space-y-1 rounded-md border p-3'>
                    <div className='flex gap-6'>
                      <label className='flex items-center gap-2'>
                        <Checkbox
                          checked={cicatrizFinal}
                          onCheckedChange={(v) => setCicatrizFinal(v === true)}
                        />
                        <span className='font-medium'>Cicatriz</span>
                      </label>
                      <label className='flex items-center gap-2'>
                        <Checkbox
                          checked={fraquezaMuscularFinal}
                          onCheckedChange={(v) => setFraquezaMuscularFinal(v === true)}
                        />
                        <span className='font-medium'>Fraqueza muscular</span>
                      </label>
                    </div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Qualificação muscular
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={zonaFraquezaFinalDescricao}
                      onChange={(e) => setZonaFraquezaFinalDescricao(e.target.value)}
                    />
                  </div>

                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Goniometria
                      </span>
                      <Textarea
                        className='min-h-[50px] resize-none'
                        value={goniometriaFinal}
                        onChange={(e) => setGoniometriaFinal(e.target.value)}
                      />
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Teste muscular
                      </span>
                      <Textarea
                        className='min-h-[50px] resize-none'
                        value={testeMuscularFinal}
                        onChange={(e) => setTesteMuscularFinal(e.target.value)}
                      />
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Autonomia
                      </span>
                      <Textarea
                        className='min-h-[50px] resize-none'
                        value={autonomiaFinal}
                        onChange={(e) => setAutonomiaFinal(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Avaliação Final – Objetivos de Reabilitação */}
                <TabsContent value='fin-objetivos' className='mt-3 space-y-3 rounded-md border p-4'>
                  <h4 className='text-[11px] font-semibold uppercase text-teal-700'>
                    Objetivos de Reabilitação
                  </h4>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Objetivos alcançados
                      </span>
                      <Textarea
                        className='min-h-[60px] resize-none'
                        value={objetivosAlcancados}
                        onChange={(e) => setObjetivosAlcancados(e.target.value)}
                      />
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Novos objetivos
                      </span>
                      <Textarea
                        className='min-h-[60px] resize-none'
                        value={novosObjetivos}
                        onChange={(e) => setNovosObjetivos(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Nº sessões propostas
                      </span>
                      <Input
                        value={sessoesPropostasFinal}
                        onChange={(e) => setSessoesPropostasFinal(e.target.value)}
                      />
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Tempo necessário
                      </span>
                      <Input
                        value={tempoNecessarioFinal}
                        onChange={(e) => setTempoNecessarioFinal(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Avaliação Final – Data de Alta */}
                <TabsContent value='fin-alta' className='mt-3 space-y-3 rounded-md border p-4'>
                  <h4 className='text-[11px] font-semibold uppercase text-teal-700'>
                    Avaliação Final – Data de Alta
                  </h4>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Data de Alta
                      </span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !dataAlta && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {dataAlta ? format(dataAlta, 'dd/MM/yyyy') : 'Escolher data'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={dataAlta ?? undefined}
                            onSelect={(d) => setDataAlta(d ?? null)}
                            initialFocus
                            locale={pt}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Motivo da Alta (cód.)
                      </span>
                      <Input
                        value={motivoAltaId}
                        onChange={(e) => setMotivoAltaId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Escala Numérica da Dor (0–10)
                    </span>
                    <input
                      type='range'
                      min={0}
                      max={10}
                      step={1}
                      value={escalaDorAlta || '0'}
                      onChange={(e) => setEscalaDorAlta(e.target.value)}
                      className='block w-full accent-teal-600'
                    />
                    <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                    <span className='text-[11px] font-medium text-teal-700'>
                      Valor: {escalaDorAlta || '0'} – {getLabelEscalaDor(escalaDorAlta || '0')}
                    </span>
                  </div>

                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Indicações para o utente
                    </span>
                    <Textarea
                      className='min-h-[60px] resize-none'
                      value={indicacoesParaUtenteAlta}
                      onChange={(e) => setIndicacoesParaUtenteAlta(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* ── OBSERVAÇÃO MÉDICA ── */}
            <TabsContent value='observacao-medica' className='mt-3'>
              <div className='rounded-md border p-4'>
                <h4 className='text-[11px] font-semibold uppercase text-teal-700'>Observação Médica</h4>
                <Textarea className='mt-2 min-h-[120px] resize-none' value={observacaoClinica} onChange={(e) => setObservacaoClinica(e.target.value)} />
              </div>
            </TabsContent>

            {/* ── BODY CHART ── */}
            <TabsContent value='body-chart' className='mt-3'>
              <BodyChartTab tratamentoId={tratamentoId} />
            </TabsContent>

            {/* ── DOCUMENTOS ── */}
            <TabsContent value='documentos' className='mt-3'>
              <div className='rounded-md border bg-card p-4'>
                <div className='mb-3 flex items-center justify-between'>
                  <h4 className='text-[11px] font-semibold uppercase text-teal-700'>
                    Ficheiros
                  </h4>
                  <Button size='sm' onClick={handleAddDocumento}>
                    Anexar Ficheiro
                  </Button>
                </div>

                <div className='overflow-x-auto'>
                  <Table className='text-xs'>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-16 text-left'>Id</TableHead>
                        <TableHead className='text-left'>Título</TableHead>
                        <TableHead className='w-40 text-left'>Data</TableHead>
                        <TableHead className='w-40 text-left'>Opções</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {docsLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className='py-6 text-center text-muted-foreground'
                          >
                            A carregar ficheiros...
                          </TableCell>
                        </TableRow>
                      ) : documentosRemotos.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className='py-6 text-center text-muted-foreground'
                          >
                            Não existem dados a apresentar.
                          </TableCell>
                        </TableRow>
                      ) : (
                        documentosRemotos.map((d: EvolucaoTratamentoFicheiroDTO, idx: number) => (
                          <TableRow key={d.id}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{d.titulo}</TableCell>
                            <TableCell>
                              {d.createdOn
                                ? format(new Date(d.createdOn), 'dd/MM/yyyy')
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <span className='mr-2 text-[11px] text-muted-foreground'>
                                {d.fileName}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Dialog open={docModalOpen} onOpenChange={setDocModalOpen}>
                <DialogContent className='sm:max-w-lg'>
                  <DialogHeader>
                    <DialogTitle>Ficheiros</DialogTitle>
                  </DialogHeader>
                  <div className='mt-2 flex flex-col gap-3 text-xs'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Título
                      </span>
                      <Input
                        value={docTitulo}
                        onChange={(e) => setDocTitulo(e.target.value)}
                      />
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Imagem / Ficheiro
                      </span>
                      <input
                        type='file'
                        className='block w-full text-[11px]'
                        onChange={(e) =>
                          setDocFile(e.target.files?.[0] ?? null)
                        }
                      />
                      {docFile && (
                        <p className='mt-1 text-[11px] text-muted-foreground'>
                          Selecionado: {docFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setDocModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size='sm'
                      onClick={handleConfirmDocumento}
                      disabled={!docTitulo || !docFile}
                    >
                      OK
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ── ALTA ── */}
          </Tabs>

          <div className='mt-2 flex items-center justify-end gap-2 rounded-md border bg-card p-3'>
            <Button type='button' variant='outline' size='sm' onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button size='sm' onClick={handleSave} disabled={saving || !tratamentoId}>
              {saving ? 'A guardar…' : 'Guardar'}
            </Button>
          </div>
        </div>
      </DashboardPageContainer>
    </>
  )
}

