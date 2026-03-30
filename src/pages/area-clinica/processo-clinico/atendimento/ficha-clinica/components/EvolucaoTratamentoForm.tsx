import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { pt } from 'date-fns/locale'
import type { EvolucaoTratamentoDTO } from '@/types/dtos/tratamentos/evolucao-tratamento.dtos'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BodyChartTab } from '../tabs/BodyChartTab'
import { useAuthStore } from '@/stores/auth-store'

type EvolucaoTratamentoFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tratamentoResumo: {
    id: string
    designacao?: string | null
    organismoNome?: string | null
    numSessao?: number | null
  } | null
  evolucaoExistente?: EvolucaoTratamentoDTO | null
  onSave: (payload: Omit<EvolucaoTratamentoDTO, 'id'> & { id?: string }) => Promise<void>
}

export function EvolucaoTratamentoForm({
  open,
  onOpenChange,
  tratamentoResumo,
  evolucaoExistente,
  onSave,
}: EvolucaoTratamentoFormProps) {
  const nomeUtilizador = useAuthStore((state) => state.name) || 'Utilizador'
  const [saving, setSaving] = useState(false)

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
  const [tipoEdemaInicial, setTipoEdemaInicial] = useState<string>('')
  const [regiaoEdemaInicialDescricao, setRegiaoEdemaInicialDescricao] = useState('')
  const [observacoesEdemaInicial, setObservacoesEdemaInicial] = useState('')
  const [elasticidadeInicial, setElasticidadeInicial] = useState(false)
  const [observacoesElasticidadeInicial, setObservacoesElasticidadeInicial] = useState('')
  const [parestesiasInicial, setParestesiasInicial] = useState(false)
  const [zonaParestesiasInicialDescricao, setZonaParestesiasInicialDescricao] = useState('')
  const [dorIrradiadaInicial, setDorIrradiadaInicial] = useState(false)
  const [zonaDorIrradiadaInicialDescricao, setZonaDorIrradiadaInicialDescricao] = useState('')
  const [cicatrizInicial, setCicatrizInicial] = useState(false)
  const [zonaCicatrizInicialDescricao, setZonaCicatrizInicialDescricao] = useState('')
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
  const [tipoEdemaFinal, setTipoEdemaFinal] = useState<string>('')
  const [regiaoEdemaFinalDescricao, setRegiaoEdemaFinalDescricao] = useState('')
  const [observacoesEdemaFinal, setObservacoesEdemaFinal] = useState('')
  const [elasticidadeFinal, setElasticidadeFinal] = useState(false)
  const [observacoesElasticidadeFinal, setObservacoesElasticidadeFinal] = useState('')
  const [parestesiasFinal, setParestesiasFinal] = useState(false)
  const [zonaParestesiasFinalDescricao, setZonaParestesiasFinalDescricao] = useState('')
  const [dorIrradiadaFinal, setDorIrradiadaFinal] = useState(false)
  const [zonaDorIrradiadaFinalDescricao, setZonaDorIrradiadaFinalDescricao] = useState('')
  const [cicatrizFinal, setCicatrizFinal] = useState(false)
  const [zonaCicatrizFinalDescricao, setZonaCicatrizFinalDescricao] = useState('')
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

  useEffect(() => {
    if (!open) return

    setPacienteInformadoInicial(evolucaoExistente?.pacienteInformadoInicial ?? false)
    setPacienteMotivadoInicial(evolucaoExistente?.pacienteMotivadoInicial ?? false)
    setPacienteColaboranteInicial(evolucaoExistente?.pacienteColaboranteInicial ?? false)
    setAvaliacaoSubjetivaInicial(evolucaoExistente?.avaliacaoSubjetivaInicial ?? '')
    setObservacoesAvaliacaoInicial(evolucaoExistente?.observacoesAvaliacaoInicial ?? '')
    setValorDorInicial(
      evolucaoExistente?.valorDorInicial != null
        ? String(evolucaoExistente.valorDorInicial)
        : '',
    )
    setTipoInicioDorInicial(
      evolucaoExistente?.tipoInicioDorInicial != null
        ? String(evolucaoExistente.tipoInicioDorInicial)
        : '',
    )
    setTipoDorInicial(evolucaoExistente?.tipoDorInicial ?? '')
    setExameFisicoRegiaoInicial(evolucaoExistente?.exameFisicoRegiaoInicial ?? '')
    setPatologiaInicial(evolucaoExistente?.patologiaInicial ?? '')
    setEdemaInicial(evolucaoExistente?.edemaInicial ?? false)
    setTipoEdemaInicial(
      evolucaoExistente?.tipoEdemaInicial != null
        ? String(evolucaoExistente.tipoEdemaInicial)
        : '',
    )
    setRegiaoEdemaInicialDescricao(evolucaoExistente?.regiaoEdemaInicialDescricao ?? '')
    setObservacoesEdemaInicial(evolucaoExistente?.observacoesEdemaInicial ?? '')
    setElasticidadeInicial(evolucaoExistente?.elasticidadeInicial ?? false)
    setObservacoesElasticidadeInicial(evolucaoExistente?.observacoesElasticidadeInicial ?? '')
    setParestesiasInicial(evolucaoExistente?.parestesiasInicial ?? false)
    setZonaParestesiasInicialDescricao(
      evolucaoExistente?.zonaParestesiasInicialDescricao ?? '',
    )
    setDorIrradiadaInicial(evolucaoExistente?.dorIrradiadaInicial ?? false)
    setZonaDorIrradiadaInicialDescricao(
      evolucaoExistente?.zonaDorIrradiadaInicialDescricao ?? '',
    )
    setCicatrizInicial(evolucaoExistente?.cicatrizInicial ?? false)
    setZonaCicatrizInicialDescricao(evolucaoExistente?.zonaCicatrizInicialDescricao ?? '')
    setFraquezaMuscularInicial(evolucaoExistente?.fraquezaMuscularInicial ?? false)
    setZonaFraquezaInicialDescricao(evolucaoExistente?.zonaFraquezaInicialDescricao ?? '')
    setMarchaAutonomaInicial(
      evolucaoExistente?.marchaAutonomaInicial != null
        ? String(evolucaoExistente.marchaAutonomaInicial)
        : '',
    )
    setObservacoesMarchaAutonomaInicial(
      evolucaoExistente?.observacoesMarchaAutonomaInicial ?? '',
    )
    setGoniometriaInicial(evolucaoExistente?.goniometriaInicial ?? '')
    setTesteMuscularInicial(evolucaoExistente?.testeMuscularInicial ?? '')
    setAutonomiaInicial(evolucaoExistente?.autonomiaInicial ?? '')
    setObjetivosEspecificosInicial(evolucaoExistente?.objetivosEspecificosInicial ?? '')
    setSessoesPropostasInicial(evolucaoExistente?.sessoesPropostasInicial ?? '')
    setTempoNecessarioInicial(evolucaoExistente?.tempoNecessarioInicial ?? '')

    setPacienteInformadoFinal(evolucaoExistente?.pacienteInformadoFinal ?? false)
    setPacienteMotivadoFinal(evolucaoExistente?.pacienteMotivadoFinal ?? false)
    setPacienteColaboranteFinal(evolucaoExistente?.pacienteColaboranteFinal ?? false)
    setAvaliacaoSubjetivaFinal(evolucaoExistente?.avaliacaoSubjetivaFinal ?? '')
    setObservacoesAvaliacaoFinal(evolucaoExistente?.observacoesAvaliacaoFinal ?? '')
    setValorDorFinal(
      evolucaoExistente?.valorDorFinal != null ? String(evolucaoExistente.valorDorFinal) : '',
    )
    setTipoInicioDorFinal(
      evolucaoExistente?.tipoInicioDorFinal != null
        ? String(evolucaoExistente.tipoInicioDorFinal)
        : '',
    )
    setTipoDorFinal(evolucaoExistente?.tipoDorFinal ?? '')
    setExameFisicoRegiaoFinalId(evolucaoExistente?.exameFisicoRegiaoFinalId ?? '')
    setPatologiaFinalId(evolucaoExistente?.patologiaFinalId ?? '')
    setEdemaFinal(evolucaoExistente?.edemaFinal ?? false)
    setTipoEdemaFinal(
      evolucaoExistente?.tipoEdemaFinal != null
        ? String(evolucaoExistente.tipoEdemaFinal)
        : '',
    )
    setRegiaoEdemaFinalDescricao(evolucaoExistente?.regiaoEdemaFinalDescricao ?? '')
    setObservacoesEdemaFinal(evolucaoExistente?.observacoesEdemaFinal ?? '')
    setElasticidadeFinal(evolucaoExistente?.elasticidadeFinal ?? false)
    setObservacoesElasticidadeFinal(evolucaoExistente?.observacoesElasticidadeFinal ?? '')
    setParestesiasFinal(evolucaoExistente?.parestesiasFinal ?? false)
    setZonaParestesiasFinalDescricao(
      evolucaoExistente?.zonaParestesiasFinalDescricao ?? '',
    )
    setDorIrradiadaFinal(evolucaoExistente?.dorIrradiadaFinal ?? false)
    setZonaDorIrradiadaFinalDescricao(
      evolucaoExistente?.zonaDorIrradiadaFinalDescricao ?? '',
    )
    setCicatrizFinal(evolucaoExistente?.cicatrizFinal ?? false)
    setZonaCicatrizFinalDescricao(evolucaoExistente?.zonaCicatrizFinalDescricao ?? '')
    setFraquezaMuscularFinal(evolucaoExistente?.fraquezaMuscularFinal ?? false)
    setZonaFraquezaFinalDescricao(evolucaoExistente?.zonaFraquezaFinalDescricao ?? '')
    setMarchaAutonomaFinal(
      evolucaoExistente?.marchaAutonomaFinal != null
        ? String(evolucaoExistente.marchaAutonomaFinal)
        : '',
    )
    setObservacoesMarchaAutonomaFinal(
      evolucaoExistente?.observacoesMarchaAutonomaFinal ?? '',
    )
    setGoniometriaFinal(evolucaoExistente?.goniometriaFinal ?? '')
    setTesteMuscularFinal(evolucaoExistente?.testeMuscularFinal ?? '')
    setAutonomiaFinal(evolucaoExistente?.autonomiaFinal ?? '')
    setSessoesPropostasFinal(evolucaoExistente?.sessoesPropostasFinal ?? '')
    setTempoNecessarioFinal(evolucaoExistente?.tempoNecessarioFinal ?? '')

    setDataAlta(
      evolucaoExistente?.dataAlta ? new Date(evolucaoExistente.dataAlta) : null,
    )
    setEscalaDorAlta(
      evolucaoExistente?.escalaDorAlta != null ? String(evolucaoExistente.escalaDorAlta) : '',
    )
    setObjetivosAlcancados(evolucaoExistente?.objetivosAlcancados ?? '')
    setNovosObjetivos(evolucaoExistente?.novosObjetivos ?? '')
    setMotivoAltaId(evolucaoExistente?.motivoAltaId ?? '')
    setIndicacoesParaUtenteAlta(evolucaoExistente?.indicacoesParaUtenteAlta ?? '')
    setObservacaoClinica(evolucaoExistente?.observacaoClinica ?? '')
  }, [open, evolucaoExistente])

  const handleSave = async () => {
    if (!tratamentoResumo) return
    setSaving(true)
    try {
      const now = new Date()
      const timestamp = format(now, 'dd/MM/yyyy HH:mm')
      const baseMensagemInicial = avaliacaoSubjetivaInicial.trim()
      const novoHistoricoEntrada = baseMensagemInicial
        ? `${nomeUtilizador} - ${timestamp}
${baseMensagemInicial}`
        : ''
      const historicoCombinado = novoHistoricoEntrada
        ? observacaoClinica
          ? `${observacaoClinica}

${novoHistoricoEntrada}`
          : novoHistoricoEntrada
        : observacaoClinica

      const payload: Omit<EvolucaoTratamentoDTO, 'id'> & { id?: string } = {
        ...(evolucaoExistente?.id ? { id: evolucaoExistente.id } : {}),
        tratamentoId: tratamentoResumo.id,
        utenteId: evolucaoExistente?.utenteId ?? '',

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
        tipoEdemaInicial: tipoEdemaInicial ? Number(tipoEdemaInicial) : null,
        regiaoEdemaInicialDescricao: regiaoEdemaInicialDescricao || null,
        observacoesEdemaInicial: observacoesEdemaInicial || null,
        elasticidadeInicial,
        observacoesElasticidadeInicial: observacoesElasticidadeInicial || null,
        parestesiasInicial,
        zonaParestesiasInicialDescricao: zonaParestesiasInicialDescricao || null,
        dorIrradiadaInicial,
        zonaDorIrradiadaInicialDescricao: zonaDorIrradiadaInicialDescricao || null,
        cicatrizInicial,
        zonaCicatrizInicialDescricao: zonaCicatrizInicialDescricao || null,
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
        tipoEdemaFinal: tipoEdemaFinal ? Number(tipoEdemaFinal) : null,
        regiaoEdemaFinalDescricao: regiaoEdemaFinalDescricao || null,
        observacoesEdemaFinal: observacoesEdemaFinal || null,
        elasticidadeFinal,
        observacoesElasticidadeFinal: observacoesElasticidadeFinal || null,
        parestesiasFinal,
        zonaParestesiasFinalDescricao: zonaParestesiasFinalDescricao || null,
        dorIrradiadaFinal,
        zonaDorIrradiadaFinalDescricao: zonaDorIrradiadaFinalDescricao || null,
        cicatrizFinal,
        zonaCicatrizFinalDescricao: zonaCicatrizFinalDescricao || null,
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
      } as unknown as Omit<EvolucaoTratamentoDTO, 'id'> & { id?: string }

      await onSave(payload)
      // Depois de guardar, limpa o campo de avaliação subjetiva/observações
      setAvaliacaoSubjetivaInicial('')
      setObservacoesAvaliacaoInicial('')
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const titulo = evolucaoExistente ? 'Editar Evolução do Tratamento' : 'Nova Evolução do Tratamento'

  const getLabelEscalaDor = (valor: string) => {
    const v = Number(valor)
    if (Number.isNaN(v)) return ''
    if (v === 0) return 'Sem dor'
    if (v <= 3) return 'Dor ligeira'
    if (v <= 6) return 'Dor moderada'
    if (v <= 8) return 'Dor intensa'
    return 'Dor muito intensa'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[1200px] md:h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {tratamentoResumo && (
            <p className='mt-1 text-xs text-muted-foreground'>
              Tratamento: <span className='font-medium'>{tratamentoResumo.designacao ?? '-'}</span>{' '}
              · Organismo: {tratamentoResumo.organismoNome ?? '-'} · Nº Sessões:{' '}
              {tratamentoResumo.numSessao ?? '-'}
            </p>
          )}
        </DialogHeader>

        <Tabs defaultValue='avaliacao-inicial' className='mt-2 text-xs flex-1 flex flex-col'>
          <TabsList className='w-full justify-start overflow-x-auto'>
            <TabsTrigger value='avaliacao-inicial'>Avaliação Inicial</TabsTrigger>
            <TabsTrigger value='avaliacao-final'>Avaliação Final</TabsTrigger>
            <TabsTrigger value='alta'>Alta</TabsTrigger>
            <TabsTrigger value='observacoes'>Observações Clínicas</TabsTrigger>
            <TabsTrigger value='bodychart'>Body Chart</TabsTrigger>
          </TabsList>

          <TabsContent
            value='avaliacao-inicial'
            className='mt-3 flex-1 overflow-y-auto rounded-md border bg-muted/10 p-3'
          >
            <Tabs defaultValue='ini-avaliacao' className='text-xs'>
              <TabsList className='w-full justify-start overflow-x-auto'>
                <TabsTrigger value='ini-avaliacao'>Avaliação</TabsTrigger>
                <TabsTrigger value='ini-exame'>Exame Físico</TabsTrigger>
                <TabsTrigger value='ini-objetivos'>Objetivos de Reabilitação</TabsTrigger>
              </TabsList>

              <TabsContent value='ini-avaliacao' className='mt-3 space-y-3'>
                <h4 className='text-[11px] font-semibold uppercase text-muted-foreground'>
                  Avaliação Inicial
                </h4>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={pacienteInformadoInicial}
                      onCheckedChange={(v) => setPacienteInformadoInicial(v === true)}
                    />
                    <span>Paciente informado</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={pacienteMotivadoInicial}
                      onCheckedChange={(v) => setPacienteMotivadoInicial(v === true)}
                    />
                    <span>Paciente motivado</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={pacienteColaboranteInicial}
                      onCheckedChange={(v) => setPacienteColaboranteInicial(v === true)}
                    />
                    <span>Paciente colaborante</span>
                  </label>
                </div>
                <div>
                  <span className='mt-5 block text-[11px] font-semibold uppercase text-muted-foreground'>
                    Avaliação Subjetiva
                  </span>
                </div>
                  <div className='grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                          Registo de Historial
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
                
                <div className='mt-3'>
                  <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                    Observações
                  </span>
                  <Textarea
                    className='min-h-[60px] resize-none'
                    value={observacoesAvaliacaoInicial}
                    onChange={(e) => setObservacoesAvaliacaoInicial(e.target.value)}
                  />
                </div>
                <div className='mt-3 space-y-2'>
                  <span className='mb-1 block text-[11px] font-semibold uppercase text-muted-foreground'>
                    Dor
                  </span>
                  <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Início da dor
                      </span>
                      <div className='flex gap-4 text-[11px]'>
                        <label className='flex items-center gap-1'>
                          <input
                            type='radio'
                            name='inicio-dor-inicial'
                            className='h-3 w-3'
                            checked={tipoInicioDorInicial === '1'}
                            onChange={() => setTipoInicioDorInicial('1')}
                          />
                          Súbito
                        </label>
                        <label className='flex items-center gap-1'>
                          <input
                            type='radio'
                            name='inicio-dor-inicial'
                            className='h-3 w-3'
                            checked={tipoInicioDorInicial === '2'}
                            onChange={() => setTipoInicioDorInicial('2')}
                          />
                          Gradual
                        </label>
                      </div>
                    </div>
                    <div>
                      <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                        Tipo de dor
                      </span>
                      <Input
                        value={tipoDorInicial}
                        onChange={(e) => setTipoDorInicial(e.target.value)}
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
                      value={valorDorInicial || '0'}
                      onChange={(e) => setValorDorInicial(e.target.value)}
                      className='block w-full accent-teal-600'
                    />
                    <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                    <span className='text-[11px] font-medium text-teal-700'>
                      Valor: {valorDorInicial || '0'} {getLabelEscalaDor(valorDorInicial || '0')}
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='ini-exame' className='mt-3 space-y-3'>
                <h4 className='text-[11px] font-semibold uppercase text-muted-foreground'>
                  Avaliação Inicial
                </h4>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Região Corporal
                    </span>
                    <Select
                      value={exameFisicoRegiaoInicial}
                      onValueChange={setExameFisicoRegiaoInicial}
                    >
                      <SelectTrigger className='h-8 text-xs'>
                        <SelectValue placeholder='Selecionar região corporal...' />
                      </SelectTrigger>
                      <SelectContent>
                        {/* TODO: popular com dados da BD */}
                        <SelectItem value='exame-1'>Exame 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Patologia
                    </span>
                    <Select value={patologiaInicial} onValueChange={setPatologiaInicial}>
                      <SelectTrigger className='h-8 text-xs'>
                        <SelectValue placeholder='Selecionar patologia...' />
                      </SelectTrigger>
                      <SelectContent>
                        {/* TODO: popular com dados da BD */}
                        <SelectItem value='patologia-1'>Patologia 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={edemaInicial}
                      onCheckedChange={(v) => setEdemaInicial(v === true)}
                    />
                    <span>Edema</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={elasticidadeInicial}
                      onCheckedChange={(v) => setElasticidadeInicial(v === true)}
                    />
                    <span>Alteração elasticidade</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={parestesiasInicial}
                      onCheckedChange={(v) => setParestesiasInicial(v === true)}
                    />
                    <span>Parestesias</span>
                  </label>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Zona / região edema
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={regiaoEdemaInicialDescricao}
                      onChange={(e) => setRegiaoEdemaInicialDescricao(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Obs. edema / elasticidade
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={observacoesEdemaInicial}
                      onChange={(e) => setObservacoesEdemaInicial(e.target.value)}
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Zona parestesias / dor irradiada
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={zonaParestesiasInicialDescricao}
                      onChange={(e) => setZonaParestesiasInicialDescricao(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Zona cicatriz / fraqueza muscular
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={zonaFraquezaInicialDescricao}
                      onChange={(e) => setZonaFraquezaInicialDescricao(e.target.value)}
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={dorIrradiadaInicial}
                      onCheckedChange={(v) => setDorIrradiadaInicial(v === true)}
                    />
                    <span>Dor irradiada</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={cicatrizInicial}
                      onCheckedChange={(v) => setCicatrizInicial(v === true)}
                    />
                    <span>Cicatriz</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={fraquezaMuscularInicial}
                      onCheckedChange={(v) => setFraquezaMuscularInicial(v === true)}
                    />
                    <span>Fraqueza muscular</span>
                  </label>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Marcha autónoma (1–3)
                    </span>
                    <Input
                      type='number'
                      min={1}
                      max={3}
                      value={marchaAutonomaInicial}
                      onChange={(e) => setMarchaAutonomaInicial(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Goniometria
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={goniometriaInicial}
                      onChange={(e) => setGoniometriaInicial(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Teste muscular
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={testeMuscularInicial}
                      onChange={(e) => setTesteMuscularInicial(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='ini-objetivos' className='mt-3 space-y-3'>
                <h4 className='text-[11px] font-semibold uppercase text-muted-foreground'>
                  Avaliação Inicial · Objetivos de Reabilitação
                </h4>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Autonomia
                    </span>
                <Textarea
                  className='min-h-[50px] resize-none'
                      value={autonomiaInicial}
                      onChange={(e) => setAutonomiaInicial(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Objetivos específicos
                    </span>
                    <Textarea
                      className='min-h-[50px]'
                      value={objetivosEspecificosInicial}
                      onChange={(e) => setObjetivosEspecificosInicial(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                    Nº sessões propostas / tempo necessário
                  </span>
                  <div className='flex gap-2'>
                    <Input
                      className='w-20'
                      placeholder='Sess.'
                      value={sessoesPropostasInicial}
                      onChange={(e) => setSessoesPropostasInicial(e.target.value)}
                    />
                    <Input
                      placeholder='Tempo'
                      value={tempoNecessarioInicial}
                      onChange={(e) => setTempoNecessarioInicial(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value='bodychart' className='mt-3 flex-1'>
            <BodyChartTab tratamentoId={tratamentoResumo?.id ?? ''} />
          </TabsContent>

          <TabsContent
            value='avaliacao-final'
            className='mt-3 max-h-[60vh] overflow-y-auto rounded-md border bg-muted/10 p-3'
          >
            <Tabs defaultValue='fin-avaliacao' className='text-xs'>
              <TabsList className='w-full justify-start overflow-x-auto'>
                <TabsTrigger value='fin-avaliacao'>Avaliação</TabsTrigger>
                <TabsTrigger value='fin-exame'>Exame Físico</TabsTrigger>
                <TabsTrigger value='fin-objetivos'>Objetivos de Reabilitação</TabsTrigger>
              </TabsList>

              <TabsContent value='fin-avaliacao' className='mt-3 space-y-3'>
                <h4 className='text-[11px] font-semibold uppercase text-muted-foreground'>
                  Avaliação Final
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
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-4'>
                  <div className='sm:col-span-1'>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Valor dor (0–10)
                    </span>
                    <Input
                      type='number'
                      min={0}
                      max={10}
                      value={valorDorFinal}
                      onChange={(e) => setValorDorFinal(e.target.value)}
                    />
                  </div>
                  <div className='sm:col-span-3'>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Avaliação subjetiva
                    </span>
                    <Textarea
                      className='min-h-[60px] resize-none'
                      value={avaliacaoSubjetivaFinal}
                      onChange={(e) => setAvaliacaoSubjetivaFinal(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                    Observações avaliação final
                  </span>
                  <Textarea
                    className='min-h-[60px]'
                    value={observacoesAvaliacaoFinal}
                    onChange={(e) => setObservacoesAvaliacaoFinal(e.target.value)}
                  />
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-4'>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Tipo início dor (cód.)
                    </span>
                    <Input
                      type='number'
                      value={tipoInicioDorFinal}
                      onChange={(e) => setTipoInicioDorFinal(e.target.value)}
                    />
                  </div>
                  <div className='sm:col-span-3'>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Tipo de dor
                    </span>
                    <Input
                      value={tipoDorFinal}
                      onChange={(e) => setTipoDorFinal(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='fin-exame' className='mt-3 space-y-3'>
                <h4 className='text-[11px] font-semibold uppercase text-muted-foreground'>
                  Avaliação Final · Exame Físico
                </h4>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Exame físico / região
                    </span>
                    <Textarea
                      className='min-h-[60px] resize-none'
                      value={exameFisicoRegiaoFinalId}
                      onChange={(e) => setExameFisicoRegiaoFinalId(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Patologia (evolução)
                    </span>
                    <Textarea
                      className='min-h-[60px]'
                      value={patologiaFinalId}
                      onChange={(e) => setPatologiaFinalId(e.target.value)}
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={edemaFinal}
                      onCheckedChange={(v) => setEdemaFinal(v === true)}
                    />
                    <span>Edema</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={elasticidadeFinal}
                      onCheckedChange={(v) => setElasticidadeFinal(v === true)}
                    />
                    <span>Alteração elasticidade</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={parestesiasFinal}
                      onCheckedChange={(v) => setParestesiasFinal(v === true)}
                    />
                    <span>Parestesias</span>
                  </label>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Zona / região edema
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={regiaoEdemaFinalDescricao}
                      onChange={(e) => setRegiaoEdemaFinalDescricao(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Obs. edema / elasticidade
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={observacoesEdemaFinal}
                      onChange={(e) => setObservacoesEdemaFinal(e.target.value)}
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Zona parestesias / dor irradiada
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={zonaParestesiasFinalDescricao}
                      onChange={(e) => setZonaParestesiasFinalDescricao(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Zona cicatriz / fraqueza muscular
                    </span>
                    <Textarea
                      className='min-h-[50px] resize-none'
                      value={zonaFraquezaFinalDescricao}
                      onChange={(e) => setZonaFraquezaFinalDescricao(e.target.value)}
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={dorIrradiadaFinal}
                      onCheckedChange={(v) => setDorIrradiadaFinal(v === true)}
                    />
                    <span>Dor irradiada</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={cicatrizFinal}
                      onCheckedChange={(v) => setCicatrizFinal(v === true)}
                    />
                    <span>Cicatriz</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <Checkbox
                      checked={fraquezaMuscularFinal}
                      onCheckedChange={(v) => setFraquezaMuscularFinal(v === true)}
                    />
                    <span>Fraqueza muscular</span>
                  </label>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Marcha autónoma (1–3)
                    </span>
                    <Input
                      type='number'
                      min={1}
                      max={3}
                      value={marchaAutonomaFinal}
                      onChange={(e) => setMarchaAutonomaFinal(e.target.value)}
                    />
                  </div>
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
                      className='min-h-[50px]'
                      value={testeMuscularFinal}
                      onChange={(e) => setTesteMuscularFinal(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='fin-objetivos' className='mt-3 space-y-3'>
                <h4 className='text-[11px] font-semibold uppercase text-muted-foreground'>
                  Avaliação Final · Objetivos de Reabilitação
                </h4>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                      Autonomia
                    </span>
                    <Textarea
                      className='min-h-[50px]'
                      value={autonomiaFinal}
                      onChange={(e) => setAutonomiaFinal(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                    Nº sessões propostas / tempo necessário
                  </span>
                  <div className='flex gap-2'>
                    <Input
                      className='w-20'
                      placeholder='Sess.'
                      value={sessoesPropostasFinal}
                      onChange={(e) => setSessoesPropostasFinal(e.target.value)}
                    />
                    <Input
                      placeholder='Tempo'
                      value={tempoNecessarioFinal}
                      onChange={(e) => setTempoNecessarioFinal(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent
            value='alta'
            className='mt-3 max-h-[60vh] overflow-y-auto rounded-md border bg-muted/10 p-3'
          >
            <section className='space-y-2'>
            <h4 className='text-[11px] font-semibold uppercase text-muted-foreground'>Alta</h4>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-4'>
              <div className='sm:col-span-1'>
                <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                  Data alta
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
              <div className='sm:col-span-1'>
                <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                  Escala dor alta (0–10)
                </span>
                <Input
                  type='number'
                  min={0}
                  max={10}
                  value={escalaDorAlta}
                  onChange={(e) => setEscalaDorAlta(e.target.value)}
                />
              </div>
              <div className='sm:col-span-2'>
                <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                  Objetivos alcançados
                </span>
                <Textarea
                  className='min-h-[60px] resize-none'
                  value={objetivosAlcancados}
                  onChange={(e) => setObjetivosAlcancados(e.target.value)}
                />
              </div>
            </div>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div>
                <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                  Novos objetivos
                </span>
                <Textarea
                  className='min-h-[60px]'
                  value={novosObjetivos}
                  onChange={(e) => setNovosObjetivos(e.target.value)}
                />
              </div>
              <div>
                <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                  Indicações para o utente
                </span>
                <Textarea
                  className='min-h-[60px]'
                  value={indicacoesParaUtenteAlta}
                  onChange={(e) => setIndicacoesParaUtenteAlta(e.target.value)}
                />
              </div>
            </div>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
              <div>
                <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                  Motivo alta (cód.)
                </span>
                <Input
                  value={motivoAltaId}
                  onChange={(e) => setMotivoAltaId(e.target.value)}
                />
              </div>
            </div>
            </section>
          </TabsContent>

          <TabsContent
            value='observacoes'
            className='mt-3 max-h-[60vh] overflow-y-auto rounded-md border bg-muted/10 p-3'
          >
            <section className='space-y-2'>
              <h4 className='text-[11px] font-semibold uppercase text-muted-foreground'>
                Observação Clínica 
              </h4>
              <Textarea
                className='min-h-[120px] resize-none'
                value={observacaoClinica}
                onChange={(e) => setObservacaoClinica(e.target.value)}
              />
            </section>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <div className='flex w-full items-center justify-between'>
            <div className='flex flex-wrap gap-2'>
              <Button type='button' variant='outline' size='sm' disabled>
                Body Chart
              </Button>
              <Button type='button' variant='outline' size='sm' disabled>
                Ver Relatório
              </Button>
            </div>
            <div className='flex gap-2'>
              <Button type='button' variant='outline' size='sm' onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button size='sm' onClick={handleSave} disabled={saving}>
                {saving ? 'A guardar…' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


