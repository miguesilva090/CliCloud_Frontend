import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/utils/toast-utils'
import { ChamadaVozService } from '@/lib/services/core/chamada-voz-service'
import type {
  AtualizarConfiguracaoChamadaVozRequest,
  ConfiguracaoChamadaVozDTO,
  ConfiguracaoChamadaVozOpcaoDTO,
  ConfiguracaoChamadaVozOpcoesDTO,
} from '@/types/dtos/core/chamada-voz.dtos'

type ChamadaVozForm = {
  ativo: boolean
  url: string
  language: string
  tld: string
}

const initialForm: ChamadaVozForm = {
  ativo: false,
  url: '',
  language: 'pt',
  tld: 'pt',
}

export function ChamadaVozConfigPage() {
  const [form, setForm] = useState<ChamadaVozForm>(initialForm)

  const configQuery = useQuery({
    queryKey: ['chamada-voz', 'configuracao'],
    queryFn: () => ChamadaVozService().getConfiguracaoAtual(),
  })

  const opcoesQuery = useQuery({
    queryKey: ['chamada-voz', 'opcoes'],
    queryFn: () => ChamadaVozService().getOpcoes(),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: AtualizarConfiguracaoChamadaVozRequest) =>
      ChamadaVozService().updateConfiguracao(payload),
    onSuccess: () => {
      toast.success('Configuração de chamada de voz guardada com sucesso.')
      void configQuery.refetch()
    },
    onError: () => {
      toast.error('Falha ao guardar configuração de chamada de voz.')
    },
  })

  useEffect(() => {
    const response = configQuery.data as any
    const dto = response?.info?.data as ConfiguracaoChamadaVozDTO | undefined
    if (!dto) return

    setForm({
      ativo: !!dto.ativo,
      url: dto.url ?? '',
      language: dto.language?.trim() || 'pt',
      tld: dto.tld?.trim() || 'pt',
    })
  }, [configQuery.data])

  const handleChange = <K extends keyof ChamadaVozForm>(key: K, value: ChamadaVozForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleGuardar = () => {
    if (form.ativo && !form.url.trim()) {
      toast.warning('URL é obrigatória quando a chamada de voz está ativa.')
      return
    }

    const payload: AtualizarConfiguracaoChamadaVozRequest = {
      ativo: form.ativo,
      url: form.url.trim() || null,
      language: form.language.trim() || 'pt',
      tld: form.tld.trim() || 'pt',
    }

    saveMutation.mutate(payload)
  }

  const opcoes = ((opcoesQuery.data as any)?.info?.data ?? null) as ConfiguracaoChamadaVozOpcoesDTO | null
  const idiomas: ConfiguracaoChamadaVozOpcaoDTO[] = opcoes?.idiomas ?? []
  const variacoes: ConfiguracaoChamadaVozOpcaoDTO[] = opcoes?.variacoes ?? []

  return (
    <>
      <PageHead title='Configuração de Chamada de Voz | CliCloud' />
      <DashboardPageContainer>
        <Card>
          <CardHeader>
            <CardTitle>Configuração de Chamada de Voz</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {configQuery.isLoading ? (
              <p className='text-sm text-muted-foreground'>A carregar configuração...</p>
            ) : null}
            {configQuery.isError ? (
              <p className='text-sm text-destructive'>Falha ao carregar configuração de chamada de voz.</p>
            ) : null}
            {opcoesQuery.isError ? (
              <p className='text-sm text-destructive'>Falha ao carregar opções de idioma/variação.</p>
            ) : null}

            <div className='flex items-center justify-between rounded border p-3'>
              <div>
                <Label className='text-sm font-medium'>Ativar chamada de voz</Label>
                <p className='text-xs text-muted-foreground'>
                  Liga/desliga o serviço de chamada de voz para a clínica atual.
                </p>
              </div>
              <Switch
                checked={form.ativo}
                onCheckedChange={(v) => handleChange('ativo', v)}
                disabled={saveMutation.isPending}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='space-y-1 md:col-span-2'>
                <Label htmlFor='voz-url'>URL Serviço de Voz</Label>
                <Input
                  id='voz-url'
                  value={form.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder='https://...'
                  disabled={saveMutation.isPending}
                />
              </div>

              <div className='space-y-1'>
                <Label>Idioma</Label>
                <Select
                  value={form.language}
                  onValueChange={(v) => handleChange('language', v)}
                  disabled={saveMutation.isPending}
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
                <Label>Variação (TLD)</Label>
                <Select
                  value={form.tld}
                  onValueChange={(v) => handleChange('tld', v)}
                  disabled={saveMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecionar variação' />
                  </SelectTrigger>
                  <SelectContent>
                    {variacoes.map((i) => (
                      <SelectItem key={i.codigo} value={i.codigo}>
                        {i.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
