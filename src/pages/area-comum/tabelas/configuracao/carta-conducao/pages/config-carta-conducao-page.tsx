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
import { ConfigCartaConducaoService } from '@/lib/services/core/config-carta-conducao-service'
import type {
  AtualizarConfigCartaConducaoRequest,
  ConfigCartaConducaoDTO,
} from '@/types/dtos/core/config-carta-conducao.dtos'

type ConfigCartaConducaoForm = {
  urlOnline: string
  urlOffline: string
  utilizador: string
  password: string
  autoridadeSaudePublica: boolean
}

const initialForm: ConfigCartaConducaoForm = {
  urlOnline: '',
  urlOffline: '',
  utilizador: '',
  password: '',
  autoridadeSaudePublica: false,
}

export function ConfigCartaConducaoPage() {
  const [form, setForm] = useState<ConfigCartaConducaoForm>(initialForm)
  const [showPassword, setShowPassword] = useState(false)

  const configQuery = useQuery({
    queryKey: ['config-carta-conducao', 'current'],
    queryFn: () => ConfigCartaConducaoService().getConfiguracaoAtual(),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: AtualizarConfigCartaConducaoRequest) =>
      ConfigCartaConducaoService().updateConfiguracao(payload),
    onSuccess: () => {
      toast.success('Configuração guardada com sucesso.')
      void configQuery.refetch()
    },
    onError: () => {
      toast.error('Falha ao guardar configuração.')
    },
  })

  useEffect(() => {
    const response = configQuery.data as any
    const dto = response?.info?.data as ConfigCartaConducaoDTO | undefined
    if (!dto) return

    setForm({
      urlOnline: dto.urlOnline ?? '',
      urlOffline: dto.urlOffline ?? '',
      utilizador: dto.utilizador ?? '',
      password: dto.password ?? '',
      autoridadeSaudePublica: dto.autoridadeSaudePublica === 1,
    })
  }, [configQuery.data])

  const handleChange = <K extends keyof ConfigCartaConducaoForm>(
    key: K,
    value: ConfigCartaConducaoForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleGuardar = () => {
    if (!form.urlOnline.trim()) {
      toast.warning('URL Online é obrigatória.')
      return
    }
    if (!form.urlOffline.trim()) {
      toast.warning('URL Offline é obrigatória.')
      return
    }
    if (!form.utilizador.trim()) {
      toast.warning('Utilizador é obrigatório.')
      return
    }
    if (!form.password.trim()) {
      toast.warning('Password é obrigatória.')
      return
    }

    const payload: AtualizarConfigCartaConducaoRequest = {
      urlOnline: form.urlOnline.trim(),
      urlOffline: form.urlOffline.trim(),
      utilizador: form.utilizador.trim(),
      password: form.password,
      autoridadeSaudePublica: form.autoridadeSaudePublica ? 1 : 0,
    }

    saveMutation.mutate(payload)
  }

  return (
    <>
      <PageHead title='Configuração Atestados Carta Condução | CliCloud' />
      <DashboardPageContainer>
        <Card>
          <CardHeader>
            <CardTitle>Configuração Atestados Carta Condução</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {configQuery.isLoading ? (
              <p className='text-sm text-muted-foreground'>A carregar configuração...</p>
            ) : null}
            {configQuery.isError ? (
              <p className='text-sm text-destructive'>Falha ao carregar configuração atual.</p>
            ) : null}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <Label htmlFor='url-online'>URL Online</Label>
                <Input
                  id='url-online'
                  value={form.urlOnline}
                  onChange={(e) => handleChange('urlOnline', e.target.value)}
                  placeholder='https://...'
                  disabled={saveMutation.isPending}
                />
              </div>

              <div className='space-y-1'>
                <Label htmlFor='url-offline'>URL Offline</Label>
                <Input
                  id='url-offline'
                  value={form.urlOffline}
                  onChange={(e) => handleChange('urlOffline', e.target.value)}
                  placeholder='https://...'
                  disabled={saveMutation.isPending}
                />
              </div>

              <div className='space-y-1'>
                <Label htmlFor='utilizador'>Utilizador</Label>
                <Input
                  id='utilizador'
                  value={form.utilizador}
                  onChange={(e) => handleChange('utilizador', e.target.value)}
                  disabled={saveMutation.isPending}
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
                    disabled={saveMutation.isPending}
                    className='pr-10'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8'
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={saveMutation.isPending}
                  >
                    {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                  </Button>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-between rounded border p-3'>
              <div>
                <Label className='text-sm font-medium'>Autoridade Saúde Pública</Label>
                <p className='text-xs text-muted-foreground'>
                  Ativa a flag de autoridade de saúde pública no payload SPMS.
                </p>
              </div>
              <Switch
                checked={form.autoridadeSaudePublica}
                onCheckedChange={(v) => handleChange('autoridadeSaudePublica', v)}
                disabled={saveMutation.isPending}
              />
            </div>

            <div className='flex justify-end'>
              <Button onClick={handleGuardar} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardPageContainer>
    </>
  )
}
