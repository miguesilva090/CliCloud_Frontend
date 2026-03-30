import type { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { TecnicoEditFormValues } from '@/pages/tecnicos/types/tecnico-edit-form-types'

export function TabTecnicoIdentificacao({
  form,
  readOnly,
}: {
  form: UseFormReturn<TecnicoEditFormValues>
  readOnly?: boolean
}) {
  return (
    <div className='space-y-4'>
      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Dados Pessoais
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2'>
          <FormField
            control={form.control}
            name='nome'
            render={({ field }) => (
              <FormItem className='col-span-2'>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Nome do técnico'
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
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    className='h-7'
                    placeholder='Email'
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
                <FormLabel>N.º Contribuinte</FormLabel>
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
            name='numeroCartaoIdentificacao'
            render={({ field }) => (
              <FormItem>
                <FormLabel>N.º B.I. / Cartão</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Nº documento...'
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
            name='dataNascimento'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Nascimento</FormLabel>
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
            name='dataEmissaoCartaoIdentificacao'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Emissão do Cartão</FormLabel>
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
            name='arquivo'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arquivo</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    maxLength={30}
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
        </div>
      </section>
    </div>
  )
}

