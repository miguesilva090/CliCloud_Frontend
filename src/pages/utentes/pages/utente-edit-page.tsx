import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { toast } from '@/utils/toast-utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Save } from 'lucide-react'
import { EntityFormPageHeader } from '@/components/shared/entity-form-page-header'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import type { UtenteEditFormValues } from '../types/utente-edit-form-types'
import { resolveRuaNomeToId } from '@/lib/utils/resolve-rua'
import { useCreateUtente, useGetUtente, useUpdateUtente } from '../queries/utentes-queries'
import { useFormValidationFeedback } from '@/hooks/use-form-validation-feedback'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useCurrentWindowId, handleWindowClose } from '@/utils/window-utils'
import { useTabManager } from '@/hooks/use-tab-manager'
import { utenteEditDefaultValues, utenteEditSchema } from '../utils/utente-edit-form'
import { buildCreatePayload, buildUpdatePayload } from '../utils/utente-edit-payload'
import { UTENTE_FIELD_LABELS, UTENTE_FIELD_TO_TAB, UTENTE_FORM_FIELD_ORDER } from '../utils/utente-edit-validation'
import { TabDadosPessoais } from '../components/utente-edit-tabs/tab-dados-pessoais'
import { TabContactos } from '../components/utente-edit-tabs/tab-contactos'
import { TabSubsistemaSaude } from '../components/utente-edit-tabs/tab-subsistema-saude'
import { TabInformacaoSNS } from '../components/utente-edit-tabs/tab-informacao-sns'
import { TabOutrasInformacoes } from '../components/utente-edit-tabs/tab-outras-informacoes'
import { TabAvisos } from '../components/utente-edit-tabs/tab-avisos'
import { TabDocumentos } from '../components/utente-edit-tabs/tab-documentos'
import { usePaisesLight, useSexosLight } from '@/lib/services/utility/lookups/lookups-queries'

