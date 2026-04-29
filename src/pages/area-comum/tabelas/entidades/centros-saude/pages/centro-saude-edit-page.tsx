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
import { Save } from 'lucide-react'
import { EntityFormPageHeader } from '@/components/shared/entity-form-page-header'
import type {
  CreateCentroSaudeRequest,
  UpdateCentroSaudeRequest,
  CentroSaudeDTO,
} from '@/types/dtos/saude/centro-saude.dtos'
import type { CentroSaudeEditFormValues } from '../types/centro-saude-edit-form-types'
import { ENTIDADE_TIPO, getTipoEntidadeIdForPayload } from '@/lib/entidade-tipo'
import { resolveRuaNomeToId } from '@/lib/utils/resolve-rua'
import {
  useCreateCentroSaude,
  useGetCentroSaude,
  useUpdateCentroSaude,
} from '../queries/centro-saude-queries'
import { TabCentroSaudeIdentificacao } from '../components/tab-centro-saude-identificacao'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useCurrentWindowId, handleWindowClose } from '@/utils/window-utils'

const schema = z
  .object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    codigoLocalCS: z.string().optional(),
    email: z.string().optional(),
    numeroContribuinte: z.string().optional(),
    observacoes: z.string().optional(),
    status: z.coerce.number().int().min(0).max(3),
    paisId: z.string().min(1, 'País é obrigatório'),
    distritoId: z.string().min(1, 'Distrito é obrigatório'),
    concelhoId: z.string().min(1, 'Concelho é obrigatório'),
    freguesiaId: z.string().min(1, 'Freguesia é obrigatória'),
    codigoPostalId: z.string().min(1, 'Código Postal é obrigatório'),
    rua: z.string().optional(),
    ruaId: z.string().optional(),
    numeroPorta: z.string().optional(),
    andarRua: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.email ||
      data.email.trim() === '' ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()),
    {
      message: 'Email inválido',
      path: ['email'],
    }
  )
  .refine((data) => (data.rua?.trim()) || (data.ruaId?.trim()), {
    message: 'Rua é obrigatória',
    path: ['rua'],
  })
  .passthrough()

function buildEntidadeContactos(values: CentroSaudeEditFormValues) {
  const contactos: Array<{
    entidadeContactoTipoId: number
    valor: string
    principal: boolean
  }> = []
  const emailVal = values.email?.trim() ?? ''
  if (emailVal) {
    contactos.push({
      entidadeContactoTipoId: 3,
      valor: emailVal,
      principal: true,
    })
  }
  return contactos
}

function buildCreatePayload(values: CentroSaudeEditFormValues): CreateCentroSaudeRequest {
  const nif = values.numeroContribuinte?.trim()
  return {
    nome: values.nome,
    tipoEntidadeId: ENTIDADE_TIPO.CentroSaude,
    email: values.email?.trim() ? values.email.trim() : null,
    ...(nif ? { numeroContribuinte: nif } : {}),
    ruaId: values.ruaId!,
    codigoPostalId: values.codigoPostalId,
    freguesiaId: values.freguesiaId,
    concelhoId: values.concelhoId,
    distritoId: values.distritoId,
    paisId: values.paisId,
    numeroPorta: values.numeroPorta?.trim() || '-',
    andarRua: values.andarRua?.trim() || '-',
    observacoes: values.observacoes ?? '',
    status: values.status ?? 1,
    entidadeContactos: (() => {
      const c = buildEntidadeContactos(values)
      return c.length > 0 ? c : undefined
    })(),
    codigoLocalCS: values.codigoLocalCS?.trim() || null,
  }
}

function ensureGuidString(v: string | undefined | null): string {
  if (v == null || v === '') return ''
  return typeof v === 'string' ? v : String(v)
}

function buildUpdatePayload(
  centro: CentroSaudeDTO,
  values: CentroSaudeEditFormValues
): UpdateCentroSaudeRequest {
  return {
    ...buildCreatePayload(values),
    ruaId: ensureGuidString(values.ruaId ?? centro.ruaId),
    codigoPostalId: ensureGuidString(values.codigoPostalId ?? centro.codigoPostalId),
    freguesiaId: ensureGuidString(values.freguesiaId ?? centro.freguesiaId),
    concelhoId: ensureGuidString(values.concelhoId ?? centro.concelhoId),
    distritoId: ensureGuidString(values.distritoId ?? centro.distritoId),
    paisId: ensureGuidString(values.paisId ?? centro.paisId),
    numeroPorta: (values.numeroPorta?.trim() || centro.numeroPorta) ?? '-',
    andarRua: (values.andarRua?.trim() || centro.andarRua) ?? '-',
    tipoEntidadeId: getTipoEntidadeIdForPayload(
      centro.tipoEntidadeId,
      ENTIDADE_TIPO.CentroSaude
    ),
  }
}

