import { useRef } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { fieldGap, inputClass, labelClass, textareaClass } from '@/lib/form-styles'

function asValue(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

const PLACEHOLDERS_CONSULTAS = [
  { label: 'Utente', token: '@Utente@' },
  { label: 'Médico', token: '@Médico@' },
  { label: 'Especialidade', token: '@Especialidade@' },
  { label: 'Data', token: '@Data@' },
  { label: 'Hora', token: '@Hora@' },
] as const

const PLACEHOLDERS_TRATAMENTOS = [{ label: 'Utente', token: '@Utente@' }] as const

function EmailTemplateSubTab({
  form,
  disabled,
  assuntoName,
  conteudoName,
  placeholders,
}: {
  form: UseFormReturn<any>
  disabled: boolean
  assuntoName: string
  conteudoName: string
  placeholders: readonly { label: string; token: string }[]
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const insertToken = (token: string) => {
    const el = textareaRef.current
    const current = (form.getValues(conteudoName) as string) ?? ''
    if (!el) {
      form.setValue(conteudoName, current + token, { shouldDirty: true })
      return
    }
    const start = el.selectionStart ?? current.length
    const end = el.selectionEnd ?? start
    const next = current.slice(0, start) + token + current.slice(end)
    form.setValue(conteudoName, next, { shouldDirty: true, shouldTouch: true })
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + token.length
      el.setSelectionRange(pos, pos)
    })
  }

  return (
    <div className='space-y-3 pt-1'>
      {placeholders.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {placeholders.map((p) => (
            <Button
              key={p.token}
              type='button'
              size='sm'
              variant='secondary'
              className='h-8 rounded-full px-3 text-xs'
              disabled={disabled}
              onClick={() => insertToken(p.token)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      )}

      <FormField
        control={form.control}
        name={assuntoName}
        render={({ field }) => (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Assunto</FormLabel>
            <FormControl>
              <Input
                className={inputClass}
                placeholder='Assunto...'
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
        name={conteudoName}
        render={({ field }) => (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Conteúdo do Email</FormLabel>
            <FormControl>
              <Textarea
                className={`${textareaClass} min-h-[20rem]`}
                rows={20}
                placeholder='Conteúdo do Email...'
                readOnly={disabled}
                {...field}
                ref={(e) => {
                  field.ref(e)
                  textareaRef.current = e
                }}
                value={asValue(field.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export function TabEmailsClinica({
  form,
  disabled,
}: {
  form: UseFormReturn<any>
  disabled: boolean
}) {
  return (
    <section className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3'>
      <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
        Emails
      </h3>

      <div className='space-y-4 pt-1'>
        <div>
          <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
            Consultas
          </h4>
          <EmailTemplateSubTab
            form={form}
            disabled={disabled}
            assuntoName='emailAssuntoConsultas'
            conteudoName='emailConteudoConsultas'
            placeholders={PLACEHOLDERS_CONSULTAS}
          />
        </div>

        <div>
          <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
            Tratamentos
          </h4>
          <EmailTemplateSubTab
            form={form}
            disabled={disabled}
            assuntoName='emailAssuntoTratamentos'
            conteudoName='emailConteudoTratamentos'
            placeholders={PLACEHOLDERS_TRATAMENTOS}
          />
        </div>

        <div>
          <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
            Exames
          </h4>
          <EmailTemplateSubTab
            form={form}
            disabled={disabled}
            assuntoName='emailAssuntoExames'
            conteudoName='emailConteudoExames'
            placeholders={[]}
          />
        </div>

        <div>
          <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
            Relatórios
          </h4>
          <EmailTemplateSubTab
            form={form}
            disabled={disabled}
            assuntoName='emailAssuntoRelatorios'
            conteudoName='emailConteudoRelatorios'
            placeholders={[]}
          />
        </div>
      </div>
    </section>
  )
}


