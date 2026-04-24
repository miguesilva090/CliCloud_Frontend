import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Building2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { toast } from '@/utils/toast-utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AtualizarConfiguracaoTratamentosRequest } from '@/types/dtos/core/configuracao-tratamentos.dtos'
import { MoedaService } from '@/lib/services/moedas/moeda-service'
import { MotivoIsencaoService } from '@/lib/services/taxas-iva/motivo-isencao-service'
import { TaxaIvaService } from '@/lib/services/taxas-iva/taxa-iva-service'
import { useGetCodigosPostaisSelect } from '@/pages/base/codigospostais/queries/codigospostais-queries'
import { CreateCodigoPostalModal } from '@/components/shared/address-quick-create'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { ImageUploader } from '@/components/shared/image-uploader'
import { CodigosPostaisService } from '@/lib/services/base/codigospostais-service'
import {
  useCloseCurrentWindowLikeTabBar,
  navigateManagedWindow,
} from '@/utils/window-utils'
import { toastFirstValidationMessage } from '../utils/clinica-edit-validation'
import {
  buildCodigoPostalComboboxItems,
  buildMoedasForSelect,
  buildMotivosIsencaoForSelect,
  filterComboboxItems,
} from '../utils/clinica-edit-selects'
import { mapClinicaToClinicaEditFormValues } from '../utils/clinica-edit-mappers'
import { buildUpdateClinicaPayload } from '../utils/clinica-edit-payload'
import {
  type ClinicaEditFormValues,
  clinicaEditDefaultValues,
  clinicaEditSchema,
} from '../utils/clinica-edit-form'
import {
  useGetClinica,
  useUpdateClinica,
} from '../queries/clinicas-queries'
import {
  useGetClinicaCurrent,
  useUpdateClinicaCurrent,
} from '../queries/clinica-queries'
import { TabOutrosParametrosClinica } from '../components/tabs/tab-outros-parametros-clinica'
import { TabHorarioClinica } from '../components/tabs/tab-horario-clinica'

const LISTAGEM_PATH = '/area-comum/tabelas/configuracao/clinicas'

