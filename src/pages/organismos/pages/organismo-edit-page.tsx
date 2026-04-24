import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from '@/utils/toast-utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw, X, Save } from 'lucide-react'
import type { EntidadeContactoItem } from '@/types/dtos/saude/organismos.dtos'
import type { OrganismoEditFormValues } from '../types/organismo-edit-form-types'
import { resolveRuaNomeToId } from '@/lib/utils/resolve-rua'
import {
  useCreateOrganismo,
  useGetOrganismo,
  useUpdateOrganismo,
} from '../queries/organismos-queries'
import { organismoEditDefaultValues, organismoEditSchema } from '../utils/organismo-edit-form'
import { buildCreatePayload, buildUpdatePayload } from '../utils/organismo-edit-payload'
import { TabIdentificacao } from '../components/organismo-edit-tabs/tab-identificacao'
import { TabOutrosParametros } from '../components/organismo-edit-tabs/tab-outros-parametros'
import { TabInformacaoSNS } from '../components/organismo-edit-tabs/tab-informacao-sns'
import { TabFaturacao } from '../components/organismo-edit-tabs/tab-faturacao'
import { NATUREZAS_ORGANISMO } from '@/pages/organismos/constants/naturezas-organismo'
import { useWindowsStore } from '@/stores/use-windows-store'
import {
  useCurrentWindowId,
  handleWindowClose,
  navigateManagedWindow,
} from '@/utils/window-utils'
import { useFormValidationFeedback } from '@/hooks/use-form-validation-feedback'
import { isZodError, applyZodErrorToForm } from '@/lib/zod-error-to-field-errors'

// schema/payload extraídos para ./utils

