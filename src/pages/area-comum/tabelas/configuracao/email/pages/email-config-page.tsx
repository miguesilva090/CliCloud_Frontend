import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Eye, EyeOff, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { navigateManagedWindow } from '@/utils/window-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfigPageCardTitleRow } from '@/components/shared/config-page-card-title-row'
import { modules } from '@/config/modules'
import { useConfigPageEditMode } from '@/hooks/use-config-page-edit-mode'
import { toast } from '@/utils/toast-utils'
import { EmailService } from '@/lib/services/core/email-service'
import { EmailAutomaticaModal } from '../components/email-automatica-modal'
import type {
  AtualizarConfiguracaoEmailAutomaticaRequest,
  AtualizarConfiguracaoEmailRequest,
  ConfiguracaoEmailAutomaticaDTO,
  ConfiguracaoEmailDTO,
} from '@/types/dtos/core/email.dtos'

type EmailConfigForm = {
  username: string
  server: string
  password: string
  porta: string
  useSSL: boolean
  tipoServico: string
  inbox: string
  outbox: string
  email: string
  displayName: string
  permitirEliminarEmail: boolean
}

type TemplateFluxoForm = {
  codigo: string
  descricao: string
  assunto: string
  conteudo: string
  ativo: boolean
}

const templateFluxoDefaults: TemplateFluxoForm[] = [
  {
    codigo: '8.1',
    descricao: 'Template Consultas',
    assunto: 'Template Consultas',
    conteudo: '',
    ativo: true,
  },
  {
    codigo: '8.2',
    descricao: 'Template Tratamentos',
    assunto: 'Template Tratamentos',
    conteudo: '',
    ativo: true,
  },
  {
    codigo: '8.3',
    descricao: 'Template Exames',
    assunto: 'Template Exames',
    conteudo: '',
    ativo: true,
  },
  {
    codigo: '8.4',
    descricao: 'Template Relatórios',
    assunto: 'Template Relatórios',
    conteudo: '',
    ativo: true,
  },
]

const fluxoCodeMap: Record<string, string> = {
  TPLCONSULTAS: '8.1',
  TPLTRATAMENTOS: '8.2',
  TPLEXAMES: '8.3',
  TPLRELATORIOS: '8.4',
}

const normalizeFlowCode = (codigo: string) => {
  const raw = (codigo ?? '').trim().toUpperCase()
  if (!raw) return ''
  const cleaned = raw.replace(/[^A-Z0-9]/g, '')
  return fluxoCodeMap[cleaned] ?? raw
}

const isFlowTemplateCode = (codigo: string) => {
  const normalized = normalizeFlowCode(codigo)
  return normalized === '8.1' || normalized === '8.2' || normalized === '8.3' || normalized === '8.4'
}

const emailPermId = modules.areaComum.permissions.configuracoesEmail.id

const initialForm: EmailConfigForm = {
  username: '',
  server: '',
  password: '',
  porta: '587',
  useSSL: true,
  tipoServico: '2',
  inbox: '',
  outbox: '',
  email: '',
  displayName: '',
  permitirEliminarEmail: false,
}

