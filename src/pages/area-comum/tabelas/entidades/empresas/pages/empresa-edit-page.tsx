import { useEffect, useState } from 'react'
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
import { RefreshCw, X, Save } from 'lucide-react'
import type {
  CreateEmpresaRequest,
  UpdateEmpresaRequest,
  EmpresaDTO,
} from '@/types/dtos/saude/empresas.dtos'
import type { EmpresaEditFormValues } from '@/pages/empresas/types/empresa-edit-form-types'
import { ENTIDADE_TIPO, getTipoEntidadeIdForPayload } from '@/lib/entidade-tipo'
import { resolveRuaNomeToId } from '@/lib/utils/resolve-rua'
import {
  useCreateEmpresa,
  useGetEmpresa,
  useUpdateEmpresa,
} from '../queries/empresa-queries'
import { TabEmpresaIdentificacao } from '../components/tab-empresa-identificacao'
import { TabEmpresaOutros } from '../components/tab-empresa-outros'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useCurrentWindowId, handleWindowClose } from '@/utils/window-utils'

const schema = z
  .object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
    numeroContribuinte: z.string().min(1, 'NIF é obrigatório'),
    observacoes: z.string().optional(),
    status: z.coerce.number().int().min(0).max(3),
    telefone: z.string().optional(),
    fax: z.string().optional(),
    paisId: z.string().min(1, 'País é obrigatório'),
    distritoId: z.string().min(1, 'Distrito é obrigatório'),
    concelhoId: z.string().min(1, 'Concelho é obrigatório'),
    freguesiaId: z.string().min(1, 'Freguesia é obrigatória'),
    codigoPostalId: z.string().min(1, 'Código Postal é obrigatório'),
    rua: z.string().optional(),
    ruaId: z.string().optional(),
    numeroPorta: z.string().min(1, 'N.º Porta é obrigatório'),
    andarRua: z.string().min(1, 'Andar é obrigatório'),
    prazoPagamento: z.string().optional(),
    desconto: z.string().optional(),
    descontoUtente: z.string().optional(),
    categoria: z.string().optional(),
    organismoId: z.string().optional(),
    codigoClinica: z.string().optional(),
    bancoId: z.string().optional(),
    numeroIdentificacaoBancaria: z.string().optional(),
    apolice: z.string().optional(),
    avenca: z.string().optional(),
    dataInicioContrato: z.string().optional(),
    dataFimContrato: z.string().optional(),
    numeroPagamentos: z.string().optional(),
    numeroTrabalhadores: z.string().optional(),
    valorTrabalhador: z.string().optional(),
    rescindindo: z.boolean().optional(),
  })
  .refine((data) => (data.rua?.trim()) || (data.ruaId?.trim()), {
    message: 'Rua é obrigatória',
    path: ['rua'],
  })
  .passthrough()

function buildEntidadeContactos(values: EmpresaEditFormValues) {
  const contactos: Array<{
    entidadeContactoTipoId: number
    valor: string
    principal: boolean
  }> = []
  const emailVal = values.email?.trim() ?? ''
  const telefoneVal = values.telefone?.trim() ?? ''
  const faxVal = values.fax?.trim() ?? ''
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
  if (faxVal) {
    contactos.push({
      entidadeContactoTipoId: 2,
      valor: faxVal,
      principal: false,
    })
  }
  if (contactos.length === 0) {
    contactos.push({
      entidadeContactoTipoId: 3,
      valor: emailVal || '',
      principal: true,
    })
  }
  return contactos
}

function parseNum(s: string | undefined): number | null {
  return s != null && s.trim() !== '' ? parseInt(s.trim(), 10) : null
}

function parseFloatSafe(s: string | undefined): number | null {
  return s != null && s.trim() !== ''
    ? parseFloat(String(s).replace(',', '.'))
    : null
}

