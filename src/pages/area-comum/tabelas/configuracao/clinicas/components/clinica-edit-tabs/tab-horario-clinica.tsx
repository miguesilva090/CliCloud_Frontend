import type { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { TimeField } from '@/components/shared/time-field'
import { Switch } from '@/components/ui/switch'

function asValue(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

export function TabHorarioClinica({
  form,
  disabled,
}: {
  form: UseFormReturn<any>
  disabled: boolean
}) {
  const interrupcao = form.watch('interrupcao')

  return (
    <section className='space-y-3 rounded border border-primary/20 bg-muted/10 p-3'>
      <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
        Horário de Funcionamento
      </h3>

      <div className='grid grid-cols-12 gap-3 items-end'>
        <FormField
          control={form.control}
          name={'interrupcao'}
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel className='text-xs'>Interrupção</FormLabel>
              <FormControl>
                <Switch
                  className='!ml-4 !mt-2'
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'horaInicManha'}
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel className='text-xs'>Inicio Manhã</FormLabel>
              <FormControl>
                <TimeField
                  className='h-7'
                  readOnly={disabled}
                  disabled={disabled}
                  value={asValue(field.value)}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'horaFimManha'}
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel className='text-xs'>Fim Manhã</FormLabel>
              <FormControl>
                <TimeField
                  className='h-7'
                  readOnly={disabled || !interrupcao}
                  disabled={disabled || !interrupcao}
                  value={asValue(field.value)}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'horaInicTarde'}
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel className='text-xs'>Início Tarde</FormLabel>
              <FormControl>
                <TimeField
                  className='h-7'
                  readOnly={disabled || !interrupcao}
                  disabled={disabled || !interrupcao}
                  value={asValue(field.value)}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'horaFimTarde'}
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel className='text-xs'>Fim Tarde</FormLabel>
              <FormControl>
                <TimeField
                  className='h-7'
                  readOnly={disabled}
                  disabled={disabled}
                  value={asValue(field.value)}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-7 gap-3'>
        <div className='md:col-span-12'>
          <FormLabel className='text-xs'>Folgas Semanais</FormLabel>
        </div>

        <FormField
          control={form.control}
          name={'folgaSeg'}
          render={({ field }) => (
            <FormItem className='md:col-span-1 flex flex-row items-center justify-start gap-1 space-y-2 space-x-2'>
              <FormLabel className='mb-0 text-xs whitespace-nowrap text-muted-foreground leading-none'>
                Segunda
              </FormLabel>
              <FormControl inline>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'folgaTer'}
          render={({ field }) => (
            <FormItem className='md:col-span-1 flex flex-row items-center justify-start gap-1 space-y-2 space-x-2'>
              <FormLabel className='mb-0 text-xs whitespace-nowrap text-muted-foreground leading-none'>
                Terça
              </FormLabel>
              <FormControl inline>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'folgaQua'}
          render={({ field }) => (
            <FormItem className='md:col-span-1 flex flex-row items-center justify-start gap-1 space-y-2 space-x-2'>
              <FormLabel className='mb-0 text-xs whitespace-nowrap text-muted-foreground leading-none'>
                Quarta
              </FormLabel>
              <FormControl inline>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'folgaQui'}
          render={({ field }) => (
            <FormItem className='md:col-span-1 flex flex-row items-center justify-start gap-1 space-y-2 space-x-2'>
              <FormLabel className='mb-0 text-xs whitespace-nowrap text-muted-foreground leading-none'>
                Quinta
              </FormLabel>
              <FormControl inline>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'folgaSex'}
          render={({ field }) => (
            <FormItem className='md:col-span-1 flex flex-row items-center justify-start gap-1 space-y-2 space-x-2'>
              <FormLabel className='mb-0 text-xs whitespace-nowrap text-muted-foreground leading-none'>
                Sexta
              </FormLabel>
              <FormControl inline>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'folgaSab'}
          render={({ field }) => (
            <FormItem className='md:col-span-1 flex flex-row items-center justify-start gap-1 space-y-2 space-x-2'>
              <FormLabel className='mb-0 text-xs whitespace-nowrap text-muted-foreground leading-none'>
                Sábado
              </FormLabel>
              <FormControl inline>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'folgaDom'}
          render={({ field }) => (
            <FormItem className='md:col-span-1 flex flex-row items-center justify-start gap-1 space-y-2 space-x-2'>
              <FormLabel className='mb-0 text-xs whitespace-nowrap text-muted-foreground leading-none'>
                Domingo
              </FormLabel>
              <FormControl inline>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  )
}


