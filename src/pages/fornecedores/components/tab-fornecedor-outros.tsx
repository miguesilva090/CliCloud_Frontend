import { useQuery } from '@tanstack/react-query'
import type { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FornecedorEditFormValues } from '@/pages/fornecedores/types/fornecedor-edit-form-types'
import { MoedaService } from '@/lib/services/moedas/moeda-service'

const ORIGEM_OPTIONS = [
  { value: '1', label: 'Nacional' },
  { value: '2', label: 'Internacional' },
  { value: '3', label: 'IntraComunitário' },
]

const CONDICAO_PAGAMENTO_OPTIONS = [
  { value: '1', label: 'À Vista' },
  { value: '2', label: '30 Dias' },
  { value: '3', label: '60 Dias' },
  { value: '4', label: '90 Dias' },
  { value: '5', label: '120 Dias' },
  { value: '6', label: 'Pré-pagamento' },
  { value: '7', label: 'Outro' },
]

export function TabFornecedorOutros({
  form,
  readOnly,
}: {
  form: UseFormReturn<FornecedorEditFormValues>
  readOnly?: boolean
}) {
  const moedasQuery = useQuery({
    queryKey: ['moedas-light'],
    queryFn: () => MoedaService().getMoedasLight(''),
    staleTime: 5 * 60_000,
  })
  const moedas = moedasQuery.data?.info?.data ?? []

  return (
    <div className='space-y-4'>
      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Outros
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2'>
          <FormField
            control={form.control}
            name='numeroContribuinte'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº Contribuinte *</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='NIF'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='numeroConta'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº Conta</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Nº Conta...'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='desconto'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desconto (%)</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Desconto...'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='condicaoPagamento'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pagamento</FormLabel>
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  disabled={readOnly}
                >
                  <FormControl>
                    <SelectTrigger className='h-7'>
                      <SelectValue placeholder='Selecionar pagamento...' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CONDICAO_PAGAMENTO_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='moeda'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moeda</FormLabel>
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  disabled={moedasQuery.isLoading || readOnly}
                >
                  <FormControl>
                    <SelectTrigger className='h-7'>
                      <SelectValue placeholder='Selecionar moeda...' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {moedas.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.descricao ?? m.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='origem'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origem Fornecedor</FormLabel>
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  disabled={readOnly}
                >
                  <FormControl>
                    <SelectTrigger className='h-7'>
                      <SelectValue placeholder='Selecionar origem...' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ORIGEM_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='enderecoWeb'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço (http://www.)</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Website'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='diasPrevEntrega'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dias (Úteis) Previstos de Entrega</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Dias previstos'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='diasEfectiEntrega'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dias (Úteis) Efectivos de Entrega</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Dias efectivos'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>
    </div>
  )
}