export function CentroSaudeEditPage() {
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

  const { data, isLoading } = useGetCentroSaude(id)
  const centro = data?.info?.data

  const createCentro = useCreateCentroSaude()
  const updateCentro = useUpdateCentroSaude(id)

  const form = useForm<CentroSaudeEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      codigoLocalCS: '',
      email: '',
      numeroContribuinte: '',
      observacoes: '',
      status: 1,
      paisId: '',
      distritoId: '',
      concelhoId: '',
      freguesiaId: '',
      codigoPostalId: '',
      rua: '',
      ruaId: '',
      numeroPorta: '',
      andarRua: '',
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!centro) return
    const emailContacto =
      centro.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 3)
        ?.valor ?? ''
    const toStr = (v: string | undefined | null): string =>
      v == null ? '' : typeof v === 'string' ? v : String(v)
    form.reset({
      nome: centro.nome ?? '',
      codigoLocalCS: centro.codigoLocalCS ?? '',
      email: centro.email ?? emailContacto ?? '',
      numeroContribuinte: centro.numeroContribuinte ?? '',
      observacoes: centro.observacoes ?? '',
      status: centro.status ?? 1,
      paisId: toStr(centro.paisId),
      distritoId: toStr(centro.distritoId),
      concelhoId: toStr(centro.concelhoId),
      freguesiaId: toStr(centro.freguesiaId),
      codigoPostalId: toStr(centro.codigoPostalId),
      rua: centro.rua?.nome ?? (centro.rua as { Nome?: string })?.Nome ?? '',
      ruaId: toStr(centro.ruaId),
      numeroPorta: centro.numeroPorta ?? '',
      andarRua: centro.andarRua ?? '',
    })
  }, [centro, form])

  const canSave = isCreate
    ? !createCentro.isPending
    : !!id && !!centro && !updateCentro.isPending

  const onSubmit = async (values: CentroSaudeEditFormValues) => {
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
    const guidRegexHyphen =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const guidRegexNoHyphen = /^[0-9a-f]{32}$/i
    const isGuid = (v: string) => guidRegexHyphen.test(v) || guidRegexNoHyphen.test(v)

    if (!payloadValues.ruaId || !isGuid(payloadValues.ruaId)) {
      toast.error('É necessário preencher a Rua com um valor existente ou verificar se a morada está completa.')
      return
    }
    if (isCreate) {
      const payload = buildCreatePayload(payloadValues)
      createCentro.mutate(payload)
      return
    }
    if (!centro) return
    const payload = buildUpdatePayload(centro, payloadValues)
    updateCentro.mutate(payload)
  }

  const title = isCreate
    ? 'Criar Centro de Saúde'
    : centro?.nome
      ? `${isReadOnly ? 'Ver' : 'Editar'}: ${centro.nome}`
      : isReadOnly
        ? 'Ver Centro de Saúde'
        : 'Editar Centro de Saúde'

  return (
    <>
      <PageHead title={`${title} | CliCloud`} />
      <DashboardPageContainer>
        <EntityFormPageHeader
          title={
            isCreate
              ? 'Criar Centro de Saúde'
              : isReadOnly
                ? 'Ver Centro de Saúde'
                : 'Editar Centro de Saúde'
          }
          onBack={() => handleWindowClose(currentWindowId, navigate, removeWindow)}
          onRefresh={() => {
            if (isCreate) {
              queryClient.invalidateQueries({ queryKey: ['centros-saude-paginated'] })
            } else if (id) {
              queryClient.invalidateQueries({ queryKey: ['centro-saude', id] })
            }
          }}
          rightActions={
            !isReadOnly ? (
              <Button
                type='submit'
                form='centro-saude-edit-form'
                disabled={!canSave}
                size='sm'
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                <Save className='h-4 w-4 mr-2' />
                Gravar Centro de Saúde
              </Button>
            ) : null
          }
        />

        <div className='rounded-b-lg border border-t-0 bg-background'>
          {isCreate ? (
            <Form {...form}>
              <form
                id='centro-saude-edit-form'
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  const msg = Object.values(errors)
                    .map((e) => (e?.message as string) ?? '')
                    .filter(Boolean)[0]
                  toast.error(msg || 'Corrija os erros do formulário antes de gravar.')
                })}
                className='space-y-0'
              >
                <div className='px-4 py-4'>
                  <TabCentroSaudeIdentificacao form={form} />
                </div>
              </form>
            </Form>
          ) : isLoading ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              A carregar...
            </div>
          ) : !centro ? (
            <div className='px-4 py-12 text-center text-muted-foreground'>
              Centro de Saúde não encontrado.
            </div>
          ) : (
            <Form {...form}>
              <form
                id='centro-saude-edit-form'
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  const msg = Object.values(errors)
                    .map((e) => (e?.message as string) ?? '')
                    .filter(Boolean)[0]
                  toast.error(msg || 'Corrija os erros do formulário antes de gravar.')
                })}
                className='space-y-0'
              >
                <div className='px-4 py-4'>
                  <TabCentroSaudeIdentificacao form={form} readOnly={isReadOnly} />
                </div>
              </form>
            </Form>
          )}
        </div>
      </DashboardPageContainer>
    </>
  )
}
