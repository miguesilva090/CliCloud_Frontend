import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from '@/utils/toast-utils'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save } from 'lucide-react'
import { EntityFormPageHeader } from '@/components/shared/entity-form-page-header'
import type {
  CreateTecnicoRequest,
  UpdateTecnicoRequest,
  TecnicoDTO,
} from '@/types/dtos/saude/tecnicos.dtos'
import type { TecnicoEditFormValues } from '@/pages/tecnicos/types/tecnico-edit-form-types'
import { ENTIDADE_TIPO, getTipoEntidadeIdForPayload } from '@/lib/entidade-tipo'
import { resolveRuaNomeToId } from '@/lib/utils/resolve-rua'
import {
  useCreateTecnico,
  useGetTecnico,
  useUpdateTecnico,
} from '../queries/tecnico-queries'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useCurrentWindowId, handleWindowClose } from '@/utils/window-utils'
import { TabTecnicoIdentificacao } from '../components/tab-tecnico-identificacao'
import { TabTecnicoDadosProfissionais } from '../components/tab-tecnico-dados-profissionais'
import { TabTecnicoContactos } from '../components/tab-tecnico-contactos'
import {
  TabHorarioTecnicoFixo,
  type TabHorarioTecnicoFixoRef,
} from '../components/tab-tecnico-horario-fixo'
import { TabTecnicoHorarioVariavel } from '../components/tab-tecnico-horario-variavel'
import { TabTecnicoFeriasFolgas } from '../components/tab-tecnico-ferias-folgas'

const schema = z
  .object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().optional(),
    numeroContribuinte: z.string().optional(),
    telefone: z.string().optional(),
    observacoes: z.string().optional(),
    status: z.coerce.number().int().min(1).max(3).optional(),
    paisId: z.string().optional(),
    distritoId: z.string().optional(),
    concelhoId: z.string().optional(),
    freguesiaId: z.string().optional(),
    codigoPostalId: z.string().optional(),
    rua: z.string().optional(),
    ruaId: z.string().optional(),
    numeroPorta: z.string().optional(),
    andarRua: z.string().optional(),
    dataNascimento: z.string().optional(),
    numeroCartaoIdentificacao: z.string().optional(),
    dataEmissaoCartaoIdentificacao: z.string().optional(),
    arquivo: z.string().optional(),
    especialidadeId: z.string().optional(),
    carteira: z.string().optional(),
    margem: z.string().optional(),
  })
  .passthrough()

function buildEntidadeContactos(values: TecnicoEditFormValues) {
  const contactos: Array<{
    entidadeContactoTipoId: number
    valor: string
    principal: boolean
  }> = []
  const emailVal = values.email?.trim() ?? ''
  const telefoneVal = values.telefone?.trim() ?? ''

  if (emailVal) {
    contactos.push({
      entidadeContactoTipoId: 3,
      valor: emailVal,
      principal: true,
    })
  }
  if (telefoneVal) {
    contactos.push({
      entidadeContactoTipoId: 1,
      valor: telefoneVal,
      principal: false,
    })
  }
  return contactos
}

function parseFloatSafe(s: string | undefined): number | null {
  return s != null && s.trim() !== ''
    ? parseFloat(String(s).replace(',', '.'))
    : null
}

function buildCreatePayload(values: TecnicoEditFormValues): CreateTecnicoRequest {
  const contactos = buildEntidadeContactos(values)
  return {
    nome: values.nome.trim(),
    tipoEntidadeId: ENTIDADE_TIPO.Tecnico,
    email: values.email?.trim() || undefined,
    numeroContribuinte: values.numeroContribuinte?.trim() || undefined,
    ruaId: values.ruaId || undefined,
    codigoPostalId: values.codigoPostalId || undefined,
    freguesiaId: values.freguesiaId || undefined,
    concelhoId: values.concelhoId || undefined,
    distritoId: values.distritoId || undefined,
    paisId: values.paisId || undefined,
    numeroPorta: values.numeroPorta || undefined,
    andarRua: values.andarRua || undefined,
    observacoes: values.observacoes || undefined,
    status: values.status ?? 1,
    entidadeContactos: contactos.length ? contactos : undefined,
    dataNascimento: values.dataNascimento || undefined,
    numeroCartaoIdentificacao:
      values.numeroCartaoIdentificacao?.trim() || undefined,
    dataEmissaoCartaoIdentificacao:
      values.dataEmissaoCartaoIdentificacao || undefined,
    arquivo: values.arquivo?.trim() || undefined,
    especialidadeId: values.especialidadeId?.trim() || undefined,
    carteira: values.carteira?.trim() || undefined,
    margem: parseFloatSafe(values.margem) ?? undefined,
  }
}

