import type { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import type { UtenteEditFormValues } from '@/pages/utentes/types/utente-edit-form-types'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import { fieldGap, labelClass, textareaClass } from './utente-edit-tabs-constants'

export function TabAvisos({
  form,
}: {
  form: UseFormReturn<UtenteEditFormValues>
  utente: UtenteDTO | undefined
}) {
  return (
    <div className='grid grid-cols-1 gap-4'>
      <FormField
        control={form.control}
        name='aviso'
        render={({ field }) => (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Avisos</FormLabel>
            <FormControl>
              <Textarea
                rows={4}
                placeholder=''
                {...field}
                value={field.value ?? ''}
                className={`${textareaClass} min-h-[100px]`}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='observacoes'
        render={({ field }) => (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Observações *</FormLabel>
            <FormControl>
              <Textarea
                rows={6}
                placeholder=''
                {...field}
                value={field.value ?? ''}
                className={`${textareaClass} min-h-[120px] font-mono`}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
