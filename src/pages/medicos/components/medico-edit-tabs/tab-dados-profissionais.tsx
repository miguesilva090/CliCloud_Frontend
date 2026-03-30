import { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import type { MedicoDTO } from '@/types/dtos/saude/medicos.dtos'
import type { MedicoEditFormValues } from '@/pages/medicos/types/medico-edit-form-types'
import { CategoriaEspecialidadeService } from '@/lib/services/especialidades/categoria-especialidade-service'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp } from '@/utils/window-utils'
import { fieldGap, labelClass, inputClass, selectTriggerClass, buttonIconClass } from '@/lib/form-styles'

/** Valor reservado para "nenhum" - Radix Select não permite value="" em SelectItem */
const NONE_VALUE = '__none__'

export function TabDadosProfissionais({
  form,
  medico,
}: {
  form: UseFormReturn<MedicoEditFormValues>
  medico: MedicoDTO | undefined
}) {
  void medico
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const queryClient = useQueryClient()

  const categoriasQuery = useQuery({
    queryKey: ['categorias-especialidades-light'],
    queryFn: () => CategoriaEspecialidadeService().getCategoriasEspecialidadesLight(''),
    staleTime: 60_000,
  })

  const especialidadesQuery = useQuery({
    queryKey: ['especialidades-light'],
    queryFn: () => EspecialidadeService('medicos').getEspecialidadesLight(''),
    staleTime: 60_000,
  })

  const categorias = categoriasQuery.data?.info?.data ?? []
  const especialidadesRaw = especialidadesQuery.data?.info?.data ?? []
  const categoriaEspecialidadeId = form.watch('categoriaEspecialidadeId')

  const especialidades = useMemo(() => {
    if (!categoriaEspecialidadeId) return especialidadesRaw
    return especialidadesRaw.filter(
      (e: { categoriaEspecialidadeId?: string | null }) => e.categoriaEspecialidadeId === categoriaEspecialidadeId
    )
  }, [especialidadesRaw, categoriaEspecialidadeId])

  // As páginas de listagem handle CRUD; só precisamos manter as queries coerentes quando o utilizador voltar.

  return (
    <div className='space-y-6'>
      <section className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'>
        <FormField
          control={form.control}
          name='carteira'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Carteira Profissional</FormLabel>
              <div className='flex gap-1.5'>
                <FormControl>
                  <Input className={inputClass} placeholder='Carteira Profissional...' {...field} value={field.value ?? ''} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='categoriaEspecialidadeId'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Categoria</FormLabel>
              <div className='flex gap-1.5'>
                <Select
                  value={field.value ?? NONE_VALUE}
                  onValueChange={(v) => field.onChange(v === NONE_VALUE ? null : v)}
                >
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder={categoriasQuery.isLoading ? 'A carregar...' : 'Categoria...'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>—</SelectItem>
                    {categorias
                      .filter((c: { id?: string }) => c.id)
                      .map((c: { id: string; codigo?: string; descricao?: string }) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.descricao ?? c.codigo ?? c.id}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className={buttonIconClass}
                  title='Adicionar categoria'
                  onClick={() =>
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/tabelas/categorias-das-especialidades',
                      'Categorias das Especialidades',
                    )
                  }
                >
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='retencao'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Retenção</FormLabel>
              <FormControl>
                <Input
                  className={inputClass}
                  type='number'
                  placeholder='Retenção...'
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    field.onChange(v === '' ? null : Number(v))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='grupoFuncional'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Grupo Funcional</FormLabel>
              <FormControl>
                <Input className={inputClass} placeholder='Médico' {...field} value={field.value ?? 'Médico'} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='especialidadeId'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Especialidade</FormLabel>
              <div className='flex gap-1.5'>
                <Select
                  value={field.value ?? NONE_VALUE}
                  onValueChange={(v) => field.onChange(v === NONE_VALUE ? null : v)}
                >
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder={especialidadesQuery.isLoading ? 'A carregar...' : 'Especialidade...'} />
                    </SelectTrigger>
                  </FormControl>
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
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className={buttonIconClass}
                  title='Adicionar especialidade'
                  onClick={() =>
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/tabelas/especialidades',
                      'Especialidades',
                    )
                  }
                >
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

      {/* Diretor, Inactivo, Comunicar NIF ADSE */}
      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1.5'>Estado</h3>
        <div className='flex flex-wrap gap-2'>
          <FormField
            control={form.control}
            name='director'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                <FormControl>
                  <button
                    type='button'
                    role='checkbox'
                    aria-checked={field.value ?? false}
                    onClick={() => field.onChange(!(field.value ?? false))}
                    className={cn(
                      'inline-flex h-8 items-center justify-center rounded-md border-2 px-3 py-1.5 text-xs font-medium transition-colors',
                      field.value ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background hover:bg-muted'
                    )}
                  >
                    Diretor
                  </button>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                <FormControl>
                  <button
                    type='button'
                    role='checkbox'
                    aria-checked={(field.value ?? 0) === 1}
                    onClick={() => field.onChange((field.value ?? 0) === 1 ? 0 : 1)}
                    className={cn(
                      'inline-flex h-8 items-center justify-center rounded-md border-2 px-3 py-1.5 text-xs font-medium transition-colors',
                      (field.value ?? 0) === 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background hover:bg-muted'
                    )}
                  >
                    Inactivo
                  </button>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='comunicacaoNifAdse'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                <FormControl>
                  <button
                    type='button'
                    role='checkbox'
                    aria-checked={field.value ?? false}
                    onClick={() => field.onChange(!(field.value ?? false))}
                    className={cn(
                      'inline-flex h-8 items-center justify-center rounded-md border-2 px-3 py-1.5 text-xs font-medium transition-colors',
                      field.value ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background hover:bg-muted'
                    )}
                  >
                    Comunicar NIF ADSE
                  </button>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      {/* Autenticação no Portal de Requisição de Vinhetas e Receitas */}
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1.5'>
          Autenticação no Portal de Requisição de Vinhetas e Receitas
        </h3>
        <FormField
          control={form.control}
          name='cartaoCidadaoMedico'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormControl>
                <RadioGroup
                  value={String(field.value ?? 0)}
                  onValueChange={(v) => field.onChange(Number(v))}
                  className='flex flex-col gap-2'
                >
                  <label className='flex items-center space-x-2 cursor-pointer'>
                    <RadioGroupItem value='0' />
                    <span className='text-sm font-normal'>Cartão Cidadão</span>
                  </label>
                  <label className='flex items-center space-x-2 cursor-pointer'>
                    <RadioGroupItem value='1' />
                    <span className='text-sm font-normal'>Cartão Ordem Médicos</span>
                  </label>
                  <label className='flex items-center space-x-2 cursor-pointer'>
                    <RadioGroupItem value='2' />
                    <span className='text-sm font-normal'>Credenciais</span>
                  </label>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='loginPRVR'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Utilizador (Credenciais PRVR) (*)</FormLabel>
              <FormControl>
                <Input className={inputClass} placeholder='Utilizador (Credenciais PRVR) (*)...' {...field} value={field.value ?? ''} />
              </FormControl>
              <p className='text-xs text-muted-foreground mt-1'>
                (*) A Password irá ser pedida no ato de prescrição
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

    </div>
  )
}
