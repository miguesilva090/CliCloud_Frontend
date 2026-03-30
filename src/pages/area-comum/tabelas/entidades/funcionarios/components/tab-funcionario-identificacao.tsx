import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { FuncionarioEditFormValues } from '../funcionario-edit-form-types'
import { useCodigosPostaisLight } from '@/lib/services/utility/lookups/lookups-queries'
import { CreateCodigoPostalModal } from '@/components/shared/address-quick-create'

export function TabFuncionarioIdentificacao({
  form,
  readOnly,
}: {
  form: UseFormReturn<FuncionarioEditFormValues>
  readOnly?: boolean
}) {
  const [modalCodigoPostal, setModalCodigoPostal] = useState(false)

  const codigosPostaisQuery = useCodigosPostaisLight('')
  const codigosPostais = codigosPostaisQuery.data?.info?.data ?? []

  return (
    <div className='space-y-4'>
      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Dados do Funcionário
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2'>
          <FormField
            control={form.control}
            name='nome'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Nome do funcionário'
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
            name='nomeUtilizador'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Utilizador</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Nome Utilizador...'
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
            name='numeroContribuinte'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº Contribuinte</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Nº Contribuinte...'
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
            name='telefone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Telefone...'
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
            name='numeroCartaoIdentificacao'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº Cartão Identificação</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Nº Cartão...'
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
            name='arquivo'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arquivo</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Arquivo...'
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
            name='dataEmissao'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Emissão</FormLabel>
                <FormControl>
                  <Input
                    type='date'
                    className='h-7'
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
          Morada
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2'>
          <FormField
            control={form.control}
            name='rua'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rua</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Ex.: Rua das Flores'
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
            name='codigoPostalId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Postal</FormLabel>
                <div className='flex gap-1.5'>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      disabled={codigosPostaisQuery.isLoading || readOnly}
                    >
                      <SelectTrigger className='h-7 w-full min-w-0'>
                        <SelectValue placeholder='Selecionar código postal...' />
                      </SelectTrigger>
                      <SelectContent>
                        {codigosPostais.map((cp) => (
                          <SelectItem key={cp.id} value={cp.id}>
                            {cp.codigo ?? cp.id}{' '}
                            {cp.localidade ? `– ${cp.localidade}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {!readOnly && (
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='shrink-0 h-7 w-7'
                      title='Adicionar código postal'
                      onClick={() => setModalCodigoPostal(true)}
                    >
                      <Plus className='h-3.5 w-3.5' />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      {!readOnly && (
        <CreateCodigoPostalModal
          open={modalCodigoPostal}
          onOpenChange={setModalCodigoPostal}
          onSuccess={(newId) => {
            form.setValue('codigoPostalId', newId)
            codigosPostaisQuery.refetch()
          }}
        />
      )}
    </div>
  )
}
