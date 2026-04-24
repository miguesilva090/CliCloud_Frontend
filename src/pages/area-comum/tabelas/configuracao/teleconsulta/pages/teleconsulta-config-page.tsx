import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ConfigPageCardTitleRow } from '@/components/shared/config-page-card-title-row'
import { modules } from '@/config/modules'
import { useConfigPageEditMode } from '@/hooks/use-config-page-edit-mode'
import { toast } from '@/utils/toast-utils'
import { TeleconsultaConfigService } from '@/lib/services/core/teleconsulta-config-service'
import { TeleconsultaService } from '@/lib/services/consultas/teleconsulta-service'
import type {
  AtualizarConfiguracaoTeleconsultaRequest,
  ConfiguracaoTeleconsultaDTO,
} from '@/types/dtos/core/teleconsulta-config.dtos'
type TeleconsultaConfigForm = {
  ativo: boolean
  provider: string
  baseMeetingUrl: string
  jwtAtivo: boolean
  jwtAppId: string
  jwtApiKey: string
  jwtKid: string
  jwtPrivateKey: string
  janelaEntradaMinutosAntes: number
  duracaoPadraoMinutos: number
  permitirEntradaAntesDoInicio: boolean
  lobbyAtivo: boolean
}

const teleconsultaPermId = modules.areaComum.permissions.configuracoesTeleconsulta.id

const initialForm: TeleconsultaConfigForm = {
  ativo: false,
  provider: 'jitsi',
  baseMeetingUrl: 'https://meet.jit.si',
  jwtAtivo: false,
  jwtAppId: '',
  jwtApiKey: '',
  jwtKid: '',
  jwtPrivateKey: '',
  janelaEntradaMinutosAntes: 15,
  duracaoPadraoMinutos: 30,
  permitirEntradaAntesDoInicio: true,
  lobbyAtivo: true,
}