function buildCreatePayload(values: EmpresaEditFormValues): CreateEmpresaRequest {
  return {
    nome: values.nome,
    tipoEntidadeId: ENTIDADE_TIPO.Empresa,
    email: values.email ?? '',
    numeroContribuinte: values.numeroContribuinte,
    ruaId: values.ruaId!,
    codigoPostalId: values.codigoPostalId,
    freguesiaId: values.freguesiaId,
    concelhoId: values.concelhoId,
    distritoId: values.distritoId,
    paisId: values.paisId,
    numeroPorta: values.numeroPorta ?? '-',
    andarRua: values.andarRua ?? '-',
    observacoes: values.observacoes ?? '',
    status: values.status ?? 1,
    entidadeContactos: buildEntidadeContactos(values),
    prazoPagamento: parseNum(values.prazoPagamento),
    desconto: parseFloatSafe(values.desconto),
    descontoUtente: parseFloatSafe(values.descontoUtente),
    condicaoPagamento: null,
    tipoModoPagamento: null,
    bancoId: values.bancoId?.trim() || null,
    numeroIdentificacaoBancaria:
      values.numeroIdentificacaoBancaria?.trim() || null,
    apolice: values.apolice?.trim() || null,
    avenca: parseFloatSafe(values.avenca),
    dataInicioContrato: values.dataInicioContrato?.trim() || null,
    dataFimContrato: values.dataFimContrato?.trim() || null,
    numeroPagamentos: parseNum(values.numeroPagamentos),
    categoria: values.categoria?.trim() || null,
    organismoId: values.organismoId?.trim() || null,
    actividade: null,
    cae: null,
    codigoClinica: values.codigoClinica?.trim() || null,
    numeroTrabalhadores: parseNum(values.numeroTrabalhadores),
    valorTrabalhador: parseFloatSafe(values.valorTrabalhador),
    rescindindo: values.rescindindo ? 1 : 0,
    contacto: values.telefone?.trim() || null,
  }
}

function buildUpdatePayload(
  empresa: EmpresaDTO,
  values: EmpresaEditFormValues
): UpdateEmpresaRequest {
  return {
    ...buildCreatePayload(values),
    tipoEntidadeId: getTipoEntidadeIdForPayload(
      empresa.tipoEntidadeId,
      ENTIDADE_TIPO.Empresa
    ),
    ruaId: values.ruaId ?? empresa.ruaId ?? '',
    codigoPostalId: values.codigoPostalId ?? empresa.codigoPostalId ?? '',
    freguesiaId: values.freguesiaId ?? empresa.freguesiaId ?? '',
    concelhoId: values.concelhoId ?? empresa.concelhoId ?? '',
    distritoId: values.distritoId ?? empresa.distritoId ?? '',
    paisId: values.paisId ?? empresa.paisId ?? '',
    numeroPorta: values.numeroPorta ?? empresa.numeroPorta ?? '-',
    andarRua: values.andarRua ?? empresa.andarRua ?? '-',
  }
}