function buildUpdatePayload(
  tecnico: TecnicoDTO,
  values: TecnicoEditFormValues
): UpdateTecnicoRequest {
  const base = buildCreatePayload(values)
  return {
    ...base,
    tipoEntidadeId: getTipoEntidadeIdForPayload(
      tecnico.tipoEntidadeId,
      ENTIDADE_TIPO.Tecnico
    ),
    ruaId: values.ruaId || tecnico.ruaId || undefined,
    codigoPostalId: values.codigoPostalId || tecnico.codigoPostalId || undefined,
    freguesiaId: values.freguesiaId || tecnico.freguesiaId || undefined,
    concelhoId: values.concelhoId || tecnico.concelhoId || undefined,
    distritoId: values.distritoId || tecnico.distritoId || undefined,
    paisId: values.paisId || tecnico.paisId || undefined,
    numeroPorta: values.numeroPorta || tecnico.numeroPorta || undefined,
    andarRua: values.andarRua || tecnico.andarRua || undefined,
  }
}


export function TecnicoEditPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const location = useLocation()
  const id = params.id ?? ''
  const queryClient = useQueryClient()
  const removeWindow = useWindowsStore((s) => s.removeWindow)
  const currentWindowId = useCurrentWindowId()

  const isCreate = !id
  const isEditMode = location.pathname.endsWith('/editar')
  const isReadOnly = !isCreate && !isEditMode

  const [activeTab, setActiveTab] = useState('identificacao')
  const horarioFixoRef = useRef<TabHorarioTecnicoFixoRef | null>(null)

  const { data, isLoading } = useGetTecnico(id)
  const tecnico = data?.info?.data

  const createTecnico = useCreateTecnico()
  const updateTecnico = useUpdateTecnico(id)

  const form = useForm<TecnicoEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      email: '',
      numeroContribuinte: '',
      observacoes: '',
      status: 1,
      telefone: '',
      paisId: '',
      distritoId: '',
      concelhoId: '',
      freguesiaId: '',
      codigoPostalId: '',
      rua: '',
      ruaId: '',
      numeroPorta: '',
      andarRua: '',
      dataNascimento: '',
      numeroCartaoIdentificacao: '',
      dataEmissaoCartaoIdentificacao: '',
      arquivo: '',
      especialidadeId: '',
      carteira: '',
      margem: '',
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!tecnico) return
    const emailContacto =
      tecnico.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 3)
        ?.valor ?? tecnico.email ?? ''
    const telefoneContacto =
      tecnico.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 1)
        ?.valor ?? ''
    const ruaNome =
      tecnico.rua?.nome ?? (tecnico.rua as { Nome?: string })?.Nome ?? ''
    form.reset({
      nome: tecnico.nome ?? '',
      email: emailContacto ?? '',
      numeroContribuinte: tecnico.numeroContribuinte ?? '',
      observacoes: tecnico.observacoes ?? '',
      status: tecnico.status ?? 1,
      telefone: telefoneContacto ?? '',
      paisId: tecnico.paisId ?? '',
      distritoId: tecnico.distritoId ?? '',
      concelhoId: tecnico.concelhoId ?? '',
      freguesiaId: tecnico.freguesiaId ?? '',
      codigoPostalId: tecnico.codigoPostalId ?? '',
      rua: ruaNome,
      ruaId: tecnico.ruaId ?? '',
      numeroPorta: tecnico.numeroPorta ?? '',
      andarRua: tecnico.andarRua ?? '',
      dataNascimento: tecnico.dataNascimento ?? '',
      numeroCartaoIdentificacao: tecnico.numeroCartaoIdentificacao ?? '',
      dataEmissaoCartaoIdentificacao:
        tecnico.dataEmissaoCartaoIdentificacao ?? '',
      arquivo: tecnico.arquivo ?? '',
      especialidadeId: tecnico.especialidadeId ?? '',
      carteira: tecnico.carteira ?? '',
      margem:
        tecnico.margem != null ? String(tecnico.margem).replace('.', ',') : '',
    })
  }, [tecnico, form])

  const canSave = isCreate
    ? !createTecnico.isPending
    : !!id && !!tecnico && !updateTecnico.isPending

  const onSubmit = async (values: TecnicoEditFormValues) => {
    let ruaId = values.ruaId ?? undefined
    const ruaTrim = values.rua?.trim()
    const cpId = values.codigoPostalId?.trim()

    if (ruaTrim && cpId && !ruaId) {
      try {
        ruaId = await resolveRuaNomeToId(ruaTrim, cpId)
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
      createTecnico.mutate(payload)
      return
    }
    if (!tecnico) return
    const payload = buildUpdatePayload(tecnico, payloadValues)
    try {
      await updateTecnico.mutateAsync(payload)
      await horarioFixoRef.current?.saveHorario()
    } catch {
      // os toasts de erro já são tratados no hook useUpdateTecnico
    }
  }

  const title = isCreate
    ? 'Criar Técnico'
    : tecnico?.nome
      ? `${isReadOnly ? 'Ver' : 'Editar'}: ${tecnico.nome}`
      : isReadOnly
        ? 'Ver Técnico'
        : 'Editar Técnico'

  return (
    <>
      <PageHead title={`${title} | CliCloud`} />
      <DashboardPageContainer>
        <EntityFormPageHeader
          title={
            isCreate
              ? 'Criar Técnico'
              : isReadOnly
                ? 'Ver Técnico'
                : 'Editar Técnico'
          }
          onBack={() => handleWindowClose(currentWindowId, navigate, removeWindow)}
          onRefresh={() => {
            if (isCreate) {
              queryClient.invalidateQueries({ queryKey: ['tecnicos-paginated'] })
            } else if (id) {
              queryClient.invalidateQueries({ queryKey: ['tecnico', id] })
            }
          }}
          rightActions={
            !isReadOnly ? (
              <Button
                type='submit'
                form='tecnico-edit-form'
                disabled={!canSave}
                size='sm'
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                <Save className='h-4 w-4 mr-2' />
                Gravar Técnico
              </Button>
            ) : null
          }
        />

        <div className='rounded-b-lg border border-t-0 bg-background'>
          {isCreate ? (
            <Form {...form}>
              <form
                id='tecnico-edit-form'
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  const msg = Object.values(errors)
                    .map((e) => (e?.message as string) ?? '')
                    .filter(Boolean)[0]
                  toast.error(
                    msg || 'Corrija os erros do formulário antes de gravar.'
                  )
                })}
                className='space-y-0'
              >
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className='px-4 py-4'
                >
                  <TabsList className='mb-4'>
                    <TabsTrigger value='identificacao'>
                      Dados Pessoais
                    </TabsTrigger>
                    <TabsTrigger value='contactos'>Contactos</TabsTrigger>
                    <TabsTrigger value='profissionais'>
                      Dados Profissionais
                    </TabsTrigger>
                    <TabsTrigger value='horario-fixo'>
                      Horário Fixo
                    </TabsTrigger>
                    <TabsTrigger value='horario-variavel'>
                      Horário Variável
                    </TabsTrigger>
                    <TabsTrigger value='ferias-folgas'>
                      Férias / Folgas
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value='identificacao'>
                    <TabTecnicoIdentificacao form={form} />
                  </TabsContent>
                  <TabsContent value='contactos'>
                    <TabTecnicoContactos form={form} />
                  </TabsContent>
                  <TabsContent value='profissionais'>
                    <TabTecnicoDadosProfissionais form={form} />
                  </TabsContent>
                  <TabsContent value='horario-fixo'>
                    <TabHorarioTecnicoFixo
                      ref={horarioFixoRef}
                      form={form}
                      tecnico={undefined}
                      isReadOnly={false}
                      hideSaveButton={false}
                    />
                  </TabsContent>
                  <TabsContent value='horario-variavel'>
                    <TabTecnicoHorarioVariavel form={form} tecnico={undefined} />
                  </TabsContent>
                  <TabsContent value='ferias-folgas'>
                    <TabTecnicoFeriasFolgas form={form} tecnico={undefined} />
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          ) : isLoading ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              A carregar...
            </div>
          ) : !tecnico ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              Técnico não encontrado.
            </div>
          ) : (
            <Form {...form}>
              <form
                id='tecnico-edit-form'
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  const msg = Object.values(errors)
                    .map((e) => (e?.message as string) ?? '')
                    .filter(Boolean)[0]
                  toast.error(
                    msg || 'Corrija os erros do formulário antes de gravar.'
                  )
                })}
                className='space-y-0'
              >
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className='px-4 py-4'
                >
                  <TabsList className='mb-4'>
                    <TabsTrigger value='identificacao'>
                      Dados Pessoais
                    </TabsTrigger>
                    <TabsTrigger value='contactos'>Contactos</TabsTrigger>
                    <TabsTrigger value='profissionais'>
                      Dados Profissionais
                    </TabsTrigger>
                    <TabsTrigger value='horario-fixo'>Horário Fixo</TabsTrigger>
                    <TabsTrigger value='horario-variavel'>
                      Horário Variável
                    </TabsTrigger>
                    <TabsTrigger value='ferias-folgas'>
                      Férias / Folgas
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value='identificacao'>
                    <TabTecnicoIdentificacao
                      form={form}
                      readOnly={isReadOnly}
                    />
                  </TabsContent>
                  <TabsContent value='contactos'>
                    <TabTecnicoContactos form={form} readOnly={isReadOnly} />
                  </TabsContent>
                  <TabsContent value='profissionais'>
                    <TabTecnicoDadosProfissionais
                      form={form}
                      readOnly={isReadOnly}
                    />
                  </TabsContent>
                  <TabsContent value='horario-fixo'>
                    <TabHorarioTecnicoFixo
                      ref={horarioFixoRef}
                      form={form}
                      tecnico={tecnico}
                      isReadOnly={isReadOnly}
                      hideSaveButton={false}
                    />
                  </TabsContent>
                  <TabsContent value='horario-variavel'>
                    <TabTecnicoHorarioVariavel form={form} tecnico={tecnico} />
                  </TabsContent>
                  <TabsContent value='ferias-folgas'>
                    <TabTecnicoFeriasFolgas form={form} tecnico={tecnico} />
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

