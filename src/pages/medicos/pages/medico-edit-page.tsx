import { useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import { Save } from 'lucide-react'
import { EntityFormPageHeader } from '@/components/shared/entity-form-page-header'
import type { MedicoDTO } from '@/types/dtos/saude/medicos.dtos'
import type { MedicoEditFormValues } from '../types/medico-edit-form-types'
import { resolveRuaNomeToId } from '@/lib/utils/resolve-rua'
import { useCreateMedico, useGetMedico, useUpdateMedico, normalizeFieldKey } from '../queries/medicos-queries'
import { medicoEditDefaultValues, medicoEditSchema } from '../utils/medico-edit-form'
import { buildCreatePayload, buildUpdatePayload } from '../utils/medico-edit-payload'
import { MEDICO_FIELD_LABELS, MEDICO_FIELD_TO_TAB, MEDICO_FORM_FIELD_ORDER } from '../utils/medico-edit-validation'
import { TabDadosPessoais } from '../components/medico-edit-tabs/tab-dados-pessoais'
import { TabContactos } from '../components/medico-edit-tabs/tab-contactos'
import { TabDadosProfissionais } from '../components/medico-edit-tabs/tab-dados-profissionais'
import { TabHorarioFixo } from '../components/medico-edit-tabs/tab-horario-fixo'
import { TabHorarioVariavel } from '../components/medico-edit-tabs/tab-horario-variavel'
import { TabFeriasFolgas } from '../components/medico-edit-tabs/tab-ferias-folgas'
import type { TabHorarioFixoRef } from '../components/medico-edit-tabs/tab-horario-fixo'
import { useFormValidationFeedback } from '@/hooks/use-form-validation-feedback'
import { useTabManager } from '@/hooks/use-tab-manager'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useCurrentWindowId, handleWindowClose } from '@/utils/window-utils'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function MedicoEditPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const id = params.id ?? ''
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const isReadOnly = searchParams.get('mode') === 'view'
  const windowId = useCurrentWindowId()
  const removeWindow = useWindowsStore((s) => s.removeWindow)

  const isCreate = !id
  const horarioFixoRef = useRef<TabHorarioFixoRef>(null)
  const { activeTab, setActiveTab } = useTabManager({ defaultTab: 'dados-pessoais' })

  const { onInvalid } = useFormValidationFeedback<MedicoEditFormValues>({
    setActiveTab,
    toastTitle: 'Campos obrigatórios em falta',
  })

  const { data, isLoading } = useGetMedico(id)
  const medico = data?.info?.data

  const updateMedico = useUpdateMedico(id, {
    onBeforeNavigate: async () => {
      await horarioFixoRef.current?.saveHorario()
    },
    onServerValidationError: (fieldKey, messages) => {
      // Aplicar erros em todos os campos com mensagem do backend (borda vermelha)
      Object.entries(messages).forEach(([key, msgs]) => {
        if (key === '$' || !msgs?.[0]) return
        const camelKey = normalizeFieldKey(key) as keyof MedicoEditFormValues
        form.setError(camelKey, { type: 'server', message: msgs[0] })
      })
      // Padrão utente: usar fieldKey do backend OU encontrar o primeiro campo vazio
      const keyToFocus =
        fieldKey && MEDICO_FIELD_TO_TAB[fieldKey]
          ? fieldKey
          : MEDICO_FORM_FIELD_ORDER.find((key) => {
              const v = form.getValues(key)
              return v === '' || v == null || (typeof v === 'string' && !v.trim())
            })
      if (keyToFocus && MEDICO_FIELD_TO_TAB[keyToFocus]) {
        setActiveTab(MEDICO_FIELD_TO_TAB[keyToFocus])
        if (!messages[keyToFocus]?.length) {
          const label =
            MEDICO_FIELD_LABELS[keyToFocus as keyof MedicoEditFormValues] ??
            keyToFocus
          form.setError(keyToFocus as keyof MedicoEditFormValues, {
            type: 'server',
            message: messages['$']?.[0] ?? `${label} é obrigatório.`,
          })
        }
        requestAnimationFrame(() => {
          form.setFocus(keyToFocus as keyof MedicoEditFormValues)
        })
      }
      const labelsList = Object.keys(messages)
        .filter((k) => k !== '$')
        .map(
          (k) =>
            MEDICO_FIELD_LABELS[
              normalizeFieldKey(k) as keyof MedicoEditFormValues
            ] ?? k,
        )
        .filter(Boolean)
        .join(', ')
      const title = labelsList ? `Campos em falta: ${labelsList}` : 'Campos obrigatórios em falta'
      const description =
        labelsList
          ? 'Preencha os campos indicados e tente novamente.'
          : Object.entries(messages)
              .filter(([k]) => k !== '$')
              .flatMap(([, msgs]) => msgs ?? [])
              .join('. ') || messages['$']?.[0] || 'Erro de validação'
      toast.error(description, title)
      setTimeout(() => {
        const first = document.querySelector('[aria-invalid="true"]')
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 150)
    },
  })
  const createMedico = useCreateMedico()

  const form = useForm<MedicoEditFormValues>({
    resolver: zodResolver(medicoEditSchema),
    defaultValues: medicoEditDefaultValues,
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!medico) return
    const emailContacto = medico.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 3)?.valor ?? ''
    const telefoneContacto = medico.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 1)?.valor ?? ''
    const faxContacto = medico.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 2)?.valor ?? ''
    form.reset({
      nome: medico.nome ?? '',
      email: medico.email ?? emailContacto ?? '',
      numeroContribuinte: medico.numeroContribuinte ?? '',
      observacoes: medico.observacoes ?? '',
      status: medico.status ?? 0,
      dataNascimento: medico.dataNascimento ?? '',
      dataEmissaoCartaoIdentificacao: medico.dataEmissaoCartaoIdentificacao ?? '',
      dataValidadeCartaoIdentificacao: medico.dataValidadeCartaoIdentificacao ?? '',
      sexo: null,
      sexoId: medico.sexoId ?? medico.sexo?.id ?? null,
      estadoCivil: null,
      estadoCivilId: medico.estadoCivilId ?? medico.estadoCivil?.id ?? null,
      nacionalidade: medico.nacionalidade ?? '',
      naturalidade: medico.naturalidade ?? '',
      numeroCartaoIdentificacao: medico.numeroCartaoIdentificacao ?? '',
      arquivo: medico.arquivo ?? '',
      carteira: medico.carteira ?? '',
      nomeUtilizador: medico.nomeUtilizador ?? '',
      numeroIdentificacaoBancaria: medico.numeroIdentificacaoBancaria ?? '',
      paisId: medico.paisId ?? null,
      distritoId: medico.distritoId ?? null,
      concelhoId: medico.concelhoId ?? null,
      freguesiaId: medico.freguesiaId ?? null,
      codigoPostalId: medico.codigoPostalId ?? null,
      rua: medico.rua?.nome ?? (medico.rua as { Nome?: string })?.Nome ?? '',
      ruaId: medico.ruaId ?? null,
      numeroPorta: medico.numeroPorta ?? '',
      andarRua: medico.andarRua ?? '',
      indicativoTelefone: '+351',
      telefone: telefoneContacto,
      telemovel: telefoneContacto,
      fax: faxContacto,
      director: medico.director ?? false,
      categoriaEspecialidadeId: null,
      especialidadeId: medico.especialidadeId ?? null,
      margem: medico.margem ?? null,
      loginPRVR: medico.loginPRVR ?? '',
      comunicacaoNif: medico.comunicacaoNif ?? false,
      comunicacaoNifAdse: medico.comunicacaoNifAdse ?? null,
      grupoFuncional: medico.grupoFuncional ?? '',
      letra: medico.letra ?? '',
      cartaoCidadaoMedico: medico.cartaoCidadaoMedico ?? 0,
      idUtilizador: medico.idUtilizador ?? null,
      globalbooking: medico.globalbooking ?? false,
      urlFoto: medico.urlFoto ?? null,
      urlFotoAssinatura: medico.urlFotoAssinatura ?? null,
    })
  }, [medico, form])

  const canSave = isCreate
    ? !createMedico.isPending
    : !!id && !!medico && !updateMedico.isPending

  const onSubmit = async (values: MedicoEditFormValues) => {
    let ruaId = values.ruaId ?? undefined
    if (values.rua?.trim() && values.freguesiaId && values.codigoPostalId && !ruaId) {
      try {
        ruaId = await resolveRuaNomeToId(
          values.rua.trim(),
          values.codigoPostalId!,
          values.freguesiaId ?? undefined
        )
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Falha ao resolver rua', 'Rua')
        return
      }
    }
    const payloadValues = { ...values, ruaId }
    if (isCreate) {
      const payload = buildCreatePayload(payloadValues)
      createMedico.mutate(payload)
      return
    }
    if (!medico) return
    const d = form.formState.dirtyFields
    const payload = buildUpdatePayload(medico, payloadValues, {
      urlFoto: Boolean(d.urlFoto),
      urlFotoAssinatura: Boolean(d.urlFotoAssinatura),
    })
    updateMedico.mutate(payload)
  }


  return (
    <>
      <PageHead title={`CliCloud`} />
      <DashboardPageContainer>
        <EntityFormPageHeader
          title={isCreate ? 'Criar Médico' : isReadOnly ? 'Ver Médico' : 'Editar Médico'}
          onBack={() => handleWindowClose(windowId, navigate, removeWindow)}
          onRefresh={() => {
            if (isCreate) {
              queryClient.invalidateQueries({ queryKey: ['medicos-paginated'] })
            } else if (id) {
              queryClient.invalidateQueries({ queryKey: ['medico', id] })
              queryClient.invalidateQueries({ queryKey: ['horario-medico', id] })
            }
          }}
          rightActions={
            !isReadOnly ? (
              <Button
                type='submit'
                form='medico-edit-form'
                disabled={!canSave}
                size='sm'
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                <Save className='h-4 w-4 mr-2' />
                Gravar médico
              </Button>
            ) : null
          }
        />

        <div className='rounded-b-lg border border-t-0 bg-background'>
          {isCreate ? (
            <Form {...form}>
              <form id='medico-edit-form' onSubmit={form.handleSubmit(onSubmit, onInvalid)} className='space-y-0'>
                <div className='border-b bg-muted/30 px-4 py-4'>
                  <div className='flex flex-col sm:flex-row sm:items-end gap-4'>
                    <FormField
                      control={form.control}
                      name='nome'
                      render={({ field }) => (
                        <FormItem className='flex-1 max-w-md'>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input className='h-7' placeholder='Nome do médico' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem className='w-24 shrink-0'>
                      <FormLabel className='text-muted-foreground'>Código</FormLabel>
                      <Input readOnly value='—' className='h-7 w-full min-w-0 bg-muted cursor-not-allowed text-muted-foreground' />
                    </FormItem>
                    <FormItem className='w-32 shrink-0'>
                      <FormLabel className='text-muted-foreground'>Data de Registo</FormLabel>
                      <Input readOnly value='—' className='h-7 w-full min-w-0 bg-muted cursor-not-allowed text-muted-foreground' />
                    </FormItem>
                    <div className='flex gap-2 ml-auto shrink-0' />
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                  <TabsList className='w-full justify-start flex-wrap h-auto gap-1 rounded-none border-b bg-transparent p-0 px-4 pt-2'>
                    <TabsTrigger value='dados-pessoais' className='rounded-t-md'>Dados Pessoais</TabsTrigger>
                    <TabsTrigger value='contactos'>Contactos</TabsTrigger>
                    <TabsTrigger value='dados-profissionais'>Dados Profissionais</TabsTrigger>
                    <TabsTrigger value='horario-fixo'>Horário Fixo</TabsTrigger>
                    <TabsTrigger value='horario-variavel'>Horário Variável</TabsTrigger>
                    <TabsTrigger value='ferias-folgas'>Férias / Folgas</TabsTrigger>
                  </TabsList>
                  <div className='px-4 pb-4'>
                    <TabsContent value='dados-pessoais' className='mt-4'>
                      <TabDadosPessoais form={form} medico={undefined as unknown as MedicoDTO} />
                    </TabsContent>
                    <TabsContent value='contactos' className='mt-4'>
                      <TabContactos form={form} medico={undefined as unknown as MedicoDTO} />
                    </TabsContent>
                    <TabsContent value='dados-profissionais' className='mt-4'>
                      <TabDadosProfissionais form={form} medico={undefined as unknown as MedicoDTO} />
                    </TabsContent>
                    <TabsContent value='horario-fixo' className='mt-4'>
                      <TabHorarioFixo form={form} medico={undefined as unknown as MedicoDTO} isReadOnly={false} />
                    </TabsContent>
                    <TabsContent value='horario-variavel' className='mt-4'>
                      <TabHorarioVariavel form={form} medico={undefined as unknown as MedicoDTO} />
                    </TabsContent>
                    <TabsContent value='ferias-folgas' className='mt-4'>
                      <TabFeriasFolgas form={form} medico={undefined as unknown as MedicoDTO} />
                    </TabsContent>
                  </div>
                </Tabs>
              </form>
            </Form>
          ) : isLoading ? (
            <div className='text-sm text-muted-foreground px-4 py-8'>A carregar…</div>
          ) : !medico ? (
            <div className='text-sm text-muted-foreground px-4 py-8'>Médico não encontrado.</div>
          ) : (
            <Form {...form}>
              <form id='medico-edit-form' onSubmit={form.handleSubmit(onSubmit, onInvalid)} className='space-y-0'>
                <div className='border-b bg-muted/30 px-4 py-4'>
                  <div className='flex flex-col sm:flex-row sm:items-end gap-4'>
                    <FormField
                      control={form.control}
                      name='nome'
                      render={({ field }) => (
                        <FormItem className='flex-1 max-w-md'>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input className='h-7' placeholder='Nome do médico' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem className='w-24 shrink-0'>
                      <FormLabel className='text-muted-foreground'>Código</FormLabel>
                      <Input readOnly value={medico.id ? String(medico.id).slice(0, 8) : '—'} className='h-7 w-full min-w-0 bg-muted cursor-not-allowed text-muted-foreground' />
                    </FormItem>
                    <FormItem className='w-32 shrink-0'>
                      <FormLabel className='text-muted-foreground'>Data de Registo</FormLabel>
                      <Input readOnly value={formatDate(medico.createdOn)} className='h-7 w-full min-w-0 bg-muted cursor-not-allowed text-muted-foreground' />
                    </FormItem>
                    <div className='flex gap-2 ml-auto shrink-0' />
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                  <TabsList className='w-full justify-start flex-wrap h-auto gap-1 rounded-none border-b bg-transparent p-0 px-4 pt-2'>
                    <TabsTrigger value='dados-pessoais' className='rounded-t-md'>Dados Pessoais</TabsTrigger>
                    <TabsTrigger value='contactos'>Contactos</TabsTrigger>
                    <TabsTrigger value='dados-profissionais'>Dados Profissionais</TabsTrigger>
                    <TabsTrigger value='horario-fixo'>Horário Fixo</TabsTrigger>
                    <TabsTrigger value='horario-variavel'>Horário Variável</TabsTrigger>
                    <TabsTrigger value='ferias-folgas'>Férias / Folgas</TabsTrigger>
                  </TabsList>
                  <div className='px-4 pb-4'>
                    <fieldset disabled={isReadOnly}>
                      <TabsContent value='dados-pessoais' className='mt-4'>
                        <TabDadosPessoais form={form} medico={medico} />
                      </TabsContent>
                      <TabsContent value='contactos' className='mt-4'>
                        <TabContactos form={form} medico={medico} />
                      </TabsContent>
                      <TabsContent value='dados-profissionais' className='mt-4'>
                        <TabDadosProfissionais form={form} medico={medico} />
                      </TabsContent>
                    <TabsContent value='horario-fixo' className='mt-4 data-[state=inactive]:hidden' forceMount>
                      <TabHorarioFixo
                        ref={horarioFixoRef}
                        form={form}
                        medico={medico}
                        isReadOnly={isReadOnly}
                        hideSaveButton
                      />
                    </TabsContent>
                      <TabsContent value='horario-variavel' className='mt-4'>
                        <TabHorarioVariavel form={form} medico={medico} />
                      </TabsContent>
                      <TabsContent value='ferias-folgas' className='mt-4'>
                        <TabFeriasFolgas form={form} medico={medico} />
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
