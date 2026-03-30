import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Plus } from 'lucide-react'
import { BancosService } from '@/lib/services/utility/bancos-service'
import type { OrganismoEditFormValues } from '@/pages/organismos/types/organismo-edit-form-types'

const CONDICOES_PAGAMENTO = [
  { value: '1', label: 'À Vista' },
  { value: '2', label: '30 Dias' },
  { value: '3', label: '60 Dias' },
  { value: '4', label: '90 Dias' },
  { value: '5', label: '120 Dias' },
  { value: '6', label: 'Pré-pagamento' },
  { value: '7', label: 'Outro' },
]

const MODOS_PAGAMENTO = [
  { value: '1', label: 'Dinheiro' },
  { value: '2', label: 'Transferência Bancária' },
  { value: '3', label: 'Cheque' },
  { value: '4', label: 'Multibanco' },
  { value: '5', label: 'Cartão de Crédito' },
  { value: '6', label: 'Cartão de Débito' },
  { value: '7', label: 'Débito Direto' },
  { value: '8', label: 'Outro' },
]

/** Agrupa checkboxes (legado): só título + corpo denso */
function OrganismoConsultasConfigCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className='flex h-full flex-col rounded border border-primary/30 bg-muted/10 p-2 shadow-none'>
      <div className='mb-1'>
        <h4 className='text-[11px] font-semibold uppercase tracking-wide text-primary leading-tight'>
          {title}
        </h4>
      </div>
      <div className='flex flex-col gap-1.5'>{children}</div>
    </div>
  )
}

const CheckboxField = ({
  form,
  name,
  label,
  readOnly,
}: {
  form: UseFormReturn<OrganismoEditFormValues>
  name: keyof OrganismoEditFormValues
  label: string
  readOnly?: boolean
}) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem className='flex flex-row items-center gap-1 space-y-0'>
        <FormControl inline>
          <Checkbox
            checked={field.value as boolean}
            onCheckedChange={field.onChange}
            disabled={readOnly}
            className='mt-0.5'
          />
        </FormControl>
        <FormLabel className='!mb-0 min-w-0 flex-1 cursor-pointer text-[11px] font-medium leading-tight'>
          {label}
        </FormLabel>
      </FormItem>
    )}
  />
)

