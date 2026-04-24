import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfigPageCardTitleRow } from '@/components/shared/config-page-card-title-row'
import { modules } from '@/config/modules'
import { useConfigPageEditMode } from '@/hooks/use-config-page-edit-mode'
import { toast } from '@/utils/toast-utils'
import { VozRuntimeService, VozService } from '@/lib/services/core/voz-service'
import type { VozBrowserOpcao } from '@/lib/services/core/voz-service/voz-runtime'
import type {
  AtualizarConfiguracaoVozRequest,
  ConfiguracaoVozDTO,
  ConfiguracaoVozOpcaoDTO,
  ConfiguracaoVozOpcoesDTO,
} from '@/types/dtos/core/voz.dtos'

type VozForm = {
  ativo: boolean
  provider: string
  idiomaPadrao: string
  sttIdioma: string
  sttAtivo: boolean
  sttInterimResults: boolean
  sttContinuous: boolean
  sttAutoPontuacao: boolean
  sttConfidenceMin: number
  sttSilenceTimeoutMs: number
  sttMaxAlternatives: number
  sttProfanityFilter: boolean
  ttsAtivo: boolean
  ttsVoice: string
  ttsRate: number
  ttsPitch: number
  ttsVolume: number
  timeoutMs: number
  maxDuracaoCapturaSegundos: number
}

type SessaoSttForm = {
  parar: () => void
  abortar: () => void
} | null

const vozPermId = modules.areaComum.permissions.configuracoesVoz.id

const initialForm: VozForm = {
  ativo: false,
  provider: 'web-speech',
  idiomaPadrao: 'pt-PT',
  sttIdioma: 'pt-PT',
  sttAtivo: true,
  sttInterimResults: true,
  sttContinuous: true,
  sttAutoPontuacao: true,
  sttConfidenceMin: 0.5,
  sttSilenceTimeoutMs: 2500,
  sttMaxAlternatives: 1,
  sttProfanityFilter: false,
  ttsAtivo: true,
  ttsVoice: '',
  ttsRate: 1,
  ttsPitch: 1,
  ttsVolume: 1,
  timeoutMs: 15000,
  maxDuracaoCapturaSegundos: 90,
}

