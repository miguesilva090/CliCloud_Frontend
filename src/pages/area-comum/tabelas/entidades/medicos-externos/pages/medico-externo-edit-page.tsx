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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Save } from 'lucide-react'
import { EntityFormPageHeader } from '@/components/shared/entity-form-page-header'
import type {
  CreateMedicoExternoRequest,
  UpdateMedicoExternoRequest,
} from '@/types/dtos/saude/medicos-externos.dtos'
import type { MedicoExternoEditFormValues } from '../types/medico-externo-edit-form-types'
import { ENTIDADE_TIPO } from '@/lib/entidade-tipo'
import {
  useCreateMedicoExterno,
  useGetMedicoExterno,
  useUpdateMedicoExterno,
} from '../queries/medico-externo-queries'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useCurrentWindowId, handleWindowClose } from '@/utils/window-utils'

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  carteira: z.string().optional(),
  numeroContribuinte: z.string().optional(),
})

function buildCreatePayload(
  values: MedicoExternoEditFormValues
): CreateMedicoExternoRequest {
  return {
    nome: values.nome.trim(),
    tipoEntidadeId: ENTIDADE_TIPO.MedicoExterno,
    carteira: values.carteira?.trim() || undefined,
    numeroContribuinte: values.numeroContribuinte?.trim() || undefined,
  }
}


export function MedicoExternoEditPage() {
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

  const { data, isLoading } = useGetMedicoExterno(id)
  const medicoExterno = data?.info?.data

  const createMedicoExterno = useCreateMedicoExterno()
  const updateMedicoExterno = useUpdateMedicoExterno(id)

  const form = useForm<MedicoExternoEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      carteira: '',
      numeroContribuinte: '',
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!medicoExterno) return
    form.reset({
      nome: medicoExterno.nome ?? '',
      carteira: medicoExterno.carteira ?? '',
      numeroContribuinte: medicoExterno.numeroContribuinte ?? '',
    })
  }, [medicoExterno, form])

  const canSave = isCreate
    ? !createMedicoExterno.isPending
    : !!id && !!medicoExterno && !updateMedicoExterno.isPending

  const onSubmit = async (values: MedicoExternoEditFormValues) => {
    const payload: CreateMedicoExternoRequest | UpdateMedicoExternoRequest =
      buildCreatePayload(values)
    if (isCreate) {
      createMedicoExterno.mutate(payload)
      return
    }
    if (!medicoExterno) return
    updateMedicoExterno.mutate(payload)
  }

  const title = isCreate
    ? 'Criar Médico Externo'
    : medicoExterno?.nome
      ? `${isReadOnly ? 'Ver' : 'Editar'}: ${medicoExterno.nome}`
      : isReadOnly
        ? 'Ver Médico Externo'
        : 'Editar Médico Externo'

  return (
    <>
      <PageHead title={`${title} | CliCloud`} />
      <DashboardPageContainer>
        <EntityFormPageHeader
          title={
            isCreate
              ? 'Criar Médico Externo'
              : isReadOnly
                ? 'Ver Médico Externo'
                : 'Editar Médico Externo'
          }
          onBack={() => handleWindowClose(currentWindowId, navigate, removeWindow)}
          onRefresh={() => {
            if (isCreate) {
              queryClient.invalidateQueries({ queryKey: ['medicos-externos-paginated'] })
            } else if (id) {
              queryClient.invalidateQueries({ queryKey: ['medico-externo', id] })
            }
          }}
          rightActions={
            !isReadOnly ? (
              <Button
                type='submit'
                form='medico-externo-edit-form'
                disabled={!canSave}
                size='sm'
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                <Save className='h-4 w-4 mr-2' />
                Gravar Médico Externo
              </Button>
            ) : null
          }
        />

        <div className='rounded-b-lg border border-t-0 bg-background'>
          {isCreate ? (
            <Form {...form}>
              <form
                id='medico-externo-edit-form'
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
                <div className='px-4 py-4'>
                  <section className='space-y-4'>
                    <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
                      Dados do Médico Externo
                    </h3>
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2'>
                      <FormField
                        control={form.control}
                        name='nome'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome *</FormLabel>
                            <FormControl>
                              <Input
                                className='h-7'
                                placeholder='Nome do médico externo'
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
                        name='carteira'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carteira Profissional</FormLabel>
                            <FormControl>
                              <Input
                                className='h-7'
                                placeholder='Carteira profissional...'
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
                        name='numeroContribuinte'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nr. Contribuinte</FormLabel>
                            <FormControl>
                              <Input
                                className='h-7'
                                placeholder='Nº contribuinte...'
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>
                </div>
              </form>
            </Form>
          ) : isLoading ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              A carregar...
            </div>
          ) : !medicoExterno ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              Médico externo não encontrado.
            </div>
          ) : (
            <Form {...form}>
              <form
                id='medico-externo-edit-form'
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
                <div className='px-4 py-4'>
                  <section className='space-y-4'>
                    <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
                      Dados do Médico Externo
                    </h3>
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2'>
                      <FormField
                        control={form.control}
                        name='nome'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome *</FormLabel>
                            <FormControl>
                              <Input
                                className='h-7'
                                placeholder='Nome do médico externo'
                                readOnly={isReadOnly}
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
                        name='carteira'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carteira Profissional</FormLabel>
                            <FormControl>
                              <Input
                                className='h-7'
                                placeholder='Carteira profissional...'
                                readOnly={isReadOnly}
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
                        name='numeroContribuinte'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nr. Contribuinte</FormLabel>
                            <FormControl>
                              <Input
                                className='h-7'
                                placeholder='Nº contribuinte...'
                                readOnly={isReadOnly}
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DashboardPageContainer>
    </>
  )
}