export function TeleconsultaConfigPage() {
  const {
    canChange,
    isEditing,
    formEditable,
    startEditing,
    cancelEditing,
    exitEditAfterSave,
  } = useConfigPageEditMode(teleconsultaPermId)
  const formLocked = !formEditable

  const [form, setForm] = useState<TeleconsultaConfigForm>(initialForm)
  const [mostrarJwt, setMostrarJwt] = useState(false)
  const [mostrarSegredos, setMostrarSegredos] = useState(false)
  const [consultaMarcacaoIdTeste, setConsultaMarcacaoIdTeste] = useState('')
  const [sessaoIdTeste, setSessaoIdTeste] = useState('')
  const [nomeMedicoTeste, setNomeMedicoTeste] = useState('Profissional')
  const [nomeUtenteTeste, setNomeUtenteTeste] = useState('Utente')
  const [destinoUtenteTeste, setDestinoUtenteTeste] = useState('')
  const [linkMedicoGerado, setLinkMedicoGerado] = useState('')
  const [linkUtenteGerado, setLinkUtenteGerado] = useState('')

  const configQuery = useQuery({
    queryKey: ['teleconsulta', 'configuracao'],
    queryFn: () => TeleconsultaConfigService().getConfiguracaoAtual(),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: AtualizarConfiguracaoTeleconsultaRequest) =>
      TeleconsultaConfigService().updateConfiguracao(payload),
    onSuccess: () => {
      toast.success('Configuração de teleconsulta guardada com sucesso.')
      exitEditAfterSave()
      void configQuery.refetch()
    },
    onError: () => {
      toast.error('Falha ao guardar configuração de teleconsulta.')
    },
  })

  const criarSessaoMutation = useMutation({
    mutationFn: (consultaMarcacaoId: string) =>
      TeleconsultaService().criarOuObterSessao({ consultaMarcacaoId }),
    onSuccess: (res) => {
      const sessaoId = (res as any)?.info?.data?.id as string | undefined
      if (sessaoId) {
        setSessaoIdTeste(sessaoId)
        toast.success('Sessão criada/obtida com sucesso.')
      } else {
        toast.warning('Sessão criada, mas não foi possível identificar o id.')
      }
    },
    onError: () => toast.error('Falha ao criar/obter sessão de teleconsulta.'),
  })

  const linkMedicoMutation = useMutation({
    mutationFn: (sessaoId: string) =>
      TeleconsultaService().obterLinkEntrada(sessaoId, {
        papel: 'Profissional',
        nomeExibicao: nomeMedicoTeste.trim() || 'Profissional',
      }),
    onSuccess: (res) => {
      const link = (res as any)?.info?.data?.meetingUrl as string | undefined
      if (link) {
        setLinkMedicoGerado(link)
        toast.success('Link do médico gerado.')
      } else {
        toast.warning('Link do médico não retornado.')
      }
    },
    onError: () => toast.error('Falha ao gerar link do médico.'),
  })

  const linkUtenteMutation = useMutation({
    mutationFn: (sessaoId: string) =>
      TeleconsultaService().gerarLinkUtente(sessaoId, {
        nomeExibicao: nomeUtenteTeste.trim() || 'Utente',
        destino: destinoUtenteTeste.trim() || null,
      }),
    onSuccess: (res) => {
      const link = (res as any)?.info?.data?.meetingUrl as string | undefined
      if (link) {
        setLinkUtenteGerado(link)
        toast.success('Link do utente gerado.')
      } else {
        toast.warning('Link do utente não retornado.')
      }
    },
    onError: () => toast.error('Falha ao gerar link do utente.'),
  })

  const revogarLinksMutation = useMutation({
    mutationFn: (sessaoId: string) => TeleconsultaService().revogarLinksSessao(sessaoId),
    onSuccess: () => {
      toast.success('Links da sessão revogados com sucesso.')
    },
    onError: () => toast.error('Falha ao revogar links da sessão.'),
  })

  useEffect(() => {
    const response = configQuery.data as any
    const dto = response?.info?.data as ConfiguracaoTeleconsultaDTO | undefined
    if (!dto) return

    setForm({
      ativo: !!dto.ativo,
      provider: dto.provider?.trim() || 'jitsi',
      baseMeetingUrl: dto.baseMeetingUrl?.trim() || 'https://meet.jit.si',
      jwtAtivo: !!dto.jwtAtivo,
      jwtAppId: dto.jwtAppId?.trim() || '',
      jwtApiKey: dto.jwtApiKey?.trim() || '',
      jwtKid: dto.jwtKid?.trim() || '',
      jwtPrivateKey: dto.jwtPrivateKey?.trim() || '',
      janelaEntradaMinutosAntes: dto.janelaEntradaMinutosAntes ?? 15,
      duracaoPadraoMinutos: dto.duracaoPadraoMinutos ?? 30,
      permitirEntradaAntesDoInicio: !!dto.permitirEntradaAntesDoInicio,
      lobbyAtivo: !!dto.lobbyAtivo,
    })
  }, [configQuery.data])

  const handleChange = <K extends keyof TeleconsultaConfigForm>(key: K, value: TeleconsultaConfigForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleGuardar = () => {
    if (form.ativo && !form.baseMeetingUrl.trim()) {
      toast.warning('URL base do meeting é obrigatória quando a teleconsulta está ativa.')
      return
    }

    if (form.jwtAtivo) {
      if (!form.jwtAppId.trim()) {
        toast.warning('JWT App ID é obrigatório quando JWT está ativo.')
        return
      }
      if (!form.jwtApiKey.trim()) {
        toast.warning('JWT API Key é obrigatória quando JWT está ativo.')
        return
      }
      if (!form.jwtPrivateKey.trim()) {
        toast.warning('JWT Private Key é obrigatória quando JWT está ativo.')
        return
      }
    }

    const payload: AtualizarConfiguracaoTeleconsultaRequest = {
      ativo: form.ativo,
      provider: 'jitsi',
      baseMeetingUrl: form.baseMeetingUrl.trim(),
      jwtAtivo: form.jwtAtivo,
      jwtAppId: form.jwtAppId.trim() || null,
      jwtApiKey: form.jwtApiKey.trim() || null,
      jwtKid: form.jwtKid.trim() || null,
      jwtPrivateKey: form.jwtPrivateKey.trim() || null,
      janelaEntradaMinutosAntes: form.janelaEntradaMinutosAntes,
      duracaoPadraoMinutos: form.duracaoPadraoMinutos,
      permitirEntradaAntesDoInicio: form.permitirEntradaAntesDoInicio,
      lobbyAtivo: form.lobbyAtivo,
    }

    saveMutation.mutate(payload)
  }

  const handleCriarSessaoTeste = () => {
    const id = consultaMarcacaoIdTeste.trim()
    if (!id) {
      toast.warning('Indica o ID da marcação de consulta.')
      return
    }
    criarSessaoMutation.mutate(id)
  }

  const handleGerarLinkMedico = () => {
    const id = sessaoIdTeste.trim()
    if (!id) {
      toast.warning('Indica o ID da sessão de teleconsulta.')
      return
    }
    linkMedicoMutation.mutate(id)
  }

  const handleGerarLinkUtente = () => {
    const id = sessaoIdTeste.trim()
    if (!id) {
      toast.warning('Indica o ID da sessão de teleconsulta.')
      return
    }
    linkUtenteMutation.mutate(id)
  }

  const handleRevogarLinks = () => {
    const id = sessaoIdTeste.trim()
    if (!id) {
      toast.warning('Indica o ID da sessão de teleconsulta.')
      return
    }
    revogarLinksMutation.mutate(id)
  }

  return (
    <>
      <PageHead title='Configuração Teleconsulta | CliCloud' />
      <DashboardPageContainer>
        <Card>
          <CardHeader className='space-y-0 pb-2'>
            <ConfigPageCardTitleRow
              title='Configuração de Teleconsulta'
              canChange={canChange}
              isEditing={isEditing}
              onStartEdit={startEditing}
              onCancelEdit={() => {
                cancelEditing()
                void configQuery.refetch()
              }}
              trailing={
                <Button type='button' variant='outline' onClick={() => setMostrarSegredos((v) => !v)}>
                  {mostrarSegredos ? <EyeOff className='mr-2 h-4 w-4' /> : <Eye className='mr-2 h-4 w-4' />}
                  {mostrarSegredos ? 'Ocultar segredos' : 'Mostrar segredos'}
                </Button>
              }
            />
          </CardHeader>
          <CardContent className='space-y-4'>
            {configQuery.isLoading ? <p className='text-sm text-muted-foreground'>A carregar configuração...</p> : null}
            {configQuery.isError ? (
              <p className='text-sm text-destructive'>Falha ao carregar configuração de teleconsulta.</p>
            ) : null}

            <div className='flex items-center justify-between rounded border p-3'>
              <div>
                <Label className='text-sm font-medium'>Ativar teleconsulta</Label>
                <p className='text-xs text-muted-foreground'>Liga/desliga o serviço de teleconsulta para a clínica atual.</p>
              </div>
              <Switch
                checked={form.ativo}
                onCheckedChange={(v) => handleChange('ativo', v)}
                disabled={formLocked || saveMutation.isPending}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <Label htmlFor='teleconsulta-provider'>Provider</Label>
                <Input id='teleconsulta-provider' value={form.provider} readOnly disabled />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='teleconsulta-base-url'>URL base meeting</Label>
                <Input
                  id='teleconsulta-base-url'
                  value={form.baseMeetingUrl}
                  onChange={(e) => handleChange('baseMeetingUrl', e.target.value)}
                  readOnly={formLocked}
                  disabled={formLocked || saveMutation.isPending}
                  placeholder='https://meet.jit.si'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <Label htmlFor='teleconsulta-janela-entrada'>Janela de entrada antes do início (min)</Label>
                <Input
                  id='teleconsulta-janela-entrada'
                  type='number'
                  min={0}
                  max={180}
                  value={form.janelaEntradaMinutosAntes}
                  onChange={(e) => handleChange('janelaEntradaMinutosAntes', Number(e.target.value))}
                  readOnly={formLocked}
                  disabled={formLocked || saveMutation.isPending}
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='teleconsulta-duracao-padrao'>Duração padrão da sessão (min)</Label>
                <Input
                  id='teleconsulta-duracao-padrao'
                  type='number'
                  min={5}
                  max={360}
                  value={form.duracaoPadraoMinutos}
                  onChange={(e) => handleChange('duracaoPadraoMinutos', Number(e.target.value))}
                  readOnly={formLocked}
                  disabled={formLocked || saveMutation.isPending}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='flex items-center justify-between rounded border p-3'>
                <div>
                  <Label className='text-sm font-medium'>Permitir entrada antes do início</Label>
                  <p className='text-xs text-muted-foreground'>Permite participantes entrarem antes da hora agendada.</p>
                </div>
                <Switch
                  checked={form.permitirEntradaAntesDoInicio}
                  onCheckedChange={(v) => handleChange('permitirEntradaAntesDoInicio', v)}
                  disabled={formLocked || saveMutation.isPending}
                />
              </div>
              <div className='flex items-center justify-between rounded border p-3'>
                <div>
                  <Label className='text-sm font-medium'>Lobby ativo</Label>
                  <p className='text-xs text-muted-foreground'>Participantes aguardam aprovação para entrar na sala.</p>
                </div>
                <Switch
                  checked={form.lobbyAtivo}
                  onCheckedChange={(v) => handleChange('lobbyAtivo', v)}
                  disabled={formLocked || saveMutation.isPending}
                />
              </div>
            </div>

            <div className='rounded border p-3 space-y-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-sm font-medium'>Configuração JWT (opcional)</Label>
                  <p className='text-xs text-muted-foreground'>
                    Ativa autenticação JWT para Jitsi self-hosted ou domínio com autenticação.
                  </p>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  disabled={formLocked}
                  onClick={() => setMostrarJwt((v) => !v)}
                >
                  {mostrarJwt ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>

              <div className='flex items-center justify-between rounded border p-3'>
                <div>
                  <Label className='text-sm font-medium'>JWT ativo</Label>
                </div>
                <Switch
                  checked={form.jwtAtivo}
                  onCheckedChange={(v) => handleChange('jwtAtivo', v)}
                  disabled={formLocked || saveMutation.isPending}
                />
              </div>

              {mostrarJwt ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='jwt-app-id'>JWT App ID</Label>
                    <Input
                      id='jwt-app-id'
                      value={form.jwtAppId}
                      onChange={(e) => handleChange('jwtAppId', e.target.value)}
                      readOnly={formLocked}
                      disabled={formLocked || saveMutation.isPending}
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label htmlFor='jwt-api-key'>JWT API Key</Label>
                    <Input
                      id='jwt-api-key'
                      value={form.jwtApiKey}
                      onChange={(e) => handleChange('jwtApiKey', e.target.value)}
                      readOnly={formLocked}
                      disabled={formLocked || saveMutation.isPending}
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label htmlFor='jwt-kid'>JWT KID</Label>
                    <Input
                      id='jwt-kid'
                      value={form.jwtKid}
                      onChange={(e) => handleChange('jwtKid', e.target.value)}
                      readOnly={formLocked}
                      disabled={formLocked || saveMutation.isPending}
                    />
                  </div>
                  <div className='space-y-1 md:col-span-2'>
                    <Label htmlFor='jwt-private-key'>JWT Private Key</Label>
                    <Textarea
                      id='jwt-private-key'
                      rows={4}
                      value={form.jwtPrivateKey}
                      onChange={(e) => handleChange('jwtPrivateKey', e.target.value)}
                      readOnly={formLocked}
                      disabled={formLocked || saveMutation.isPending}
                      className={mostrarSegredos ? '' : 'blur-sm'}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className='flex justify-end'>
              <Button
                onClick={handleGuardar}
                disabled={!formEditable || saveMutation.isPending}
              >
                {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
              </Button>
            </div>

            <div className='rounded border p-3 space-y-3'>
              <Label className='text-sm font-medium'>Teste Operacional (UI)</Label>
              <p className='text-xs text-muted-foreground'>
                Usa esta secção para testar fluxo real sem chamadas manuais a endpoints.
              </p>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='space-y-1'>
                  <Label htmlFor='tc-consulta-id'>ID da Marcação (ConsultaMarcacaoId)</Label>
                  <Input
                    id='tc-consulta-id'
                    value={consultaMarcacaoIdTeste}
                    onChange={(e) => setConsultaMarcacaoIdTeste(e.target.value)}
                    readOnly={formLocked}
                    disabled={formLocked}
                    placeholder='GUID da marcação'
                  />
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='tc-sessao-id'>ID da Sessão Teleconsulta</Label>
                  <Input
                    id='tc-sessao-id'
                    value={sessaoIdTeste}
                    onChange={(e) => setSessaoIdTeste(e.target.value)}
                    readOnly={formLocked}
                    disabled={formLocked}
                    placeholder='Preenchido após criar sessão'
                  />
                </div>
              </div>

              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCriarSessaoTeste}
                  disabled={formLocked || criarSessaoMutation.isPending}
                >
                  {criarSessaoMutation.isPending ? 'A criar...' : 'Criar/Obter Sessão'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleRevogarLinks}
                  disabled={formLocked || revogarLinksMutation.isPending}
                >
                  {revogarLinksMutation.isPending ? 'A revogar...' : 'Revogar Links'}
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='space-y-1'>
                  <Label htmlFor='tc-nome-medico'>Nome no link do médico</Label>
                  <Input
                    id='tc-nome-medico'
                    value={nomeMedicoTeste}
                    onChange={(e) => setNomeMedicoTeste(e.target.value)}
                    readOnly={formLocked}
                    disabled={formLocked}
                    placeholder='Profissional'
                  />
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='tc-nome-utente'>Nome no link do utente</Label>
                  <Input
                    id='tc-nome-utente'
                    value={nomeUtenteTeste}
                    onChange={(e) => setNomeUtenteTeste(e.target.value)}
                    readOnly={formLocked}
                    disabled={formLocked}
                    placeholder='Utente'
                  />
                </div>
              </div>

              <div className='space-y-1'>
                <Label htmlFor='tc-destino-utente'>Destino de envio do utente (audit)</Label>
                <Input
                  id='tc-destino-utente'
                  value={destinoUtenteTeste}
                  onChange={(e) => setDestinoUtenteTeste(e.target.value)}
                  readOnly={formLocked}
                  disabled={formLocked}
                  placeholder='email ou telefone'
                />
              </div>

              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleGerarLinkMedico}
                  disabled={formLocked || linkMedicoMutation.isPending}
                >
                  {linkMedicoMutation.isPending ? 'A gerar...' : 'Gerar Link Médico'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleGerarLinkUtente}
                  disabled={formLocked || linkUtenteMutation.isPending}
                >
                  {linkUtenteMutation.isPending ? 'A gerar...' : 'Gerar Link Utente'}
                </Button>
              </div>

              <div className='space-y-1'>
                <Label>Link Médico</Label>
                <div className='flex gap-2'>
                  <Input value={linkMedicoGerado} readOnly placeholder='Gera o link do médico para abrir primeiro' />
                  <Button
                    type='button'
                    variant='outline'
                    disabled={formLocked || !linkMedicoGerado}
                    onClick={() => linkMedicoGerado && window.open(linkMedicoGerado, '_blank')}
                  >
                    Abrir
                  </Button>
                </div>
              </div>

              <div className='space-y-1'>
                <Label>Link Utente</Label>
                <div className='flex gap-2'>
                  <Input value={linkUtenteGerado} readOnly placeholder='Gera o link do utente após o médico' />
                  <Button
                    type='button'
                    variant='outline'
                    disabled={formLocked || !linkUtenteGerado}
                    onClick={() => linkUtenteGerado && window.open(linkUtenteGerado, '_blank')}
                  >
                    Abrir
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardPageContainer>
    </>
  )
}
