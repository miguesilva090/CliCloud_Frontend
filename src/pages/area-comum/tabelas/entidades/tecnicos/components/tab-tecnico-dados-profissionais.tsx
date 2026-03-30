import type { UseFormReturn } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TecnicoEditFormValues } from '@/pages/tecnicos/types/tecnico-edit-form-types'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'

/** Valor reservado para "nenhum" - Radix Select não permite value="" em SelectItem */
const NONE_VALUE = '__none__'

export function TabTecnicoDadosProfissionais({
  form,
  readOnly,
}: {
  form: UseFormReturn<TecnicoEditFormValues>
  readOnly?: boolean
}) {
  const especialidadesQuery = useQuery({
    queryKey: ['especialidades-light', 'tecnicos'],
    queryFn: () => EspecialidadeService('tecnicos').getEspecialidadesLight(''),
    staleTime: 60_000,
  })

  const especialidades = especialidadesQuery.data?.info?.data ?? []

  return (
    <div className='space-y-4'>
      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Dados Profissionais
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2'>
          <FormField
            control={form.control}
            name='especialidadeId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidade</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ? field.value : NONE_VALUE}
                    onValueChange={(v) =>
                      field.onChange(v === NONE_VALUE ? '' : v)
                    }
                    disabled={readOnly || especialidadesQuery.isLoading}
                  >
                    <SelectTrigger className='h-7'>
                      <SelectValue
                        placeholder={
                          especialidadesQuery.isLoading
                            ? 'A carregar...'
                            : 'Especialidade...'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className='z-[100]'>
                      <SelectItem value={NONE_VALUE}>—</SelectItem>
                      {especialidades
                        .filter((e: { id?: string }) => e.id)
                        .map((e: { id: string; nome?: string }) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.nome ?? e.id}
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
            name='carteira'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carteira</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Carteira...'
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
            name='margem'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Margem (€)</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Margem...'
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
            name='status'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center gap-2 space-y-0 mt-6'>
                <FormControl inline>
                  <Checkbox
                    checked={field.value != null ? field.value !== 1 : false}
                    onCheckedChange={(checked) =>
                      // O backend valida `Status` entre 1 e 3.
                      // Aqui assumimos: 1 = Ativo, 2 = Inativo.
                      field.onChange(checked === true ? 2 : 1)
                    }
                    disabled={readOnly}
                    className='mt-0.5'
                  />
                </FormControl>
                <FormLabel className='!mt-0 !mb-0 whitespace-nowrap'>Inativo</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </section>
    </div>
  )
}

