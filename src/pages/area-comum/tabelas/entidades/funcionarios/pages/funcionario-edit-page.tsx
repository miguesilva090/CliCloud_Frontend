import { useEffect } from 'react'
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
import { RefreshCw, X, Save } from 'lucide-react'
import type {
  CreateFuncionarioRequest,
  UpdateFuncionarioRequest,
  FuncionarioDTO,
} from '@/types/dtos/saude/funcionarios.dtos'
import type { FuncionarioEditFormValues } from '../types/funcionario-edit-form-types'
import { ENTIDADE_TIPO } from '@/lib/entidade-tipo'
import { resolveRuaNomeToId } from '@/lib/utils/resolve-rua'
import {
  useCreateFuncionario,
  useGetFuncionario,
  useUpdateFuncionario,
} from '../queries/funcionario-queries'
import { TabFuncionarioIdentificacao } from '../components/tab-funcionario-identificacao'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useCurrentWindowId, handleWindowClose } from '@/utils/window-utils'

function getTelefoneFromContactos(
  contactos: { entidadeContactoTipoId: number; valor?: string | null }[] | null | undefined
): string {
  if (!contactos?.length) return ''
  const tel = contactos.find((c) => c.entidadeContactoTipoId === 1)
  return tel?.valor ?? ''
}

const schema = z
  .object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    nomeUtilizador: z.string().optional(),
    rua: z.string().optional(),
    ruaId: z.string().optional(),
    codigoPostalId: z.string().optional(),
    numeroContribuinte: z.string().optional(),
    telefone: z.string().optional(),
    numeroCartaoIdentificacao: z.string().optional(),
    arquivo: z.string().optional(),
    dataEmissao: z.string().optional(),
  })
  .refine(
    (data) => {
      const ruaTrim = data.rua?.trim()
      const cpId = data.codigoPostalId?.trim()
      if (ruaTrim && cpId) return true
      if (!ruaTrim && !cpId) return true
      return false
    },
    { message: 'Rua e Código Postal devem ser preenchidos em conjunto.', path: ['rua'] }
  )
  .passthrough()

function buildEntidadeContactos(values: FuncionarioEditFormValues) {
  const telVal = values.telefone?.trim()
  if (telVal) {
    return [{ entidadeContactoTipoId: 1, valor: telVal, principal: false }]
  }
  return []
}

function buildCreatePayload(values: FuncionarioEditFormValues): CreateFuncionarioRequest {
  const cpId = values.codigoPostalId?.trim() || undefined
  const contactos = buildEntidadeContactos(values)
  return {
    nome: values.nome.trim(),
    tipoEntidadeId: ENTIDADE_TIPO.Funcionario,
    nomeUtilizador: values.nomeUtilizador?.trim() || undefined,
    numeroContribuinte: values.numeroContribuinte?.trim() || undefined,
    codigoPostalId: cpId,
    numeroCartaoIdentificacao: values.numeroCartaoIdentificacao?.trim() || undefined,
    dataEmissaoCartaoIdentificacao: values.dataEmissao?.trim() || undefined,
    arquivo: values.arquivo?.trim() || undefined,
    status: 1,
    entidadeContactos: contactos.length > 0 ? contactos : undefined,
  }
}

function buildUpdatePayload(
  funcionario: FuncionarioDTO,
  values: FuncionarioEditFormValues
): UpdateFuncionarioRequest {
  const payload = buildCreatePayload(values) as UpdateFuncionarioRequest
  const toStr = (v: unknown) => (v != null && v !== undefined ? String(v) : '')
  return {
    ...payload,
    ruaId: values.ruaId || (funcionario.ruaId ? toStr(funcionario.ruaId) : undefined),
    codigoPostalId: values.codigoPostalId || (funcionario.codigoPostalId ? toStr(funcionario.codigoPostalId) : undefined),
    freguesiaId: funcionario.freguesiaId ? toStr(funcionario.freguesiaId) : undefined,
    concelhoId: funcionario.concelhoId ? toStr(funcionario.concelhoId) : undefined,
    distritoId: funcionario.distritoId ? toStr(funcionario.distritoId) : undefined,
    paisId: funcionario.paisId ? toStr(funcionario.paisId) : undefined,
    numeroPorta: funcionario.numeroPorta ?? undefined,
    andarRua: funcionario.andarRua ?? undefined,
    status: funcionario.status ?? 1,
    entidadeContactos: (() => {
      const telVal = values.telefone?.trim()
      const mapItem = (c: { id?: string | null; entidadeContactoTipoId: number; valor?: string | null; principal?: boolean }) => ({
        id: c.id,
        entidadeContactoTipoId: c.entidadeContactoTipoId,
        valor: c.valor ?? '',
        principal: c.principal ?? false,
      })
      if (telVal) {
        const telExist = funcionario.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 1)
        const others = (funcionario.entidadeContactos ?? []).filter((c) => c.entidadeContactoTipoId !== 1).map(mapItem)
        return [
          {
            id: telExist && 'id' in telExist ? (telExist as { id?: string }).id : undefined,
            entidadeContactoTipoId: 1,
            valor: telVal,
            principal: false,
          },
          ...others,
        ]
      }
      return funcionario.entidadeContactos?.map(mapItem) ?? undefined
    })(),
  }
}