export function ClinicaEditPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const location = useLocation()
  const queryClient = useQueryClient()
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()

  // (// retirar) codinstquota/quotas removidos: não é necessário carregar organismos para este formulário.

  const id = params.id ?? ''
  const isSessionClinicaEditRoute =
    location.pathname.includes('/configuracao/clinica-atual/editar')
  const isEditMode =
    isSessionClinicaEditRoute || location.pathname.endsWith('/editar')
  const isReadOnly = !isEditMode

  const currentClinicaQuery = useGetClinicaCurrent({
    enabled: isSessionClinicaEditRoute,
  })
  const byIdClinicaQuery = useGetClinica(id, {
    enabled: !isSessionClinicaEditRoute && !!id,
  })

  const isLoading = isSessionClinicaEditRoute
    ? currentClinicaQuery.isLoading
    : byIdClinicaQuery.isLoading
  const isError = isSessionClinicaEditRoute
    ? currentClinicaQuery.isError
    : byIdClinicaQuery.isError

  const clinica = (
    isSessionClinicaEditRoute
      ? currentClinicaQuery.data
      : byIdClinicaQuery.data
  )?.info?.data

  const updateByIdMutation = useUpdateClinica(
    isSessionClinicaEditRoute ? '' : id,
  )
  const updateCurrentMutation = useUpdateClinicaCurrent()
  const updatePending = isSessionClinicaEditRoute
    ? updateCurrentMutation.isPending
    : updateByIdMutation.isPending

  const [tratamentosPayload, setTratamentosPayload] = useState<
    AtualizarConfiguracaoTratamentosRequest | null
  >(null)

  const moedasQuery = useQuery({
    queryKey: ['moedas-light', 'clinica-form'],
    queryFn: () => MoedaService().getMoedasLight(''),
    enabled: !!clinica,
  })
  const motivosIsencaoQuery = useQuery({
    queryKey: ['motivos-isencao-light', 'clinica-form'],
    queryFn: () => MotivoIsencaoService().getMotivosIsencaoLight(''),
    enabled: !!clinica,
  })
  const taxasIvaQuery = useQuery({
    queryKey: ['taxas-iva-light', 'clinica-form'],
    queryFn: () => TaxaIvaService().getTaxasIvaLight(''),
    enabled: !!clinica,
  })
  const codigosPostaisQuery = useGetCodigosPostaisSelect('')
  const moedas = moedasQuery.data?.info?.data ?? []
  const motivosIsencao = motivosIsencaoQuery.data?.info?.data ?? []
  const taxasIva = taxasIvaQuery.data?.info?.data ?? []
  const codigosPostais = codigosPostaisQuery.data ?? []

  const [modalCodigoPostalOpen, setModalCodigoPostalOpen] = useState(false)
  const [cpComboboxSearch, setCpComboboxSearch] = useState('')

  type MainTabKey =
    | 'identificacao'
    | 'dados-fiscais'
    | 'faturacao'
    | 'outros-parametros'
    | 'horario'
    | 'emails'
  const [mainTab, setMainTab] = useState<MainTabKey>('identificacao')
  const [subTab, setSubTab] = useState<string>('geral-identificacao')
  const toSelectValue = (v: unknown): string | undefined => {
    if (v === null || v === undefined) return undefined
    const s = String(v).trim()
    return s ? s : undefined
  }

  useEffect(() => {
    if (mainTab === 'identificacao') setSubTab('geral-identificacao')
    else if (mainTab === 'dados-fiscais') setSubTab('fiscal-dados-fiscais')
    else if (mainTab === 'faturacao') setSubTab('fiscal-faturacao')
    else if (mainTab === 'outros-parametros')
      setSubTab('outros-parametros-geral')
    else if (mainTab === 'horario') setSubTab('geral-horario')
    else setSubTab('comunicacao-emails')
  }, [mainTab])

  const form = useForm<ClinicaEditFormValues>({
    resolver: zodResolver(clinicaEditSchema),
    defaultValues: clinicaEditDefaultValues,
    mode: 'onBlur',
  })

  const ccPostalWatch = form.watch('ccPostal')
  const cpComboboxItems = useMemo(() => {
    return buildCodigoPostalComboboxItems(codigosPostais, ccPostalWatch)
  }, [codigosPostais, ccPostalWatch])

  const cpComboboxFiltered = useMemo(() => {
    return filterComboboxItems(cpComboboxItems, cpComboboxSearch)
  }, [cpComboboxItems, cpComboboxSearch])
  const resolveRegimeIvaByZonaFiscal = (
    zonFiscValue: string,
    taxas: Array<{ descricao: string; taxa: number }>,
  ): string => {
    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    const token =
      zonFiscValue === '1'
        ? 'continente'
        : zonFiscValue === '2'
          ? 'madeira'
          : zonFiscValue === '3'
            ? 'acores'
            : ''

    const byZona = token
      ? taxas.filter(
          (t) =>
            Number.isFinite(t.taxa) &&
            t.taxa > 0 &&
            normalize(t.descricao).includes(token),
        )
      : []

    const candidatos =
      byZona.length > 0
        ? byZona
        : taxas.filter((t) => Number.isFinite(t.taxa) && t.taxa > 0)

    if (candidatos.length === 0) return ''
    const taxa = candidatos.sort((a, b) => b.taxa - a.taxa)[0].taxa
    return Number.isInteger(taxa) ? String(taxa) : String(taxa).replace('.', ',')
  }
  const resolveRegimeIvaIsento = (
    taxas: Array<{ descricao: string; taxa: number }>,
  ): string => {
    const isento = taxas.find((t) => t.taxa === 0)
    if (!isento) return '0'
    return Number.isInteger(isento.taxa)
      ? String(isento.taxa)
      : String(isento.taxa).replace('.', ',')
  }

  const cmoedaWatch = form.watch('cmoeda')
  const tipoWatch = form.watch('tipo')
  const moedasForSelect = useMemo(() => {
    return buildMoedasForSelect(moedas, cmoedaWatch)
  }, [moedas, cmoedaWatch])

  const motivoIsencaoWatch = form.watch('motivoIsencaoDefeito')
  const motivosIsencaoForSelect = useMemo(() => {
    return buildMotivosIsencaoForSelect(motivosIsencao, motivoIsencaoWatch)
  }, [motivosIsencao, motivoIsencaoWatch])

  useEffect(() => {
    if (!clinica) return
    form.reset(mapClinicaToClinicaEditFormValues(clinica))
  }, [clinica, form])

  useEffect(() => {
    if (!clinica) return
    const urlFotoAtual = clinica.urlFoto ?? ''
    if ((form.getValues('urlFoto') ?? '') !== urlFotoAtual) {
      form.setValue('urlFoto', urlFotoAtual, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      })
    }
  }, [clinica?.id, clinica?.urlFoto, location.key, form, clinica])

  const canSave = !isReadOnly && !!clinica && !updatePending

  const onInvalidSubmit = toastFirstValidationMessage

  const handleSubmitSafe = (e?: unknown) => {
    const submit = form.handleSubmit(onSubmit, onInvalidSubmit)
    void submit(e as never).catch((error: unknown) => {
      onInvalidSubmit(error)
    })
  }

  const onSubmit = async (values: ClinicaEditFormValues) => {
    if (!clinica) return
    if (isReadOnly) return

    try {
      const payload: any = {
        ...buildUpdateClinicaPayload(values, clinica),
        ...(tratamentosPayload ?? {}),
        gravarConfiguracaoTratamentos: tratamentosPayload ? true : null,
      }

      if (isSessionClinicaEditRoute) {
        await updateCurrentMutation.mutateAsync(payload)
      } else {
        await updateByIdMutation.mutateAsync(payload)
      }
    } catch {
      toast.error('Falha ao preparar os dados para gravação.')
    }
  }

  const headerTitle = isSessionClinicaEditRoute
    ? 'Configuração da Clínica'
    : isReadOnly
      ? 'Ver Clínica'
      : 'Editar Clínica'

  const title =
    clinica?.nome && isSessionClinicaEditRoute
      ? `Configuração da Clínica — ${clinica.nome}`
      : clinica?.nome
        ? `${isReadOnly ? 'Ver' : 'Editar'}: ${clinica.nome}`
        : headerTitle

  const handleVoltar = () => {
    if (isSessionClinicaEditRoute) {
      closeWindowTab()
      return
    }
    navigateManagedWindow(navigate, LISTAGEM_PATH)
  }

  return (
    <>
      <PageHead title={`${title} | CliCloud`} />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>{headerTitle}</h1>
          <div className='flex items-center gap-2'>
            {isReadOnly && clinica && !isSessionClinicaEditRoute ? (
              <Button
                type='button'
                variant='default'
                onClick={() =>
                  navigateManagedWindow(
                    navigate,
                    `${LISTAGEM_PATH}/${clinica.id}/editar`
                  )
                }
              >
                Editar
              </Button>
            ) : null}
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={handleVoltar}
              title='Voltar'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='rounded-b-lg border border-t-0 bg-background px-4 py-4'>
          {isLoading ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              A carregar...
            </div>
          ) : isError ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              Não foi possível carregar a clínica.
            </div>
          ) : !clinica ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              Clínica não encontrada.
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={handleSubmitSafe}
                className='space-y-4'
              >
                {!isReadOnly ? (
                  <div className='flex justify-end'>
                    <Button
                      type='button'
                      disabled={!canSave}
                      onClick={() => handleSubmitSafe()}
                      size='sm'
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                      {updatePending ? 'A guardar...' : 'Guardar'}
                    </Button>
                  </div>
                ) : null}

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='nome'
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormLabel>Designação</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Designação'
                            readOnly={isReadOnly || updatePending}
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Tabs
                  value={subTab}
                  onValueChange={(v) => setSubTab(v)}
                >
                <div className='mb-4'>
                    <div className='flex flex-wrap gap-2 mb-3 hidden'>
                      <Button
                        type='button'
                        size='sm'
                        variant={mainTab === 'identificacao' ? 'default' : 'outline'}
                        onClick={() => setMainTab('identificacao')}
                      >
                        Identificação
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant={mainTab === 'dados-fiscais' ? 'default' : 'outline'}
                        onClick={() => setMainTab('dados-fiscais')}
                      >
                        Dados Fiscais
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant={mainTab === 'faturacao' ? 'default' : 'outline'}
                        onClick={() => setMainTab('faturacao')}
                      >
                        Faturação
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant={
                          mainTab === 'outros-parametros' ? 'default' : 'outline'
                        }
                        onClick={() => setMainTab('outros-parametros')}
                      >
                        Outros Parâmetros
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant={
                          mainTab === 'horario' ? 'default' : 'outline'
                        }
                        onClick={() => setMainTab('horario')}
                      >
                        Horário de Funcionamento
                      </Button>
                    </div>

                    <TabsList>
                      <TabsTrigger value='geral-identificacao'>Identificação</TabsTrigger>
                      <TabsTrigger value='fiscal-dados-fiscais'>Dados Fiscais</TabsTrigger>
                      <TabsTrigger value='fiscal-faturacao'>Faturação</TabsTrigger>
                      <TabsTrigger value='outros-parametros-geral'>Outros Parâmetros</TabsTrigger>
                      <TabsTrigger value='geral-horario'>Horário de Funcionamento</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value='geral-identificacao'>
                  <div className='grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-4 items-start'>
                  <div className='order-2 lg:order-1'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='nomeComercial'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome comercial</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Nome comercial'
                              readOnly={isReadOnly || updatePending}
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
                      name='abreviatura'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Abreviatura</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Abreviatura'
                              readOnly={isReadOnly || updatePending}
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
                      name='sucursal'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sucursal</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Sucursal'
                              readOnly={isReadOnly || updatePending}
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
                      name='observacoes'
                      render={({ field }) => (
                        <FormItem className='md:col-span-1'>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Observações'
                              readOnly={isReadOnly || updatePending}
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Campos de contacto (no legado ficam dentro de "Identificação") */}
                    <FormField
                      control={form.control}
                      name='morada'
                      render={({ field }) => (
                        <FormItem className='md:col-span-1'>
                          <FormLabel>Morada</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Morada'
                              readOnly={isReadOnly || updatePending}
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
                      name='ccPostal'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Postal</FormLabel>
                          <div className='flex gap-1.5 w-full min-w-0'>
                            <FormControl className='flex-1 min-w-0'>
                              <AsyncCombobox
                                value={field.value ?? ''}
                                onChange={(codigo) => {
                                  field.onChange(codigo)
                                  const row = codigosPostais.find(
                                    (c) => c.codigo === codigo,
                                  )
                                  if (row?.localidade) {
                                    form.setValue('localidade', row.localidade)
                                  }
                                }}
                                items={cpComboboxFiltered}
                                isLoading={codigosPostaisQuery.isLoading}
                                placeholder='Pesquisar código postal…'
                                searchPlaceholder='Filtrar por código ou localidade…'
                                emptyText='Sem códigos postais.'
                                disabled={isReadOnly || updatePending}
                                searchValue={cpComboboxSearch}
                                onSearchValueChange={setCpComboboxSearch}
                              />
                            </FormControl>
                            {!isReadOnly ? (
                              <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                className='shrink-0 h-8 w-8'
                                title='Novo código postal'
                                disabled={updatePending}
                                onClick={() => setModalCodigoPostalOpen(true)}
                              >
                                <Plus className='h-4 w-4' />
                              </Button>
                            ) : null}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='localidade'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localidade</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Localidade'
                              readOnly={isReadOnly || updatePending}
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
                      name='indicativoTelefone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Indicativo Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='351'
                              readOnly={isReadOnly || updatePending}
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
                      name='telefone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Telefone'
                              readOnly={isReadOnly || updatePending}
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
                      name='telemovel'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telemovel</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Telemovel'
                              readOnly={isReadOnly || updatePending}
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
                      name='fax'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fax</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Fax'
                              readOnly={isReadOnly || updatePending}
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Email'
                              readOnly={isReadOnly || updatePending}
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
                      name='web'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Web</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Web'
                              readOnly={isReadOnly || updatePending}
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  </div>
                  <div className='order-1 lg:order-2'>
                    <FormField
                      control={form.control}
                      name='urlFoto'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foto</FormLabel>
                          <FormControl>
                            <ImageUploader
                              key={`${clinica?.id ?? 'clinica'}-${clinica?.urlFoto ?? 'sem-foto'}`}
                              uploadUrl='/client/utility/ImageUpload/upload-image'
                              fieldName='File'
                              additionalFields={{ Subfolder: 'Clinicas' }}
                              accept={{
                                'image/png': [],
                                'image/jpeg': [],
                                'image/jpg': [],
                                'image/webp': [],
                                'image/gif': [],
                              }}
                              currentImageUrl={(field.value || clinica?.urlFoto) ?? undefined}
                              enableCompression={false}
                              maxRetries={0}
                              showMetadata={false}
                              variant='default'
                              placeholder=''
                              actionButtonLabel='Foto'
                              actionButtonShowLabel={false}
                              showFileTypesHint
                              showRemoveButtonAlways={!isReadOnly}
                              disabled={isReadOnly || updatePending}
                              rootClassName='border-solid border-[#2aa89a] bg-background/0 backdrop-blur-0 w-[260px] max-w-[260px] h-[170px]'
                              actionButtonClassName='bg-[#2aa89a] text-white hover:bg-[#239b8f]'
                              placeholderIcon={<Building2 className='h-10 w-10 text-muted-foreground/40' />}
                              onUploadSuccess={(partialUrl) => field.onChange(partialUrl ?? '')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  </div>
                  </TabsContent>

                  <TabsContent value='fiscal-dados-fiscais'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='cmoeda'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Moeda</FormLabel>
                            <Select
                              value={toSelectValue(field.value)}
                              onValueChange={field.onChange}
                              disabled={
                                moedasQuery.isLoading ||
                                isReadOnly ||
                                updatePending
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Selecionar moeda…' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {moedasForSelect.map((m) => {
                                  const moedaId = (m.id ?? '').trim()
                                  if (!moedaId) return null
                                  return (
                                    <SelectItem key={moedaId} value={moedaId}>
                                      {m.descricao ?? moedaId}
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='numeroContribuinte'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nr. Contribuinte</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Nr. Contribuinte'
                                readOnly={isReadOnly || updatePending}
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
                        name='nib'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NIB</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='NIB'
                                readOnly={isReadOnly || updatePending}
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
                        name='atividade'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Atividade</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Atividade'
                                readOnly={isReadOnly || updatePending}
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
                        name='regcom'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>R. Comercial</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='R. Comercial'
                                readOnly={isReadOnly || updatePending}
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
                        name='capsocial'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cap. Social</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                step='0.01'
                                placeholder='Cap. Social'
                                readOnly={isReadOnly || updatePending}
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
                        name='cae'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CAE</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='CAE'
                                readOnly={isReadOnly || updatePending}
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
                        name='zonFisc'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zona Fiscal</FormLabel>
                            <Select
                              value={toSelectValue(field.value)}
                              onValueChange={(value) => {
                                field.onChange(value)
                                const regimeIva = resolveRegimeIvaByZonaFiscal(
                                  value,
                                  taxasIva,
                                )
                                form.setValue('tipo', regimeIva, { shouldDirty: true })
                              }}
                              disabled={isReadOnly || updatePending}
                              >
                                <FormControl>
                                  <SelectTrigger className='data-[placeholder]:text-muted-foreground'>
                                    <SelectValue placeholder='Zona fiscal'/>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value='1'>Continente</SelectItem>
                                  <SelectItem value='2'>Madeira</SelectItem>
                                  <SelectItem value='3'>Açores</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='tipo'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sistema de IVA</FormLabel>
                            <div className='flex items-center gap-3 min-w-0'>
                              <FormControl>
                                <Input
                                  className='w-full max-w-[600px]'
                                  placeholder='Sistema de IVA'
                                  readOnly={isReadOnly || updatePending}
                                  {...field}
                                  value={field.value ?? tipoWatch ?? ''}
                                />
                              </FormControl>
                              <div className='flex items-center gap-2 mr-12'>
                                <Checkbox
                                  id='clinica-iva-isento'
                                  checked={toSelectValue(field.value) === resolveRegimeIvaIsento(taxasIva)}
                                  onCheckedChange={(checked) => {
                                    if (checked === true) {
                                      form.setValue(
                                        'tipo',
                                        resolveRegimeIvaIsento(taxasIva),
                                        { shouldDirty: true },
                                      )
                                      return
                                    }
                                    const zonFiscAtual = form.getValues('zonFisc')
                                    form.setValue(
                                      'tipo',
                                      resolveRegimeIvaByZonaFiscal(
                                        zonFiscAtual,
                                        taxasIva,
                                      ),
                                      { shouldDirty: true },
                                    )
                                  }}
                                  disabled={isReadOnly || updatePending}
                                />
                                <label
                                  htmlFor='clinica-iva-isento'
                                  className='text-sm text-muted-foreground cursor-pointer'
                                >
                                  Isento
                                </label>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='portaria'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Portaria</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Portaria'
                                readOnly={isReadOnly || updatePending}
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
                        name='despachoUcc'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Despacho</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Despacho'
                                readOnly={isReadOnly || updatePending}
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
                        name='obsNotaCredito'
                        render={({ field }) => (
                          <FormItem className='md:col-start-2 md:col-span-1'>
                            <FormLabel>Nota de Crédito</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Nota de Crédito'
                                readOnly={isReadOnly || updatePending}
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value='fiscal-faturacao'>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <section className='space-y-3 rounded border border-primary/20 bg-muted/10 p-3'>
                          <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
                            Fatura/Recibo
                          </h4>

                          <FormField
                            control={form.control}
                            name='faturaRecibo'
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <RadioGroup
                                    value={field.value ?? ''}
                                    onValueChange={field.onChange}
                                    disabled={isReadOnly || updatePending}
                                  >
                                    <div className='flex gap-6'>
                                      <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <RadioGroupItem value='1' id='faturaRecibo-1-edit' />
                                        <FormLabel
                                          htmlFor='faturaRecibo-1-edit'
                                          className='!mb-0'
                                        >
                                          Fatura
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <RadioGroupItem value='2' id='faturaRecibo-2-edit' />
                                        <FormLabel
                                          htmlFor='faturaRecibo-2-edit'
                                          className='!mb-0'
                                        >
                                          Recibo
                                        </FormLabel>
                                      </FormItem>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='imprimeTicket'
                            render={({ field }) => (
                              <FormItem className='flex flex-row items-center justify-between gap-3 space-y-0'>
                                <FormLabel className='!mb-0 cursor-pointer leading-none whitespace-nowrap'>
                                  Imprime Ticket
                                </FormLabel>
                                <FormControl inline>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isReadOnly || updatePending}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='temSaft'
                            render={({ field }) => (
                              <FormItem className='flex flex-row items-center justify-between gap-3 space-y-0'>
                                <FormLabel className='!mb-0 cursor-pointer leading-none whitespace-nowrap'>
                                  Utiliza Saft
                                </FormLabel>
                                <FormControl inline>
                                  <Switch 
                                    className='!mt-2'
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isReadOnly || updatePending}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </section>

                        <section className='space-y-3 rounded border border-primary/20 bg-muted/10 p-3'>
                          <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
                            Impressão de Faturas
                          </h4>

                          <FormField
                            control={form.control}
                            name='cab'
                            render={({ field }) => (
                              <FormItem className='flex flex-row items-center justify-between gap-3 space-y-0'>
                                <FormLabel className='!mb-0 cursor-pointer leading-none whitespace-nowrap'>
                                  Imprimir Cabeçalho
                                </FormLabel>
                                <FormControl inline>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isReadOnly || updatePending}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          

                          <FormField
                            control={form.control}
                            name='faturacaoDocumentosImpressao'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Impressão de Faturas</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    value={field.value ?? ''}
                                    onValueChange={field.onChange}
                                    disabled={isReadOnly || updatePending}
                                  >
                                    <div className='flex flex-wrap gap-x-4 gap-y-2'>
                                      {[
                                        { v: 'A5', l: 'Folha A5' },
                                        { v: 'A4', l: 'Folha A4' },
                                        {
                                          v: '1/2 A4',
                                          l: '1/2 A4',
                                        },
                                        { v: 'Ticket', l: 'Ticket' },
                                        {
                                          v: 'Ticket2',
                                          l: 'Ticket c/ Serviços',
                                        },
                                      ].map((o) => (
                                        <FormItem
                                          key={o.v}
                                          className='flex items-center space-x-2 space-y-0'
                                        >
                                          <RadioGroupItem
                                            value={o.v}
                                            id={`faturacaoDoc-${o.v}-edit`}
                                          />
                                          <FormLabel
                                            htmlFor={`faturacaoDoc-${o.v}-edit`}
                                            className='!mb-0'
                                          >
                                            {o.l}
                                          </FormLabel>
                                        </FormItem>
                                      ))}
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='emailLink'
                            render={({ field }) => (
                              <FormItem className='flex flex-row items-center justify-between gap-3 space-y-0'>
                                <FormLabel className='!mb-0 cursor-pointer leading-none whitespace-nowrap'>
                                  Envia Fatura por Link
                                </FormLabel>
                                <FormControl inline>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isReadOnly || updatePending}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </section>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <section className='space-y-3 rounded border border-primary/20 bg-muted/10 p-3 md:col-span-2'>
                          <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
                            Cabeçalho dos Documentos
                          </h4>
                          <div className='rounded-md border border-input bg-background overflow-hidden'>
                            <div className='flex flex-col'>
                              {(
                                [
                                  ['linha1', 'Linha 1'],
                                  ['linha2', 'Linha 2'],
                                  ['linha3', 'Linha 3'],
                                  ['linha4', 'Linha 4'],
                                  ['linha5', 'Linha 5'],
                                  ['linha6', 'Linha 6'],
                                ] as const
                              ).map(([name], idx) => (
                                <FormField
                                  key={name}
                                  control={form.control}
                                  name={name}
                                  render={({ field }) => (
                                    <FormItem className='!space-y-0'>
                                      <FormControl>
                                        <Input
                                          readOnly={isReadOnly || updatePending}
                                          {...field}
                                          value={field.value ?? ''}
                                          className={
                                            idx < 5
                                              ? 'rounded-none border-0 border-b border-input shadow-none'
                                              : 'rounded-none border-0 shadow-none'
                                          }
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              ))}
                              <div className='border-b border-input' />
                            </div>
                          </div>
                        </section>

                        {/* (// retirar) Quotas removidas */}

                        <section className='space-y-3 rounded border border-primary/20 bg-muted/10 p-3'>
                          <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
                            Regra Faturação
                          </h4>

                          <FormField
                            control={form.control}
                            name='regrafaturacao'
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <RadioGroup
                                    value={field.value ?? ''}
                                    onValueChange={field.onChange}
                                    disabled={isReadOnly || updatePending}
                                  >
                                    <div className='flex gap-4'>
                                      <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <RadioGroupItem
                                          value='1'
                                          id='regraF-1-edit'
                                        />
                                        <FormLabel
                                          htmlFor='regraF-1-edit'
                                          className='!mb-0'
                                        >
                                          Preço Unitário (P.U.)
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <RadioGroupItem
                                          value='2'
                                          id='regraF-2-edit'
                                        />
                                        <FormLabel
                                          htmlFor='regraF-2-edit'
                                          className='!mb-0'
                                        >
                                          Preço Venda ao Público (P.V.P.)
                                        </FormLabel>
                                      </FormItem>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='valorMaxFaturaSimpli'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Valor Máximo Fatura Simplificada
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    placeholder='Valor'
                                    readOnly={isReadOnly || updatePending}
                                    {...field}
                                    value={field.value ?? ''}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </section>

                        <section className='space-y-2 rounded border border-primary/20 bg-muted/10 p-2'>
                          <h4 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
                            ATCUD
                          </h4>

                          <div className='grid grid-cols-2 gap-2'>
                            <FormField
                              control={form.control}
                              name='atUser'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Utilizador</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='Utilizador'
                                      readOnly={isReadOnly || updatePending}
                                      {...field}
                                      value={field.value ?? ''}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='atPass'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='Password'
                                      readOnly={isReadOnly || updatePending}
                                      type='password'
                                      {...field}
                                      value={field.value ?? ''}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </section>

                        <div className='space-y-3'>
                          <FormField
                            control={form.control}
                            name='motivoIsencaoDefeito'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Motivo de Isenção por Defeito</FormLabel>
                                <Select
                                  value={toSelectValue(field.value)}
                                  onValueChange={field.onChange}
                                  disabled={
                                    motivosIsencaoQuery.isLoading ||
                                    isReadOnly ||
                                    updatePending
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder='Selecionar motivo…' />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {motivosIsencaoForSelect.map((m) => (
                                      <SelectItem key={m.id} value={m.codigo}>
                                        {m.codigo}
                                        {m.descricao ? ` — ${m.descricao}` : ''}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className='space-y-3'>
                          <FormField
                            control={form.control}
                            name='armazemHabitual'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Armazém habitual</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='Código'
                                    readOnly={isReadOnly || updatePending}
                                    {...field}
                                    value={field.value ?? ''}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value='outros-parametros-geral'>
                    <TabOutrosParametrosClinica
                      form={form}
                      disabled={isReadOnly || updatePending}
                      onTratamentosPayloadChange={setTratamentosPayload}
                      configuracaoTratamentos={
                        clinica
                          ? clinica.configuracaoTratamentos ?? null
                          : undefined
                      }
                    />
                  </TabsContent>

                  <TabsContent value='fiscal-contas-regras'>
                    <TabOutrosParametrosClinica
                      form={form}
                      disabled={isReadOnly || updatePending}
                      visibleSections={[
                        'descarga',
                        'valorart',
                        'controlarAdiantamentos',
                      ]}
                      configuracaoTratamentos={
                        clinica
                          ? clinica.configuracaoTratamentos ?? null
                          : undefined
                      }
                    />
                  </TabsContent>

                  <TabsContent value='fiscal-exportacao'>
                    <TabOutrosParametrosClinica
                      form={form}
                      disabled={isReadOnly || updatePending}
                      visibleSections={['exportacao']}
                      configuracaoTratamentos={
                        clinica
                          ? clinica.configuracaoTratamentos ?? null
                          : undefined
                      }
                    />
                  </TabsContent>

                  <TabsContent value='operacao-stocks'>
                    <TabOutrosParametrosClinica
                      form={form}
                      disabled={isReadOnly || updatePending}
                      visibleSections={['descarga', 'valorart', 'stocks']}
                      configuracaoTratamentos={
                        clinica
                          ? clinica.configuracaoTratamentos ?? null
                          : undefined
                      }
                    />
                  </TabsContent>

                  <TabsContent value='atendimento-prescricao'>
                    <TabOutrosParametrosClinica
                      form={form}
                      disabled={isReadOnly || updatePending}
                      visibleSections={['artigos', 'receitas', 'atestados']}
                      configuracaoTratamentos={
                        clinica
                          ? clinica.configuracaoTratamentos ?? null
                          : undefined
                      }
                    />
                  </TabsContent>

                  <TabsContent value='atendimento-processo'>
                    <TabOutrosParametrosClinica
                      form={form}
                      disabled={isReadOnly || updatePending}
                      visibleSections={['modulosCid']}
                      configuracaoTratamentos={
                        clinica
                          ? clinica.configuracaoTratamentos ?? null
                          : undefined
                      }
                    />
                  </TabsContent>

                  <TabsContent value='atendimento-documentos'>
                    <TabOutrosParametrosClinica
                      form={form}
                      disabled={isReadOnly || updatePending}
                      visibleSections={['diretoriaDocumentos']}
                      configuracaoTratamentos={
                        clinica
                          ? clinica.configuracaoTratamentos ?? null
                          : undefined
                      }
                    />
                  </TabsContent>

                  <TabsContent value='comunicacao-envio-email'>
                    <TabOutrosParametrosClinica
                      form={form}
                      disabled={isReadOnly || updatePending}
                      visibleSections={['labels', 'envioEmail', 'kqueue']}
                      configuracaoTratamentos={
                        clinica
                          ? clinica.configuracaoTratamentos ?? null
                          : undefined
                      }
                    />
                  </TabsContent>

                  <TabsContent value='geral-horario'>
                    <TabHorarioClinica form={form} disabled={isReadOnly || updatePending} />
                  </TabsContent>

                </Tabs>
              </form>
            </Form>
          )}
        </div>

        <CreateCodigoPostalModal
          open={modalCodigoPostalOpen}
          onOpenChange={setModalCodigoPostalOpen}
          onSuccess={async (newId) => {
            await queryClient.invalidateQueries({
              queryKey: ['codigospostais-select'],
            })
            try {
              const res =
                await CodigosPostaisService('codigospostais').getCodigoPostal(
                  newId,
                )
              const d = res.info?.data
              if (d) {
                form.setValue('ccPostal', d.codigo)
                form.setValue('localidade', d.localidade ?? '')
              }
            } catch {
              toast.info(
                'Código postal criado. Selecione-o na lista quando aparecer.',
              )
            }
          }}
        />
      </DashboardPageContainer>
    </>
  )
}

