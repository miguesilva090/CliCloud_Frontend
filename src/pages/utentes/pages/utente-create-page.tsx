import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { navigateManagedWindow } from '@/utils/window-utils'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDebounce } from 'use-debounce'
import type { Resolver } from 'react-hook-form'
import { useFieldArray, useForm } from 'react-hook-form'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import Heading from '@/components/shared/heading'
import { PageHead } from '@/components/shared/page-head'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useCodigosPostaisLight,
  useConcelhosLight,
  useDistritosLight,
  useEstadosCivisLight,
  useFreguesiasLight,
  useGruposSanguineosLight,
  useProfissoesLight,
  useSexosLight,
  usePaisesLight,
  useRuasLight,
} from '@/lib/services/utility/lookups/lookups-queries'
import { Plus } from 'lucide-react'
import { ENTIDADE_TIPO } from '@/lib/entidade-tipo'
import { resolveRuaNomeToId } from '@/lib/utils/resolve-rua'
import type { CreateUtenteRequest } from '@/types/dtos/saude/utentes.dtos'
import { useCreateUtente } from '../queries/utentes-queries'
import { useFormValidationFeedback } from '@/hooks/use-form-validation-feedback'
import { TabSubsistemaSaude } from '../components/utente-edit-tabs/tab-subsistema-saude'
import {
  isZodError,
  applyZodErrorToForm,
  zodErrorToFieldErrors,
} from '@/lib/zod-error-to-field-errors'

const CONTACT_TYPES = [
  { id: 1, label: 'Telefone' },
  { id: 2, label: 'Telemóvel' },
  { id: 3, label: 'Email' },
] as const

const STATUS_OPTIONS = [
  { id: 0, label: 'Ativo' },
  { id: 1, label: 'Inativo' },
  { id: 2, label: 'Pendente' },
  { id: 3, label: 'Cancelado' },
] as const

const TIPO_CONSULTA_OPTIONS = [
  { id: 0, label: 'Não definido' },
  { id: 1, label: 'Normal' },
  { id: 2, label: 'Urgente' },
  { id: 3, label: 'Emergência' },
] as const

const TIPO_TAXA_MODERADORA_OPTIONS = [
  { id: 1, label: 'Isento' },
  { id: 2, label: 'Não isento' },
  { id: 3, label: 'E1111' },
  { id: 4, label: 'H' },
  { id: 5, label: '65' },
] as const


const CC_VALIDACAO_OPTIONS = [
  { id: 0, label: 'Não validado' },
  { id: 1, label: 'Validado' },
] as const

const CLEAR_SELECT_VALUE = '__clear__' as const

const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? null : Number(v)),
    z.number().int().min(min).max(max).nullable()
  )

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  numeroContribuinte: z.string().min(1, 'NIF é obrigatório'),
  numeroUtente: z.string().optional(),
  dataNascimento: z.string().optional(),

  // EntidadePessoa
  sexoId: z.string().nullable().optional(),
  estadoCivilId: z.string().nullable().optional(),
  nacionalidade: z.string().optional(),
  naturalidade: z.string().optional(),
  numeroCartaoIdentificacao: z.string().optional(),
  dataEmissaoCartaoIdentificacao: z.string().optional(),
  dataValidadeCartaoIdentificacao: z.string().optional(),

  // Utente
  nomePai: z.string().optional(),
  nomeMae: z.string().optional(),
  numeroSegurancaSocial: z.string().optional(),
  profissaoId: z.string().nullable().optional(),
  grupoSanguineoId: z.string().nullable().optional(),
  tipoConsulta: z.coerce.number().int().min(0).max(3),
  tipoTaxaModeradora: optionalInt(1, 5),
  migrante: z.boolean(),
  cronico: z.boolean(),
  desistencia: z.boolean(),
  aviso: z.string().optional(),
  ccValidado: optionalInt(0, 1),
  ccDataValidacao: z.string().optional(),
  dataValidadeCU: z.string().optional(),
  nDocMigrante: z.string().optional(),
  dataRegisto: z.string().optional(),

  // Morada (IDs obrigatórios; aceitar qualquer string não vazia — a API pode devolver UUID ou ID numérico)
  paisId: z.string().min(1, 'Seleciona um país'),
  distritoId: z.string().min(1, 'Seleciona um distrito'),
  concelhoId: z.string().min(1, 'Seleciona um concelho'),
  freguesiaId: z.string().min(1, 'Seleciona uma freguesia'),
  codigoPostalId: z.string().min(1, 'Seleciona um código postal'),
  rua: z.string().optional(),
  ruaId: z.string().optional(),
  numeroPorta: z.string().min(1, 'Nº porta é obrigatório'),
  andarRua: z.string().min(1, 'Andar é obrigatório'),

  observacoes: z.string().min(1, 'Observações é obrigatório'),
  status: z.coerce.number().int().min(0).max(3),

  entidadeContactos: z
    .array(
      z.object({
        entidadeContactoTipoId: z.coerce.number().int().min(1),
        // contacto (telefone/telemóvel/email) passa a opcional ao nível de validação
        valor: z.string().optional(),
        principal: z.boolean(),
      })
    )
    .optional(),
}).refine((data) => (data.rua?.trim()) || (data.ruaId?.trim()), {
  message: 'Rua é obrigatória',
  path: ['ruaId'],
})

