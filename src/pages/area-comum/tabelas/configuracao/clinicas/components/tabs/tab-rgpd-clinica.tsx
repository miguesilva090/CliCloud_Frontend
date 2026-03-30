import type { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { fieldGap, labelClass, textareaClass } from '@/lib/form-styles'

function asValue(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

export function TabRgpdClinica({
  form,
  disabled,
}: {
  form: UseFormReturn<any>
  disabled: boolean
}) {
  return (
    <div className='space-y-4'>
      <section className='space-y-3 rounded border border-primary/20 bg-muted/10 p-3'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Consentimento RGPD
        </h3>

        <FormField
          control={form.control}
          name='rgpdDescritivo'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Descritivo</FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  className={`${textareaClass} min-h-[14rem]`}
                  placeholder='Descritivo'
                  readOnly={disabled}
                  {...field}
                  value={asValue(field.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='rgpdConsentimento'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Consentimento</FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  className={`${textareaClass} min-h-[14rem]`}
                  placeholder='Consentimento'
                  readOnly={disabled}
                  {...field}
                  value={asValue(field.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='rgpdMarketing'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Marketing</FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  className={`${textareaClass} min-h-[14rem]`}
                  placeholder='Marketing'
                  readOnly={disabled}
                  {...field}
                  value={asValue(field.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>
    </div>
  )
}