type FormFieldKey = Extract<keyof UtenteEditFormValues, string>
type RnuPrefillPayload = {
  nome?: string
  numeroUtente?: string
  dataNascimento?: string
  sexoCodigo?: string
  paisNacionalidade?: string
  condicaoSns?: number | null
  entidadeResponsavelCodigo?: string
  entidadeResponsavelDescricao?: string
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function UtenteEditPage() {
  const navigate = useNavigate()
  const windowId = useCurrentWindowId()
  const removeWindow = useWindowsStore((s) => s.removeWindow)
  const params = useParams<{ id: string }>()
  const id = params.id ?? ''
  const queryClient = useQueryClient()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const instanceId = searchParams.get('instanceId') ?? 'default'
  const isReadOnly = searchParams.get('mode') === 'view'
  const fromParam = searchParams.get('from')
  void fromParam
  void location
  const { activeTab, setActiveTab } = useTabManager({ defaultTab: 'dados-pessoais' })
  const isCreate = !id

  const { data, isLoading } = useGetUtente(id)
  const utente = data?.info?.data
  const requiredFieldOrder = UTENTE_FORM_FIELD_ORDER as FormFieldKey[]
  const updateUtente = useUpdateUtente(id, {
    onServerValidationError: (fieldKey) => {
      const serverFieldKey = typeof fieldKey === 'string' ? fieldKey : null
      const keyToFocus = serverFieldKey && UTENTE_FIELD_TO_TAB[serverFieldKey]
        ? serverFieldKey
        : requiredFieldOrder.find((key) => {
            const v = form.getValues(key)
            return v === '' || v == null || (typeof v === 'string' && !v.trim())
          })
      if (keyToFocus && UTENTE_FIELD_TO_TAB[keyToFocus]) {
        setActiveTab(UTENTE_FIELD_TO_TAB[keyToFocus])
        form.setError(keyToFocus as keyof UtenteEditFormValues, {
          type: 'server',
          message: UTENTE_FIELD_LABELS[keyToFocus]
            ? `${UTENTE_FIELD_LABELS[keyToFocus]} é obrigatório.`
            : 'Este campo é obrigatório.',
        })
        requestAnimationFrame(() => {
          form.setFocus(keyToFocus as keyof UtenteEditFormValues)
        })
      }
    },
  })
  const createUtente = useCreateUtente()

  const form = useForm<UtenteEditFormValues>({
    resolver: zodResolver(utenteEditSchema),
    defaultValues: utenteEditDefaultValues,
    mode: 'onBlur',
  })
  const [rnuPrefill, setRnuPrefill] = useState<RnuPrefillPayload | null>(null)
  const sexos = useSexosLight('').data?.info?.data ?? []
  const paises = usePaisesLight('').data?.info?.data ?? []

  useEffect(() => {
    if (!isCreate) return
    const key = `utente-create-draft-${instanceId}`
    const raw = sessionStorage.getItem(key)
    const rnuRaw = sessionStorage.getItem('rnu-prefill-utente-create')
    if (!raw && !rnuRaw) return

    let draft: Partial<UtenteEditFormValues> = {}
    let rnuPrefill: Partial<UtenteEditFormValues> = {}

    if (raw) {
      try {
        draft = JSON.parse(raw) as Partial<UtenteEditFormValues>
      } catch {
        // ignore invalid draft payload
      }
    }

    if (rnuRaw) {
      try {
        const rnu = JSON.parse(rnuRaw) as RnuPrefillPayload
        setRnuPrefill(rnu)
        rnuPrefill = {
          nome: rnu.nome?.trim() ?? '',
          numeroUtente: rnu.numeroUtente?.trim() ?? '',
          dataNascimento: rnu.dataNascimento?.trim() ?? '',
          condicaoSns: rnu.condicaoSns ?? null,
        }
      } catch {
        // ignore invalid RNU payload
      } finally {
        sessionStorage.removeItem('rnu-prefill-utente-create')
      }
    }

    form.reset({
      ...utenteEditDefaultValues,
      ...draft,
      ...rnuPrefill,
    })
  }, [isCreate, instanceId, form])

  useEffect(() => {
    if (!isCreate || !rnuPrefill) return

    const sexoCodigo = rnuPrefill.sexoCodigo?.trim().toUpperCase()
    if (sexoCodigo && sexos.length === 0) return

    if (sexoCodigo) {
      const sexoMatch = sexos.find((s) => {
        const codigo = ((s as { codigo?: string }).codigo ?? '').toString().trim().toUpperCase()
        const descricao = (s.descricao ?? '').toString().trim().toUpperCase()
        if (codigo === sexoCodigo || descricao === sexoCodigo) return true

        // fallback para cenários comuns: M/F vs Masculino/Feminino
        if (sexoCodigo === 'M' && (codigo.startsWith('M') || descricao.startsWith('M'))) return true
        if (sexoCodigo === 'F' && (codigo.startsWith('F') || descricao.startsWith('F'))) return true
        return false
      })
      if (sexoMatch?.id) {
        form.setValue('sexoId', sexoMatch.id, { shouldDirty: true })
      }
    }

    const paisNacionalidade = rnuPrefill.paisNacionalidade?.trim()
    if (paisNacionalidade) {
      const target = paisNacionalidade.toUpperCase()
      const paisMatch = paises.find((p) =>
        (p.codigo ?? '').toString().trim().toUpperCase() === target
        || (p.nome ?? '').toString().trim().toUpperCase() === target
        || (p.id ?? '').toString().trim().toUpperCase() === target
      )
      const nacionalidadeValue = paisMatch
        ? (paisMatch.nome ?? paisMatch.codigo ?? String(paisMatch.id ?? ''))
        : paisNacionalidade
      if (nacionalidadeValue) {
        form.setValue('nacionalidade', nacionalidadeValue, { shouldDirty: true })
      }
    }

    if (rnuPrefill.condicaoSns != null) {
      form.setValue('condicaoSns', rnuPrefill.condicaoSns, { shouldDirty: true })
    }

    setRnuPrefill(null)
  }, [isCreate, rnuPrefill, sexos, paises, form])

  useEffect(() => {
    if (!isCreate) return
    const key = `utente-create-draft-${instanceId}`
    const subscription = form.watch((values) => {
      sessionStorage.setItem(key, JSON.stringify(values))
    })
    return () => subscription.unsubscribe()
  }, [isCreate, instanceId, form])

  useEffect(() => {
    if (!isCreate || !createUtente.isSuccess) return
    const key = `utente-create-draft-${instanceId}`
    sessionStorage.removeItem(key)
  }, [isCreate, createUtente.isSuccess, instanceId])

  useEffect(() => {
    if (!isCreate) return

    const refreshAddressLookups = () => {
      queryClient.invalidateQueries({ queryKey: ['utility', 'pais', 'light'] })
      queryClient.invalidateQueries({ queryKey: ['utility', 'distrito', 'light'] })
      queryClient.invalidateQueries({ queryKey: ['utility', 'concelho', 'light'] })
      queryClient.invalidateQueries({ queryKey: ['utility', 'freguesia', 'light'] })
      queryClient.invalidateQueries({ queryKey: ['utility', 'codigo-postal', 'light'] })
      queryClient.invalidateQueries({ queryKey: ['utility', 'rua', 'light'] })
    }

    const onFocus = () => refreshAddressLookups()
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshAddressLookups()
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [isCreate, queryClient])

  useEffect(() => {
    if (!utente) return
    const emailContacto = utente.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 3)?.valor ?? ''
    const telefoneContacto = utente.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 1)?.valor ?? ''
    const telemovelContacto = utente.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 2)?.valor ?? ''
    form.reset({
      nome: utente.nome ?? '',
      email: utente.email ?? emailContacto ?? '',
      numeroContribuinte: utente.numeroContribuinte ?? '',
      numeroUtente: utente.numeroUtente ?? '',
      observacoes: utente.observacoes ?? '',
      status: utente.status ?? 0,
      statusSelecionado: utente.status != null,
      aviso: utente.aviso ?? '',
      desistencia: utente.desistencia ?? false,
      tipoConsulta: utente.tipoConsulta ?? 0,
      dataNascimento: utente.dataNascimento ?? '',
      dataEmissaoCartaoIdentificacao: utente.dataEmissaoCartaoIdentificacao ?? '',
      dataValidadeCartaoIdentificacao: utente.dataValidadeCartaoIdentificacao ?? '',
      sexoId: utente.sexoId ?? null,
      estadoCivilId: utente.estadoCivilId ?? null,
      habilitacaoId: utente.habilitacaoId ?? null,
      grupoSanguineoId: utente.grupoSanguineoId ?? null,
      cronico: utente.cronico ?? false,
      numeroCartaoIdentificacao: utente.numeroCartaoIdentificacao ?? '',
      nomeMae: utente.nomeMae ?? '',
      nomePai: utente.nomePai ?? '',
      naturalidade: utente.naturalidade ?? '',
      nacionalidade: utente.nacionalidade ?? '',
      profissaoId: utente.profissaoId ?? null,
      arquivo: utente.arquivo ?? '',
      ccValidado: utente.ccValidado ?? null,
      ccDataValidacao: utente.ccDataValidacao ?? '',
      paisId: utente.paisId ?? '',
      distritoId: utente.distritoId ?? '',
      concelhoId: utente.concelhoId ?? '',
      freguesiaId: utente.freguesiaId ?? '',
      codigoPostalId: utente.codigoPostalId ?? '',
      rua: utente.rua?.nome ?? (utente.rua as { Nome?: string })?.Nome ?? '',
      ruaId: utente.ruaId ?? '',
      numeroPorta: utente.numeroPorta ?? '',
      andarRua: utente.andarRua ?? '',
      morada: '',
      indicativoTelefone: '+351',
      telefone: telefoneContacto,
      telemovel: telemovelContacto,
      numeroSegurancaSocial: utente.numeroSegurancaSocial ?? '',
      tipoTaxaModeradora: utente.tipoTaxaModeradora ?? null,
      migrante: utente.migrante ?? false,
      nDocMigrante: utente.nDocMigrante ?? '',
      condicaoSns: utente.condicaoSns ?? null,
      entidadeFinanceiraResponsavelId: utente.entidadeFinanceiraResponsavelId ?? null,
      numeroBeneficiarioEfr: utente.numeroBeneficiarioEfr ?? '',
      dataValidadeEfr: utente.dataValidadeEfr ?? '',
      migranteTipoCartao: utente.migranteTipoCartao ?? '',
      provenienciaUtenteId: utente.provenienciaUtenteId ?? null,
      organismoId: utente.organismoId ?? null,
      seguradoraId: utente.seguradoraId ?? null,
      empresaId: utente.empresaId ?? null,
      centroSaudeId: utente.centroSaudeId ?? null,
      medicoExternoId: utente.medicoExternoId ?? null,
      medicoId: utente.medicoId ?? null,
      subsistemaLinhas:
        (utente.subsistemaLinhas as UtenteDTO['subsistemaLinhas'] | undefined)?.map((linha) => {
          const L = linha as unknown as Record<string, unknown>
          const empresa = (L.empresa ?? L.Empresa) as { id?: string; nome?: string | null } | undefined
          const empresaIdFromLinha = (L.empresaId ?? L.EmpresaId ?? empresa?.id ?? null) as string | null
          const empresaIdNorm =
            empresaIdFromLinha != null && String(empresaIdFromLinha).trim() !== ''
              ? String(empresaIdFromLinha).trim()
              : null
          return {
            organismoId: (L.organismoId ?? L.OrganismoId ?? null) as string | null,
            designacao: (L.designacao ?? L.Designacao ?? '') as string,
            numeroBeneficiario: (L.numeroBeneficiario ?? L.NumeroBeneficiario ?? '') as string,
            sigla: (L.sigla ?? L.Sigla ?? '') as string,
            nomeBeneficiario: (L.nomeBeneficiario ?? L.NomeBeneficiario ?? '') as string,
            dataCartao: (L.dataCartao ?? L.DataCartao ?? '') as string,
            numeroApolice: (L.numeroApolice ?? L.NumeroApolice ?? '') as string,
            empresaId: empresaIdNorm,
            empresaNome: (empresa?.nome ?? '') as string,
          }
        }) ?? [],
    })
  }, [utente, form])

  const canSave = isCreate
    ? !createUtente.isPending
    : !!id && !!utente && !updateUtente.isPending

  const onSubmit = async (values: UtenteEditFormValues) => {
    let ruaId = values.ruaId?.trim() ?? ''
    if (values.rua?.trim() && values.freguesiaId && values.codigoPostalId && !ruaId) {
      try {
        ruaId = await resolveRuaNomeToId(
          values.rua.trim(),
          values.codigoPostalId,
          values.freguesiaId
        )
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Falha ao resolver rua', 'Rua')
        return
      }
    }
    const payloadValues = { ...values, ruaId }
    if (isCreate) {
      const payload = buildCreatePayload(payloadValues)
      createUtente.mutate(payload)
      return
    }
    if (!utente) return
    const payload = buildUpdatePayload(utente, payloadValues)
    updateUtente.mutate(payload)
  }

  const { onInvalid } = useFormValidationFeedback<UtenteEditFormValues>({
    setActiveTab,
    toastTitle: 'Preencha os campos indicados',
  })

  return (
    <>
      <PageHead title={`CliCloud`} />
      <DashboardPageContainer>
        <EntityFormPageHeader
          title={isCreate ? 'Criar Utente' : isReadOnly ? 'Ver Utente' : 'Editar Utente'}
          onBack={() => handleWindowClose(windowId, navigate, removeWindow)}
          onRefresh={() =>
            isCreate
              ? queryClient.invalidateQueries({ queryKey: ['utentes-paginated'] })
              : queryClient.invalidateQueries({ queryKey: ['utente', id] })
          }
          rightActions={
            !isReadOnly ? (
              <Button
                type='submit'
                form='utente-edit-form'
                disabled={!canSave}
                size='sm'
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                <Save className='h-4 w-4 mr-2' />
                Gravar Utente
              </Button>
            ) : null
          }
        />

        {/* Conteúdo numa única “janela” ligada à barra de título (igual à Listagem de Utentes) */}
        <div className='rounded-b-lg border border-t-0 bg-background'>
          {isCreate ? (
            <Form {...form}>
              <form id='utente-edit-form' onSubmit={form.handleSubmit(onSubmit, onInvalid)} className='space-y-0'>
                {/* Barra superior: Nome | (sem data de registo) | Botões */}
                <div className='border-b bg-muted/30 px-4 py-4'>
                  <div className='flex flex-col sm:flex-row sm:items-end gap-4'>
                    <FormField
                      control={form.control}
                      name='nome'
                      render={({ field }) => (
                        <FormItem className='flex-1 max-w-md'>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input className='h-7' placeholder='Nome do utente' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem className='w-32 shrink-0'>
                      <FormLabel className='text-muted-foreground'>Data de Registo</FormLabel>
                      <Input
                        readOnly
                        value='—'
                        className='h-7 w-full min-w-0 bg-muted cursor-not-allowed text-muted-foreground'
                        title='Data de criação do registo - não editável'
                      />
                    </FormItem>
                    <div className='flex gap-2 ml-auto shrink-0'>
                      <Button type='button' variant='outline' size='sm' className='bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'>
                        <Search className='h-4 w-4 mr-2' />
                        Medicação Crónica
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tabs: navegação sempre ativa (controlada para saltar para o primeiro erro) */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                  <TabsList className='w-full justify-start flex-wrap h-auto gap-1 rounded-none border-b bg-transparent p-0 px-4 pt-2'>
                    <TabsTrigger value='dados-pessoais' className='rounded-t-md'>
                      Dados Pessoais
                    </TabsTrigger>
                    <TabsTrigger value='contactos'>Contactos</TabsTrigger>
                    <TabsTrigger value='subsistema-saude'>Subsistema de Saúde</TabsTrigger>
                    <TabsTrigger value='informacao-sns'>Informação SNS</TabsTrigger>
                    <TabsTrigger value='outras-informacoes'>Outras Informações</TabsTrigger>
                    <TabsTrigger value='avisos'>Avisos</TabsTrigger>
                    <TabsTrigger value='documentos'>Documentos</TabsTrigger>
                  </TabsList>
                  <div className='px-4 pb-4'>
                    <TabsContent value='dados-pessoais' className='mt-4'>
                      <TabDadosPessoais form={form} utente={undefined as unknown as UtenteDTO} />
                    </TabsContent>
                    <TabsContent value='contactos' className='mt-4'>
                      <TabContactos form={form} utente={undefined as unknown as UtenteDTO} />
                    </TabsContent>
                    <TabsContent value='subsistema-saude' className='mt-4' forceMount hidden={activeTab !== 'subsistema-saude'}>
                      <TabSubsistemaSaude form={form} utente={undefined as unknown as UtenteDTO} />
                    </TabsContent>
                    <TabsContent value='informacao-sns' className='mt-4'>
                      <TabInformacaoSNS form={form} utente={undefined as unknown as UtenteDTO} />
                    </TabsContent>
                    <TabsContent value='outras-informacoes' className='mt-4'>
                      <TabOutrasInformacoes form={form} utente={undefined as unknown as UtenteDTO} />
                    </TabsContent>
                    <TabsContent value='avisos' className='mt-4'>
                      <TabAvisos form={form} utente={undefined as unknown as UtenteDTO} />
                    </TabsContent>
                    <TabsContent value='documentos' className='mt-4'>
                      <TabDocumentos />
                    </TabsContent>
                  </div>
                </Tabs>
              </form>
            </Form>
          ) : isLoading ? (
            <div className='text-sm text-muted-foreground px-4 py-8'>A carregar…</div>
          ) : !utente ? (
            <div className='text-sm text-muted-foreground px-4 py-8'>Utente não encontrado.</div>
          ) : (
            <Form {...form}>
              <form id='utente-edit-form' onSubmit={form.handleSubmit(onSubmit, onInvalid)} className='space-y-0'>
                {/* Barra superior: Nome | Data de Registo | Botões (canto direito) */}
                <div className='border-b bg-muted/30 px-4 py-4'>
                  <div className='flex flex-col sm:flex-row sm:items-end gap-4'>
                    <FormField
                      control={form.control}
                      name='nome'
                      render={({ field }) => (
                        <FormItem className='flex-1 max-w-md'>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input className='h-7' placeholder='Nome do utente' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem className='w-32 shrink-0'>
                      <FormLabel className='text-muted-foreground'>Data de Registo</FormLabel>
                      <Input
                        readOnly
                        value={formatDate(utente.dataRegisto)}
                        className='h-7 w-full min-w-0 bg-muted cursor-not-allowed text-muted-foreground'
                        title='Data de criação do registo - não editável'
                      />
                    </FormItem>
                    <div className='flex gap-2 ml-auto shrink-0'>
                      <Button type='button' variant='outline' size='sm' className='bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'>
                        <Search className='h-4 w-4 mr-2' />
                        Medicação Crónica
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tabs: navegação sempre ativa (controlada para saltar para o primeiro erro) */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                  <TabsList className='w-full justify-start flex-wrap h-auto gap-1 rounded-none border-b bg-transparent p-0 px-4 pt-2'>
                    <TabsTrigger value='dados-pessoais' className='rounded-t-md'>Dados Pessoais</TabsTrigger>
                    <TabsTrigger value='contactos'>Contactos</TabsTrigger>
                    <TabsTrigger value='subsistema-saude'>Subsistema de Saúde</TabsTrigger>
                    <TabsTrigger value='informacao-sns'>Informação SNS</TabsTrigger>
                    <TabsTrigger value='outras-informacoes'>Outras Informações</TabsTrigger>
                    <TabsTrigger value='avisos'>Avisos</TabsTrigger>
                    <TabsTrigger value='documentos'>Documentos</TabsTrigger>
                  </TabsList>
                  <div className='px-4 pb-4'>
                    <fieldset disabled={isReadOnly}>
                      <TabsContent value='dados-pessoais' className='mt-4'>
                        <TabDadosPessoais form={form} utente={utente} />
                      </TabsContent>
                      <TabsContent value='contactos' className='mt-4'>
                        <TabContactos form={form} utente={utente} />
                      </TabsContent>
                      <TabsContent value='subsistema-saude' className='mt-4' forceMount hidden={activeTab !== 'subsistema-saude'}>
                        <TabSubsistemaSaude form={form} utente={utente} />
                      </TabsContent>
                      <TabsContent value='informacao-sns' className='mt-4'>
                        <TabInformacaoSNS form={form} utente={utente} />
                      </TabsContent>
                      <TabsContent value='outras-informacoes' className='mt-4'>
                        <TabOutrasInformacoes form={form} utente={utente} />
                      </TabsContent>
                      <TabsContent value='avisos' className='mt-4'>
                        <TabAvisos form={form} utente={utente} />
                      </TabsContent>
                      <TabsContent value='documentos' className='mt-4'>
                        <TabDocumentos />
                      </TabsContent>
                    </fieldset>
                  </div>
                </Tabs>
              </form>
            </Form>
          )}
        </div>
      </DashboardPageContainer>
    </>
  )
}