type FormValues = z.infer<typeof schema>

export function UtenteCreatePage() {
  const navigate = useNavigate()
  const createUtente = useCreateUtente()
  const [activeTab, setActiveTab] = useState('dados-pessoais')

  const { onInvalid } = useFormValidationFeedback<FormValues>({
    setActiveTab,
    toastTitle: 'Preencha os campos indicados',
  })

  /** Submit que trata ZodError quando o resolver lança (para toast + tab + bordas vermelhas). */
  const handleSubmitSafe = (e?: React.BaseSyntheticEvent) => {
    const fn = form.handleSubmit(onSubmit, onInvalid)
    fn(e).catch((err: unknown) => {
      if (isZodError(err)) {
        applyZodErrorToForm(err, form as { setError: (name: string, opts: { message: string }) => void }, onInvalid)
      } else {
        throw err
      }
    })
  }

  // keywords para lookups (debounced)
  const [paisQ, setPaisQ] = useState('')
  const [distritoQ, setDistritoQ] = useState('')
  const [concelhoQ, setConcelhoQ] = useState('')
  const [freguesiaQ, setFreguesiaQ] = useState('')
  const [ruaQ, setRuaQ] = useState('')

  const [paisQD] = useDebounce(paisQ, 250)
  const [distritoQD] = useDebounce(distritoQ, 250)
  const [concelhoQD] = useDebounce(concelhoQ, 250)
  const [freguesiaQD] = useDebounce(freguesiaQ, 250)
  const [ruaQD] = useDebounce(ruaQ, 250)

  const paises = usePaisesLight(paisQD)
  const distritos = useDistritosLight(distritoQD)
  const concelhos = useConcelhosLight(concelhoQD)
  const freguesias = useFreguesiasLight(freguesiaQD)
  // Em "create", alinhamos com Luma: o Código Postal é inferido a partir da Rua.
  const codigosPostais = useCodigosPostaisLight('')
  const ruas = useRuasLight(ruaQD)
  const estadosCivis = useEstadosCivisLight('')
  const gruposSanguineos = useGruposSanguineosLight('')
  const profissoes = useProfissoesLight('')
  const sexos = useSexosLight('')
  const sexosList = sexos.data?.info?.data ?? []
  const estadosCivisList = estadosCivis.data?.info?.data ?? []
  const gruposSanguineosList = gruposSanguineos.data?.info?.data ?? []
  const profissoesList = profissoes.data?.info?.data ?? []

  /** Resolver que nunca lança: em falha de validação devolve erros para RHF chamar onInvalid (evita Uncaught ZodError em onBlur). */
  const resolver: Resolver<FormValues> = useCallback(
    async (values, context, options) => {
      try {
        return await zodResolver(schema)(values, context, options)
      } catch (err) {
        if (isZodError(err)) {
          const errors = zodErrorToFieldErrors<FormValues>(err)
          return { values: {} as Record<string, never>, errors }
        }
        throw err
      }
    },
    []
  )

  const form = useForm<FormValues, unknown, FormValues>({
    resolver,
    defaultValues: {
      nome: '',
      numeroContribuinte: '',
      numeroUtente: '',
      dataNascimento: '',
      sexoId: null,
      estadoCivilId: null,
      nacionalidade: '',
      naturalidade: '',
      numeroCartaoIdentificacao: '',
      dataEmissaoCartaoIdentificacao: '',
      dataValidadeCartaoIdentificacao: '',
      nomePai: '',
      nomeMae: '',
      numeroSegurancaSocial: '',
      profissaoId: null,
      grupoSanguineoId: null,
      tipoConsulta: 0,
      tipoTaxaModeradora: null,
      migrante: false,
      cronico: false,
      desistencia: false,
      aviso: '',
      ccValidado: null,
      ccDataValidacao: '',
      dataValidadeCU: '',
      nDocMigrante: '',
      dataRegisto: '',
      paisId: '',
      distritoId: '',
      concelhoId: '',
      freguesiaId: '',
      codigoPostalId: '',
      ruaId: '',
      numeroPorta: '',
      andarRua: '',
      observacoes: '-',
      status: 0,
      entidadeContactos: [
        {
          entidadeContactoTipoId: 2,
          valor: '',
          principal: true,
        },
      ],
    },
    mode: 'onBlur',
  })

  const contactos = useFieldArray({
    control: form.control,
    name: 'entidadeContactos',
  })

  const paisItems = useMemo(() => {
    const list = paises.data?.info?.data ?? []
    return list.map((p) => ({
      value: String(p.id ?? ''),
      label: p.nome || p.codigo || String(p.id ?? ''),
      secondary: p.codigo ? `Código: ${p.codigo}` : undefined,
    }))
  }, [paises.data])

  const paisIdMorada = form.watch('paisId')
  const freguesiaIdMorada = form.watch('freguesiaId')
  const codigoPostalIdMorada = form.watch('codigoPostalId')

  const distritoItems = useMemo(() => {
    const list = distritos.data?.info?.data ?? []
    const paisStr = paisIdMorada != null && paisIdMorada !== '' ? String(paisIdMorada) : ''
    const filtered = paisStr
      ? list.filter((d: { paisId?: string | number | null }) => String(d.paisId ?? '') === paisStr)
      : []
    return filtered.map((d: { id: string; nome?: string | null; paisNome?: string | null }) => ({
      value: String(d.id ?? ''),
      label: d.nome || d.id,
      secondary: d.paisNome ? `País: ${d.paisNome}` : undefined,
    }))
  }, [distritos.data, paisIdMorada])

  const distritoIdMorada = form.watch('distritoId')
  const concelhoIdMorada = form.watch('concelhoId')

  const concelhoItems = useMemo(() => {
    const list = concelhos.data?.info?.data ?? []
    const distritoStr = distritoIdMorada != null && distritoIdMorada !== '' ? String(distritoIdMorada) : ''
    const filtered = distritoStr
      ? list.filter((c: { distritoId?: string | number | null }) => String(c.distritoId ?? '') === distritoStr)
      : []
    return filtered.map((c: { id: string; nome?: string | null; distritoNome?: string | null }) => ({
      value: String(c.id ?? ''),
      label: c.nome || c.id,
      secondary: c.distritoNome ? `Distrito: ${c.distritoNome}` : undefined,
    }))
  }, [concelhos.data, distritoIdMorada])

  const freguesiaItems = useMemo(() => {
    const list = freguesias.data?.info?.data ?? []
    const concelhoStr = concelhoIdMorada != null && concelhoIdMorada !== '' ? String(concelhoIdMorada) : ''
    const filtered = concelhoStr
      ? list.filter((f: { concelhoId?: string | number | null }) => String(f.concelhoId ?? '') === concelhoStr)
      : []
    return filtered.map((f: { id: string; nome?: string | null; concelhoNome?: string | null }) => ({
      value: String(f.id ?? ''),
      label: f.nome || f.id,
      secondary: f.concelhoNome ? `Concelho: ${f.concelhoNome}` : undefined,
    }))
  }, [freguesias.data, concelhoIdMorada])

  const cpItems = useMemo(() => {
    const list = codigosPostais.data?.info?.data ?? []
    return list.map((cp) => ({
      value: String(cp.id ?? ''),
      label: cp.codigo || String(cp.id ?? ''),
      secondary: cp.localidade || undefined,
    }))
  }, [codigosPostais.data])

  const codigoPostalDisplay = useMemo(() => {
    const cpId =
      codigoPostalIdMorada != null && codigoPostalIdMorada !== '' ? String(codigoPostalIdMorada) : ''
    if (!cpId) return ''
    const cp = cpItems.find((i) => i.value === cpId)
    if (!cp) return cpId
    return cp.secondary ? `${cp.label}– ${cp.secondary}` : cp.label
  }, [cpItems, codigoPostalIdMorada])

  const ruaItems = useMemo(() => {
    const list = ruas.data?.info?.data ?? []
    const fregStr = freguesiaIdMorada != null && freguesiaIdMorada !== '' ? String(freguesiaIdMorada) : ''
    const filtered = fregStr ? list.filter((r: { freguesiaId?: string | null }) => String(r.freguesiaId ?? '') === fregStr) : list
    return filtered.map((r: { id: string; nome?: string | null; codigoPostalId?: string | number | null; codigoPostalCodigo?: string | null }) => ({
      value: String(r.id ?? ''),
      label: r.nome || String(r.id ?? ''),
      secondary: r.codigoPostalCodigo ? `CP ${r.codigoPostalCodigo}` : undefined,
      codigoPostalId: r.codigoPostalId != null && r.codigoPostalId !== '' ? String(r.codigoPostalId) : '',
    }))
  }, [ruas.data, freguesiaIdMorada])

  const onSubmit = async (values: FormValues) => {
    let ruaId = values.ruaId?.trim() ?? ''
    if (values.rua?.trim() && values.freguesiaId && values.codigoPostalId && !ruaId) {
      try {
        ruaId = await resolveRuaNomeToId(
          values.rua.trim(),
          values.codigoPostalId,
          values.freguesiaId
        )
      } catch (e) {
        const { toast } = await import('@/utils/toast-utils')
        toast.error(e instanceof Error ? e.message : 'Falha ao resolver rua', 'Rua')
        return
      }
    }
    const payload: CreateUtenteRequest = {
      // obrigatórios
      nome: values.nome,
      tipoEntidadeId: ENTIDADE_TIPO.Utente,
      email: '', // email opcional na UI (aba Contactos); backend exige string
      numeroContribuinte: values.numeroContribuinte,
      ruaId,
      codigoPostalId: values.codigoPostalId,
      freguesiaId: values.freguesiaId,
      concelhoId: values.concelhoId,
      distritoId: values.distritoId,
      paisId: values.paisId,
      numeroPorta: values.numeroPorta,
      andarRua: values.andarRua,
      observacoes: values.observacoes,
      status: values.status,
      entidadeContactos: (values.entidadeContactos ?? []).map((c) => ({
        entidadeContactoTipoId: c.entidadeContactoTipoId,
        principal: c.principal,
        valor: c.valor ?? '',
      })),

      // EntidadePessoa (opcionais)
      dataNascimento: values.dataNascimento ? values.dataNascimento : null,
      sexoId: values.sexoId ?? null,
      estadoCivilId: values.estadoCivilId ?? null,
      nacionalidade: values.nacionalidade ? values.nacionalidade : null,
      naturalidade: values.naturalidade ? values.naturalidade : null,
      numeroCartaoIdentificacao: values.numeroCartaoIdentificacao
        ? values.numeroCartaoIdentificacao
        : null,
      dataEmissaoCartaoIdentificacao: values.dataEmissaoCartaoIdentificacao
        ? values.dataEmissaoCartaoIdentificacao
        : null,
      dataValidadeCartaoIdentificacao: values.dataValidadeCartaoIdentificacao
        ? values.dataValidadeCartaoIdentificacao
        : null,

      // Utente (opcionais/flags)
      nomePai: values.nomePai ? values.nomePai : null,
      nomeMae: values.nomeMae ? values.nomeMae : null,
      numeroSegurancaSocial: values.numeroSegurancaSocial
        ? values.numeroSegurancaSocial
        : null,
      profissaoId: values.profissaoId ?? null,
      grupoSanguineoId: values.grupoSanguineoId ?? null,
      numeroUtente: values.numeroUtente ? values.numeroUtente : null,
      aviso: values.aviso ? values.aviso : null,
      desistencia: values.desistencia,
      cronico: values.cronico,
      tipoConsulta: values.tipoConsulta,
      migrante: values.migrante,
      tipoTaxaModeradora: values.tipoTaxaModeradora ?? null,
      ccValidado: values.ccValidado ?? null,
      ccDataValidacao: values.ccDataValidacao ? values.ccDataValidacao : null,
      dataValidadeCU: values.dataValidadeCU ? values.dataValidadeCU : null,
      nDocMigrante: values.nDocMigrante ? values.nDocMigrante : null,
      dataRegisto: values.dataRegisto ? values.dataRegisto : null,

      // defaults seguros (ainda não expostos no UI)
      markConsentimento: 0,
      rgpdConsentimento: 0,
      markTratamentoDados: false,
    }

    createUtente.mutate(payload)
  }

  return (
    <>
      <PageHead title='CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-6'>
          <Heading
            title='Criar Utente'
            description='Preenche os dados do utente (estrutura alinhada com o sistema legado)'
          />
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={() => navigateManagedWindow(navigate, '/utentes')}>
              Voltar
            </Button>
            <Button
              onClick={() => handleSubmitSafe()}
              disabled={createUtente.isPending}
            >
              {createUtente.isPending ? 'A gravar…' : 'Gravar Utente'}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form
            className='space-y-6'
            onSubmit={handleSubmitSafe}
          >
            <Card>
              <CardHeader>
                <CardTitle>Identificação</CardTitle>
              </CardHeader>
              <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='nome'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder='Nome completo' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='numeroContribuinte'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIF</FormLabel>
                      <FormControl>
                        <Input placeholder='Número de contribuinte' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='numeroUtente'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº Utente (SNS)</FormLabel>
                      <FormControl>
                        <Input placeholder='Opcional' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='dataNascimento'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data nascimento</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select
                          value={String(field.value)}
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Seleciona…' />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
              <TabsList>
                <TabsTrigger value='dados-pessoais'>Dados Pessoais</TabsTrigger>
                <TabsTrigger value='morada'>Morada</TabsTrigger>
                <TabsTrigger value='contactos'>Contactos</TabsTrigger>
                <TabsTrigger value='sns'>Informação SNS</TabsTrigger>
                <TabsTrigger value='subsistema'>Subsistema de Saúde</TabsTrigger>
                <TabsTrigger value='outras'>Outras Informações</TabsTrigger>
                <TabsTrigger value='avisos'>Avisos</TabsTrigger>
                <TabsTrigger value='documentos'>Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value='dados-pessoais' className='mt-4' data-fields='nome,numeroContribuinte,numeroUtente,dataNascimento,status,sexoId,estadoCivilId,nacionalidade,naturalidade,nomePai,nomeMae,numeroCartaoIdentificacao,dataEmissaoCartaoIdentificacao,dataValidadeCartaoIdentificacao'>
                <Card>
                  <CardHeader>
                    <CardTitle>Dados pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='sexoId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexo</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ?? ''}
                              onValueChange={(v) =>
                                field.onChange(v === CLEAR_SELECT_VALUE || v === '' ? null : v)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Seleciona…' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={CLEAR_SELECT_VALUE}>—</SelectItem>
                                {sexosList.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.descricao}
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
                      name='estadoCivilId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado civil</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ?? ''}
                              onValueChange={(v) =>
                                field.onChange(v === CLEAR_SELECT_VALUE || v === '' ? null : v)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Seleciona…' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={CLEAR_SELECT_VALUE}>—</SelectItem>
                                {estadosCivisList.map((ec) => (
                                  <SelectItem key={ec.id} value={ec.id}>
                                    {ec.descricao}
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
                      name='nacionalidade'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nacionalidade</FormLabel>
                          <FormControl>
                            <Input placeholder='Ex.: Portuguesa' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='naturalidade'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Naturalidade</FormLabel>
                          <FormControl>
                            <Input placeholder='Ex.: Lisboa' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='nomePai'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do pai</FormLabel>
                          <FormControl>
                            <Input placeholder='Opcional' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='nomeMae'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da mãe</FormLabel>
                          <FormControl>
                            <Input placeholder='Opcional' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='numeroCartaoIdentificacao'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nº Cartão de Identificação</FormLabel>
                          <FormControl>
                            <Input placeholder='Opcional' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='dataEmissaoCartaoIdentificacao'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data emissão (CC)</FormLabel>
                          <FormControl>
                            <Input type='date' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='dataValidadeCartaoIdentificacao'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data validade (CC)</FormLabel>
                          <FormControl>
                            <Input type='date' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='morada' className='mt-4' data-fields='paisId,distritoId,concelhoId,freguesiaId,codigoPostalId,rua,ruaId,numeroPorta,andarRua'>
                <Card>
                  <CardHeader>
                    <CardTitle>Morada</CardTitle>
                  </CardHeader>
                  <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='paisId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <div className='flex gap-1.5 w-full min-w-0'>
                            <div className='flex-1 min-w-0'>
                              <FormControl>
                                <AsyncCombobox
                                  className='h-9'
                                  value={field.value != null && field.value !== '' ? String(field.value) : ''}
                                  onChange={(v) => {
                                    const next = v != null && v !== '' ? String(v) : ''
                                    field.onChange(next)
                                    form.clearErrors('paisId')
                                    form.setValue('distritoId', '')
                                    form.setValue('concelhoId', '')
                                    form.setValue('freguesiaId', '')
                                    form.setValue('codigoPostalId', '')
                                    form.setValue('ruaId', '')
                                    form.setValue('rua', '')
                                  }}
                                  items={paisItems}
                                  isLoading={paises.isFetching}
                                  placeholder='Selecionar país…'
                                  searchPlaceholder='Pesquisar país…'
                                  searchValue={paisQ}
                                  onSearchValueChange={setPaisQ}
                                />
                              </FormControl>
                            </div>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='shrink-0 h-9 w-9'
                              title='Adicionar país'
                              onClick={() =>
                                navigateManagedWindow(
                                  navigate,
                                  '/area-comum/tabelas/tabelas/geograficas/paises'
                                )
                              }
                            >
                              <Plus className='h-4 w-4' />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='distritoId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distrito</FormLabel>
                          <div className='flex gap-1.5 w-full min-w-0'>
                            <div className='flex-1 min-w-0'>
                              <FormControl>
                                <AsyncCombobox
                                  className='h-9'
                                  value={field.value != null && field.value !== '' ? String(field.value) : ''}
                                  onChange={(v) => {
                                    const next = v != null && v !== '' ? String(v) : ''
                                    field.onChange(next)
                                    form.clearErrors('distritoId')
                                    form.setValue('concelhoId', '')
                                    form.setValue('freguesiaId', '')
                                    form.setValue('codigoPostalId', '')
                                    form.setValue('ruaId', '')
                                    form.setValue('rua', '')
                                  }}
                                  items={distritoItems}
                                  isLoading={distritos.isFetching}
                                  placeholder={paisIdMorada ? 'Selecionar distrito…' : 'Selecione primeiro o país'}
                                  searchPlaceholder='Pesquisar distrito…'
                                  searchValue={distritoQ}
                                  onSearchValueChange={setDistritoQ}
                                />
                              </FormControl>
                            </div>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='shrink-0 h-9 w-9'
                              title='Adicionar distrito'
                              onClick={() =>
                                navigateManagedWindow(
                                  navigate,
                                  '/area-comum/tabelas/tabelas/geograficas/distritos'
                                )
                              }
                            >
                              <Plus className='h-4 w-4' />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='concelhoId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Concelho</FormLabel>
                          <div className='flex gap-1.5 w-full min-w-0'>
                            <div className='flex-1 min-w-0'>
                              <FormControl>
                                <AsyncCombobox
                                  className='h-9'
                                  value={field.value != null && field.value !== '' ? String(field.value) : ''}
                                  onChange={(v) => {
                                    const next = v != null && v !== '' ? String(v) : ''
                                    field.onChange(next)
                                    form.clearErrors('concelhoId')
                                    form.setValue('freguesiaId', '')
                                    form.setValue('codigoPostalId', '')
                                    form.setValue('ruaId', '')
                                    form.setValue('rua', '')
                                  }}
                                  items={concelhoItems}
                                  isLoading={concelhos.isFetching}
                                  placeholder={distritoIdMorada ? 'Selecionar concelho…' : 'Selecione primeiro o distrito'}
                                  searchPlaceholder='Pesquisar concelho…'
                                  searchValue={concelhoQ}
                                  onSearchValueChange={setConcelhoQ}
                                />
                              </FormControl>
                            </div>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='shrink-0 h-9 w-9'
                              title='Adicionar concelho'
                              onClick={() =>
                                navigateManagedWindow(
                                  navigate,
                                  '/area-comum/tabelas/tabelas/geograficas/concelhos'
                                )
                              }
                            >
                              <Plus className='h-4 w-4' />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='freguesiaId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Freguesia</FormLabel>
                          <div className='flex gap-1.5 w-full min-w-0'>
                            <div className='flex-1 min-w-0'>
                              <FormControl>
                                <AsyncCombobox
                                  className='h-9'
                                  value={field.value != null && field.value !== '' ? String(field.value) : ''}
                                  onChange={(v) => {
                                    const next = v != null && v !== '' ? String(v) : ''
                                    field.onChange(next)
                                    form.clearErrors('freguesiaId')
                                    form.setValue('codigoPostalId', '')
                                    form.setValue('ruaId', '')
                                    form.setValue('rua', '')
                                  }}
                                  items={freguesiaItems}
                                  isLoading={freguesias.isFetching}
                                  placeholder={concelhoIdMorada ? 'Selecionar freguesia…' : 'Selecione primeiro o concelho'}
                                  searchPlaceholder='Pesquisar freguesia…'
                                  searchValue={freguesiaQ}
                                  onSearchValueChange={setFreguesiaQ}
                                />
                              </FormControl>
                            </div>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='shrink-0 h-9 w-9'
                              title='Adicionar freguesia'
                              onClick={() =>
                                navigateManagedWindow(
                                  navigate,
                                  '/area-comum/tabelas/tabelas/geograficas/freguesias'
                                )
                              }
                            >
                              <Plus className='h-4 w-4' />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='codigoPostalId'
                      render={() => (
                        <FormItem>
                          <FormLabel>Código Postal *</FormLabel>
                          <div className='flex gap-1.5 w-full min-w-0'>
                            <div className='flex-1 min-w-0'>
                              <FormControl>
                                <Input readOnly className='h-9' value={codigoPostalDisplay} />
                              </FormControl>
                            </div>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='shrink-0 h-9 w-9'
                              title='Adicionar código postal'
                              onClick={() =>
                                navigateManagedWindow(
                                  navigate,
                                  '/area-comum/tabelas/tabelas/geograficas/codigospostais'
                                )
                              }
                            >
                              <Plus className='h-4 w-4' />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='ruaId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rua *</FormLabel>
                          <div className='flex gap-1.5 w-full min-w-0'>
                            <div className='flex-1 min-w-0'>
                              <FormControl>
                                <AsyncCombobox
                                  className='h-9'
                                  value={field.value != null && field.value !== '' ? String(field.value) : ''}
                                  onChange={(v) => {
                                    const next = v != null && v !== '' ? String(v) : ''
                                    field.onChange(next)
                                    form.clearErrors('ruaId')
                                    const selected = ruaItems.find((i) => i.value === next) as (typeof ruaItems)[number] | undefined
                                    form.setValue('rua', selected?.label ?? '')
                                    form.setValue('codigoPostalId', (selected as any)?.codigoPostalId ?? '')
                                    form.clearErrors('codigoPostalId')
                                  }}
                                  items={ruaItems}
                                  isLoading={ruas.isFetching}
                                  placeholder={
                                    freguesiaIdMorada ? 'Selecionar rua…' : 'Selecione primeiro a freguesia'
                                  }
                                  searchPlaceholder='Pesquisar rua…'
                                  searchValue={ruaQ}
                                  onSearchValueChange={setRuaQ}
                                />
                              </FormControl>
                            </div>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='shrink-0 h-9 w-9'
                              title='Adicionar rua'
                              onClick={() => {
                                const params = new URLSearchParams()
                                const paisId = String(form.watch('paisId') ?? '').trim()
                                const distritoId = String(form.watch('distritoId') ?? '').trim()
                                const concelhoId = String(form.watch('concelhoId') ?? '').trim()
                                const freguesiaId = String(form.watch('freguesiaId') ?? '').trim()
                                const codigoPostalId = String(form.watch('codigoPostalId') ?? '').trim()
                                if (paisId) params.set('paisId', paisId)
                                if (distritoId) params.set('distritoId', distritoId)
                                if (concelhoId) params.set('concelhoId', concelhoId)
                                if (freguesiaId) params.set('freguesiaId', freguesiaId)
                                if (codigoPostalId) params.set('codigoPostalId', codigoPostalId)
                                const qs = params.toString()
                                navigateManagedWindow(
                                  navigate,
                                  `/area-comum/tabelas/tabelas/geograficas/ruas${qs ? `?${qs}` : ''}`
                                )
                              }}
                              disabled={!freguesiaIdMorada}
                            >
                              <Plus className='h-4 w-4' />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='numeroPorta'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nº Porta</FormLabel>
                          <FormControl>
                            <Input placeholder='Ex.: 12' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='andarRua'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Andar</FormLabel>
                          <FormControl>
                            <Input placeholder='Ex.: 1º Esq.' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='contactos' className='mt-4' data-fields='entidadeContactos'>
                <Card>
                  <CardHeader>
                    <CardTitle>Contactos</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {contactos.fields.map((f, idx) => (
                      <div
                        key={f.id}
                        className='grid grid-cols-1 md:grid-cols-12 gap-3 items-end'
                      >
                        <FormField
                          control={form.control}
                          name={`entidadeContactos.${idx}.entidadeContactoTipoId`}
                          render={({ field }) => (
                            <FormItem className='md:col-span-3'>
                              <FormLabel>Tipo</FormLabel>
                              <FormControl>
                                <Select
                                  value={String(field.value)}
                                  onValueChange={(v) =>
                                    field.onChange(Number(v))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Seleciona…' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CONTACT_TYPES.map((t) => (
                                      <SelectItem
                                        key={t.id}
                                        value={String(t.id)}
                                      >
                                        {t.label}
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
                          name={`entidadeContactos.${idx}.valor`}
                          render={({ field }) => (
                            <FormItem className='md:col-span-7'>
                              <FormLabel>Valor</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Ex.: 912 345 678'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`entidadeContactos.${idx}.principal`}
                          render={({ field }) => (
                            <FormItem className='md:col-span-2'>
                              <FormLabel>Principal</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value ? '1' : '0'}
                                  onValueChange={(v) =>
                                    field.onChange(v === '1')
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='1'>Sim</SelectItem>
                                    <SelectItem value='0'>Não</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='md:col-span-12 flex justify-end'>
                          {contactos.fields.length > 1 ? (
                            <Button
                              type='button'
                              variant='outline'
                              onClick={() => contactos.remove(idx)}
                            >
                              Remover
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}

                    <div className='flex justify-end'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() =>
                          contactos.append({
                            entidadeContactoTipoId: 1,
                            valor: '',
                            principal: false,
                          })
                        }
                      >
                        + Adicionar contacto
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='sns' className='mt-4' data-fields='numeroSegurancaSocial,tipoTaxaModeradora'>
                <Card>
                  <CardHeader>
                    <CardTitle>Informação SNS / Clínica</CardTitle>
                  </CardHeader>
                  <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='numeroSegurancaSocial'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nº Segurança Social</FormLabel>
                          <FormControl>
                            <Input placeholder='Opcional' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='profissaoId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profissão</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value != null ? String(field.value) : ''}
                              onValueChange={(v) =>
                                field.onChange(v === CLEAR_SELECT_VALUE || v === '' ? null : v)
                              }
                            >
                              <SelectTrigger className='h-9 w-full min-w-0'>
                                <SelectValue placeholder='Seleciona…' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={CLEAR_SELECT_VALUE}>—</SelectItem>
                                {profissoesList.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.descricao ?? p.id}
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
                      name='grupoSanguineoId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grupo sanguíneo</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ?? ''}
                              onValueChange={(v) =>
                                field.onChange(v === CLEAR_SELECT_VALUE || v === '' ? null : v)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Seleciona…' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={CLEAR_SELECT_VALUE}>—</SelectItem>
                                {gruposSanguineosList.map((gs) => (
                                  <SelectItem key={gs.id} value={gs.id}>
                                    {gs.descricao}
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
                      name='tipoConsulta'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo consulta</FormLabel>
                          <FormControl>
                            <Select
                              value={String(field.value)}
                              onValueChange={(v) => field.onChange(Number(v))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Seleciona…' />
                              </SelectTrigger>
                              <SelectContent>
                                {TIPO_CONSULTA_OPTIONS.map((o) => (
                                  <SelectItem key={o.id} value={String(o.id)}>
                                    {o.label}
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
                      name='tipoTaxaModeradora'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tx. moderadora</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value === null ? '' : String(field.value)}
                              onValueChange={(v) =>
                                field.onChange(v === CLEAR_SELECT_VALUE || v === '' ? null : Number(v))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Seleciona…' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={CLEAR_SELECT_VALUE}>—</SelectItem>
                                {TIPO_TAXA_MODERADORA_OPTIONS.map((o) => (
                                  <SelectItem key={o.id} value={String(o.id)}>
                                    {o.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 md:col-span-2'>
                      <FormField
                        control={form.control}
                        name='migrante'
                        render={({ field }) => (
                          <FormItem className='flex items-center gap-2 space-y-0 rounded-md border p-3'>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(v) => field.onChange(!!v)}
                              />
                            </FormControl>
                            <FormLabel className='m-0'>Migrante</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='cronico'
                        render={({ field }) => (
                          <FormItem className='flex items-center gap-2 space-y-0 rounded-md border p-3'>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(v) => field.onChange(!!v)}
                              />
                            </FormControl>
                            <FormLabel className='m-0'>Crónico</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='desistencia'
                        render={({ field }) => (
                          <FormItem className='flex items-center gap-2 space-y-0 rounded-md border p-3'>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(v) => field.onChange(!!v)}
                              />
                            </FormControl>
                            <FormLabel className='m-0'>Desistência</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name='ccValidado'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CC validado</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value === null ? '' : String(field.value)}
                              onValueChange={(v) =>
                                field.onChange(v === CLEAR_SELECT_VALUE || v === '' ? null : Number(v))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Seleciona…' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={CLEAR_SELECT_VALUE}>—</SelectItem>
                                {CC_VALIDACAO_OPTIONS.map((o) => (
                                  <SelectItem key={o.id} value={String(o.id)}>
                                    {o.label}
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
                      name='ccDataValidacao'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data validação CC</FormLabel>
                          <FormControl>
                            <Input type='datetime-local' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='dataValidadeCU'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data validade CU</FormLabel>
                          <FormControl>
                            <Input type='date' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='nDocMigrante'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nº doc. migrante</FormLabel>
                          <FormControl>
                            <Input placeholder='Opcional' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='subsistema' className='mt-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>Subsistema de Saúde</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TabSubsistemaSaude form={form as unknown as React.ComponentProps<typeof TabSubsistemaSaude>['form']} utente={undefined} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='outras' className='mt-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>Outras informações</CardTitle>
                  </CardHeader>
                  <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='dataRegisto'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de registo</FormLabel>
                          <FormControl>
                            <Input type='datetime-local' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='md:col-span-2' />
                    <FormField
                      control={form.control}
                      name='observacoes'
                      render={({ field }) => (
                        <FormItem className='md:col-span-2'>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder='Notas internas…'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='avisos' className='mt-4' data-fields='observacoes'>
                <Card>
                  <CardHeader>
                    <CardTitle>Avisos</CardTitle>
                  </CardHeader>
                  <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='aviso'
                      render={({ field }) => (
                        <FormItem className='md:col-span-2'>
                          <FormLabel>Aviso</FormLabel>
                          <FormControl>
                            <Textarea rows={3} placeholder='Aviso clínico…' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='documentos' className='mt-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-sm text-muted-foreground'>
                      Placeholder — quando definirmos no backend como anexar/associar
                      documentos ao utente (upload + listagem), ligamos aqui.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className='flex items-center justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigateManagedWindow(navigate, '/utentes')}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={createUtente.isPending}>
                {createUtente.isPending ? 'A gravar…' : 'Gravar Utente'}
              </Button>
            </div>
          </form>
        </Form>
      </DashboardPageContainer>
    </>
  )
}

