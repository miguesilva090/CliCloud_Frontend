import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ReferenciasMbService } from '@/lib/services/faturacao/referencias-mb-service'
import type { AtualizarConfigReferenciaMbRequest } from '@/types/dtos/faturacao/referencias-mb.dtos'
import { toast } from '@/utils/toast-utils'

type FormState = {
  servicoUrl: string
  valorMinimo: number
  prazoPagamento: number
  codigoEntidade: string
  subEntidade: string
  chaveBackOffice: string
  ifThenKey: string
}

const initialForm: FormState = {
  servicoUrl: '',
  valorMinimo: 0,
  prazoPagamento: 0,
  codigoEntidade: '',
  subEntidade: '',
  chaveBackOffice: '',
  ifThenKey: '',
}

export function ReferenciasMbConfigPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(initialForm)
  const [callbackUrl, setCallbackUrl] = useState('')
  const [callbackModalOpen, setCallbackModalOpen] = useState(false)
  const [callbackBaseUrl, setCallbackBaseUrl] = useState('')
  const [callbackKey, setCallbackKey] = useState('')

  const configQuery = useQuery({
    queryKey: ['referencias-mb', 'config'],
    queryFn: () => ReferenciasMbService().getConfiguracaoAtual(),
  })

  const callbackQuery = useQuery({
    queryKey: ['referencias-mb', 'callback-ifthen'],
    queryFn: () => ReferenciasMbService().getCallbackIfThen(),
  })

  useEffect(() => {
    const dto = (configQuery.data as any)?.info?.data
    if (!dto) return
    setForm({
      servicoUrl: dto.servicoUrl ?? '',
      valorMinimo: dto.valorMinimo ?? 0,
      prazoPagamento: dto.prazoPagamento ?? 0,
      codigoEntidade: dto.codigoEntidade ?? '',
      subEntidade: dto.subEntidade ?? '',
      chaveBackOffice: dto.chaveBackOffice ?? '',
      ifThenKey: dto.ifThenKey ?? '',
    })
  }, [configQuery.data])

  useEffect(() => {
    const callback = (callbackQuery.data as any)?.info?.data
    const full = typeof callback === 'string' ? callback : ''
    setCallbackUrl(full)
    if (!full) {
      setCallbackBaseUrl('')
      setCallbackKey('')
      return
    }

    const [base, query = ''] = full.split('?')
    setCallbackBaseUrl(base ?? '')
    const search = new URLSearchParams(query)
    setCallbackKey(search.get('key') ?? '')
  }, [callbackQuery.data])

  const saveMutation = useMutation({
    mutationFn: (payload: AtualizarConfigReferenciaMbRequest) => ReferenciasMbService().updateConfiguracao(payload),
    onSuccess: () => {
      toast.success('Configuração de Referências MB guardada com sucesso.')
      void configQuery.refetch()
      void callbackQuery.refetch()
    },
    onError: () => {
      toast.error('Falha ao guardar configuração de Referências MB.')
    },
  })

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleGuardar = () => {
    if (!form.codigoEntidade.trim()) return toast.warning('Código da entidade é obrigatório.')
    if (!form.subEntidade.trim()) return toast.warning('Sub-entidade é obrigatória.')
    if (!form.chaveBackOffice.trim()) return toast.warning('Chave de BackOffice é obrigatória.')
    if (!form.ifThenKey.trim()) return toast.warning('IfThen Key anti-phishing é obrigatória.')

    const payload: AtualizarConfigReferenciaMbRequest = {
      servicoUrl: form.servicoUrl.trim() || null,
      valorMinimo: form.valorMinimo,
      prazoPagamento: form.prazoPagamento,
      codigoEntidade: form.codigoEntidade.trim(),
      subEntidade: form.subEntidade.trim(),
      chaveBackOffice: form.chaveBackOffice.trim(),
      ifThenKey: form.ifThenKey.trim(),
    }

    saveMutation.mutate(payload)
  }

  return (
    <>
      <PageHead title='Configuração Referências MB | CliCloud' />
      <DashboardPageContainer>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Configurações de Referências MB (IfThenPay)</CardTitle>
            <div className='flex flex-wrap gap-2'>
              <Button variant='outline' onClick={() => navigate('/area-comum/tabelas/configuracao/referencias-mb/historico')}>
                Referencias MB geradas
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  void callbackQuery.refetch()
                  setCallbackModalOpen(true)
                }}
              >
                URL do callback
              </Button>
              <Button onClick={handleGuardar} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <div className='space-y-1 md:col-span-2'>
                <Label htmlFor='servico-url'>URL do Serviço</Label>
                <Input id='servico-url' value={form.servicoUrl} onChange={(e) => setField('servicoUrl', e.target.value)} />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='valor-minimo'>Valor mínimo</Label>
                <Input
                  id='valor-minimo'
                  type='number'
                  step='0.01'
                  value={form.valorMinimo}
                  onChange={(e) => setField('valorMinimo', Number(e.target.value))}
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='prazo-pagamento'>Prazo de pagamento (dias)</Label>
                <Input
                  id='prazo-pagamento'
                  type='number'
                  value={form.prazoPagamento}
                  onChange={(e) => setField('prazoPagamento', Number(e.target.value))}
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='sub-entidade'>Chave MB</Label>
                <Input
                  id='sub-entidade'
                  value={form.subEntidade}
                  onChange={(e) => setField('subEntidade', e.target.value)}
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='codigo-entidade'>MB Way</Label>
                <Input
                  id='codigo-entidade'
                  value={form.codigoEntidade}
                  onChange={(e) => setField('codigoEntidade', e.target.value)}
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='chave-backoffice'>Chave BackOffice</Label>
                <Input
                  id='chave-backoffice'
                  value={form.chaveBackOffice}
                  onChange={(e) => setField('chaveBackOffice', e.target.value)}
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='ifthen-key'>IfThen Key anti-phishing</Label>
                <Input id='ifthen-key' value={form.ifThenKey} onChange={(e) => setField('ifThenKey', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={callbackModalOpen} onOpenChange={setCallbackModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>URL do Callback</DialogTitle>
            </DialogHeader>
            <div className='space-y-3'>
              <div className='space-y-1'>
                <Label htmlFor='callback-url-full'>URL</Label>
                <Input id='callback-url-full' value={callbackUrl} readOnly />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='callback-url-base'>Base URL</Label>
                <Input id='callback-url-base' value={callbackBaseUrl} readOnly />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='callback-key'>AntiPhishing Key</Label>
                <Input id='callback-key' value={callbackKey} readOnly />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setCallbackModalOpen(false)}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardPageContainer>
    </>
  )
}
