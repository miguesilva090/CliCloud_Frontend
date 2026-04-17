import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/utils/toast-utils'
import { ConfigWebServiceService } from '@/lib/services/core/config-webservice-service'
import type {
  AtualizarConfigWebServiceRequest,
  ConfigWebServiceDTO,
} from '@/types/dtos/core/config-webservice.dtos'

type ConfigWebServiceForm = {
  versaoPrescricao: number
  urlRnu: string
  urlAcss: string
  loginAcss: string
  passwordAcss: string
  usarProxy: boolean
  userProxy: string
  passwordProxy: string
  dominioProxy: string
  urlAcssRsp: string
  loginAcssRsp: string
  passwordAcssRsp: string
  usarProxyRsp: boolean
  userProxyRsp: string
  passwordProxyRsp: string
  dominioProxyRsp: string
  proxyAutenticacao: string
  tokenAutenticacao: string
  loginAutenticacao: string
  passwordAutenticacao: string
}

const initialForm: ConfigWebServiceForm = {
  versaoPrescricao: 2,
  urlRnu: '',
  urlAcss: '',
  loginAcss: '',
  passwordAcss: '',
  usarProxy: false,
  userProxy: '',
  passwordProxy: '',
  dominioProxy: '',
  urlAcssRsp: '',
  loginAcssRsp: '',
  passwordAcssRsp: '',
  usarProxyRsp: false,
  userProxyRsp: '',
  passwordProxyRsp: '',
  dominioProxyRsp: '',
  proxyAutenticacao: '',
  tokenAutenticacao: '',
  loginAutenticacao: '',
  passwordAutenticacao: '',
}