export function EmailConfigPage() {
  const navigate = useNavigate()
  const {
    canChange,
    isEditing,
    formEditable,
    startEditing,
    cancelEditing,
    exitEditAfterSave,
  } = useConfigPageEditMode(emailPermId)
  const formLocked = !formEditable

  const [form, setForm] = useState<EmailConfigForm>(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<ConfiguracaoEmailAutomaticaDTO | null>(null)
  const [templatesFluxo, setTemplatesFluxo] = useState<TemplateFluxoForm[]>([])
  const [fluxoEditOpen, setFluxoEditOpen] = useState(false)
  const [selectedFluxoConfig, setSelectedFluxoConfig] = useState<ConfiguracaoEmailAutomaticaDTO | null>(null)

  const configQuery = useQuery({
    queryKey: ['email-config', 'current'],
    queryFn: () => EmailService().getConfiguracaoAtual(),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: AtualizarConfiguracaoEmailRequest) => EmailService().updateConfiguracao(payload),
    onSuccess: async () => {
      toast.success('Configuração de Email guardada com sucesso.')
      exitEditAfterSave()
      await configQuery.refetch()
    },
    onError: () => {
      toast.error('Falha ao guardar configuração de Email.')
    },
  })

  const automaticasQuery = useQuery({
    queryKey: ['email-config', 'automaticas'],
    queryFn: () => EmailService().getConfiguracoesAutomaticas(),
  })

  const saveAutomaticaMutation = useMutation({
    mutationFn: async (payload: AtualizarConfiguracaoEmailAutomaticaRequest) => {
      if (!selectedConfig) return
      await EmailService().updateConfiguracaoAutomatica(selectedConfig.codigo, payload)
    },
    onSuccess: async () => {
      toast.success('Template automático atualizado com sucesso.')
      setEditOpen(false)
      await automaticasQuery.refetch()
    },
    onError: () => {
      toast.error('Falha ao atualizar template automático.')
    },
  })

  const saveFluxoMutation = useMutation({
    mutationFn: async (payload: AtualizarConfiguracaoEmailAutomaticaRequest) => {
      await EmailService().updateConfiguracaoAutomatica(payload.codigo, payload)
    },
    onSuccess: async () => {
      toast.success('Template de fluxo guardado com sucesso.')
      await automaticasQuery.refetch()
    },
    onError: () => {
      toast.error('Falha ao guardar template de fluxo.')
    },
  })

  useEffect(() => {
    const response = configQuery.data as any
    const dto = (response?.info?.data ?? response?.data) as
      | (ConfiguracaoEmailDTO & {
          Username?: string
          Server?: string
          Password?: string
          Porta?: number
          UseSSL?: boolean
          TipoServico?: number
          Inbox?: string | null
          Outbox?: string | null
          Email?: string | null
          DisplayName?: string | null
          PermitirEliminarEmail?: boolean
        })
      | undefined
    if (!dto) return

    setForm({
      username: dto.username ?? dto.Username ?? '',
      server: dto.server ?? dto.Server ?? '',
      password: dto.password ?? dto.Password ?? '',
      porta: String(dto.porta ?? dto.Porta ?? 587),
      useSSL: !!(dto.useSSL ?? dto.UseSSL),
      tipoServico: String(dto.tipoServico ?? dto.TipoServico ?? 2),
      inbox: dto.inbox ?? dto.Inbox ?? '',
      outbox: dto.outbox ?? dto.Outbox ?? '',
      email: dto.email ?? dto.Email ?? '',
      displayName: dto.displayName ?? dto.DisplayName ?? '',
      permitirEliminarEmail: !!(dto.permitirEliminarEmail ?? dto.PermitirEliminarEmail),
    })
  }, [configQuery.data])

  const automaticas = useMemo(() => {
    const response = automaticasQuery.data as any
    const lista = (response?.info?.data ?? []) as ConfiguracaoEmailAutomaticaDTO[]
    return [...lista]
      .filter((x) => !isFlowTemplateCode(x.codigo))
      .sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true }))
  }, [automaticasQuery.data])

  useEffect(() => {
    const response = automaticasQuery.data as any
    const lista = (response?.info?.data ?? []) as ConfiguracaoEmailAutomaticaDTO[]
    const fluxo = lista
      .filter((x) => isFlowTemplateCode(x.codigo))
      .map((x) => ({
        codigo: normalizeFlowCode(x.codigo),
        descricao: x.descricao ?? '',
        assunto: x.descricao ?? '',
        conteudo: x.textomensagem ?? '',
        ativo: x.ativo === 1,
      }))

    if (fluxo.length) {
      setTemplatesFluxo(fluxo)
    }
  }, [automaticasQuery.data])

  const templatesFluxoEfetivos = useMemo(() => {
    const defaultsPorCodigo = new Map(
      templateFluxoDefaults.map((x) => [x.codigo, { ...x, codigo: normalizeFlowCode(x.codigo) }]),
    )

    for (const item of templatesFluxo) {
      const codigo = normalizeFlowCode(item.codigo)
      if (!codigo) continue
      const base = defaultsPorCodigo.get(codigo)
      defaultsPorCodigo.set(codigo, {
        codigo,
        descricao: item.descricao || base?.descricao || '',
        assunto: item.assunto || base?.assunto || '',
        conteudo: item.conteudo ?? base?.conteudo ?? '',
        ativo: item.ativo ?? base?.ativo ?? true,
      })
    }

    return Array.from(defaultsPorCodigo.values()).sort((a, b) =>
      a.codigo.localeCompare(b.codigo, undefined, { numeric: true }),
    )
  }, [templatesFluxo])

  const listaUnificada = useMemo(() => {
    const autoRows = automaticas.map((a) => ({
      tipo: 'auto' as const,
      codigo: a.codigo,
      descricao: a.descricao,
      ativo: a.ativo === 1,
      diasAntecedencia: a.diasantecedencia,
      auto: a,
    }))

    const fluxoRows = templatesFluxoEfetivos.map((t) => ({
      tipo: 'fluxo' as const,
      codigo: t.codigo,
      descricao: t.descricao,
      ativo: t.ativo,
      diasAntecedencia: 0,
      auto: null,
      fluxo: t,
    }))

    return [...autoRows, ...fluxoRows]
  }, [automaticas, templatesFluxoEfetivos])

  const handleChange = <K extends keyof EmailConfigForm>(key: K, value: EmailConfigForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleGuardarConfig = () => {
    if (!form.username.trim()) return toast.warning('Username é obrigatório.')
    if (!form.server.trim()) return toast.warning('Server é obrigatório.')
    if (!form.password.trim()) return toast.warning('Password é obrigatória.')
    if (!form.porta.trim() || Number(form.porta) <= 0) return toast.warning('Porta inválida.')

    const payload: AtualizarConfiguracaoEmailRequest = {
      username: form.username.trim(),
      server: form.server.trim(),
      password: form.password,
      porta: Number(form.porta),
      useSSL: form.useSSL,
      tipoServico: Number(form.tipoServico) || 2,
      inbox: form.inbox.trim() || null,
      outbox: form.outbox.trim() || null,
      email: form.email.trim() || null,
      displayName: form.displayName.trim() || null,
      permitirEliminarEmail: form.permitirEliminarEmail,
    }

    saveMutation.mutate(payload)
  }

  const openEditModal = (cfg: ConfiguracaoEmailAutomaticaDTO) => {
    setSelectedConfig(cfg)
    setEditOpen(true)
  }

  const openFluxoModal = (template: TemplateFluxoForm) => {
    setSelectedFluxoConfig({
      id: template.codigo,
      clinicaId: '',
      codigo: template.codigo,
      descricao: template.assunto || template.descricao,
      ativo: template.ativo ? 1 : 0,
      diasantecedencia: 0,
      textomensagem: template.conteudo,
    })
    setFluxoEditOpen(true)
  }

  const handleGuardarFluxo = async (payload: AtualizarConfiguracaoEmailAutomaticaRequest) => {
    setTemplatesFluxo((prev) => {
      const baseList = prev.length ? prev : templatesFluxoEfetivos
      return baseList.map((x) =>
      x.codigo === payload.codigo
        ? { ...x, assunto: payload.descricao, conteudo: payload.textomensagem, ativo: payload.ativo === 1 }
        : x,
      )
    })
    await saveFluxoMutation.mutateAsync(payload)
    setFluxoEditOpen(false)
    setSelectedFluxoConfig(null)
  }

  return (
    <>
      <PageHead title='Configuração de Email | CliCloud' />
      <DashboardPageContainer>
        <div className='space-y-4'>
          <Card>
            <CardHeader className='space-y-0 pb-2'>
              <ConfigPageCardTitleRow
                title='Configuração do Servidor de Email'
                canChange={canChange}
                isEditing={isEditing}
                onStartEdit={startEditing}
                onCancelEdit={() => {
                  cancelEditing()
                  void configQuery.refetch()
                }}
                trailing={
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() =>
                      navigateManagedWindow(
                        navigate,
                        '/area-comum/tabelas/configuracao/email/historico'
                      )
                    }
                    disabled={saveMutation.isPending}
                  >
                    Histórico de Emails
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                <div className='space-y-1'>
                  <Label>Tipo de Serviço</Label>
                  <Select
                    value={form.tipoServico}
                    onValueChange={(v) => handleChange('tipoServico', v)}
                    disabled={formLocked || saveMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Selecionar serviço' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1'>IMAP</SelectItem>
                      <SelectItem value='2'>SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='space-y-1'>
                  <Label htmlFor='username'>Username</Label>
                  <Input
                    id='username'
                    value={form.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    readOnly={formLocked}
                    disabled={formLocked || saveMutation.isPending}
                  />
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='server'>Server</Label>
                  <Input
                    id='server'
                    value={form.server}
                    onChange={(e) => handleChange('server', e.target.value)}
                    readOnly={formLocked}
                    disabled={formLocked || saveMutation.isPending}
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='password'>Password</Label>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      readOnly={formLocked}
                      disabled={formLocked || saveMutation.isPending}
                      className='pr-10'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8'
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={formLocked || saveMutation.isPending}
                    >
                      {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </Button>
                  </div>
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='porta'>Porta</Label>
                  <Input
                    id='porta'
                    value={form.porta}
                    onChange={(e) => handleChange('porta', e.target.value)}
                    readOnly={formLocked}
                    disabled={formLocked || saveMutation.isPending}
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='inbox'>Inbox</Label>
                  <Input
                    id='inbox'
                    value={form.inbox}
                    onChange={(e) => handleChange('inbox', e.target.value)}
                    readOnly={formLocked}
                    disabled={formLocked || saveMutation.isPending}
                  />
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='outbox'>Outbox</Label>
                  <Input
                    id='outbox'
                    value={form.outbox}
                    onChange={(e) => handleChange('outbox', e.target.value)}
                    readOnly={formLocked}
                    disabled={formLocked || saveMutation.isPending}
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    readOnly={formLocked}
                    disabled={formLocked || saveMutation.isPending}
                  />
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='display-name'>Display Name</Label>
                  <Input
                    id='display-name'
                    value={form.displayName}
                    onChange={(e) => handleChange('displayName', e.target.value)}
                    readOnly={formLocked}
                    disabled={formLocked || saveMutation.isPending}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='flex items-center justify-between rounded border p-3'>
                  <div>
                    <Label className='text-sm font-medium'>UseSSL</Label>
                  </div>
                  <Switch
                    checked={form.useSSL}
                    onCheckedChange={(v) => handleChange('useSSL', v)}
                    disabled={formLocked || saveMutation.isPending}
                  />
                </div>

                <div className='flex items-center justify-between rounded border p-3'>
                  <div>
                    <Label className='text-sm font-medium'>Permitir Eliminar Email</Label>
                  </div>
                  <Switch
                    checked={form.permitirEliminarEmail}
                    onCheckedChange={(v) => handleChange('permitirEliminarEmail', v)}
                    disabled={formLocked || saveMutation.isPending}
                  />
                </div>
              </div>

              <div className='flex justify-end'>
                <Button
                  onClick={handleGuardarConfig}
                  disabled={!formEditable || saveMutation.isPending}
                >
                  {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuração de Emails Automáticos</CardTitle>
            </CardHeader>
            <CardContent>
              {!!listaUnificada.length ? (
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-[100px] text-center'>Cód.</TableHead>
                        <TableHead className='text-center'>Descrição</TableHead>
                        <TableHead className='w-[100px] text-center'>Ativo?</TableHead>
                        <TableHead className='w-[170px] text-center'>Dias de Antecedência</TableHead>
                        <TableHead className='w-[80px] text-right'>Editar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listaUnificada.map((row) => (
                        <TableRow key={`${row.tipo}-${row.codigo}`}>
                          <TableCell className='text-center'>{row.codigo}</TableCell>
                          <TableCell className='text-center'>{row.descricao}</TableCell>
                          <TableCell className='text-center'>{row.ativo ? 'Sim' : 'Não'}</TableCell>
                          <TableCell className='text-center'>{row.diasAntecedencia}</TableCell>
                          <TableCell className='text-right'>
                            <Button
                              type='button'
                              size='icon'
                              variant='ghost'
                              title={row.tipo === 'auto' ? 'Editar configuração' : 'Editar template de fluxo'}
                              onClick={() =>
                                row.tipo === 'auto'
                                  ? openEditModal(row.auto!)
                                  : openFluxoModal(row.fluxo!)
                              }
                              disabled={
                                formLocked ||
                                saveAutomaticaMutation.isPending ||
                                saveFluxoMutation.isPending
                              }
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  {automaticasQuery.isLoading
                    ? 'A carregar configurações automáticas...'
                    : 'Sem configurações para apresentar.'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardPageContainer>

      <EmailAutomaticaModal
        open={editOpen}
        config={selectedConfig}
        loading={saveAutomaticaMutation.isPending}
        onClose={() => setEditOpen(false)}
        onSave={async (payload) => {
          if (!payload.textomensagem.trim()) {
            toast.warning('O texto da mensagem é obrigatório.')
            return
          }
          await saveAutomaticaMutation.mutateAsync(payload)
        }}
      />

      <EmailAutomaticaModal
        open={fluxoEditOpen}
        config={selectedFluxoConfig}
        loading={saveFluxoMutation.isPending}
        title='Editar Template de Fluxo'
        descricaoLabel='Assunto'
        descricaoReadOnly={false}
        showDiasAntecedencia={false}
        onClose={() => {
          setFluxoEditOpen(false)
          setSelectedFluxoConfig(null)
        }}
        onSave={handleGuardarFluxo}
      />
    </>
  )
}