export function EmpresaEditPage() {
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

  const { data, isLoading } = useGetEmpresa(id)
  const empresa = data?.info?.data

  const createEmpresa = useCreateEmpresa()
  const updateEmpresa = useUpdateEmpresa(id)

  const form = useForm<EmpresaEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      email: '',
      numeroContribuinte: '',
      observacoes: '',
      status: 1,
      telefone: '',
      fax: '',
      paisId: '',
      distritoId: '',
      concelhoId: '',
      freguesiaId: '',
      codigoPostalId: '',
      rua: '',
      ruaId: '',
      numeroPorta: '',
      andarRua: '',
      prazoPagamento: '',
      desconto: '',
      descontoUtente: '',
      categoria: '',
      organismoId: '',
      codigoClinica: '',
      bancoId: '',
      numeroIdentificacaoBancaria: '',
      apolice: '',
      avenca: '',
      dataInicioContrato: '',
      dataFimContrato: '',
      numeroPagamentos: '',
      numeroTrabalhadores: '',
      valorTrabalhador: '',
      rescindindo: false,
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!empresa) return
    const emailContacto =
      empresa.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 3)
        ?.valor ?? ''
    const telefoneContacto =
      empresa.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 1)
        ?.valor ?? ''
    const faxContacto =
      empresa.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 2)
        ?.valor ?? ''
    form.reset({
      nome: empresa.nome ?? '',
      email: empresa.email ?? emailContacto ?? '',
      numeroContribuinte: empresa.numeroContribuinte ?? '',
      observacoes: empresa.observacoes ?? '',
      status: empresa.status ?? 1,
      telefone: telefoneContacto,
      fax: faxContacto,
      paisId: empresa.paisId ?? '',
      distritoId: empresa.distritoId ?? '',
      concelhoId: empresa.concelhoId ?? '',
      freguesiaId: empresa.freguesiaId ?? '',
      codigoPostalId: empresa.codigoPostalId ?? '',
      rua:
        empresa.rua?.nome ??
        (empresa.rua as { Nome?: string })?.Nome ??
        '',
      ruaId: empresa.ruaId ?? '',
      numeroPorta: empresa.numeroPorta ?? '-',
      andarRua: empresa.andarRua ?? '-',
      prazoPagamento:
        empresa.prazoPagamento != null ? String(empresa.prazoPagamento) : '',
      desconto:
        empresa.desconto != null ? String(empresa.desconto) : '',
      descontoUtente:
        empresa.descontoUtente != null
          ? String(empresa.descontoUtente)
          : '',
      categoria: empresa.categoria ?? '',
      organismoId: empresa.organismoId ?? '',
      codigoClinica: empresa.codigoClinica ?? '',
      bancoId: empresa.bancoId ?? '',
      numeroIdentificacaoBancaria:
        empresa.numeroIdentificacaoBancaria ?? '',
      apolice: empresa.apolice ?? '',
      avenca: empresa.avenca != null ? String(empresa.avenca) : '',
      dataInicioContrato: empresa.dataInicioContrato ?? '',
      dataFimContrato: empresa.dataFimContrato ?? '',
      numeroPagamentos:
        empresa.numeroPagamentos != null
          ? String(empresa.numeroPagamentos)
          : '',
      numeroTrabalhadores:
        empresa.numeroTrabalhadores != null
          ? String(empresa.numeroTrabalhadores)
          : '',
      valorTrabalhador:
        empresa.valorTrabalhador != null
          ? String(empresa.valorTrabalhador)
          : '',
      rescindindo: (empresa.rescindindo ?? 0) === 1,
    })
  }, [empresa, form])

  const canSave = isCreate
    ? !createEmpresa.isPending
    : !!id && !!empresa && !updateEmpresa.isPending

  const onSubmit = async (values: EmpresaEditFormValues) => {
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
      createEmpresa.mutate(payload)
      return
    }
    if (!empresa) return
    const payload = buildUpdatePayload(empresa, payloadValues)
    updateEmpresa.mutate(payload)
  }

  const title = isCreate
    ? 'Criar Empresa'
    : empresa?.nome
      ? `${isReadOnly ? 'Ver' : 'Editar'}: ${empresa.nome}`
      : isReadOnly
        ? 'Ver Empresa'
        : 'Editar Empresa'

  return (
    <>
      <PageHead title={`${title} | CliCloud`} />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>
            {isCreate
              ? 'Criar Empresa'
              : isReadOnly
                ? 'Ver Empresa'
                : 'Editar Empresa'}
          </h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                if (isCreate) {
                  queryClient.invalidateQueries({
                    queryKey: ['empresas-paginated'],
                  })
                } else if (id) {
                  queryClient.invalidateQueries({ queryKey: ['empresa', id] })
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
              onClick={() =>
                handleWindowClose(currentWindowId, navigate, removeWindow)
              }
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
                <div className='border-b bg-muted px-4 py-4'>
                  <div className='flex flex-col sm:flex-row sm:items-end sm:justify-end gap-4'>
                    <Button
                      type='submit'
                      disabled={!canSave}
                      size='sm'
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                      <Save className='h-4 w-4 mr-2' />
                      Gravar Empresa
                    </Button>
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
                  </TabsList>
                  <TabsContent value='identificacao'>
                    <TabEmpresaIdentificacao form={form} />
                  </TabsContent>
                  <TabsContent value='outros'>
                    <TabEmpresaOutros form={form} />
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          ) : isLoading ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              A carregar...
            </div>
          ) : !empresa ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              Empresa não encontrada.
            </div>
          ) : (
            <Form {...form}>
              <form
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
                <div className='border-b bg-muted/30 px-4 py-4'>
                  <div className='flex flex-col sm:flex-row sm:items-end sm:justify-end gap-4'>
                    {!isReadOnly && (
                      <Button
                        type='submit'
                        disabled={!canSave}
                        size='sm'
                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      >
                        <Save className='h-4 w-4 mr-2' />
                        Gravar Empresa
                      </Button>
                    )}
                    {isReadOnly && (
                      <Button
                        type='button'
                        variant='default'
                        onClick={() =>
                          navigate(
                            `/area-comum/tabelas/entidades/empresas/${id}/editar`
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
                  </TabsList>
                  <TabsContent value='identificacao'>
                    <TabEmpresaIdentificacao
                      form={form}
                      readOnly={isReadOnly}
                    />
                  </TabsContent>
                  <TabsContent value='outros'>
                    <TabEmpresaOutros form={form} readOnly={isReadOnly} />
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

