import { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UtenteEditFormValues } from '@/pages/utentes/types/utente-edit-form-types'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import { TipoTaxaModeradora, TipoTaxaModeradoraLabel } from '@/types/enums/tipo-taxa-moderadora.enum'
import { useCentrosSaudeLight, useMedicosExternosLight } from '@/lib/services/utility/lookups/lookups-queries'
import { useWindowsStore } from '@/stores/use-windows-store'
import { fieldGap, inputClass, labelClass, selectTriggerClass, buttonIconClass } from './utente-edit-tabs-constants'
import { useGetEntidadesFinanceirasPaginated } from '@/pages/area-comum/tabelas/tabelas/entidades-financeiras-responsaveis/queries/listagem-entidades-financeiras-responsaveis-queries'
import { openPathInApp } from '@/utils/window-utils'

export function TabInformacaoSNS({
  form,
  utente,
}: {
  form: UseFormReturn<UtenteEditFormValues>
  utente: UtenteDTO | undefined
}) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const centrosSaudeQuery = useCentrosSaudeLight('')
  const medicosExternosQuery = useMedicosExternosLight('')
  const centrosSaude = centrosSaudeQuery.data?.info?.data ?? []
  const medicosExternos = medicosExternosQuery.data?.info?.data ?? []
  const entidadesFinanceirasQuery = useGetEntidadesFinanceirasPaginated(1, 50, null, null)
  const entidadesFinanceiras = entidadesFinanceirasQuery.data?.info?.data ?? []

  const centrosSaudeComUtente = useMemo(() => {
    const list = centrosSaude
    if (utente?.centroSaudeId && utente.centroSaude && !list.some((c) => c.id === utente.centroSaudeId)) {
      return [
        { id: utente.centroSaude.id, nome: utente.centroSaude.nome ?? '', numeroContribuinte: null, codigoLocalCS: utente.centroSaude.codigoLocalCS ?? null },
        ...list,
      ]
    }
    return list
  }, [centrosSaude, utente?.centroSaudeId, utente?.centroSaude])

  const medicosExternosComUtente = useMemo(() => {
    const list = medicosExternos
    if (utente?.medicoExternoId && utente.medicoExterno && !list.some((m) => m.id === utente.medicoExternoId)) {
      return [
        { id: utente.medicoExterno.id, nome: utente.medicoExterno.nome ?? '', numeroContribuinte: null },
        ...list,
      ]
    }
    return list
  }, [medicosExternos, utente?.medicoExternoId, utente?.medicoExterno])

  return (
    <div className='grid grid-cols-2 gap-4'>
      {/* Linha 1: Número Utente / NISS */}
      <FormField
        control={form.control}
        name='numeroUtente'
        render={({ field }) => (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Número Utente</FormLabel>
            <FormControl>
              <Input className={inputClass} placeholder='' {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='numeroSegurancaSocial'
        render={({ field }) => (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>NISS</FormLabel>
            <FormControl>
              <Input className={inputClass} placeholder='' {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Linha 2: Entidade Financeira Responsável / Centro de Saúde */}
      <FormField
        control={form.control}
        name='entidadeFinanceiraResponsavelId'
        render={({ field }) => (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Entidade Financeira Responsável</FormLabel>
            <div className='flex flex-col gap-2 w-full min-w-0'>
              <div className='flex gap-1.5 w-full min-w-0'>
                <FormControl className='flex-1 min-w-0'>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v === '' ? null : v)}
                    disabled={entidadesFinanceirasQuery.isLoading}
                  >
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder='Selecionar...' />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Mantém o valor atual mesmo que a lista (page 1) não o contenha */}
                      {field.value &&
                        !entidadesFinanceiras.some((e) => e.id === field.value) && (
                          <SelectItem value={field.value}>{field.value}</SelectItem>
                        )}
                      {entidadesFinanceiras.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nome || e.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className={buttonIconClass}
                  title='Entidades Financeiras Responsáveis'
                  onClick={() =>
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/tabelas/entidades-financeiras-responsaveis',
                      'Entidades Financeiras Responsáveis'
                    )
                  }
                >
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='numeroBeneficiarioEfr'
                  render={({ field }) => (
                    <FormItem className={fieldGap}>
                      <FormLabel className={labelClass}>N.º Beneficiário EFR</FormLabel>
                      <FormControl>
                        <Input className={inputClass} placeholder='' {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='dataValidadeEfr'
                  render={({ field }) => (
                    <FormItem className={fieldGap}>
                      <FormLabel className={labelClass}>Data Validade</FormLabel>
                      <FormControl>
                        <Input className={inputClass} type='date' {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='centroSaudeId'
        render={({ field }) => (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Centro de Saúde</FormLabel>
            <div className='flex gap-1.5 w-full min-w-0'>
              <div className='flex-1 min-w-0'>
                <FormControl>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v === '' ? null : v)}
                    disabled={centrosSaudeQuery.isLoading}
                  >
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder='Selecionar...' />
                    </SelectTrigger>
                    <SelectContent>
                      {centrosSaudeComUtente.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome || c.codigoLocalCS || c.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </div>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className={buttonIconClass}
                title='Gestão de Centros de Saúde'
                onClick={() =>
                  openPathInApp(
                    navigate,
                    addWindow,
                    '/area-comum/tabelas/entidades/centros-saude',
                    'Centros de Saúde'
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

      {/* Linha 3: Médico Externo (alinhado logo abaixo do Centro de Saúde, sem espaço extra) */}
      <FormField
        control={form.control}
        name='medicoExternoId'
        render={({ field }) => (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Médico Externo</FormLabel>
            <div className='flex gap-1.5 w-full min-w-0'>
              <div className='flex-1 min-w-0'>
                <FormControl>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v === '' ? null : v)}
                    disabled={medicosExternosQuery.isLoading}
                  >
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder='Selecionar...' />
                    </SelectTrigger>
                    <SelectContent>
                      {medicosExternosComUtente.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nome || m.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </div>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className={buttonIconClass}
                title='Gestão de Médicos Externos'
                onClick={() =>
                  openPathInApp(
                    navigate,
                    addWindow,
                    '/area-comum/tabelas/entidades/medicos-externos',
                    'Médicos Externos'
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

      {/* Linha 4: Condição (full width, acima de Taxas) */}
      <FormField
        control={form.control}
        name='condicaoSns'
        render={({ field }) => (
          <FormItem className={`col-span-2 ${fieldGap}`}>
            <FormLabel className={labelClass}>Condição</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value != null ? String(field.value) : ''}
                onValueChange={(v) => field.onChange(v === '' ? null : Number(v))}
                className='flex flex-wrap gap-4'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='0' id='cond-sns-0' />
                  <label htmlFor='cond-sns-0' className='text-sm cursor-pointer'>
                    Condição SNS
                  </label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='1' id='cond-sns-1' />
                  <label htmlFor='cond-sns-1' className='text-sm cursor-pointer'>
                    Condição Terceiro Pagador
                  </label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='2' id='cond-sns-2' />
                  <label htmlFor='cond-sns-2' className='text-sm cursor-pointer'>
                    Não especificado
                  </label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Linha 5: Taxas Moderadoras (full width) */}
      <FormField
        control={form.control}
        name='tipoTaxaModeradora'
        render={({ field }) => (
          <FormItem className={`col-span-2 ${fieldGap}`}>
            <FormLabel className={labelClass}>Taxas Moderadoras</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value != null ? String(field.value) : ''}
                onValueChange={(v) => field.onChange(v === '' ? null : Number(v))}
                className='flex flex-wrap gap-4'
              >
                {(Object.entries(TipoTaxaModeradora) as [string, TipoTaxaModeradora][])
                  .filter(([, v]) => typeof v === 'number')
                  .map(([k, v]) => (
                    <div key={k} className='flex items-center space-x-2'>
                      <RadioGroupItem value={String(v)} id={`tm-${v}`} />
                      <label htmlFor={`tm-${v}`} className='text-sm cursor-pointer'>
                        {TipoTaxaModeradoraLabel[v]}
                      </label>
                    </div>
                  ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Linha 6: Migrante */}
      <div className='col-span-2 pt-2 border-t'>
        <h4 className='text-sm font-semibold mb-3'>Migrante</h4>
        <div className='grid grid-cols-3 gap-4 items-end'>
          <FormField
            control={form.control}
            name='migrante'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>Migrante</FormLabel>
                <FormControl>
                  <button
                    type='button'
                    aria-checked={field.value ?? false}
                    title='Migrante'
                    onClick={() => field.onChange(!(field.value ?? false))}
                    className={cn(
                      'inline-flex h-7 w-fit items-center justify-center rounded-md border-2 px-3 py-1.5 text-xs font-medium transition-colors',
                      field.value ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background hover:bg-muted'
                    )}
                  >
                    Migrante
                  </button>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='nDocMigrante'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>N.º Documento</FormLabel>
                <FormControl>
                  <Input className={inputClass} placeholder='' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='migranteTipoCartao'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>Tipo Cartão</FormLabel>
                <FormControl>
                  <Input className={inputClass} placeholder='' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Linha 7: Benefícios */}
      {/* Notas: CliCloud.ASPcli não tem campos "Benefícios" persistidos neste fluxo de SNS.
         Mantém-se apenas o que existe no DTO (EFR, taxas, migrante, etc.). */}
    </div>
  )
}