export function FuncionarioEditPage() {
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

  const { data, isLoading } = useGetFuncionario(id)
  const funcionario = data?.info?.data

  const createFuncionario = useCreateFuncionario()
  const updateFuncionario = useUpdateFuncionario(id)

  const form = useForm<FuncionarioEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      nomeUtilizador: '',
      rua: '',
      ruaId: '',
      codigoPostalId: '',
      numeroContribuinte: '',
      telefone: '',
      numeroCartaoIdentificacao: '',
      arquivo: '',
      dataEmissao: '',
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!funcionario) return
    const ruaNome = funcionario.rua?.nome ?? (funcionario.rua as { Nome?: string })?.Nome ?? ''
    const dataEmissao = funcionario.dataEmissaoCartaoIdentificacao
      ? String(funcionario.dataEmissaoCartaoIdentificacao).slice(0, 10)
      : ''
    form.reset({
      nome: funcionario.nome ?? '',
      nomeUtilizador: funcionario.nomeUtilizador ?? '',
      rua: ruaNome,
      ruaId: funcionario.ruaId ? String(funcionario.ruaId) : '',
      codigoPostalId: funcionario.codigoPostalId ? String(funcionario.codigoPostalId) : '',
      numeroContribuinte: funcionario.numeroContribuinte ?? '',
      telefone: getTelefoneFromContactos(funcionario.entidadeContactos ?? []),
      numeroCartaoIdentificacao: funcionario.numeroCartaoIdentificacao ?? '',
      arquivo: funcionario.arquivo ?? '',
      dataEmissao,
    })
  }, [funcionario, form])

  const canSave = isCreate
    ? !createFuncionario.isPending
    : !!id && !!funcionario && !updateFuncionario.isPending

  const onSubmit = async (values: FuncionarioEditFormValues) => {
    const ruaTrim = values.rua?.trim()
    const cpId = values.codigoPostalId?.trim()
    if (ruaTrim && !cpId) {
      toast.error('Código Postal é obrigatório quando preenche a Rua.')
      return
    }
    if (cpId && !ruaTrim && isCreate) {
      toast.error('Rua é obrigatória quando seleciona Código Postal.')
      return
    }

    let ruaId: string | undefined = values.ruaId || undefined
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

    if (isCreate) {
      const payload: CreateFuncionarioRequest = {
        ...buildCreatePayload(values),
        ruaId,
        codigoPostalId: cpId || undefined,
      }
      createFuncionario.mutate(payload)
      return
    }
    if (!funcionario) return
    const payload = buildUpdatePayload(funcionario, { ...values, ruaId: ruaId ?? values.ruaId ?? '' })
    updateFuncionario.mutate(payload)
  }

  const title = isCreate
    ? 'Criar Funcionário'
    : funcionario?.nome
      ? `${isReadOnly ? 'Ver' : 'Editar'}: ${funcionario.nome}`
      : isReadOnly
        ? 'Ver Funcionário'
        : 'Editar Funcionário'

  return (
    <>
      <PageHead title={`${title} | CliCloud`} />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>
            {isCreate ? 'Criar Funcionário' : isReadOnly ? 'Ver Funcionário' : 'Editar Funcionário'}
          </h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                if (isCreate) {
                  queryClient.invalidateQueries({ queryKey: ['funcionarios-paginated'] })
                } else if (id) {
                  queryClient.invalidateQueries({ queryKey: ['funcionario', id] })
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
                  toast.error(msg || 'Corrija os erros do formulário antes de gravar.')
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
                      Gravar Funcionário
                    </Button>
                  </div>
                </div>
                <div className='px-4 py-4'>
                  <TabFuncionarioIdentificacao form={form} />
                </div>
              </form>
            </Form>
          ) : isLoading ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              A carregar...
            </div>
          ) : !funcionario ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              Funcionário não encontrado.
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  const msg = Object.values(errors)
                    .map((e) => (e?.message as string) ?? '')
                    .filter(Boolean)[0]
                  toast.error(msg || 'Corrija os erros do formulário antes de gravar.')
                })}
                className='space-y-0'
              >
                <div className='border-b bg-muted px-4 py-4'>
                  <div className='flex flex-col sm:flex-row sm:items-end sm:justify-end gap-4'>
                    {!isReadOnly && (
                      <Button
                        type='submit'
                        disabled={!canSave}
                        size='sm'
                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      >
                        <Save className='h-4 w-4 mr-2' />
                        Gravar Funcionário
                      </Button>
                    )}
                  </div>
                </div>
                <div className='px-4 py-4'>
                  <TabFuncionarioIdentificacao form={form} readOnly={isReadOnly} />
                </div>
              </form>
            </Form>
          )}
        </div>
      </DashboardPageContainer>
    </>
  )
}