export function WebserviceConfigPage() {
  const [form, setForm] = useState<ConfigWebServiceForm>(initialForm)
  const [showPasswords, setShowPasswords] = useState(false)
  const [showAdvancedAuth, setShowAdvancedAuth] = useState(false)

  const configQuery = useQuery({
    queryKey: ['config-webservice', 'current'],
    queryFn: () => ConfigWebServiceService().getConfiguracaoAtual(),
  })
  const versaoQuery = useQuery({
    queryKey: ['config-webservice', 'versao-prescricao'],
    queryFn: () => ConfigWebServiceService().getVersaoPrescricao(),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: AtualizarConfigWebServiceRequest) =>
      ConfigWebServiceService().updateConfiguracao(payload),
    onSuccess: () => {
      toast.success('Configuração de WebServices guardada com sucesso.')
      void configQuery.refetch()
      void versaoQuery.refetch()
    },
    onError: () => {
      toast.error('Falha ao guardar configuração de WebServices.')
    },
  })

  useEffect(() => {
    const response = configQuery.data as any
    const dto = response?.info?.data as ConfigWebServiceDTO | undefined
    if (!dto) return

    setForm({
      versaoPrescricao: dto.versaoPrescricao ?? 2,
      urlRnu: dto.urlRnu ?? '',
      urlAcss: dto.urlAcss ?? '',
      loginAcss: dto.loginAcss ?? '',
      passwordAcss: dto.passwordAcss ?? '',
      usarProxy: dto.usarProxy ?? false,
      userProxy: dto.userProxy ?? '',
      passwordProxy: dto.passwordProxy ?? '',
      dominioProxy: dto.dominioProxy ?? '',
      urlAcssRsp: dto.urlAcssRsp ?? '',
      loginAcssRsp: dto.loginAcssRsp ?? '',
      passwordAcssRsp: dto.passwordAcssRsp ?? '',
      usarProxyRsp: dto.usarProxyRsp ?? false,
      userProxyRsp: dto.userProxyRsp ?? '',
      passwordProxyRsp: dto.passwordProxyRsp ?? '',
      dominioProxyRsp: dto.dominioProxyRsp ?? '',
      proxyAutenticacao: dto.proxyAutenticacao ?? '',
      tokenAutenticacao: dto.tokenAutenticacao ?? '',
      loginAutenticacao: dto.loginAutenticacao ?? '',
      passwordAutenticacao: dto.passwordAutenticacao ?? '',
    })
  }, [configQuery.data])

  useEffect(() => {
    const response = versaoQuery.data as any
    const versao = response?.info?.data
    if (typeof versao !== 'number') return
    setForm((prev) => ({ ...prev, versaoPrescricao: versao }))
  }, [versaoQuery.data])

  const handleChange = <K extends keyof ConfigWebServiceForm>(key: K, value: ConfigWebServiceForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleGuardar = () => {
    if (!form.urlRnu.trim()) return toast.warning('Endereço RNU é obrigatório.')
    if (!form.urlAcss.trim()) return toast.warning('Endereço Prescrição (Materializadas) é obrigatório.')
    if (!form.loginAcss.trim()) return toast.warning('Utilizador ACSS é obrigatório.')
    if (!form.passwordAcss.trim()) return toast.warning('Palavra-passe ACSS é obrigatória.')
    if (!form.urlAcssRsp.trim()) return toast.warning('Endereço Prescrição (Desmaterializadas) é obrigatório.')
    if (!form.loginAcssRsp.trim()) return toast.warning('Utilizador ACSS RSP é obrigatório.')
    if (!form.passwordAcssRsp.trim()) return toast.warning('Palavra-passe ACSS RSP é obrigatória.')
    if (form.usarProxy && (!form.dominioProxy.trim() || !form.userProxy.trim() || !form.passwordProxy.trim())) {
      return toast.warning('Quando "Usar Proxy" está ativo, domínio, utilizador e password são obrigatórios.')
    }
    if (form.usarProxyRsp && (!form.dominioProxyRsp.trim() || !form.userProxyRsp.trim() || !form.passwordProxyRsp.trim())) {
      return toast.warning('Quando "Usar Proxy" RSP está ativo, domínio, utilizador e password são obrigatórios.')
    }

    const payload: AtualizarConfigWebServiceRequest = {
      versaoPrescricao: form.versaoPrescricao,
      urlRnu: form.urlRnu.trim(),
      urlAcss: form.urlAcss.trim(),
      loginAcss: form.loginAcss.trim(),
      passwordAcss: form.passwordAcss,
      usarProxy: form.usarProxy,
      userProxy: form.userProxy.trim() || null,
      passwordProxy: form.passwordProxy || null,
      dominioProxy: form.dominioProxy.trim() || null,
      urlAcssRsp: form.urlAcssRsp.trim(),
      loginAcssRsp: form.loginAcssRsp.trim(),
      passwordAcssRsp: form.passwordAcssRsp,
      usarProxyRsp: form.usarProxyRsp,
      userProxyRsp: form.userProxyRsp.trim() || null,
      passwordProxyRsp: form.passwordProxyRsp || null,
      dominioProxyRsp: form.dominioProxyRsp.trim() || null,
      proxyAutenticacao: form.proxyAutenticacao.trim() || null,
      tokenAutenticacao: form.tokenAutenticacao.trim() || null,
      loginAutenticacao: form.loginAutenticacao.trim() || null,
      passwordAutenticacao: form.passwordAutenticacao || null,
    }

    saveMutation.mutate(payload)
  }

  const passwordType = showPasswords ? 'text' : 'password'

  return (
    <>
      <PageHead title='Configuração WebServices | CliCloud' />
      <DashboardPageContainer>
        <div className='space-y-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Configuração de WebServices</CardTitle>
              <div className='flex gap-2'>
                <Button type='button' variant='outline' onClick={() => setShowPasswords((v) => !v)}>
                  {showPasswords ? <EyeOff className='mr-2 h-4 w-4' /> : <Eye className='mr-2 h-4 w-4' />}
                  {showPasswords ? 'Ocultar passwords' : 'Mostrar passwords'}
                </Button>
                <Button onClick={handleGuardar} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
                </Button>
              </div>
            </CardHeader>

            <CardContent className='space-y-6'>
              {configQuery.isLoading ? (
                <p className='text-sm text-muted-foreground'>A carregar configuração...</p>
              ) : null}
              {configQuery.isError ? (
                <p className='text-sm text-destructive'>Falha ao carregar configuração atual.</p>
              ) : null}

              <section className='space-y-3 rounded-md border p-4'>
                <h3 className='text-sm font-semibold text-primary'>Configuração</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='url-rnu'>Endereço RNU</Label>
                    <Input
                      id='url-rnu'
                      value={form.urlRnu}
                      onChange={(e) => handleChange('urlRnu', e.target.value)}
                      disabled={saveMutation.isPending}
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label htmlFor='versao-prescricao'>Versão Prescrição</Label>
                    <select
                      id='versao-prescricao'
                      value={String(form.versaoPrescricao)}
                      onChange={(e) => handleChange('versaoPrescricao', Number(e.target.value))}
                      className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm'
                      disabled={saveMutation.isPending}
                    >
                      <option value='1'>V1</option>
                      <option value='2'>V2</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className='space-y-3 rounded-md border p-4'>
                <h3 className='text-sm font-semibold text-primary'>Receitas Materializadas</h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <div className='md:col-span-3 space-y-1'>
                    <Label htmlFor='url-acss'>Endereço Prescrição</Label>
                    <Input id='url-acss' value={form.urlAcss} onChange={(e) => handleChange('urlAcss', e.target.value)} />
                  </div>
                  <div className='space-y-1'>
                    <Label htmlFor='login-acss'>Utilizador</Label>
                    <Input id='login-acss' value={form.loginAcss} onChange={(e) => handleChange('loginAcss', e.target.value)} />
                  </div>
                  <div className='space-y-1'>
                    <Label htmlFor='password-acss'>Palavra-passe</Label>
                    <Input id='password-acss' type={passwordType} value={form.passwordAcss} onChange={(e) => handleChange('passwordAcss', e.target.value)} />
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                  <div className='flex items-center justify-between rounded border p-3'>
                    <Label className='text-sm font-medium'>Usar Proxy</Label>
                    <Switch checked={form.usarProxy} onCheckedChange={(v) => handleChange('usarProxy', v)} />
                  </div>
                  <div className='space-y-1'>
                    <Label>Domínio</Label>
                    <Input value={form.dominioProxy} onChange={(e) => handleChange('dominioProxy', e.target.value)} />
                  </div>
                  <div className='space-y-1'>
                    <Label>Utilizador</Label>
                    <Input value={form.userProxy} onChange={(e) => handleChange('userProxy', e.target.value)} />
                  </div>
                  <div className='space-y-1'>
                    <Label>Palavra-passe</Label>
                    <Input type={passwordType} value={form.passwordProxy} onChange={(e) => handleChange('passwordProxy', e.target.value)} />
                  </div>
                </div>
              </section>

              <section className='space-y-3 rounded-md border p-4'>
                <h3 className='text-sm font-semibold text-primary'>Receitas Desmaterializadas</h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <div className='md:col-span-3 space-y-1'>
                    <Label htmlFor='url-acss-rsp'>Endereço Prescrição</Label>
                    <Input id='url-acss-rsp' value={form.urlAcssRsp} onChange={(e) => handleChange('urlAcssRsp', e.target.value)} />
                  </div>
                  <div className='space-y-1'>
                    <Label htmlFor='login-acss-rsp'>Utilizador</Label>
                    <Input id='login-acss-rsp' value={form.loginAcssRsp} onChange={(e) => handleChange('loginAcssRsp', e.target.value)} />
                  </div>
                  <div className='space-y-1'>
                    <Label htmlFor='password-acss-rsp'>Palavra-passe</Label>
                    <Input id='password-acss-rsp' type={passwordType} value={form.passwordAcssRsp} onChange={(e) => handleChange('passwordAcssRsp', e.target.value)} />
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                  <div className='flex items-center justify-between rounded border p-3'>
                    <Label className='text-sm font-medium'>Usar Proxy</Label>
                    <Switch checked={form.usarProxyRsp} onCheckedChange={(v) => handleChange('usarProxyRsp', v)} />
                  </div>
                  <div className='space-y-1'>
                    <Label>Domínio</Label>
                    <Input value={form.dominioProxyRsp} onChange={(e) => handleChange('dominioProxyRsp', e.target.value)} />
                  </div>
                  <div className='space-y-1'>
                    <Label>Utilizador</Label>
                    <Input value={form.userProxyRsp} onChange={(e) => handleChange('userProxyRsp', e.target.value)} />
                  </div>
                  <div className='space-y-1'>
                    <Label>Palavra-passe</Label>
                    <Input type={passwordType} value={form.passwordProxyRsp} onChange={(e) => handleChange('passwordProxyRsp', e.target.value)} />
                  </div>
                </div>
              </section>

              <section className='space-y-3 rounded-md border p-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-semibold text-primary'>Definições Avançadas</h3>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setShowAdvancedAuth((v) => !v)}
                  >
                    {showAdvancedAuth ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
                {showAdvancedAuth ? (
                  <div className='space-y-3'>
                    <h4 className='text-xs font-medium text-muted-foreground'>Autenticação</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label>Proxy de Autenticação</Label>
                        <Input
                          value={form.proxyAutenticacao}
                          onChange={(e) => handleChange('proxyAutenticacao', e.target.value)}
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label>Token de Autenticação</Label>
                        <Input
                          value={form.tokenAutenticacao}
                          onChange={(e) => handleChange('tokenAutenticacao', e.target.value)}
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label>Utilizador</Label>
                        <Input
                          value={form.loginAutenticacao}
                          onChange={(e) => handleChange('loginAutenticacao', e.target.value)}
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label>Palavra-passe</Label>
                        <Input
                          type={passwordType}
                          value={form.passwordAutenticacao}
                          onChange={(e) => handleChange('passwordAutenticacao', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>

            </CardContent>
          </Card>
        </div>
      </DashboardPageContainer>
    </>
  )
}