export function OrganismoEditPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const location = useLocation()
  const id = params.id ?? ''
  const queryClient = useQueryClient()
  // Integração com WindowManager: saber qual é a janela actual e o seu pai
  const currentWindowId = useCurrentWindowId()
  const { removeWindow } = useWindowsStore()

  const isCreate = !id
  const isEditMode = location.pathname.endsWith('/editar')
  const isReadOnly = !isCreate && !isEditMode

  type TabKey = 'identificacao' | 'outros' | 'sns' | 'faturacao'
  const tabOptions: TabKey[] = ['identificacao', 'outros', 'sns', 'faturacao']
  const getTabFromSearch = (): TabKey => {
    const sp = new URLSearchParams(location.search)
    const tab = sp.get('tab')
    if (tab && tabOptions.includes(tab as TabKey)) return tab as TabKey
    return 'identificacao'
  }

  const [activeTab, _setActiveTab] = useState<TabKey>(getTabFromSearch)
  const setActiveTab = (nextTab: string) => {
    if (tabOptions.includes(nextTab as TabKey)) _setActiveTab(nextTab as TabKey)
  }

  useEffect(() => {
    const next = getTabFromSearch()
    if (next !== activeTab) _setActiveTab(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  const { onInvalid } = useFormValidationFeedback<OrganismoEditFormValues>({
    setActiveTab,
    toastTitle: 'Preencha os campos indicados',
  })

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

  const { data, isLoading } = useGetOrganismo(id)
  const organismo = data?.info?.data

  const createOrganismo = useCreateOrganismo()
  const updateOrganismo = useUpdateOrganismo(id)

  const form = useForm<OrganismoEditFormValues>({
    resolver: zodResolver(organismoEditSchema),
    defaultValues: {
      ...organismoEditDefaultValues,
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!organismo) return
    const emailContacto =
      organismo.entidadeContactos?.find(
        (c: EntidadeContactoItem) => c.entidadeContactoTipoId === 3,
      )?.valor ?? ''
    const telefoneContacto =
      organismo.entidadeContactos?.find(
        (c: EntidadeContactoItem) => c.entidadeContactoTipoId === 1,
      )?.valor ?? ''
    const faxContacto =
      organismo.entidadeContactos?.find(
        (c: EntidadeContactoItem) => c.entidadeContactoTipoId === 2,
      )?.valor ?? ''
    form.reset({
      nome: organismo.nome ?? '',
      nomeComercial: organismo.nomeComercial ?? '',
      abreviatura: organismo.abreviatura ?? '',
      email: organismo.email ?? emailContacto ?? '',
      numeroContribuinte: organismo.numeroContribuinte ?? '',
      observacoes: organismo.observacoes ?? '',
      status: organismo.status ?? 1,
      telefone: telefoneContacto,
      fax: faxContacto,
      contacto: organismo.contacto ?? '',
      globalbooking: organismo.globalbooking ?? false,
      nacional: organismo.nacional === 1,
      codigoClinica: organismo.codigoClinica ?? '',
      localidade: organismo.codigoPostal?.localidade ?? '',
      paisId: organismo.paisId != null ? String(organismo.paisId) : '',
      distritoId: organismo.distritoId != null ? String(organismo.distritoId) : '',
      concelhoId: organismo.concelhoId != null ? String(organismo.concelhoId) : '',
      freguesiaId: organismo.freguesiaId != null ? String(organismo.freguesiaId) : '',
      codigoPostalId: organismo.codigoPostalId != null ? String(organismo.codigoPostalId) : '',
      rua: organismo.rua?.nome ?? (organismo.rua as { Nome?: string })?.Nome ?? '',
      ruaId: organismo.ruaId != null ? String(organismo.ruaId) : '',
      numeroPorta: organismo.numeroPorta ?? '',
      andarRua: organismo.andarRua ?? '',
      desconto:
        organismo.desconto != null ? String(organismo.desconto) : '',
      descontoUtente:
        organismo.descontoUtente != null ? String(organismo.descontoUtente) : '',
      prazoPagamento:
        organismo.prazoPagamento != null ? String(organismo.prazoPagamento) : '',
      categoria: organismo.categoria ?? '',
      numeroPagamentos:
        organismo.numeroPagamentos != null
          ? String(organismo.numeroPagamentos)
          : '',
      apolice: organismo.apolice ?? '',
      avenca:
        organismo.avenca != null ? String(organismo.avenca) : '',
      bancoId: organismo.bancoId ?? organismo.banco?.id ?? '',
      nib: organismo.numeroIdentificacaoBancaria ?? '',
      designaTratamentos: organismo.designaTratamentos ?? '',
      dataInicioContrato: organismo.dataInicioContrato ?? '',
      dataFimContrato: organismo.dataFimContrato ?? '',
      limitarConsultas: organismo.limitarConsultas ?? false,
      numeroConsultas:
        organismo.numeroConsultas != null
          ? String(organismo.numeroConsultas)
          : '',
      contabilizarFaltas: organismo.contabilizarFaltas ?? false,
      faturaCredencial: organismo.faturaCredencial ?? 0,
      condicaoPagamento:
        organismo.condicaoPagamento != null
          ? String(organismo.condicaoPagamento)
          : '',
      tipoModoPagamento:
        organismo.tipoModoPagamento != null
          ? String(organismo.tipoModoPagamento)
          : '',
      assinarPagaDocumento: organismo.assinarPagaDocumento === 1,
      admissaoCC: organismo.admissaoCC === 1,
      inactivo: organismo.bloqueio === 1,
      discriminaServicos: organismo.discriminaServicos ?? false,
      apresentarCredenciaisPrimeiraSessao: organismo
        .apresentarCredenciaisPrimeiraSessaoTratamento
        ? 1
        : 0,
      apresentarCredenciaisTipoConsulta: organismo
        .apresentarCredenciaisPrimeiraConsulta
        ? 1
        : 0,
      contabContaFA: organismo.contabContaFA ?? '',
      contabTipoContaFA: organismo.contabTipoContaFA ?? '',
      contabContaFR: organismo.contabContaFR ?? '',
      contabTipoContaFR: organismo.contabTipoContaFR ?? '',
      ars: organismo.ars && organismo.ars.trim() !== '' ? '1' : '',
      codigoRegiao:
        organismo.codigoRegiaoAtestadoCC != null
          ? String(organismo.codigoRegiaoAtestadoCC)
          : '',
      codigoULSNova:
        organismo.codigoULSNova != null ? String(organismo.codigoULSNova) : '',
      codigoFaturacao: organismo.codigoFaturacao ?? '',
      entidadeNatureza: organismo.codigoFaturacao?.trim()
        ? [
          {
            codigoEntidade: organismo.codigoFaturacao.trim(),
            natureza: NATUREZAS_ORGANISMO[0] ?? '',
          },
        ]
        : [],
      cServicoFaturaResumo: organismo.cServicoFaturaResumo ?? '',
      faturarPorDatas: organismo.faturarPorDatas === 1,
      trust: organismo.trust ?? false,
      adm: organismo.adm ?? false,
      sadgnr: organismo.sadgnr ?? false,
      sadpsp: organismo.sadpsp ?? false,
    })
  }, [organismo, form])

  const canSave = isCreate
    ? !createOrganismo.isPending
    : !!id && !!organismo && !updateOrganismo.isPending

  const onSubmit = async (values: OrganismoEditFormValues) => {
    let ruaId = values.ruaId ?? undefined
    if (
      values.rua?.trim() &&
      values.freguesiaId &&
      values.codigoPostalId &&
      !ruaId
    ) {
      try {
        ruaId = await resolveRuaNomeToId(
          values.rua.trim(),
          values.codigoPostalId,
          values.freguesiaId
        )
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : 'Falha ao resolver rua',
          'Rua'
        )
        return
      }
    }
    const payloadValues = { ...values, ruaId: ruaId ?? values.ruaId ?? '' }
    if (isCreate) {
      const payload = buildCreatePayload(payloadValues)
      createOrganismo.mutate(payload)
      return
    }
    if (!organismo) return
    const payload = buildUpdatePayload(organismo, payloadValues)
    updateOrganismo.mutate(payload)
  }

  const title = isCreate
    ? 'Criar Organismo'
    : organismo?.nome
      ? `${isReadOnly ? 'Ver' : 'Editar'}: ${organismo.nome}`
      : isReadOnly
        ? 'Ver Organismo'
        : 'Editar Organismo'

  return (
    <>
      <PageHead title={`${title} | CliCloud`} />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>
            {isCreate
              ? 'Criar Organismo'
              : isReadOnly
                ? 'Ver Organismo'
                : 'Editar Organismo'}
          </h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                if (isCreate) {
                  queryClient.invalidateQueries({ queryKey: ['organismos-paginated'] })
                } else if (id) {
                  queryClient.invalidateQueries({ queryKey: ['organismo', id] })
                }
              }}
              title='Atualizar'
            >
              <RefreshCw className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => handleWindowClose(currentWindowId, navigate, removeWindow)}
              title='Fechar'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='rounded-b-lg border border-t-0 bg-background'>
          {isCreate ? (
            <Form {...form}>
              <form
                onSubmit={handleSubmitSafe}
                className='space-y-0'
              >
                <div className='border-b bg-muted px-4 py-4'>
                  <div className='flex flex-col sm:flex-row sm:items-end sm:justify-end gap-4'>
                    <Button type='submit' disabled={!canSave} size='sm' className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                      <Save className='h-4 w-4 mr-2' />
                      Gravar Organismo
                    </Button>
                  </div>
                </div>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className='px-4 py-4'
                >
                  <TabsList className='mb-4'>
                    <TabsTrigger value='identificacao'>Identificação</TabsTrigger>
                    <TabsTrigger value='outros'>Outros Parâmetros</TabsTrigger>
                    <TabsTrigger value='sns'>Informação SNS</TabsTrigger>
                    <TabsTrigger value='faturacao'>Faturação</TabsTrigger>
                  </TabsList>
                  <TabsContent value='identificacao'>
                    <TabIdentificacao form={form} organismo={undefined} />
                  </TabsContent>
                  <TabsContent value='outros'>
                    <TabOutrosParametros form={form} />
                  </TabsContent>
                  <TabsContent value='sns'>
                    <TabInformacaoSNS form={form} />
                  </TabsContent>
                  <TabsContent value='faturacao'>
                    <TabFaturacao form={form} lockServicoFaturaResumo />
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          ) : isLoading ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              A carregar...
            </div>
          ) : !organismo ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              Organismo não encontrado.
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={handleSubmitSafe}
                className='space-y-0'
              >
                <div className='border-b bg-muted/30 px-4 py-4'>
                  <div className='flex flex-col sm:flex-row sm:items-end sm:justify-end gap-4'>
                    {!isReadOnly && (
                      <Button type='submit' disabled={!canSave} size='sm' className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                        <Save className='h-4 w-4 mr-2' />
                        Gravar Organismo
                      </Button>
                    )}
                    {isReadOnly && (
                      <Button
                        type='button'
                        variant='default'
                        onClick={() =>
                          navigateManagedWindow(
                            navigate,
                            `/organismos/${id}/editar`
                          )
                        }
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className='px-4 py-4'
                >
                  <TabsList className='mb-4'>
                    <TabsTrigger value='identificacao'>
                      Identificação
                    </TabsTrigger>
                    <TabsTrigger value='outros'>
                      Outros Parâmetros
                    </TabsTrigger>
                    <TabsTrigger value='sns'>
                      Informação SNS
                    </TabsTrigger>
                    <TabsTrigger value='faturacao'>Faturação</TabsTrigger>
                  </TabsList>
                  <TabsContent value='identificacao'>
                    <TabIdentificacao
                      form={form}
                      organismo={organismo}
                      readOnly={isReadOnly}
                    />
                  </TabsContent>
                  <TabsContent value='outros'>
                    <TabOutrosParametros form={form} readOnly={isReadOnly} />
                  </TabsContent>
                  <TabsContent value='sns'>
                    <TabInformacaoSNS form={form} readOnly={isReadOnly} />
                  </TabsContent>
                  <TabsContent value='faturacao'>
                    <TabFaturacao form={form} readOnly={isReadOnly} organismoId={organismo.id} />
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          )}
        </div>
      </DashboardPageContainer>
    </>
  )
}
