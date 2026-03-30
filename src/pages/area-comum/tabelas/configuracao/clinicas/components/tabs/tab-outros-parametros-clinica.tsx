import type { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ConfiguracaoTratamentosEmbedded } from '../configuracao-tratamentos-embedded'
import type {
  AtualizarConfiguracaoTratamentosRequest,
  ConfiguracaoTratamentosDTO,
} from '@/types/dtos/core/configuracao-tratamentos.dtos'

type ClinicaOutrosFormValues = Record<string, unknown>
type TFormValues = ClinicaOutrosFormValues

export type TabOutrosParametrosClinicaSection =
  | 'descarga'
  | 'rupturaStocks'
  | 'valorart'
  | 'controlarAdiantamentos'
  | 'artigos'
  | 'receitas'
  | 'atestados'
  | 'modulosCid'
  | 'configuracoesGeral'
  | 'configuracoesConsultas'
  | 'configuracoesPrescricaoEletronica'
  | 'configuracoesStocks'
  | 'diretoriaDocumentos'
  | 'exportacao'
  | 'labels'
  | 'envioEmail'
  | 'stocks'
  | 'kqueue'

const OPCOES_DESCARGA = [
  { value: '1', label: 'Descarga Manual' },
  { value: '2', label: 'Descarga Automática' },
]

const OPCOES_RUPTURA = [
  { value: '1', label: 'Ignorar' },
  { value: '2', label: 'Avisar' },
  { value: '3', label: 'Bloquear' },
]

const OPCOES_VALORART = [
  { value: '1', label: 'P.V.P. (1)' },
  { value: '2', label: 'P.V.P. (2)' },
  { value: '3', label: 'P.V.P. (3)' },
  { value: '5', label: 'Ultimo Preço' },
  { value: '4', label: 'Preço Médio' },
]

const OPCOES_CTRL_PLAFOND = [
  { value: '1', label: 'Ignorar' },
  { value: '2', label: 'Avisar' },
  { value: '3', label: 'Bloquear' },
]

const OPCOES_ENVIO_EMAIL = [
  { value: '0', label: 'Não' },
  { value: '1', label: 'Sim' },
]

const OPCOES_CONTA_FA = [
  { value: 'CLIENTE', label: 'Cliente' },
  { value: 'CONTACG', label: 'Conta CG' },
  { value: 'CONTABANCARIA', label: 'Conta Bancária' },
]

const OPCOES_PRED_UTENTES = [
  { value: '1', label: 'Não' },
  { value: '2', label: 'Sim' },
]

const OPCOES_TIPO_ADMISS_POR_DEFEITO = [
  { value: '1', label: 'Fisioterapia' },
  { value: '2', label: 'Especialidades' },
]

const OPCOES_REGIAO = [
  { value: ' ', label: ' ' },
  { value: '1', label: 'Região Norte' },
  { value: '2', label: 'Região Centro' },
  { value: '3', label: 'Região de Lisboa e Vale do Tejo' },
  { value: '4', label: 'Região do Alentejo' },
  { value: '5', label: 'Região do Algarve' },
  { value: '6', label: 'Região Autónoma dos Açores' },
  { value: '7', label: 'Região Autónoma da Madeira' },
]

function asValue(v: unknown) {
  if (v === null || v === undefined) return ''
  return String(v)
}

