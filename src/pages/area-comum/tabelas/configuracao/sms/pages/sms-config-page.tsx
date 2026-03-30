import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/utils/toast-utils'
import { SmsService } from '@/lib/services/core/sms-service'
import type {
  AtualizarConfiguracaoSmsRequest,
  ConfiguracaoSmsDTO,
} from '@/types/dtos/core/sms.dtos'

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
  const [form, setForm] = useState<SmsConfigForm>(initialForm)
  const [numeroTeste, setNumeroTeste] = useState('')
  const [mensagemTeste, setMensagemTeste] = useState('Mensagem de teste CliCloud')
  const [showArpooneUrl, setShowArpooneUrl] = useState(false)
  const [showArpooneSender, setShowArpooneSender] = useState(false)
  const [showArpooneOrganizationId, setShowArpooneOrganizationId] = useState(false)
  const [showArpooneApiKey, setShowArpooneApiKey] = useState(false)

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

  const testMutation = useMutation({
    mutationFn: (payload: { numeroDestinatario: string; textoMensagem: string }) =>
      SmsService().enviarTeste({
        numeroDestinatario: payload.numeroDestinatario,
        textoMensagem: payload.textoMensagem,
        modulo: 'TesteSMS',
      }),
    onSuccess: () => {
      toast.success('SMS de teste enviado.')
    },
    onError: () => {
      toast.error('Falha ao enviar SMS de teste.')
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

  const handleEnviarTeste = () => {
    if (!numeroTeste.trim()) {
      toast.warning('Indica o número de destino.')
      return
    }
    if (!mensagemTeste.trim()) {
      toast.warning('Indica a mensagem de teste.')
      return
    }

    testMutation.mutate({
      numeroDestinatario: numeroTeste.trim(),
      textoMensagem: mensagemTeste.trim(),
    })
  }

  const isBusy = saveMutation.isPending || testMutation.isPending

  return (
    <>
      <PageHead title='Configuração SMS | CliCloud' />
      <DashboardPageContainer>
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Configuração SMS (Arpoone)</CardTitle>
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
              <CardTitle>Enviar SMS de teste</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='space-y-1'>
                <Label htmlFor='numero-teste'>Número destino</Label>
                <Input
                  id='numero-teste'
                  value={numeroTeste}
                  onChange={(e) => setNumeroTeste(e.target.value)}
                  placeholder='9XXXXXXXX'
                  disabled={isBusy}
                />
              </div>

              <div className='space-y-1'>
                <Label htmlFor='mensagem-teste'>Mensagem</Label>
                <Textarea
                  id='mensagem-teste'
                  value={mensagemTeste}
                  onChange={(e) => setMensagemTeste(e.target.value)}
                  rows={4}
                  disabled={isBusy}
                />
              </div>

              <div className='flex justify-end'>
                <Button
                  variant='secondary'
                  onClick={handleEnviarTeste}
                  disabled={isBusy}
                >
                  {testMutation.isPending ? 'A enviar...' : 'Enviar teste'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardPageContainer>
    </>
  )
}