export function TabOutrosParametros({
  form,
  readOnly,
}: {
  form: UseFormReturn<OrganismoEditFormValues>
  readOnly?: boolean
}) {
  const bancosQuery = useQuery({
    queryKey: ['bancos', 'light', ''],
    queryFn: () => BancosService('organismos').getBancosLight(''),
    staleTime: 5 * 60_000,
  })
  const bancos = bancosQuery.data?.info?.data ?? []

  return (
    <div className='space-y-3'>
      {/* Parâmetros de Pagamento - grid compacto 4 colunas */}
      <section className='space-y-2'>
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2'>
          <FormField
            control={form.control}
            name='categoria'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Categoria</FormLabel>
                <FormControl>
                  <Input className='h-7' placeholder='Categoria...' readOnly={readOnly} {...field} value={field.value ?? ''} />
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
                <FormLabel className='text-xs'>Nr. Pagamentos</FormLabel>
                <FormControl>
                  <Input type='number' className='h-7' placeholder='Nr. Pagamentos...' readOnly={readOnly} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='desconto'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Desconto Clínica (%)</FormLabel>
                <FormControl>
                  <Input className='h-7' placeholder='Ex.: 10' readOnly={readOnly} {...field} value={field.value ?? ''} />
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
                <FormLabel className='text-xs'>Desconto Utente (%)</FormLabel>
                <FormControl>
                  <Input className='h-7' placeholder='Ex.: 5' readOnly={readOnly} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='contacto'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Contacto</FormLabel>
                <FormControl>
                  <Input className='h-7' placeholder='Contacto...' readOnly={readOnly} {...field} value={field.value ?? ''} />
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
                <FormLabel className='text-xs'>Prazo Pagamento</FormLabel>
                <FormControl>
                  <Input type='number' className='h-7' placeholder='Ex.: 30' readOnly={readOnly} {...field} value={field.value ?? ''} />
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
                <FormLabel className='text-xs'>Apólice</FormLabel>
                <FormControl>
                  <Input className='h-7' placeholder='Apólice...' readOnly={readOnly} {...field} value={field.value ?? ''} />
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
                <FormLabel className='text-xs'>Avença (€)</FormLabel>
                <FormControl>
                  <Input type='number' step='0.01' className='h-7' placeholder='Avença...' readOnly={readOnly} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='bancoId'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Banco</FormLabel>
                <div className='flex gap-1'>
                  <FormControl>
                    <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={bancosQuery.isLoading || readOnly}>
                      <SelectTrigger className='h-7 flex-1'>
                        <SelectValue placeholder='Banco...' />
                      </SelectTrigger>
                      <SelectContent>
                        {bancos.map((b: { id: string; nome?: string }) => (
                          <SelectItem key={b.id} value={b.id}>{b.nome ?? b.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {!readOnly && (
                    <Button type='button' variant='outline' size='icon' className='h-7 w-7 shrink-0'>
                      <Plus className='h-3 w-3' />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='nib'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>N.I.B.</FormLabel>
                <FormControl>
                  <Input className='h-7' placeholder='NIB' readOnly={readOnly} {...field} value={field.value ?? ''} />
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
                <FormLabel className='text-xs'>Início Contrato</FormLabel>
                <FormControl>
                  <Input type='date' className='h-7' readOnly={readOnly} {...field} value={field.value ?? ''} />
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
                <FormLabel className='text-xs'>Fim Contrato</FormLabel>
                <FormControl>
                  <Input type='date' className='h-7' readOnly={readOnly} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='designaTratamentos'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Design. tratamento</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Designação do tratamento...'
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
            name='condicaoPagamento'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Condição Pagamento</FormLabel>
                <div className='flex gap-1'>
                  <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={readOnly}>
                    <FormControl>
                      <SelectTrigger className='h-7 flex-1'>
                        <SelectValue placeholder='Selecionar...' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONDICOES_PAGAMENTO.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!readOnly && (
                    <Button type='button' variant='outline' size='icon' className='h-7 w-7 shrink-0'>
                      <Plus className='h-3 w-3' />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='tipoModoPagamento'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Modo Pagamento</FormLabel>
                <div className='flex gap-1'>
                  <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={readOnly}>
                    <FormControl>
                      <SelectTrigger className='h-7 flex-1'>
                        <SelectValue placeholder='Selecionar...' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MODOS_PAGAMENTO.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!readOnly && (
                    <Button type='button' variant='outline' size='icon' className='h-7 w-7 shrink-0'>
                      <Plus className='h-3 w-3' />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      {/* Consultas e Configurações — grelha densa, labels curtas */}
      <section className='space-y-1'>
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 items-stretch'>
          <OrganismoConsultasConfigCard title='Limite consultas'>
            <CheckboxField form={form} name='limitarConsultas' label='Limitar consultas' readOnly={readOnly} />
            <FormField
              control={form.control}
              name='numeroConsultas'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormLabel className='text-[11px] font-medium mb-1'>N.º máx.</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      className='h-7 text-xs px-2'
                      placeholder='Ex.: 3'
                      readOnly={readOnly}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </OrganismoConsultasConfigCard>

          <OrganismoConsultasConfigCard title='Credenciais consulta'>
            <FormField
              control={form.control}
              name='apresentarCredenciaisPrimeiraSessao'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-1 space-y-0'>
                  <FormLabel className='text-[11px] font-medium whitespace-nowrap'>
                    Credenciais na 1.ª sessão
                  </FormLabel>
                  <div className='flex flex-wrap gap-2 items-center'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <Checkbox
                        checked={field.value === 1}
                        onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                        disabled={readOnly}
                      />
                      <span className='text-[11px] leading-none'>Sim</span>
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <Checkbox
                        checked={field.value !== 1}
                        onCheckedChange={(v) => field.onChange(v ? 0 : 0)}
                        disabled={readOnly}
                      />
                      <span className='text-[11px] leading-none'>Não</span>
                    </label>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='apresentarCredenciaisTipoConsulta'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormLabel className='text-[11px] font-medium'>
                    Credenciais no tipo consulta
                  </FormLabel>
                  <div className='flex flex-wrap gap-2 items-center'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <Checkbox
                        checked={(field.value ?? 0) === 0}
                        onCheckedChange={(v) => field.onChange(v ? 0 : 0)}
                        disabled={readOnly}
                      />
                      <span className='text-[11px] leading-none'>Não</span>
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <Checkbox
                        checked={(field.value ?? 0) === 1}
                        onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                        disabled={readOnly}
                      />
                      <span className='text-[11px] leading-none'>1</span>
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <Checkbox
                        checked={(field.value ?? 0) === 2}
                        onCheckedChange={(v) => field.onChange(v ? 2 : 0)}
                        disabled={readOnly}
                      />
                      <span className='text-[11px] leading-none'>1 e 2</span>
                    </label>
                  </div>
                </FormItem>
              )}
            />
          </OrganismoConsultasConfigCard>

            <OrganismoConsultasConfigCard title='Serviços'>
              <CheckboxField form={form} name='discriminaServicos' label='Discrimina serviços' readOnly={readOnly} />
            </OrganismoConsultasConfigCard>
          <OrganismoConsultasConfigCard title='Credencial'>
            <FormField
              control={form.control}
              name='faturaCredencial'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center gap-1 space-y-0'>
                  <FormControl inline>
                    <Checkbox
                      checked={field.value === 1}
                      onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
                      disabled={readOnly}
                      className='mt-0.5'
                    />
                  </FormControl>
                  <FormLabel className='!mb-0 min-w-0 flex-1 cursor-pointer text-[11px] font-medium leading-tight'>
                    Destac. credencial
                  </FormLabel>
                </FormItem>
              )}
            />
          </OrganismoConsultasConfigCard>

          <OrganismoConsultasConfigCard title='Fatura / recibo'>
            <CheckboxField form={form} name='assinarPagaDocumento' label='Assinar doc. FT/RC' readOnly={readOnly} />
            <CheckboxField form={form} name='admissaoCC' label='Admissão CC' readOnly={readOnly} />
          </OrganismoConsultasConfigCard>

          <OrganismoConsultasConfigCard title='Faltas / estado'>
            <CheckboxField form={form} name='contabilizarFaltas' label='Contabilizar faltas' readOnly={readOnly} />
            <CheckboxField form={form} name='inactivo' label='Inactivo' readOnly={readOnly} />
          </OrganismoConsultasConfigCard>

          {/* Contab. - Fatura (lado direito de Faltas/estado, abaixo de Serviços/Credencial) */}
          <OrganismoConsultasConfigCard title='Contab. - Fatura'>
            <div className='flex flex-wrap gap-3 items-center'>
              <FormField
                control={form.control}
                name='contabContaFA'
                render={({ field }) => (
                  <FormItem className='flex-1 min-w-[140px] space-y-0'>
                    <FormControl>
                      <Input className='h-7 text-xs px-2' placeholder='Conta FA' readOnly={readOnly} {...field} value={field.value ?? ''} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='contabTipoContaFA'
                render={({ field }) => (
                  <FormItem className='space-y-0'>
                    <RadioGroup
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      disabled={readOnly}
                      className='flex gap-4 items-center'
                    >
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='cliente' id='fa-cli' />
                        <label htmlFor='fa-cli' className='text-xs cursor-pointer whitespace-nowrap'>
                          Conta Cliente
                        </label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='cg' id='fa-cg' />
                        <label htmlFor='fa-cg' className='text-xs cursor-pointer whitespace-nowrap'>
                          Conta CG
                        </label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='bancaria' id='fa-banc' />
                        <label htmlFor='fa-banc' className='text-xs cursor-pointer whitespace-nowrap'>
                          Conta Bancária
                        </label>
                      </div>
                    </RadioGroup>
                  </FormItem>
                )}
              />
            </div>
          </OrganismoConsultasConfigCard>

          {/* Contab. - Fatura Recibo (lado direito de Faltas/estado, abaixo de Serviços/Credencial) */}
          <OrganismoConsultasConfigCard title='Contab. - Fatura Recibo'>
            <div className='flex flex-wrap gap-3 items-center'>
              <FormField
                control={form.control}
                name='contabContaFR'
                render={({ field }) => (
                  <FormItem className='flex-1 min-w-[140px] space-y-0'>
                    <FormControl>
                      <Input className='h-7 text-xs px-2' placeholder='Conta FR' readOnly={readOnly} {...field} value={field.value ?? ''} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='contabTipoContaFR'
                render={({ field }) => (
                  <FormItem className='space-y-0'>
                    <RadioGroup
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      disabled={readOnly}
                      className='flex gap-4 items-center'
                    >
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='cliente' id='fr-cli' />
                        <label htmlFor='fr-cli' className='text-xs cursor-pointer whitespace-nowrap'>
                          Conta Cliente
                        </label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='cg' id='fr-cg' />
                        <label htmlFor='fr-cg' className='text-xs cursor-pointer whitespace-nowrap'>
                          Conta CG
                        </label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='bancaria' id='fr-banc' />
                        <label htmlFor='fr-banc' className='text-xs cursor-pointer whitespace-nowrap'>
                          Conta Bancária
                        </label>
                      </div>
                    </RadioGroup>
                  </FormItem>
                )}
              />
            </div>
          </OrganismoConsultasConfigCard>
        </div>
      </section>
    </div>
  )
}
