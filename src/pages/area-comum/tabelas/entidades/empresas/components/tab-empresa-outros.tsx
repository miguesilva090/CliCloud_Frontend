import type { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { EmpresaEditFormValues } from '@/pages/empresas/types/empresa-edit-form-types'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOrganismosLight } from '@/lib/services/utility/entity-quick-create/entity-quick-create-queries'

export function TabEmpresaOutros({
  form,
  readOnly,
}: {
  form: UseFormReturn<EmpresaEditFormValues>
  readOnly?: boolean
}) {
  const organismosQuery = useOrganismosLight('')
  const organismos = organismosQuery.data?.info?.data ?? []

  return (
    <div className='space-y-4'>
      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Condições Comerciais
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2'>
          <FormField
            control={form.control}
            name='desconto'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desconto Clínica (%)</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Desconto clínica...'
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
            name='descontoUtente'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desconto Utente (%)</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Desconto utente...'
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
            name='categoria'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Categoria...'
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

      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Dados Bancários / Contrato
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2'>
          <FormField
            control={form.control}
            name='bancoId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banco (Id)</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Id do banco...'
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
            name='organismoId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organismo</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={readOnly || organismosQuery.isLoading}
                  >
                    <SelectTrigger className='h-7'>
                      <SelectValue placeholder='Organismo...' />
                    </SelectTrigger>
                    <SelectContent>
                      {organismos.map((o: { id: string; nome?: string | null; abreviatura?: string | null }) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.nome ?? o.abreviatura ?? o.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='numeroIdentificacaoBancaria'
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIB/IBAN</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='NIB/IBAN...'
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
            name='apolice'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apólice</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Apólice...'
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
            name='codigoClinica'
            render={({ field }) => (
              <FormItem>
                <FormLabel>C. Clínica</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='C. Clínica...'
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
            name='avenca'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avenca (€)</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Avenca...'
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
            name='dataInicioContrato'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início Contrato</FormLabel>
                <FormControl>
                  <Input
                    type='date'
                    className='h-7'
                    readOnly={readOnly}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='dataFimContrato'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fim Contrato</FormLabel>
                <FormControl>
                  <Input
                    type='date'
                    className='h-7'
                    readOnly={readOnly}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='numeroPagamentos'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº Pagamentos</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Nº Pagamentos...'
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
            name='prazoPagamento'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo Pagamento (dias)</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Prazo pagamento...'
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

      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Empresa
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2'>
          <FormField
            control={form.control}
            name='numeroTrabalhadores'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº Trabalhadores</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Nº Trabalhadores...'
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
            name='valorTrabalhador'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Trabalhador (€)</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Valor trabalhador...'
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
            name='rescindindo'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center gap-2 space-y-0'>
                <FormControl inline>
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    disabled={readOnly}
                    className='mt-0.5'
                  />
                </FormControl>
                <FormLabel className='!mt-0 !mb-0 whitespace-nowrap'>Rescindindo</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </section>
    </div>
  )
}

