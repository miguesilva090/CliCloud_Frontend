import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import type { OrganismoEditFormValues } from '@/pages/organismos/types/organismo-edit-form-types'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useCurrentWindowId, openPathInApp } from '@/utils/window-utils'

export function TabFaturacao({
  form,
  readOnly,
  lockServicoFaturaResumo,
  organismoId,
}: {
  form: UseFormReturn<OrganismoEditFormValues>
  readOnly?: boolean
  lockServicoFaturaResumo?: boolean
  organismoId?: string
}) {
  const navigate = useNavigate()
  const serviceLocked = Boolean(readOnly || lockServicoFaturaResumo)
  const addWindow = useWindowsStore((s) => s.addWindow)
  const updateWindowState = useWindowsStore((s) => s.updateWindowState)
  const currentWindowId = useCurrentWindowId()
  const currentWindow = useWindowsStore((s) => s.windows.find((w) => w.id === currentWindowId))

  const servicosQuery = useQuery({
    queryKey: ['servicos-light', 'faturacao'],
    queryFn: () => ServicoService().getServicoLight(''),
    enabled: Boolean(organismoId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const subsistemaServicosQuery = useQuery({
    queryKey: ['subsistema-servicos', organismoId],
    queryFn: () => SubsistemaServicoService().getSubsistemaServico(),
    enabled: Boolean(organismoId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const servicos = servicosQuery.data?.info?.data ?? []
  const subsistemaServicos = subsistemaServicosQuery.data?.info?.data ?? []

  const servicoDesignacaoById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of servicos) map.set(s.id, s.designacao)
    return map
  }, [servicos])

  const options = useMemo(() => {
    if (!organismoId) return []

    // Dedup por servicoId: o campo guarda o "serviço" (compatível com o legado c_servico),
    // mesmo que existam múltiplas linhas por subsistema.
    const seen = new Set<string>()
    const out: Array<{ servicoId: string; subsistemaId: string }> = []

    for (const linha of subsistemaServicos) {
      if (linha.organismoId !== organismoId) continue
      if (seen.has(linha.servicoId)) continue
      seen.add(linha.servicoId)
      out.push({ servicoId: linha.servicoId, subsistemaId: linha.subsistemaId })
    }

    return out
  }, [organismoId, subsistemaServicos])

  return (
    <div className='space-y-4'>
      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Faturação
        </h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_max-content] md:items-end'>
          <FormField
            control={form.control}
            name='cServicoFaturaResumo'
            render={({ field }) => (
              <FormItem className='min-w-0'>
                <FormLabel>Serviço Fatura Resumo</FormLabel>
                <div className='flex gap-2'>
                  <FormControl className='flex-1 min-w-0'>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v === '' ? '' : v)}
                      disabled={serviceLocked}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Selecionar...' />
                      </SelectTrigger>
                      <SelectContent>
                        {field.value &&
                          !options.some((o) => o.servicoId === field.value) && (
                            <SelectItem value={field.value}>{field.value}</SelectItem>
                          )}
                        {options.map((o) => (
                          <SelectItem key={o.servicoId} value={o.servicoId}>
                            {servicoDesignacaoById.get(o.servicoId) ?? o.servicoId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {!readOnly && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='shrink-0'
                      onClick={() => {
                        if (currentWindowId && currentWindow) {
                          const prev = currentWindow.searchParams ?? {}
                          updateWindowState(currentWindowId, {
                            searchParams: { ...prev, tab: 'faturacao' },
                          })
                        }
                        openPathInApp(
                          navigate,
                          addWindow,
                          '/area-comum/tabelas/consultas/servicos/subsistemas-servicos',
                          'Subsistemas de Serviços'
                        )
                      }}
                      title='Criar Subsistema de Serviço'
                    >
                      <Plus className='h-3.5 w-3.5' />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='faturarPorDatas'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center gap-2 space-y-0 w-fit max-w-full shrink-0 sm:pb-[2px] mb-1'>
                <FormControl inline>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormLabel className='!mb-0 font-normal cursor-pointer whitespace-nowrap'>Faturar Por Datas</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className='mt-4 space-y-2'>
          <h4 className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
            Documentos
          </h4>
          <div className='rounded-md border'>
            <div className='grid grid-cols-[60px_1fr_120px_80px_80px] gap-2 px-3 py-2 bg-muted/50 text-xs font-medium'>
              <span>Código</span>
              <span>Descrição</span>
              <span>Tipo Documento</span>
              <span>Série</span>
              <span className='text-right'>Opções</span>
            </div>
            <div className='px-3 py-6 text-center text-sm text-muted-foreground'>
              Configuração de documentos em desenvolvimento
            </div>
          </div>
        </div>

        <div className='mt-6 space-y-3'>
          <h4 className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
            Configuração Entidade
          </h4>
          <div className='flex flex-wrap gap-x-6 gap-y-2'>
            <FormField
              control={form.control}
              name='trust'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center gap-2 space-y-0 w-fit max-w-full'>
                  <FormControl inline>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormLabel className='!mb-0 font-normal cursor-pointer'>TRUST</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='adm'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center gap-2 space-y-0 w-fit max-w-full'>
                  <FormControl inline>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormLabel className='!mb-0 font-normal cursor-pointer'>A.D.M</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='sadgnr'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center gap-2 space-y-0 w-fit max-w-full'>
                  <FormControl inline>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormLabel className='!mb-0 font-normal cursor-pointer leading-tight'>SAD / GNR</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='sadpsp'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center gap-2 space-y-0 w-fit max-w-full'>
                  <FormControl inline>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormLabel className='!mb-0 font-normal cursor-pointer leading-tight'>SAD / PSP</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