export function TabOutrosParametrosClinica({
  form,
  disabled,
  visibleSections,
  onTratamentosPayloadChange,
  configuracaoTratamentos,
}: {
  form: UseFormReturn<any>
  disabled?: boolean
  visibleSections?: TabOutrosParametrosClinicaSection[]
  configuracaoTratamentos?: ConfiguracaoTratamentosDTO | null
  onTratamentosPayloadChange?: (
    payload: AtualizarConfiguracaoTratamentosRequest | null
  ) => void
}) {
  const shouldShowSection = (s: TabOutrosParametrosClinicaSection) =>
    !visibleSections || visibleSections.includes(s)

  const kqueueAvisoAtraso = form.watch('kqueueAvisoAtraso' as keyof TFormValues)

  // When no external filter is passed, render the tabbed "Outros Parâmetros" UI.
  if (!visibleSections) {
    return (
      <section className='space-y-3'>
        <Tabs defaultValue='geral'>
          <TabsList className='flex flex-wrap'>
            <TabsTrigger value='geral'>Geral</TabsTrigger>
            <TabsTrigger value='tratamentos'>Tratamentos</TabsTrigger>
            <TabsTrigger value='consultas'>Consultas</TabsTrigger>
            <TabsTrigger value='contas-correntes'>Contas Correntes</TabsTrigger>
            <TabsTrigger value='prescricao-eletronica'>
              Prescrição Eletrónica
            </TabsTrigger>
            <TabsTrigger value='processo-clinico'>Processo Clínico</TabsTrigger>
            <TabsTrigger value='stocks'>Stocks</TabsTrigger>
            <TabsTrigger value='kqueue'>KQueue</TabsTrigger>
          </TabsList>

          <TabsContent value='geral'>
            <TabOutrosParametrosClinica
              form={form}
              disabled={disabled}
              visibleSections={[
                'configuracoesGeral',
                'diretoriaDocumentos',
                'exportacao',
                'labels',
                'envioEmail',
              ]}
            />
          </TabsContent>

          <TabsContent value='tratamentos'>
            <div className='space-y-3'>
              <TabOutrosParametrosClinica
                form={form}
                disabled={disabled}
                visibleSections={['controlarAdiantamentos']}
              />
              <ConfiguracaoTratamentosEmbedded
                disabled={disabled}
                onPayloadChange={onTratamentosPayloadChange}
                configuracaoTratamentos={configuracaoTratamentos}
              />
            </div>
          </TabsContent>

          <TabsContent value='consultas'>
            <TabOutrosParametrosClinica
              form={form}
              disabled={disabled}
              visibleSections={['configuracoesConsultas']}
            />
          </TabsContent>

          <TabsContent value='contas-correntes'>
            <TabOutrosParametrosClinica
              form={form}
              disabled={disabled}
              visibleSections={['descarga']}
            />
          </TabsContent>

          <TabsContent value='prescricao-eletronica'>
            <TabOutrosParametrosClinica
              form={form}
              disabled={disabled}
              visibleSections={['receitas', 'atestados', 'configuracoesPrescricaoEletronica']}
            />
          </TabsContent>

          <TabsContent value='processo-clinico'>
            <TabOutrosParametrosClinica
              form={form}
              disabled={disabled}
              visibleSections={['modulosCid']}
            />
          </TabsContent>

          <TabsContent value='stocks'>
            <TabOutrosParametrosClinica
              form={form}
              disabled={disabled}
              visibleSections={[
                'rupturaStocks',
                'valorart',
                'artigos',
                'configuracoesStocks',
                'stocks',
              ]}
            />
          </TabsContent>

          <TabsContent value='kqueue'>
            <TabOutrosParametrosClinica
              form={form}
              disabled={disabled}
              visibleSections={['kqueue']}
            />
          </TabsContent>
        </Tabs>
      </section>
    )
  }

  return (
    <div className='space-y-3'>
      <section
        className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3'
        hidden={!shouldShowSection('descarga')}
      >
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Contas Correntes
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <FormField
            control={form.control}
            name={'descarga' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Contas Correntes</FormLabel>
                <RadioGroup
                  value={asValue(field.value)}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  {OPCOES_DESCARGA.map((o) => (
                    <label
                      key={o.value}
                      className='flex items-center gap-2 cursor-pointer'
                    >
                      <RadioGroupItem value={o.value} id={`desc-${o.value}`} />
                      <span className='text-xs'>{o.label}</span>
                    </label>
                  ))}
                </RadioGroup>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>
      </section>

      <div
        className='grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch'
        hidden={!shouldShowSection('valorart')}
      >
        {shouldShowSection('valorart') ? (
          <div className='space-y-2 rounded border border-primary/20 bg-background p-3 h-full'>
            <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
              Valor Unitário
            </h4>
            <FormField
              control={form.control}
              name={'valorart' as keyof TFormValues}
              render={({ field }) => (
                <FormItem>
                  <RadioGroup
                    value={asValue(field.value)}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-1.5 max-w-md'>
                      {OPCOES_VALORART.map((o) => (
                        <label
                          key={o.value}
                          className='flex items-center gap-2 cursor-pointer'
                        >
                          <RadioGroupItem value={o.value} id={`va-${o.value}`} />
                          <span className='text-xs'>{o.label}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}

        {shouldShowSection('rupturaStocks') ? (
          <div className='space-y-2 rounded border border-primary/20 bg-background p-3 h-full'>
            <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
              Rutura de Stocks
            </h4>
            <FormField
              control={form.control}
              name={'ruptura' as keyof TFormValues}
              render={({ field }) => (
                <FormItem>
                  <RadioGroup
                    value={asValue(field.value)}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    {OPCOES_RUPTURA.map((o) => (
                      <label
                        key={o.value}
                        className='flex items-center gap-2 cursor-pointer'
                      >
                        <RadioGroupItem value={o.value} id={`rup-${o.value}`} />
                        <span className='text-xs'>{o.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}
      </div>

      <section
        className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3'
        hidden={!shouldShowSection('controlarAdiantamentos')}
      >
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Controlar Adiantamentos
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <FormField
            control={form.control}
            name={'controlarPlafond' as keyof TFormValues}
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between gap-3 space-y-2 pr-3'>
                <FormLabel className='mb-0 text-xs whitespace-nowrap'>
                  Tratar Adiantamentos
                </FormLabel>
                <FormControl inline>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={'ctrlPlafond' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Controlar Adiantamentos</FormLabel>
                <RadioGroup
                  value={asValue(field.value)}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  {OPCOES_CTRL_PLAFOND.map((o) => (
                    <label
                      key={o.value}
                      className='flex items-center gap-2 cursor-pointer'
                    >
                      <RadioGroupItem value={o.value} id={`cp-${o.value}`} />
                      <span className='text-xs'>{o.label}</span>
                    </label>
                  ))}
                </RadioGroup>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <section
        className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3'
        hidden={!shouldShowSection('artigos')}
      >
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Artigos
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <FormField
            control={form.control}
            name={'validade' as keyof TFormValues}
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between gap-3 space-y-2'>
                <FormLabel className='mb-0 text-xs whitespace-nowrap'>
                  Validar Artigos
                </FormLabel>
                <FormControl inline>
                  <Switch
                    className='!mr-6 !mt-2'
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={'diasvalid' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Dias Validade</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Dias Validade'
                    readOnly={disabled}
                    type='number'
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
            name={'ligacb' as keyof TFormValues}
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between gap-3 space-y-2'>
                <FormLabel className='ml-5 mb-0 text-xs whitespace-nowrap'>
                  Código de Barras
                </FormLabel>
                <FormControl inline>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </section>

      <section
        className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3'
        hidden={!shouldShowSection('receitas')}
      >
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Receitas
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <FormField
            control={form.control}
            name={'entidadeUtilizadora' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Entidade Utilizadora</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Entidade Utilizadora'
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
            name={'localPrescricao' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Local Prescrição</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Local Prescrição'
                    readOnly={disabled}
                    {...field}
                    value={asValue(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <FormField
            control={form.control}
            name={'nomeEtiqueta' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Nome Etiqueta</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Nome Etiqueta'
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
            name={'codSb' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Cod SB</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='0002...'
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
            name={'netiquetas' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Nº Etiquetas Imprimir</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Nº Etiquetas'
                    readOnly={disabled}
                    type='number'
                    {...field}
                    value={asValue(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <section
        className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3'
        hidden={!shouldShowSection('atestados')}
      >
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Atestados Carta de Condução
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <FormField
            control={form.control}
            name={'cccCodLocalEmissao' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Código Local de Emissão</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    readOnly={disabled}
                    type='number'
                    {...field}
                    value={asValue(field.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={'cccDescLocalEmissao' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Designação Local Emissão</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    readOnly={disabled}
                    {...field}
                    value={asValue(field.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={'regiao' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Região</FormLabel>
                <FormControl>
                  <Select
                    value={asValue(field.value)}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <SelectTrigger className='h-7'>
                      <SelectValue placeholder='Região...' />
                    </SelectTrigger>
                    <SelectContent>
                      {OPCOES_REGIAO.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </section>

      <section
        className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3'
        hidden={!shouldShowSection('modulosCid')}
      >
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Modulos / Subsistemas / CID
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch'>
          <div className='space-y-2 rounded border border-primary/20 bg-background p-3 h-full'>
            <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
              Páginas Novas
            </h4>
            <FormField
              control={form.control}
              name={'ativoNovaPagina' as keyof TFormValues}
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <div className='flex w-full min-w-0 items-center justify-between gap-3 py-0.5'>
                    <FormLabel className='mb-0 flex-1 min-w-0 text-xs leading-snug'>
                      Nova Pagina Atendimento
                    </FormLabel>
                    <FormControl inline>
                      <Switch
                        className='!mr-2 !mt-2'
                        checked={!!field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                        disabled={disabled}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className='space-y-2 rounded border border-primary/20 bg-background p-3 h-full'>
            <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
              CID
            </h4>
            <FormField
              control={form.control}
              name={'cid' as keyof TFormValues}
              render={({ field }) => (
                <FormItem>
                  <RadioGroup
                    value={asValue(field.value)}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <RadioGroupItem value='1' id='cid-1' />
                      <span className='text-xs'>CID09</span>
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <RadioGroupItem value='2' id='cid-2' />
                      <span className='text-xs'>CID10</span>
                    </label>
                  </RadioGroup>
                </FormItem>
              )}
            />
          </div>
        </div>
      </section>

      <section
        className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3'
        hidden={!shouldShowSection('configuracoesGeral')}
      >
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Configurações
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
          <FormField
            control={form.control}
            name={'portaLeitorCartoes' as keyof TFormValues}
            render={({ field }) => (
              <FormItem className='max-w-md'>
                <FormLabel className='text-xs'>Porta Execução Leitor Cartões</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Porta Execução Leitor Cartões'
                    readOnly={disabled}
                    type='number'
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
            name={'calendarioMarcacoesRadio' as keyof TFormValues}
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-xs'>Calendário de Marcações</FormLabel>
                <RadioGroup
                  value={asValue(field.value)}
                  onValueChange={field.onChange}
                  disabled={disabled}
                  className='mt-1'
                >
                  <div className='flex flex-col gap-1.5'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <RadioGroupItem value='1' id='cal-1' />
                      <span className='text-xs'>Passar Férias Automaticamente</span>
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <RadioGroupItem value='2' id='cal-2' />
                      <span className='text-xs'>Indisponibilidades a vermelho</span>
                    </label>
                  </div>
                </RadioGroup>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <section
        className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3'
        hidden={!shouldShowSection('configuracoesConsultas')}
      >
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Configurações Consultas
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch'>
          <div className='space-y-2 rounded border border-primary/20 bg-background p-3 h-full'>
            <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
              Gestão de Salas
            </h4>
            <FormField
              control={form.control}
              name={'gestaoSalas' as keyof TFormValues}
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <div className='flex w-full min-w-0 items-center justify-between gap-3 py-0.5'>
                    <FormLabel className='mb-0 flex-1 min-w-0 text-xs leading-snug'>
                      Gestão de Salas
                    </FormLabel>
                    <FormControl inline>
                      <Switch
                      className='!mr-2 !mt-2'
                        checked={!!field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                        disabled={disabled}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className='space-y-2 rounded border border-primary/20 bg-background p-3 h-full'>
            <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
              Configuração do tipo de admissão por defeito
            </h4>
            <FormField
              control={form.control}
              name={'tipoAdmissPorDefeito' as keyof TFormValues}
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <RadioGroup
                    value={asValue(field.value)}
                    onValueChange={field.onChange}
                    disabled={disabled}
                    className='mt-1'
                  >
                    <div className='flex flex-col gap-1.5'>
                      {OPCOES_TIPO_ADMISS_POR_DEFEITO.map((o) => (
                        <label
                          key={o.value}
                          className='flex items-center gap-2 cursor-pointer'
                        >
                          <RadioGroupItem value={o.value} id={`ta-${o.value}`} />
                          <span className='text-xs'>{o.label}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </section>

      <section
        className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3'
        hidden={!shouldShowSection('configuracoesPrescricaoEletronica')}
      >
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Configurações Prescrição Eletrónica
        </h3>
        <FormField
          control={form.control}
          name={'novaPrescricao' as keyof TFormValues}
          render={({ field }) => (
            <FormItem className='space-y-0'>
              <div className='flex w-full min-w-0 items-center justify-between gap-3 py-0.5'>
                <FormLabel className='mb-0 flex-1 min-w-0 text-xs leading-snug'>
                  Nova Página Prescrição
                </FormLabel>
                <FormControl inline>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(Boolean(checked))
                    }
                    disabled={disabled}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
      </section>

      <div
        className='grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch'
        hidden={
          !shouldShowSection('configuracoesStocks') &&
          !shouldShowSection('stocks')
        }
      >
        <section
          className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3 h-full'
          hidden={!shouldShowSection('configuracoesStocks')}
        >
          <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
            Configurações Stocks
          </h3>
          <FormField
            control={form.control}
            name={'stocksColunaStockReal' as keyof TFormValues}
            render={({ field }) => (
              <FormItem className='space-y-0'>
                <div className='flex w-full min-w-0 items-center justify-between gap-3 py-0.5'>
                  <FormLabel className='mb-0 flex-1 min-w-0 text-xs leading-snug'>
                    Coluna Stock Real
                  </FormLabel>
                  <FormControl inline>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                      disabled={disabled}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
        </section>

        <section
          className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3 h-full'
          hidden={!shouldShowSection('stocks')}
        >
          <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
            Stocks
          </h3>
          <FormField
            control={form.control}
            name={'movimentosInternos' as keyof TFormValues}
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between gap-3 space-y-0'>
                <FormLabel className='mb-0 text-xs whitespace-nowrap'>
                  Gerar baixa por Movimentos Internos
                </FormLabel>
                <FormControl inline>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </section>
      </div>

      <section
        className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3'
        hidden={!shouldShowSection('diretoriaDocumentos')}
      >
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Diretoria do Documentos
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <FormField
            control={form.control}
            name={'diretoriaDocumentos' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Diretoria</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='\\UserFiles\\UserFilesDocumentosFichaClinica\\'
                    readOnly={disabled}
                    {...field}
                    value={asValue(field.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'caminhoSaft' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>SAFT</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='\\UserFiles\\Faturacao\\Saft'
                    readOnly={disabled}
                    {...field}
                    value={asValue(field.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </section>

      <section
        className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3'
        hidden={!shouldShowSection('exportacao')}
      >
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Exportação de Ficheiros de Contabilidade
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 items-start'>
          <div className='space-y-3'>
            <FormField
              control={form.control}
              name={'exportContabilidadeFa' as keyof TFormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>Contabilidade - Fatura</FormLabel>
                  <FormControl>
                    <Input
                      className='h-7'
                      placeholder='...'
                      readOnly={disabled}
                      {...field}
                      value={asValue(field.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={'exportTipoContaFa' as keyof TFormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>Tipo de Conta</FormLabel>
                  <RadioGroup
                    value={asValue(field.value)}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    {OPCOES_CONTA_FA.map((o) => (
                      <label
                        key={o.value}
                        className='flex items-center gap-2 cursor-pointer'
                      >
                        <RadioGroupItem value={o.value} id={`fa-${o.value}`} />
                        <span className='text-xs'>{o.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={'exportPredUtenteFa' as keyof TFormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>Predefinido para Utentes</FormLabel>
                  <RadioGroup
                    value={asValue(field.value)}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    {OPCOES_PRED_UTENTES.map((o) => (
                      <label
                        key={o.value}
                        className='flex items-center gap-2 cursor-pointer'
                      >
                        <RadioGroupItem
                          value={o.value}
                          id={`fa-p-${o.value}`}
                        />
                        <span className='text-xs'>{o.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </FormItem>
              )}
            />
          </div>

          <div className='space-y-3'>
            <FormField
              control={form.control}
              name={'exportContabilidadeFr' as keyof TFormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>
                    Contabilidade - Fatura Recibo
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='h-7'
                      placeholder='...'
                      readOnly={disabled}
                      {...field}
                      value={asValue(field.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={'exportTipoContaFr' as keyof TFormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>Tipo de Conta</FormLabel>
                  <RadioGroup
                    value={asValue(field.value)}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    {OPCOES_CONTA_FA.map((o) => (
                      <label
                        key={o.value}
                        className='flex items-center gap-2 cursor-pointer'
                      >
                        <RadioGroupItem value={o.value} id={`fr-${o.value}`} />
                        <span className='text-xs'>{o.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={'exportPredUtenteFr' as keyof TFormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>Predefinido para Utentes</FormLabel>
                  <RadioGroup
                    value={asValue(field.value)}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    {OPCOES_PRED_UTENTES.map((o) => (
                      <label
                        key={o.value}
                        className='flex items-center gap-2 cursor-pointer'
                      >
                        <RadioGroupItem
                          value={o.value}
                          id={`fr-p-${o.value}`}
                        />
                        <span className='text-xs'>{o.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </FormItem>
              )}
            />
          </div>
        </div>
      </section>

      <div
        className='grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch'
        hidden={!shouldShowSection('labels') && !shouldShowSection('envioEmail')}
      >
        <section
          className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3 h-full'
          hidden={!shouldShowSection('labels')}
        >
          <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
            Configurar Labels
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <FormField
              control={form.control}
              name={'labelAuxiliares' as keyof TFormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>Auxiliares</FormLabel>
                  <FormControl>
                    <Input
                      className='h-7'
                      placeholder='Auxiliares'
                      readOnly={disabled}
                      {...field}
                      value={asValue(field.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </section>

        <section
          className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3 h-full'
          hidden={!shouldShowSection('envioEmail')}
        >
          <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
            Envio automático de email (Consultas e Tratamentos)
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <FormField
              control={form.control}
              name={'envioEmail' as keyof TFormValues}
              render={({ field }) => (
                <FormItem>
                  <RadioGroup
                    value={asValue(field.value)}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    {OPCOES_ENVIO_EMAIL.map((o) => (
                      <label
                        key={o.value}
                        className='flex items-center gap-2 cursor-pointer'
                      >
                        <RadioGroupItem value={o.value} id={`ee-${o.value}`} />
                        <span className='text-xs'>{o.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </FormItem>
              )}
            />
          </div>
        </section>
      </div>



      <section
        className='space-y-2 rounded border border-primary/20 bg-muted/10 p-3'
        hidden={!shouldShowSection('kqueue')}
      >
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Mensagens de Aviso - KQueue
        </h3>

        <div className='space-y-3'>
          <FormField
            control={form.control}
            name={'msgFaltaPagamento' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Pagamentos em falta</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    className='min-h-16 resize-y'
                    placeholder=''
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
            name={'msgCredenciais' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>
                  Mostrar credenciais no balcão
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    className='min-h-16 resize-y'
                    placeholder=''
                    readOnly={disabled}
                    {...field}
                    value={asValue(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <FormField
              control={form.control}
              name={'kqueueAvisoAtraso' as keyof TFormValues}
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between gap-3 space-y-2 pr-2'>
                  <FormLabel className='ml-2 mb-0 text-xs whitespace-nowrap'>
                    Aviso Atraso
                  </FormLabel>
                  <FormControl inline>
                    <Switch
                      className='!mr-5 !mt-2'
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={'kqueueTempoAvisoAtraso' as keyof TFormValues}
              render={({ field }) => (
                <FormItem className='max-w-38'>
                  <FormLabel className='text-xs'>Minutos para atraso</FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      inputMode='numeric'
                      className='h-7 w-24'
                      readOnly={disabled || !kqueueAvisoAtraso}
                      {...field}
                      value={asValue(field.value)}
                      onChange={(e) => {
                        field.onChange(e.target.value.replace(/\D/g, ''))
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={'kqueueMensagemAvisoAtraso' as keyof TFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Mensagem aviso atraso</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    className='min-h-16 resize-y'
                    placeholder=''
                    readOnly={disabled || !kqueueAvisoAtraso}
                    {...field}
                    value={asValue(field.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </section>
    </div>
  )
}

