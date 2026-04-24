import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from '@/utils/toast-utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type FieldError } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw, X, Save } from 'lucide-react'
import type { EntidadeContactoItem } from '@/types/dtos/saude/fornecedores.dtos'
import type { FornecedorEditFormValues } from '../types/fornecedor-edit-form-types'
import { resolveRuaNomeToId } from '@/lib/utils/resolve-rua'
import {
  useCreateFornecedor,
  useGetFornecedor,
  useUpdateFornecedor,
} from '../queries/fornecedor-queries'
import { fornecedorEditDefaultValues, fornecedorEditSchema } from '../utils/fornecedor-edit-form'
import { buildCreatePayload, buildUpdatePayload } from '../utils/fornecedor-edit-payload'
import { TabFornecedorEntidade } from '../components/tab-fornecedor-entidade'
import { TabFornecedorOutros } from '../components/tab-fornecedor-outros'
import { navigateManagedWindow } from '@/utils/window-utils'

// schema/payload extraídos para ./utils
const LISTAGEM_PATH = '/area-comum/tabelas/entidades/fornecedores'

export function FornecedorEditPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const location = useLocation()
  const id = params.id ?? ''
  const queryClient = useQueryClient()

  const isCreate = !id
  const isEditMode = location.pathname.endsWith('/editar')
  const isReadOnly = !isCreate && !isEditMode

  const [activeTab, setActiveTab] = useState('entidade')

  const { data, isLoading } = useGetFornecedor(id)
  const fornecedor = data?.info?.data

  const createFornecedor = useCreateFornecedor()
  const updateFornecedor = useUpdateFornecedor()

  const form = useForm<FornecedorEditFormValues>({
    resolver: zodResolver(fornecedorEditSchema),
    defaultValues: fornecedorEditDefaultValues,
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!fornecedor) return
    const emailContacto =
      fornecedor.entidadeContactos?.find(
        (c: EntidadeContactoItem) => c.entidadeContactoTipoId === 3,
      )?.valor ?? ''
    const telefoneContacto =
      fornecedor.entidadeContactos?.find(
        (c: EntidadeContactoItem) => c.entidadeContactoTipoId === 1,
      )?.valor ?? ''
    form.reset({
      nome: fornecedor.nome ?? '',
      email: fornecedor.email ?? emailContacto ?? '',
      numeroContribuinte: fornecedor.numeroContribuinte ?? '',
      observacoes: fornecedor.observacoes ?? '',
      status: fornecedor.status ?? 1,
      telefone: telefoneContacto,
      paisId: fornecedor.paisId != null ? String(fornecedor.paisId) : '',
      distritoId: fornecedor.distritoId != null ? String(fornecedor.distritoId) : '',
      concelhoId: fornecedor.concelhoId != null ? String(fornecedor.concelhoId) : '',
      freguesiaId: fornecedor.freguesiaId != null ? String(fornecedor.freguesiaId) : '',
      codigoPostalId: fornecedor.codigoPostalId != null ? String(fornecedor.codigoPostalId) : '',
      rua: fornecedor.rua?.nome ?? (fornecedor.rua as { Nome?: string })?.Nome ?? '',
      ruaId: fornecedor.ruaId != null ? String(fornecedor.ruaId) : '',
      numeroPorta: fornecedor.numeroPorta ?? '-',
      andarRua: fornecedor.andarRua ?? '-',
      numeroConta: fornecedor.numeroConta ?? '',
      plafond: fornecedor.plafond != null ? String(fornecedor.plafond) : '',
      desconto: fornecedor.desconto != null ? String(fornecedor.desconto) : '',
      condicaoPagamento:
        fornecedor.condicaoPagamento != null
          ? String(fornecedor.condicaoPagamento)
          : '',
      moeda: fornecedor.moeda != null ? String(fornecedor.moeda) : '',
      numeroNib: fornecedor.numeroNib ?? '',
      enderecoWeb: fornecedor.enderecoWeb ?? '',
      diasPrevEntrega:
        fornecedor.diasPrevEntrega != null
          ? String(fornecedor.diasPrevEntrega)
          : '',
      diasEfectiEntrega:
        fornecedor.diasEfectiEntrega != null
          ? String(fornecedor.diasEfectiEntrega)
          : '',
      origem: fornecedor.origem != null ? String(fornecedor.origem) : '',
    })
  }, [fornecedor, form])

  const canSave = isCreate
    ? !createFornecedor.isPending
    : !!id && !!fornecedor && !updateFornecedor.isPending

  const onSubmit = async (values: FornecedorEditFormValues) => {
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
      createFornecedor.mutate(payload)
      return
    }
    if (!fornecedor) return
    const payload = buildUpdatePayload(fornecedor, payloadValues)
    updateFornecedor.mutate({ id, payload })
  }

  const title = isCreate
    ? 'Criar Fornecedor'
    : fornecedor?.nome
      ? `${isReadOnly ? 'Ver' : 'Editar'}: ${fornecedor.nome}`
      : isReadOnly
        ? 'Ver Fornecedor'
        : 'Editar Fornecedor'

  return (
    <>
      <PageHead title={`${title} | CliCloud`} />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>
            {isCreate
              ? 'Criar Fornecedor'
              : isReadOnly
                ? 'Ver Fornecedor'
                : 'Editar Fornecedor'}
          </h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                if (isCreate) {
                  queryClient.invalidateQueries({ queryKey: ['fornecedores-paginated'] })
                } else if (id) {
                  queryClient.invalidateQueries({ queryKey: ['fornecedor', id] })
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
              onClick={() => navigateManagedWindow(navigate, LISTAGEM_PATH)}
              title='Voltar'
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
                    .map((e) => (e as FieldError | undefined)?.message ?? '')
                    .filter(Boolean)[0]
                  toast.error(msg || 'Corrija os erros do formulário antes de gravar.')
                })}
                className='space-y-0'
              >
                <div className='border-b bg-muted px-4 py-4'>
                  <div className='flex flex-col sm:flex-row sm:items-end sm:justify-end gap-4'>
                    <Button type='submit' disabled={!canSave} size='sm' className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                      <Save className='h-4 w-4 mr-2' />
                      Guardar
                    </Button>
                  </div>
                </div>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className='px-4 py-4'
                >
                  <TabsList className='mb-4'>
                    <TabsTrigger value='entidade'>Entidade</TabsTrigger>
                    <TabsTrigger value='outros'>Outros</TabsTrigger>
                  </TabsList>
                  <TabsContent value='entidade'>
                    <TabFornecedorEntidade form={form} />
                  </TabsContent>
                  <TabsContent value='outros'>
                    <TabFornecedorOutros form={form} />
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          ) : isLoading ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              A carregar...
            </div>
          ) : !fornecedor ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              Fornecedor não encontrado.
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  const msg = Object.values(errors)
                    .map((e) => (e as FieldError | undefined)?.message ?? '')
                    .filter(Boolean)[0]
                  toast.error(msg || 'Corrija os erros do formulário antes de gravar.')
                })}
                className='space-y-0'
              >
                <div className='border-b bg-muted/30 px-4 py-4'>
                  <div className='flex flex-col sm:flex-row sm:items-end sm:justify-end gap-4'>
                    {!isReadOnly && (
                      <Button type='submit' disabled={!canSave} size='sm' className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                        <Save className='h-4 w-4 mr-2' />
                        Guardar
                      </Button>
                    )}
                    {isReadOnly && (
                      <Button
                        type='button'
                        variant='default'
                        onClick={() =>
                          navigateManagedWindow(
                            navigate,
                            `/fornecedores/${id}/editar`
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
                    <TabsTrigger value='entidade'>Entidade</TabsTrigger>
                    <TabsTrigger value='outros'>Outros</TabsTrigger>
                  </TabsList>
                  <TabsContent value='entidade'>
                    <TabFornecedorEntidade form={form} readOnly={isReadOnly} />
                  </TabsContent>
                  <TabsContent value='outros'>
                    <TabFornecedorOutros form={form} readOnly={isReadOnly} />
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