export function VozConfigPage() {
  const {
    canChange,
    isEditing,
    formEditable,
    startEditing,
    cancelEditing,
    exitEditAfterSave,
  } = useConfigPageEditMode(vozPermId)
  const formLocked = !formEditable

  const [form, setForm] = useState<VozForm>(initialForm)
  const [textoTeste, setTextoTeste] = useState('Olá. Esta é uma mensagem de teste de voz do CliCloud.')
  const [vozesBrowser, setVozesBrowser] = useState<VozBrowserOpcao[]>([])
  const [aTraduzirTeste, setATraduzirTeste] = useState(false)
  const [mostrarAvancadas, setMostrarAvancadas] = useState(false)
  const [sessaoStt, setSessaoStt] = useState<SessaoSttForm>(null)
  const [sttTranscricao, setSttTranscricao] = useState('')
  const [sttErro, setSttErro] = useState<string | null>(null)
  const [sttEscutando, setSttEscutando] = useState(false)

  const configQuery = useQuery({
    queryKey: ['voz', 'configuracao'],
    queryFn: () => VozService().getConfiguracaoAtual(),
  })

  const opcoesQuery = useQuery({
    queryKey: ['voz', 'opcoes'],
    queryFn: () => VozService().getOpcoes(),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: AtualizarConfiguracaoVozRequest) => VozService().updateConfiguracao(payload),
    onSuccess: () => {
      toast.success('Configuração de voz guardada com sucesso.')
      exitEditAfterSave()
      void configQuery.refetch()
    },
    onError: () => {
      toast.error('Falha ao guardar configuração de voz.')
    },
  })

  useEffect(() => {
    const response = configQuery.data as any
    const dto = response?.info?.data as ConfiguracaoVozDTO | undefined
    if (!dto) return

    setForm({
      ativo: !!dto.ativo,
      provider: dto.provider?.trim() || 'web-speech',
      idiomaPadrao: dto.idiomaPadrao?.trim() || 'pt-PT',
      sttIdioma: dto.sttIdioma?.trim() || dto.idiomaPadrao?.trim() || 'pt-PT',
      sttAtivo: !!dto.sttAtivo,
      sttInterimResults: !!dto.sttInterimResults,
      sttContinuous: !!dto.sttContinuous,
      sttAutoPontuacao: !!dto.sttAutoPontuacao,
      sttConfidenceMin: dto.sttConfidenceMin ?? 0.5,
      sttSilenceTimeoutMs: dto.sttSilenceTimeoutMs ?? 2500,
      sttMaxAlternatives: dto.sttMaxAlternatives ?? 1,
      sttProfanityFilter: !!dto.sttProfanityFilter,
      ttsAtivo: !!dto.ttsAtivo,
      ttsVoice: dto.ttsVoice?.trim() || '',
      ttsRate: dto.ttsRate ?? 1,
      ttsPitch: dto.ttsPitch ?? 1,
      ttsVolume: dto.ttsVolume ?? 1,
      timeoutMs: dto.timeoutMs ?? 15000,
      maxDuracaoCapturaSegundos: dto.maxDuracaoCapturaSegundos ?? 90,
    })
  }, [configQuery.data])

  useEffect(() => {
    const carregarVozes = () => {
      setVozesBrowser(VozRuntimeService.listarVozesBrowser(form.idiomaPadrao))
    }

    carregarVozes()
    window.speechSynthesis?.addEventListener?.('voiceschanged', carregarVozes)
    return () => {
      window.speechSynthesis?.removeEventListener?.('voiceschanged', carregarVozes)
    }
  }, [form.idiomaPadrao])

  const handleChange = <K extends keyof VozForm>(key: K, value: VozForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleGuardar = () => {
    if (form.ativo && !form.provider.trim()) {
      toast.warning('Provider é obrigatório quando o serviço está ativo.')
      return
    }
    if (form.ativo && !form.idiomaPadrao.trim()) {
      toast.warning('Idioma padrão é obrigatório quando o serviço está ativo.')
      return
    }

    const payload: AtualizarConfiguracaoVozRequest = {
      ativo: form.ativo,
      provider: form.provider.trim() || 'web-speech',
      idiomaPadrao: form.idiomaPadrao.trim() || 'pt-PT',
      sttIdioma: form.sttIdioma.trim() || form.idiomaPadrao.trim() || 'pt-PT',
      sttAtivo: form.sttAtivo,
      sttInterimResults: form.sttInterimResults,
      sttContinuous: form.sttContinuous,
      sttAutoPontuacao: form.sttAutoPontuacao,
      sttConfidenceMin: form.sttConfidenceMin,
      sttSilenceTimeoutMs: form.sttSilenceTimeoutMs,
      sttMaxAlternatives: form.sttMaxAlternatives,
      sttProfanityFilter: form.sttProfanityFilter,
      ttsAtivo: form.ttsAtivo,
      ttsVoice: form.ttsVoice.trim() || null,
      ttsRate: form.ttsRate,
      ttsPitch: form.ttsPitch,
      ttsVolume: form.ttsVolume,
      timeoutMs: form.timeoutMs,
      maxDuracaoCapturaSegundos: form.maxDuracaoCapturaSegundos,
    }

    saveMutation.mutate(payload)
  }

  const handleOuvirTeste = async () => {
    if (!form.ttsAtivo) {
      toast.warning('Ativa o TTS para testar a voz.')
      return
    }

    if (!textoTeste.trim()) {
      toast.warning('Escreve um texto para testar a voz.')
      return
    }

    let textoParaFalar = textoTeste.trim()
    try {
      setATraduzirTeste(true)
      textoParaFalar = await VozRuntimeService.traduzirTextoParaIdioma(textoParaFalar, form.idiomaPadrao)
    } catch {
      toast.warning('Não foi possível traduzir o texto. A reproduzir texto original.')
    } finally {
      setATraduzirTeste(false)
    }

    const falou = VozRuntimeService.falar(textoParaFalar, {
      id: '',
      clinicaId: '',
      ativo: form.ativo,
      provider: form.provider,
      idiomaPadrao: form.idiomaPadrao,
      sttIdioma: form.sttIdioma,
      sttAtivo: form.sttAtivo,
      sttInterimResults: form.sttInterimResults,
      sttContinuous: form.sttContinuous,
      sttAutoPontuacao: form.sttAutoPontuacao,
      sttConfidenceMin: form.sttConfidenceMin,
      sttSilenceTimeoutMs: form.sttSilenceTimeoutMs,
      sttMaxAlternatives: form.sttMaxAlternatives,
      sttProfanityFilter: form.sttProfanityFilter,
      ttsAtivo: form.ttsAtivo,
      ttsVoice: form.ttsVoice || null,
      ttsRate: form.ttsRate,
      ttsPitch: form.ttsPitch,
      ttsVolume: form.ttsVolume,
      timeoutMs: form.timeoutMs,
      maxDuracaoCapturaSegundos: form.maxDuracaoCapturaSegundos,
    })

    if (!falou) {
      toast.error('Não foi possível reproduzir o teste de voz neste browser.')
      return
    }

    toast.success('A reproduzir teste de voz...')
  }

  const handlePararTeste = () => {
    VozRuntimeService.pararFala()
  }

  const handleIniciarTesteStt = () => {
    if (!form.sttAtivo) {
      toast.warning('Ativa o STT para testar voz para texto.')
      return
    }

    setSttErro(null)
    setSttTranscricao('')

    const sessao = VozRuntimeService.iniciarStt(
      {
        id: '',
        clinicaId: '',
        ativo: form.ativo,
        provider: form.provider,
        idiomaPadrao: form.idiomaPadrao,
        sttIdioma: form.sttIdioma,
        sttAtivo: form.sttAtivo,
        sttInterimResults: form.sttInterimResults,
        sttContinuous: form.sttContinuous,
        sttAutoPontuacao: form.sttAutoPontuacao,
        sttConfidenceMin: form.sttConfidenceMin,
        sttSilenceTimeoutMs: form.sttSilenceTimeoutMs,
        sttMaxAlternatives: form.sttMaxAlternatives,
        sttProfanityFilter: form.sttProfanityFilter,
        ttsAtivo: form.ttsAtivo,
        ttsVoice: form.ttsVoice || null,
        ttsRate: form.ttsRate,
        ttsPitch: form.ttsPitch,
        ttsVolume: form.ttsVolume,
        timeoutMs: form.timeoutMs,
        maxDuracaoCapturaSegundos: form.maxDuracaoCapturaSegundos,
      },
      {
        onTextoParcial: (texto) => setSttTranscricao(texto),
        onTextoFinal: (texto) => {
          if (texto?.trim()) setSttTranscricao(texto.trim())
        },
        onErro: (erro) => {
          setSttErro(erro)
          setSttEscutando(false)
          setSessaoStt(null)
        },
        onFim: () => {
          setSttEscutando(false)
          setSessaoStt(null)
        },
      }
    )

    if (!sessao) {
      toast.error('Não foi possível iniciar o teste de voz para texto neste browser.')
      return
    }

    setSessaoStt(sessao)
    setSttEscutando(true)
    toast.success('STT iniciado. Podes começar a falar.')
  }

  const handlePararTesteStt = () => {
    if (!sessaoStt) return
    sessaoStt.parar()
    setSttEscutando(false)
  }

  const opcoes = ((opcoesQuery.data as any)?.info?.data ?? null) as ConfiguracaoVozOpcoesDTO | null
  const idiomas: ConfiguracaoVozOpcaoDTO[] = opcoes?.idiomas ?? []
  const vozes: ConfiguracaoVozOpcaoDTO[] = opcoes?.vozes ?? []
  const vozesSelect = useMemo(
    () =>
      vozesBrowser.length
        ? vozesBrowser.map((v) => ({ codigo: v.codigo, descricao: v.descricao }))
        : vozes.map((v) => ({ codigo: v.codigo, descricao: v.descricao })),
    [vozesBrowser, vozes]
  )

  return (
    <>
      <PageHead title='Configuração de Voz | CliCloud' />
      <DashboardPageContainer>
        <Card>
          <CardHeader className='space-y-0 pb-2'>
            <ConfigPageCardTitleRow
              title='Configuração de Voz'
              canChange={canChange}
              isEditing={isEditing}
              onStartEdit={startEditing}
              onCancelEdit={() => {
                cancelEditing()
                void configQuery.refetch()
              }}
            />
          </CardHeader>
          <CardContent className='space-y-4'>
            {configQuery.isLoading ? <p className='text-sm text-muted-foreground'>A carregar configuração...</p> : null}
            {configQuery.isError ? (
              <p className='text-sm text-destructive'>Falha ao carregar configuração de voz.</p>
            ) : null}
            {opcoesQuery.isError ? (
              <p className='text-sm text-destructive'>Falha ao carregar opções de idioma/voz.</p>
            ) : null}

            <div className='flex items-center justify-between rounded border p-3'>
              <div>
                <Label className='text-sm font-medium'>Ativar serviço de voz</Label>
                <p className='text-xs text-muted-foreground'>
                  Liga/desliga o serviço de voz (Speech-to-Text e Text-to-Speech) para a clínica atual.
                </p>
              </div>
              <Switch
                checked={form.ativo}
                onCheckedChange={(v) => handleChange('ativo', v)}
                disabled={formLocked || saveMutation.isPending}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <Label htmlFor='voz-provider'>Provider</Label>
                <Input
                  id='voz-provider'
                  value={form.provider}
                  readOnly
                  placeholder='web-speech'
                  disabled
                />
              </div>

              <div className='space-y-1'>
                <Label>Idioma padrão</Label>
                <Select
                  value={form.idiomaPadrao}
                  onValueChange={(v) => handleChange('idiomaPadrao', v)}
                  disabled={formLocked || saveMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecionar idioma' />
                  </SelectTrigger>
                  <SelectContent>
                    {idiomas.map((i) => (
                      <SelectItem key={i.codigo} value={i.codigo}>
                        {i.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1'>
                <Label>Voz (TTS)</Label>
                <Select
                  value={form.ttsVoice}
                  onValueChange={(v) => handleChange('ttsVoice', v)}
                  disabled={formLocked || saveMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecionar voz' />
                  </SelectTrigger>
                  <SelectContent>
                    {vozesSelect.map((i) => (
                      <SelectItem key={i.codigo} value={i.codigo}>
                        {i.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {vozesBrowser.length ? (
                  <p className='text-xs text-muted-foreground'>A usar vozes reais do browser para maior precisão de idioma/género.</p>
                ) : null}
              </div>

              <div className='flex items-center justify-between rounded border p-3 md:col-span-2'>
                <div>
                  <Label className='text-sm font-medium'>STT ativo</Label>
                  <p className='text-xs text-muted-foreground'>Ativa reconhecimento de voz para texto.</p>
                </div>
                <Switch
                  checked={form.sttAtivo}
                  onCheckedChange={(v) => handleChange('sttAtivo', v)}
                  disabled={formLocked || saveMutation.isPending}
                />
              </div>

              <div className='flex items-center justify-between rounded border p-3 md:col-span-2'>
                <div>
                  <Label className='text-sm font-medium'>TTS ativo</Label>
                  <p className='text-xs text-muted-foreground'>Ativa leitura de texto por voz.</p>
                </div>
                <Switch
                  checked={form.ttsAtivo}
                  onCheckedChange={(v) => handleChange('ttsAtivo', v)}
                  disabled={formLocked || saveMutation.isPending}
                />
              </div>

              <div className='md:col-span-2 rounded border p-3 space-y-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label className='text-sm font-medium'>Definições avançadas</Label>
                    <p className='text-xs text-muted-foreground'>Parâmetros técnicos de STT/TTS.</p>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    disabled={formLocked}
                    onClick={() => setMostrarAvancadas((v) => !v)}
                  >
                    {mostrarAvancadas ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>

                {mostrarAvancadas ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    <div className='space-y-1'>
                      <Label>Idioma STT</Label>
                      <Select
                        value={form.sttIdioma}
                        onValueChange={(v) => handleChange('sttIdioma', v)}
                        disabled={formLocked || saveMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Selecionar idioma STT' />
                        </SelectTrigger>
                        <SelectContent>
                          {idiomas.map((i) => (
                            <SelectItem key={`stt-${i.codigo}`} value={i.codigo}>
                              {i.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-1'>
                      <Label htmlFor='stt-confidence'>Confiança mínima STT (0-1)</Label>
                      <Input
                        id='stt-confidence'
                        type='number'
                        min={0}
                        max={1}
                        step={0.1}
                        value={form.sttConfidenceMin}
                        onChange={(e) => handleChange('sttConfidenceMin', Number(e.target.value))}
                        readOnly={formLocked}
                        disabled={formLocked || saveMutation.isPending}
                      />
                    </div>

                    <div className='space-y-1'>
                      <Label htmlFor='stt-silence-timeout'>Silêncio STT (ms)</Label>
                      <Input
                        id='stt-silence-timeout'
                        type='number'
                        min={500}
                        max={10000}
                        step={100}
                        value={form.sttSilenceTimeoutMs}
                        onChange={(e) => handleChange('sttSilenceTimeoutMs', Number(e.target.value))}
                        readOnly={formLocked}
                        disabled={formLocked || saveMutation.isPending}
                      />
                    </div>

                    <div className='space-y-1'>
                      <Label htmlFor='stt-max-alt'>Alternativas STT</Label>
                      <Input
                        id='stt-max-alt'
                        type='number'
                        min={1}
                        max={5}
                        step={1}
                        value={form.sttMaxAlternatives}
                        onChange={(e) => handleChange('sttMaxAlternatives', Number(e.target.value))}
                        readOnly={formLocked}
                        disabled={formLocked || saveMutation.isPending}
                      />
                    </div>

                    <div className='flex items-center justify-between rounded border p-3'>
                      <div>
                        <Label className='text-sm font-medium'>Filtro de linguagem STT</Label>
                        <p className='text-xs text-muted-foreground'>Ativa filtro de palavras sensíveis quando suportado.</p>
                      </div>
                      <Switch
                        checked={form.sttProfanityFilter}
                        onCheckedChange={(v) => handleChange('sttProfanityFilter', v)}
                        disabled={formLocked || saveMutation.isPending}
                      />
                    </div>

                    <div className='space-y-1'>
                      <Label htmlFor='timeout-ms'>Timeout (ms)</Label>
                      <Input
                        id='timeout-ms'
                        type='number'
                        min={1000}
                        max={60000}
                        value={form.timeoutMs}
                        onChange={(e) => handleChange('timeoutMs', Number(e.target.value))}
                        readOnly={formLocked}
                        disabled={formLocked || saveMutation.isPending}
                      />
                    </div>

                    <div className='space-y-1'>
                      <Label htmlFor='max-duracao'>Duração máxima captura (s)</Label>
                      <Input
                        id='max-duracao'
                        type='number'
                        min={10}
                        max={600}
                        value={form.maxDuracaoCapturaSegundos}
                        onChange={(e) => handleChange('maxDuracaoCapturaSegundos', Number(e.target.value))}
                        readOnly={formLocked}
                        disabled={formLocked || saveMutation.isPending}
                      />
                    </div>

                    <div className='space-y-1'>
                      <Label htmlFor='tts-rate'>TTS Rate</Label>
                      <Input
                        id='tts-rate'
                        type='number'
                        min={0.5}
                        max={2}
                        step={0.1}
                        value={form.ttsRate}
                        onChange={(e) => handleChange('ttsRate', Number(e.target.value))}
                        readOnly={formLocked}
                        disabled={formLocked || saveMutation.isPending}
                      />
                    </div>

                    <div className='space-y-1'>
                      <Label htmlFor='tts-pitch'>TTS Pitch</Label>
                      <Input
                        id='tts-pitch'
                        type='number'
                        min={0}
                        max={2}
                        step={0.1}
                        value={form.ttsPitch}
                        onChange={(e) => handleChange('ttsPitch', Number(e.target.value))}
                        readOnly={formLocked}
                        disabled={formLocked || saveMutation.isPending}
                      />
                    </div>

                    <div className='space-y-1'>
                      <Label htmlFor='tts-volume'>TTS Volume</Label>
                      <Input
                        id='tts-volume'
                        type='number'
                        min={0}
                        max={1}
                        step={0.1}
                        value={form.ttsVolume}
                        onChange={(e) => handleChange('ttsVolume', Number(e.target.value))}
                        readOnly={formLocked}
                        disabled={formLocked || saveMutation.isPending}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className='space-y-2 md:col-span-2 rounded border p-3'>
                <Label htmlFor='texto-teste-voz'>Teste de voz</Label>
                <p className='text-xs text-muted-foreground'>
                  O texto é traduzido automaticamente para o idioma selecionado antes do TTS.
                </p>
                <Textarea
                  id='texto-teste-voz'
                  value={textoTeste}
                  onChange={(e) => setTextoTeste(e.target.value)}
                  rows={3}
                  readOnly={formLocked}
                  disabled={formLocked}
                  placeholder='Escreve o texto para testar a voz...'
                />
                <div className='flex gap-2 justify-end'>
                  <Button
                    type='button'
                    variant='outline'
                    disabled={formLocked}
                    onClick={handlePararTeste}
                  >
                    Parar
                  </Button>
                  <Button
                    type='button'
                    onClick={handleOuvirTeste}
                    disabled={formLocked || aTraduzirTeste}
                  >
                    {aTraduzirTeste ? 'A traduzir...' : 'Ouvir teste'}
                  </Button>
                </div>
              </div>

              <div className='space-y-2 md:col-span-2 rounded border p-3'>
                <Label htmlFor='texto-teste-stt'>Teste de voz para texto (STT)</Label>
                <p className='text-xs text-muted-foreground'>
                  Clica em iniciar, fala ao microfone e valida a transcrição com as definições STT atuais.
                </p>
                <Textarea
                  id='texto-teste-stt'
                  value={sttTranscricao}
                  onChange={(e) => setSttTranscricao(e.target.value)}
                  rows={4}
                  readOnly={formLocked}
                  disabled={formLocked}
                  placeholder='A transcrição aparece aqui...'
                />
                {sttErro ? <p className='text-xs text-destructive'>{sttErro}</p> : null}
                <div className='flex gap-2 justify-end'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handlePararTesteStt}
                    disabled={formLocked || !sttEscutando}
                  >
                    Parar STT
                  </Button>
                  <Button
                    type='button'
                    onClick={handleIniciarTesteStt}
                    disabled={formLocked || sttEscutando}
                  >
                    {sttEscutando ? 'A escutar...' : 'Iniciar STT'}
                  </Button>
                </div>
              </div>
            </div>

            <div className='flex justify-end'>
              <Button
                onClick={handleGuardar}
                disabled={!formEditable || saveMutation.isPending}
              >
                {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardPageContainer>
    </>
  )
}
