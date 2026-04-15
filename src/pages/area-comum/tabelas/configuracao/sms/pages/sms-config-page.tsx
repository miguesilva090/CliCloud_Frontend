import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Eye, EyeOff, Pencil, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/utils/toast-utils'
import { SmsService } from '@/lib/services/core/sms-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import type {
  AtualizarConfiguracaoSmsRequest,
  AtualizarConfiguracaoAutomaticaRequest,
  ConfiguracaoSmsDTO,
  ConfiguracaoSmsAutomaticaDTO,
} from '@/types/dtos/core/sms.dtos'
import type { MedicoLightDTO } from '@/types/dtos/saude/medicos.dtos'

type SmsConfigForm = {
  ativo: boolean
  arpooneUrl: string
  arpooneSender: string
  arpooneApiKey: string
  arpooneOrganizationID: string
}

const initialForm: SmsConfigForm = {
  ativo: false,
  arpooneUrl: '',
  arpooneSender: '',
  arpooneApiKey: '',
  arpooneOrganizationID: '',
}

export function SmsConfigPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<SmsConfigForm>(initialForm)
  const [showArpooneUrl, setShowArpooneUrl] = useState(false)
  const [showArpooneSender, setShowArpooneSender] = useState(false)
  const [showArpooneOrganizationId, setShowArpooneOrganizationId] = useState(false)
  const [showArpooneApiKey, setShowArpooneApiKey] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<ConfiguracaoSmsAutomaticaDTO | null>(null)
  const [editAtivo, setEditAtivo] = useState(true)
  const [editDias, setEditDias] = useState('0')
  const [editMensagem, setEditMensagem] = useState('')
  const [medicosSelecionados, setMedicosSelecionados] = useState<string[]>([])
  const [medicosPickerOpen, setMedicosPickerOpen] = useState(false)

  const configQuery = useQuery({
    queryKey: ['sms-config', 'current'],
    queryFn: () => SmsService().getConfiguracaoAtual(),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: AtualizarConfiguracaoSmsRequest) =>
      SmsService().updateConfiguracao(payload),
    onSuccess: () => {
      toast.success('Configuração SMS guardada com sucesso.')
      void configQuery.refetch()
    },
    onError: () => {
      toast.error('Falha ao guardar configuração SMS.')
    },
  })

  const automaticasQuery = useQuery({
    queryKey: ['sms-config', 'automaticas'],
    queryFn: () => SmsService().getConfiguracoesAutomaticas(),
  })

  const medicosQuery = useQuery({
    queryKey: ['sms-config', 'medicos-light'],
    queryFn: () => MedicosService('sms-config').getMedicosLight(''),
    enabled: (editOpen || medicosPickerOpen) && selectedConfig?.codigo === '1',
  })

  const medicosSelecionadosQuery = useQuery({
    queryKey: ['sms-config', 'medicos-selecionados', selectedConfig?.codigo],
    queryFn: () => SmsService().getMedicosSelecionados(selectedConfig?.codigo ?? '1'),
    enabled: (editOpen || medicosPickerOpen) && selectedConfig?.codigo === '1',
  })

  const guardarMedicosMutation = useMutation({
    mutationFn: async () => {
      if (!selectedConfig || selectedConfig.codigo !== '1') return
      await SmsService().updateTodosMedicos(selectedConfig.codigo, { todosMedicos: false })
      await SmsService().updateMedicosSelecionados(selectedConfig.codigo, {
        codigosMedicos: medicosSelecionados,
      })
    },
    onSuccess: async () => {
      toast.success('Médicos atribuídos com sucesso.')
      setMedicosPickerOpen(false)
      await automaticasQuery.refetch()
    },
    onError: () => {
      toast.error('Falha ao atribuir médicos.')
    },
  })

  const saveAutomaticaMutation = useMutation({
    mutationFn: async () => {
      if (!selectedConfig) return
      const payload: AtualizarConfiguracaoAutomaticaRequest = {
        codigo: selectedConfig.codigo,
        ativo: editAtivo ? 1 : 0,
        descricao: selectedConfig.descricao,
        diasantecedencia: Number(editDias) || 0,
        textomensagem: editMensagem.trim(),
      }
      await SmsService().updateConfiguracaoAutomatica(selectedConfig.codigo, payload)
    },
    onSuccess: async () => {
      toast.success('Configuração automática atualizada com sucesso.')
      setEditOpen(false)
      await automaticasQuery.refetch()
    },
    onError: () => {
      toast.error('Falha ao atualizar configuração automática.')
    },
  })


  useEffect(() => {
    const response = configQuery.data as any
    const dto = response?.info?.data as ConfiguracaoSmsDTO | undefined
    if (!dto) return

    setForm({
      ativo: !!dto.ativo,
      arpooneUrl: dto.arpooneUrl ?? '',
      arpooneSender: dto.arpooneSender ?? '',
      arpooneApiKey: dto.arpooneApiKey ?? '',
      arpooneOrganizationID: dto.arpooneOrganizationID ?? '',
    })
  }, [configQuery.data])

  const handleChange = <K extends keyof SmsConfigForm>(key: K, value: SmsConfigForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleGuardar = () => {
    const payload: AtualizarConfiguracaoSmsRequest = {
      ativo: form.ativo,
      usenditArpoone: 2,
      arpooneUrl: form.arpooneUrl.trim() || null,
      arpooneSender: form.arpooneSender.trim() || null,
      arpooneApiKey: form.arpooneApiKey.trim() || null,
      arpooneOrganizationID: form.arpooneOrganizationID.trim() || null,
    }

    saveMutation.mutate(payload)
  }

  const automaticas = useMemo(() => {
    const response = automaticasQuery.data as any
    const lista = (response?.info?.data ?? []) as ConfiguracaoSmsAutomaticaDTO[]
    return [...lista].sort((a, b) =>
      a.codigo.localeCompare(b.codigo, undefined, { numeric: true, sensitivity: 'base' }),
    )
  }, [automaticasQuery.data])

  const medicos = useMemo(() => {
    const response = medicosQuery.data as any
    return (response?.info?.data ?? []) as MedicoLightDTO[]
  }, [medicosQuery.data])

  const codigosMedicosDisponiveis = useMemo(
    () => medicos.map((m) => m.letra ?? '').filter(Boolean) as string[],
    [medicos],
  )

  useEffect(() => {
    if (!medicosSelecionadosQuery.data) return
    const response = medicosSelecionadosQuery.data as any
    const lista = (response?.info?.data ?? []) as string[]
    setMedicosSelecionados(lista)
  }, [medicosSelecionadosQuery.data])

  const handleOpenEdit = (cfg: ConfiguracaoSmsAutomaticaDTO) => {
    setSelectedConfig(cfg)
    setEditAtivo(cfg.ativo === 1)
    setEditDias(String(cfg.diasantecedencia))
    setEditMensagem(cfg.textomensagem ?? '')
    setEditOpen(true)
  }

  const handleGuardarAutomatica = async () => {
    if (!selectedConfig) return
    if (!editMensagem.trim()) {
      toast.warning('O texto da mensagem é obrigatório.')
      return
    }
    await saveAutomaticaMutation.mutateAsync()
  }

  const alternarMedico = (codigoMedico: string, checked: boolean) => {
    setMedicosSelecionados((prev) =>
      checked ? Array.from(new Set([...prev, codigoMedico])) : prev.filter((x) => x !== codigoMedico),
    )
  }

  const inserirPlaceholder = (placeholder: string) => {
    setEditMensagem((prev) => {
      const token = `@${placeholder}`
      if (!prev.trim()) return token
      return `${prev} ${token}`.replace(/\s+/g, ' ').trim()
    })
  }


  const isBusy = saveMutation.isPending
  const isAutomaticaBusy = saveAutomaticaMutation.isPending
  const isMedicosBusy = guardarMedicosMutation.isPending

  const handleTodosMedicosTabela = async (cfg: ConfiguracaoSmsAutomaticaDTO, checked: boolean) => {
    if (cfg.codigo !== '1') return
    try {
      await SmsService().updateTodosMedicos(cfg.codigo, { todosMedicos: checked })
      await automaticasQuery.refetch()
      toast.success('Opção de médicos atualizada.')
    } catch {
      toast.error('Falha ao atualizar opção de médicos.')
    }
  }

  const handleEscolherMedicosTabela = (cfg: ConfiguracaoSmsAutomaticaDTO) => {
    if (cfg.codigo !== '1') return
    setSelectedConfig(cfg)
    setMedicosPickerOpen(true)
  }

  const handleGuardarMedicosSelecionados = async () => {
    if (!selectedConfig || selectedConfig.codigo !== '1') return
    await guardarMedicosMutation.mutateAsync()
  }


  return (
    <>
      <PageHead title='Configuração SMS | CliCloud' />
      <DashboardPageContainer>
        <div className='space-y-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between gap-3'>
              <CardTitle>Configuração SMS (Arpoone)</CardTitle>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate('/area-comum/tabelas/configuracao/sms/historico?tipo=enviadas')}
              >
                Histórico SMS
              </Button>
            </CardHeader>
            <CardContent className='space-y-4'>
              {configQuery.isLoading ? (
                <p className='text-sm text-muted-foreground'>A carregar configuração...</p>
              ) : null}

              {configQuery.isError ? (
                <p className='text-sm text-destructive'>Falha ao carregar configuração SMS.</p>
              ) : null}

              <div className='flex items-center justify-between rounded border p-3'>
                <div>
                  <Label className='text-sm font-medium'>Ativar serviço SMS</Label>
                  <p className='text-xs text-muted-foreground'>
                    Liga/desliga o envio de SMS para a clínica atual.
                  </p>
                </div>
                <Switch
                  checked={form.ativo}
                  onCheckedChange={(v) => handleChange('ativo', v)}
                  disabled={isBusy}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='space-y-1'>
                  <Label htmlFor='arpoone-url'>Arpoone URL</Label>
                  <div className='relative'>
                    <Input
                      id='arpoone-url'
                      type={showArpooneUrl ? 'text' : 'password'}
                      value={form.arpooneUrl}
                      onChange={(e) => handleChange('arpooneUrl', e.target.value)}
                      placeholder='https://api.arpoone.com/...'
                      disabled={isBusy}
                      className='pr-10'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8'
                      onClick={() => setShowArpooneUrl((prev) => !prev)}
                      disabled={isBusy}
                    >
                      {showArpooneUrl ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </Button>
                  </div>
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='arpoone-sender'>Sender</Label>
                  <div className='relative'>
                    <Input
                      id='arpoone-sender'
                      type={showArpooneSender ? 'text' : 'password'}
                      value={form.arpooneSender}
                      onChange={(e) => handleChange('arpooneSender', e.target.value)}
                      placeholder='CLICLOUD'
                      disabled={isBusy}
                      className='pr-10'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8'
                      onClick={() => setShowArpooneSender((prev) => !prev)}
                      disabled={isBusy}
                    >
                      {showArpooneSender ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </Button>
                  </div>
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='arpoone-org'>Organization ID (GUID)</Label>
                  <div className='relative'>
                    <Input
                      id='arpoone-org'
                      type={showArpooneOrganizationId ? 'text' : 'password'}
                      value={form.arpooneOrganizationID}
                      onChange={(e) => handleChange('arpooneOrganizationID', e.target.value)}
                      placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                      disabled={isBusy}
                      className='pr-10'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8'
                      onClick={() => setShowArpooneOrganizationId((prev) => !prev)}
                      disabled={isBusy}
                    >
                      {showArpooneOrganizationId ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='arpoone-key'>API Key</Label>
                  <div className='relative'>
                    <Input
                      id='arpoone-key'
                      type={showArpooneApiKey ? 'text' : 'password'}
                      value={form.arpooneApiKey}
                      onChange={(e) => handleChange('arpooneApiKey', e.target.value)}
                      placeholder='API Key'
                      disabled={isBusy}
                      className='pr-10'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8'
                      onClick={() => setShowArpooneApiKey((prev) => !prev)}
                      disabled={isBusy}
                    >
                      {showArpooneApiKey ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className='flex justify-end'>
                <Button onClick={handleGuardar} disabled={isBusy}>
                  {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuração de SMS Automáticos</CardTitle>
            </CardHeader>
            <CardContent>
              {automaticasQuery.isLoading ? (
                <p className='text-sm text-muted-foreground'>A carregar configurações automáticas...</p>
              ) : null}
              {automaticasQuery.isError ? (
                <p className='text-sm text-destructive'>
                  Falha ao carregar configurações automáticas.
                </p>
              ) : null}

              {!automaticasQuery.isLoading && !automaticas.length ? (
                <p className='text-sm text-muted-foreground'>Sem configurações automáticas para apresentar.</p>
              ) : null}

              {!!automaticas.length ? (
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-[80px] text-center'>Cód.</TableHead>
                        <TableHead className='text-center'>Título</TableHead>
                        <TableHead className='w-[90px] text-center'>Ativo?</TableHead>
                        <TableHead className='w-[170px] text-center'>Dias de Antecedência</TableHead>
                        <TableHead className='w-[170px] text-center'>Todos os médicos</TableHead>
                        <TableHead className='w-[80px] text-right'>Editar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {automaticas.map((cfg) => (
                        <TableRow key={cfg.id}>
                          <TableCell className='text-center'>{cfg.codigo}</TableCell>
                          <TableCell className='text-center'>{cfg.descricao}</TableCell>
                          <TableCell className='text-center'>{cfg.ativo === 1 ? 'Sim' : 'Não'}</TableCell>
                          <TableCell className='text-center'>{cfg.diasantecedencia}</TableCell>
                          <TableCell className='text-center'>
                            {cfg.codigo === '1' ? (
                              <div className='flex items-center justify-center gap-2'>
                                <Checkbox
                                  checked={cfg.todosMedicos}
                                  onCheckedChange={(checked) =>
                                    void handleTodosMedicosTabela(cfg, !!checked)
                                  }
                                />
                                <Button
                                  type='button'
                                  size='icon'
                                  variant='ghost'
                                  title='Escolher médicos'
                                  onClick={() => handleEscolherMedicosTabela(cfg)}
                                >
                                  <Users className='h-4 w-4' />
                                </Button>
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className='text-right'>
                            <Button
                              type='button'
                              size='icon'
                              variant='ghost'
                              onClick={() => handleOpenEdit(cfg)}
                              title='Editar configuração'
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </DashboardPageContainer>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Configuração de SMS Automático</DialogTitle>
            <DialogDescription className='sr-only'>
              Editar configuração automática de SMS.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <Label>Código</Label>
                <Input value={selectedConfig?.codigo ?? ''} readOnly />
              </div>
              <div className='space-y-1'>
                <Label>Descrição</Label>
                <Input value={selectedConfig?.descricao ?? ''} readOnly />
              </div>
            </div>

            <div className='flex items-center justify-between rounded border p-3'>
              <Label htmlFor='edit-ativo'>Ativo</Label>
              <Switch
                id='edit-ativo'
                checked={editAtivo}
                onCheckedChange={setEditAtivo}
                disabled={isAutomaticaBusy}
              />
            </div>

            <div className='space-y-1'>
              <Label htmlFor='edit-dias'>Dias de Antecedência</Label>
              <Input
                id='edit-dias'
                type='number'
                value={editDias}
                onChange={(e) => setEditDias(e.target.value)}
                disabled={isAutomaticaBusy}
              />
            </div>

            <div className='space-y-1'>
              <Label htmlFor='edit-mensagem'>Texto da Mensagem</Label>
              <Textarea
                id='edit-mensagem'
                rows={6}
                value={editMensagem}
                onChange={(e) => setEditMensagem(e.target.value)}
                disabled={isAutomaticaBusy}
              />
            </div>

            {selectedConfig?.codigo === '3' ? (
              <div className='flex justify-start'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Utente')}
                  disabled={isAutomaticaBusy}
                >
                  Utente
                </Button>
              </div>
            ) : null}

            {selectedConfig?.codigo === '1' ? (
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Utente')}
                  disabled={isAutomaticaBusy}
                >
                  Utente
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Hora')}
                  disabled={isAutomaticaBusy}
                >
                  Hora
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Data')}
                  disabled={isAutomaticaBusy}
                >
                  Data
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Medico')}
                  disabled={isAutomaticaBusy}
                >
                  Médico
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Especialidade')}
                  disabled={isAutomaticaBusy}
                >
                  Especialidade
                </Button>
              </div>
            ) : null}

            {selectedConfig?.codigo === '2.1' ? (
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Utente')}
                  disabled={isAutomaticaBusy}
                >
                  Utente
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Hora')}
                  disabled={isAutomaticaBusy}
                >
                  Hora
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Data')}
                  disabled={isAutomaticaBusy}
                >
                  Data
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Fisioterapeuta')}
                  disabled={isAutomaticaBusy}
                >
                  Fisioterapeuta
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Nsessao')}
                  disabled={isAutomaticaBusy}
                >
                  N.º Sessão
                </Button>
              </div>
            ) : null}

            {selectedConfig?.codigo === '2.2' ? (
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Utente')}
                  disabled={isAutomaticaBusy}
                >
                  Utente
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Hora')}
                  disabled={isAutomaticaBusy}
                >
                  Hora
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Data')}
                  disabled={isAutomaticaBusy}
                >
                  Data
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Fisioterapeuta')}
                  disabled={isAutomaticaBusy}
                >
                  Fisioterapeuta
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Nsessao')}
                  disabled={isAutomaticaBusy}
                >
                  N.º Sessão
                </Button>
              </div>
            ) : null}

            {selectedConfig?.codigo === '2.3' ? (
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Utente')}
                  disabled={isAutomaticaBusy}
                >
                  Utente
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Hora')}
                  disabled={isAutomaticaBusy}
                >
                  Hora
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Data')}
                  disabled={isAutomaticaBusy}
                >
                  Data
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Fisioterapeuta')}
                  disabled={isAutomaticaBusy}
                >
                  Fisioterapeuta
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Nsessao')}
                  disabled={isAutomaticaBusy}
                >
                  N.º Sessão
                </Button>
              </div>
            ) : null}

            {selectedConfig?.codigo === '4' ? (
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Utente')}
                  disabled={isAutomaticaBusy}
                >
                  Utente
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Medico')}
                  disabled={isAutomaticaBusy}
                >
                  Médico
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('HoraAntiga')}
                  disabled={isAutomaticaBusy}
                >
                  Hora Antiga
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('DataAntiga')}
                  disabled={isAutomaticaBusy}
                >
                  Data Antiga
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('HoraNova')}
                  disabled={isAutomaticaBusy}
                >
                  Hora Nova
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('DataNova')}
                  disabled={isAutomaticaBusy}
                >
                  Data Nova
                </Button>
              </div>
            ) : null}

            {selectedConfig?.codigo === '5' ? (
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Utente')}
                  disabled={isAutomaticaBusy}
                >
                  Utente
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Medico')}
                  disabled={isAutomaticaBusy}
                >
                  Médico
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Hora')}
                  disabled={isAutomaticaBusy}
                >
                  Hora
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Data')}
                  disabled={isAutomaticaBusy}
                >
                  Data
                </Button>
              </div>
            ) : null}

            {selectedConfig?.codigo === '6.1' ? (
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Utente')}
                  disabled={isAutomaticaBusy}
                >
                  Utente
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Hora')}
                  disabled={isAutomaticaBusy}
                >
                  Hora
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Data')}
                  disabled={isAutomaticaBusy}
                >
                  Data
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Medico')}
                  disabled={isAutomaticaBusy}
                >
                  Médico
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Especialidade')}
                  disabled={isAutomaticaBusy}
                >
                  Especialidade
                </Button>
              </div>
            ) : null}

            {selectedConfig?.codigo === '6.2' ? (
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Utente')}
                  disabled={isAutomaticaBusy}
                >
                  Utente
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Hora')}
                  disabled={isAutomaticaBusy}
                >
                  Hora
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Data')}
                  disabled={isAutomaticaBusy}
                >
                  Data
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Medico')}
                  disabled={isAutomaticaBusy}
                >
                  Médico
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Especialidade')}
                  disabled={isAutomaticaBusy}
                >
                  Especialidade
                </Button>
              </div>
            ) : null}

            {selectedConfig?.codigo === '7.1' ? (
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Utente')}
                  disabled={isAutomaticaBusy}
                >
                  Utente
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Hora')}
                  disabled={isAutomaticaBusy}
                >
                  Hora
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Data')}
                  disabled={isAutomaticaBusy}
                >
                  Data
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Profissional')}
                  disabled={isAutomaticaBusy}
                >
                  Profissional
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Modalidade')}
                  disabled={isAutomaticaBusy}
                >
                  Modalidade
                </Button>
              </div>
            ) : null}

            {selectedConfig?.codigo === '8' ? (
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Utente')}
                  disabled={isAutomaticaBusy}
                >
                  Utente
                </Button>
              </div>
            ) : null}

            {selectedConfig?.codigo === '9' ? (
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Utente')}
                  disabled={isAutomaticaBusy}
                >
                  Utente
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Hora')}
                  disabled={isAutomaticaBusy}
                >
                  Hora
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Data')}
                  disabled={isAutomaticaBusy}
                >
                  Data
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Medico')}
                  disabled={isAutomaticaBusy}
                >
                  Médico
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Especialidade')}
                  disabled={isAutomaticaBusy}
                >
                  Especialidade
                </Button>
              </div>
            ) : null}

            {selectedConfig?.codigo === '10' ? (
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Utente')}
                  disabled={isAutomaticaBusy}
                >
                  Utente
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Hora')}
                  disabled={isAutomaticaBusy}
                >
                  Hora
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Data')}
                  disabled={isAutomaticaBusy}
                >
                  Data
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Fisioterapeuta')}
                  disabled={isAutomaticaBusy}
                >
                  Fisioterapeuta
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => inserirPlaceholder('Nsessao')}
                  disabled={isAutomaticaBusy}
                >
                  N.º Sessão
                </Button>
              </div>
            ) : null}

          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setEditOpen(false)} disabled={isAutomaticaBusy}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarAutomatica} disabled={isAutomaticaBusy}>
              {isAutomaticaBusy ? 'A guardar...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={medicosPickerOpen} onOpenChange={setMedicosPickerOpen}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Configuração de SMS Automático</DialogTitle>
            <DialogDescription className='sr-only'>
              Seleção de médicos para envio de SMS.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3'>
            <div className='flex justify-end'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  setMedicosSelecionados((prev) =>
                    prev.length === codigosMedicosDisponiveis.length ? [] : codigosMedicosDisponiveis,
                  )
                }
                disabled={isMedicosBusy}
              >
                {medicosSelecionados.length === codigosMedicosDisponiveis.length
                  ? 'Limpar seleção'
                  : 'Selecionar Todos'}
              </Button>
            </div>

            <div className='rounded border max-h-72 overflow-y-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[140px] text-center'>Código</TableHead>
                    <TableHead className='text-left'>Médico</TableHead>
                    <TableHead className='w-[140px] text-center'>Enviar SMS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicosQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className='text-center text-sm text-muted-foreground'>
                        A carregar médicos...
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {medicosQuery.isError ? (
                    <TableRow>
                      <TableCell colSpan={3} className='text-center text-sm text-destructive'>
                        Falha ao carregar médicos.
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {!medicosQuery.isLoading && !medicos.length ? (
                    <TableRow>
                      <TableCell colSpan={3} className='text-center text-sm text-muted-foreground'>
                        Sem médicos para apresentar.
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {medicos.map((m) => {
                    const codigoMedico = m.letra?.trim() ?? ''
                    const chaveSelecao = codigoMedico || m.nome?.trim() || m.id

                    return (
                      <TableRow key={`${m.id}-${chaveSelecao}`}>
                        <TableCell className='text-center'>{codigoMedico || '-'}</TableCell>
                        <TableCell className='text-left'>{m.nome}</TableCell>
                        <TableCell className='text-center'>
                          <Checkbox
                            checked={medicosSelecionados.includes(chaveSelecao)}
                            onCheckedChange={(checked) => alternarMedico(chaveSelecao, !!checked)}
                            disabled={isMedicosBusy}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setMedicosPickerOpen(false)} disabled={isMedicosBusy}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarMedicosSelecionados} disabled={isMedicosBusy}>
              {isMedicosBusy ? 'A guardar...' : 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
