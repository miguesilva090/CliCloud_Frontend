import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'
import type {
  ConfigAdseDTO,
  GuardarConfigAdseRequest,
} from '@/types/dtos/faturacao/config-adse.dtos'
import { Eye, EyeOff } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { BaseApiError } from '@/lib/base-client'
import { ConfigAdseService } from '@/lib/services/faturacao/config-adse-service'
import { EmpresaService } from '@/lib/services/saude/empresa-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { useOrganismosLight } from '@/lib/services/utility/entity-quick-create/entity-quick-create-queries'
import { handleApiError } from '@/utils/error-handlers'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import { useConfigPageEditMode } from '@/hooks/use-config-page-edit-mode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { ConfigPageCardActions } from '@/components/shared/config-page-card-title-row'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'

const ADSE_PERM_ID = modules.areaFinanceira.permissions.adse.id

const extractApiErrorMessage = (response: unknown): string | null => {
  const root = response as
    | { status?: number; messages?: Record<string, string[]> }
    | undefined
  if (!root?.messages) return null

  if (root.status === ResponseStatus.Failure) {
    const allMessages = Object.values(root.messages).flat().filter(Boolean)
    if (allMessages.length > 0) return allMessages[0]
  }

  return null
}

const resolveMutationErrorMessage = (error: unknown): string => {
  if (error instanceof BaseApiError) {
    const apiMessage = extractApiErrorMessage(error.data)
    if (apiMessage) return apiMessage

    if (typeof error.data === 'string' && error.data.trim()) {
      return error.data
    }

    return handleApiError(
      {
        info: error.data as {
          status: ResponseStatus
          messages: Record<string, string[]>
        },
      },
      error.message
    )
  }

  return handleApiError(error, 'Falha ao guardar configurações ADSE.')
}

type ConfigAdseForm = {
  organismoAdseId: string
  organismoAdseLabel: string
  entidadeFisioterapiaId: string
  entidadeFisioterapiaLabel: string
  urlWebService: string
  dominio: string
  userLogin: string
  password: string
  passwordAdse: string
  numeroLocal: string
  caminhoPdf: string
}

const mapDtoToForm = (
  dto: ConfigAdseDTO,
  labels?: { empresaLabel?: string; organismoLabel?: string }
): ConfigAdseForm => ({
  organismoAdseId: dto.organismoId ? String(dto.organismoId) : '',
  organismoAdseLabel: labels?.organismoLabel ?? '',
  entidadeFisioterapiaId: dto.empresaId ? String(dto.empresaId) : '',
  entidadeFisioterapiaLabel: labels?.empresaLabel ?? '',
  urlWebService: dto.urlADSE ?? '',
  dominio: dto.dominio ?? '',
  userLogin: dto.utilizador ?? '',
  password: dto.password ?? '',
  passwordAdse: dto.passwordLocal ?? '',
  numeroLocal: dto.numeroLocal != null ? String(dto.numeroLocal) : '',
  caminhoPdf: dto.urlPasta ?? '',
})

const initialForm: ConfigAdseForm = {
  organismoAdseId: '',
  organismoAdseLabel: '',
  entidadeFisioterapiaId: '',
  entidadeFisioterapiaLabel: '',
  urlWebService: '',
  dominio: '',
  userLogin: '',
  password: '',
  passwordAdse: '',
  numeroLocal: '',
  caminhoPdf: '',
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  readOnly,
  disabled,
  showPassword,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  readOnly: boolean
  disabled: boolean
  showPassword: boolean
}) {
  return (
    <div className='space-y-1'>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        readOnly={readOnly}
        disabled={disabled}
        maxLength={255}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function ConfiguracoesADSEPage() {
  const {
    canChange,
    isEditing,
    formEditable,
    startEditing,
    cancelEditing,
    exitEditAfterSave,
  } = useConfigPageEditMode(ADSE_PERM_ID)

  const [form, setForm] = useState<ConfigAdseForm>(initialForm)
  const [showPasswords, setShowPasswords] = useState(false)
  const [organismoSearch, setOrganismoSearch] = useState('')
  const [empresaSearch, setEmpresaSearch] = useState('')
  const [organismoSearchDebounced] = useDebounce(organismoSearch, 250)
  const [empresaSearchDebounced] = useDebounce(empresaSearch, 250)
  const initialBootstrapDone = useRef(false)

  const configListQuery = useQuery({
    queryKey: ['config-adse', 'list'],
    queryFn: () => ConfigAdseService(ADSE_PERM_ID).listConfiguracoes(),
  })

  const configQuery = useQuery({
    queryKey: ['config-adse', form.entidadeFisioterapiaId],
    queryFn: () =>
      ConfigAdseService(ADSE_PERM_ID).getConfiguracao(
        form.entidadeFisioterapiaId
      ),
    enabled: Boolean(form.entidadeFisioterapiaId.trim()),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: {
      empresaId: string
      body: GuardarConfigAdseRequest
    }) =>
      ConfigAdseService(ADSE_PERM_ID).guardarConfiguracao(
        payload.empresaId,
        payload.body
      ),
    onSuccess: (response) => {
      const { success } = handleApiResponse(
        response,
        'Configurações ADSE guardadas com sucesso.',
        'Falha ao guardar configurações ADSE.'
      )
      if (!success) return

      exitEditAfterSave()
      void configQuery.refetch()
    },
    onError: (error) => {
      toast.error(resolveMutationErrorMessage(error))
    },
  })

  useEffect(() => {
    if (initialBootstrapDone.current) return

    const list = (
      configListQuery.data as { info?: { data?: ConfigAdseDTO[] } } | undefined
    )?.info?.data
    const first = list?.[0]
    const empresaId = first?.empresaId ? String(first.empresaId) : ''
    if (!empresaId) return

    initialBootstrapDone.current = true
    cancelEditing()

    void (async () => {
      let empresaLabel = empresaId

      try {
        const empresaRes =
          await EmpresaService(ADSE_PERM_ID).getEmpresa(empresaId)
        empresaLabel = empresaRes.info?.data?.nome ?? empresaLabel
      } catch {
        // mantém o id como fallback
      }

      setForm((prev) => ({
        ...prev,
        entidadeFisioterapiaId: empresaId,
        entidadeFisioterapiaLabel: empresaLabel,
      }))
    })()
  }, [cancelEditing, configListQuery.data])

  useEffect(() => {
    const dto = (
      configQuery.data as { info?: { data?: ConfigAdseDTO } } | undefined
    )?.info?.data
    if (!dto?.empresaId) return

    void (async () => {
      let organismoLabel = ''
      if (dto.organismoId) {
        const organismoId = String(dto.organismoId)
        try {
          const organismoRes =
            await OrganismoService(ADSE_PERM_ID).getOrganismo(organismoId)
          organismoLabel = organismoRes.info?.data?.nome ?? organismoId
        } catch {
          organismoLabel = organismoId
        }
      }

      setForm((prev) => ({
        ...mapDtoToForm(dto, {
          empresaLabel: prev.entidadeFisioterapiaLabel || String(dto.empresaId),
          organismoLabel,
        }),
        entidadeFisioterapiaId: dto.empresaId
          ? String(dto.empresaId)
          : prev.entidadeFisioterapiaId,
        entidadeFisioterapiaLabel: prev.entidadeFisioterapiaLabel,
      }))
    })()
  }, [configQuery.data])

  const organismosQuery = useOrganismosLight(organismoSearchDebounced)
  const empresasQuery = useQuery({
    queryKey: ['empresas', 'config-adse', empresaSearchDebounced],
    queryFn: () =>
      EmpresaService(ADSE_PERM_ID).getEmpresasPaginated({
        pageNumber: 1,
        pageSize: 25,
        filters: empresaSearchDebounced
          ? [{ id: 'nome', value: empresaSearchDebounced }]
          : [],
      }),
  })

  const organismoItems = useMemo(() => {
    const list = organismosQuery.data?.info?.data ?? []
    const mapped = list.map((o) => ({
      value: o.id,
      label: o.nome ?? o.id,
    }))
    if (
      form.organismoAdseId &&
      form.organismoAdseLabel &&
      !mapped.some((item) => item.value === form.organismoAdseId)
    ) {
      return [
        { value: form.organismoAdseId, label: form.organismoAdseLabel },
        ...mapped,
      ]
    }
    return mapped
  }, [form.organismoAdseId, form.organismoAdseLabel, organismosQuery.data])

  const empresaItems = useMemo(() => {
    const list = empresasQuery.data?.info?.data ?? []
    const mapped = list.map((e) => ({
      value: e.id,
      label: e.nome ?? e.id,
    }))
    if (
      form.entidadeFisioterapiaId &&
      form.entidadeFisioterapiaLabel &&
      !mapped.some((item) => item.value === form.entidadeFisioterapiaId)
    ) {
      return [
        {
          value: form.entidadeFisioterapiaId,
          label: form.entidadeFisioterapiaLabel,
        },
        ...mapped,
      ]
    }
    return mapped
  }, [
    empresasQuery.data,
    form.entidadeFisioterapiaId,
    form.entidadeFisioterapiaLabel,
  ])

  const formLocked = !formEditable
  const fieldDisabled = formLocked || saveMutation.isPending

  const patch = (partial: Partial<ConfigAdseForm>) => {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  const validate = (): GuardarConfigAdseRequest | null => {
    if (!form.organismoAdseId.trim()) {
      toast.warning('Organismo ADSE é obrigatório.')
      return null
    }
    if (!form.entidadeFisioterapiaId.trim()) {
      toast.warning('Entidade Fisioterapia é obrigatória.')
      return null
    }
    if (!form.urlWebService.trim()) {
      toast.warning('Url Web Service é obrigatório.')
      return null
    }
    if (!form.dominio.trim()) {
      toast.warning('Domínio é obrigatório.')
      return null
    }
    if (!form.userLogin.trim()) {
      toast.warning('User Login é obrigatório.')
      return null
    }
    if (!form.password.trim()) {
      toast.warning('Password é obrigatória.')
      return null
    }
    if (!form.passwordAdse.trim()) {
      toast.warning('Password ADSE é obrigatória.')
      return null
    }
    const numeroLocal = Number(form.numeroLocal)
    if (!form.numeroLocal.trim() || Number.isNaN(numeroLocal)) {
      toast.warning('Número Local é obrigatório.')
      return null
    }
    if (!form.caminhoPdf.trim()) {
      toast.warning('Caminho PDF é obrigatório.')
      return null
    }

    return {
      empresaId: form.entidadeFisioterapiaId.trim(),
      organismoId: form.organismoAdseId.trim(),
      urlADSE: form.urlWebService.trim(),
      dominio: form.dominio.trim(),
      utilizador: form.userLogin.trim(),
      password: form.password,
      passwordLocal: form.passwordAdse,
      numeroLocal,
      urlPasta: form.caminhoPdf.trim(),
    }
  }

  const handleGuardar = () => {
    const payload = validate()
    if (!payload) return

    saveMutation.mutate({
      empresaId: form.entidadeFisioterapiaId.trim(),
      body: payload,
    })
  }

  return (
    <>
      <PageHead title='Configurações ADSE | Área Financeira' />
      <DashboardPageContainer>
        <AreaComumDashboardCard
          title='Configurações ADSE'
          contentClassName='space-y-6'
          headerTrailing={
            <>
              <Button
                type='button'
                variant='outline'
                onClick={() => setShowPasswords((v) => !v)}
              >
                {showPasswords ? (
                  <EyeOff className='mr-2 h-4 w-4' />
                ) : (
                  <Eye className='mr-2 h-4 w-4' />
                )}
                {showPasswords ? 'Ocultar passwords' : 'Mostrar passwords'}
              </Button>
              <ConfigPageCardActions
                canChange={canChange}
                isEditing={isEditing}
                onStartEdit={startEditing}
                onCancelEdit={() => {
                  cancelEditing()
                  void configQuery.refetch()
                }}
              />
            </>
          }
        >
          {configListQuery.isLoading ||
          (configQuery.isFetching && form.entidadeFisioterapiaId) ? (
            <p className='text-sm text-muted-foreground'>
              A carregar configuração...
            </p>
          ) : null}

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-1'>
              <Label>Organismo ADSE</Label>
              <AsyncCombobox
                value={form.organismoAdseId}
                onChange={(id) => {
                  const item = organismoItems.find((o) => o.value === id)
                  patch({
                    organismoAdseId: id,
                    organismoAdseLabel: item?.label ?? '',
                  })
                }}
                items={organismoItems}
                isLoading={organismosQuery.isFetching}
                placeholder='Organismo ADSE'
                searchPlaceholder='Pesquisar organismo...'
                emptyText='Sem organismos'
                disabled={fieldDisabled}
                searchValue={organismoSearch}
                onSearchValueChange={setOrganismoSearch}
              />
            </div>
            <div className='space-y-1'>
              <Label>Entidade Fisioterapia</Label>
              <AsyncCombobox
                value={form.entidadeFisioterapiaId}
                onChange={(id) => {
                  const item = empresaItems.find((e) => e.value === id)
                  patch({
                    entidadeFisioterapiaId: id,
                    entidadeFisioterapiaLabel: item?.label ?? '',
                  })
                }}
                items={empresaItems}
                isLoading={empresasQuery.isFetching}
                placeholder='Entidade Fisioterapia'
                searchPlaceholder='Pesquisar empresa...'
                emptyText='Sem empresas'
                disabled={fieldDisabled}
                searchValue={empresaSearch}
                onSearchValueChange={setEmpresaSearch}
              />
            </div>
          </div>

          <div className='grid gap-4 lg:grid-cols-2'>
            <section className='space-y-3 rounded-md border p-4'>
              <h3 className='border-b pb-2 text-sm font-semibold text-primary'>
                Credenciais ADSE
              </h3>
              <div className='space-y-3'>
                <div className='space-y-1'>
                  <Label htmlFor='url-web-service'>Url Web Service</Label>
                  <Input
                    id='url-web-service'
                    value={form.urlWebService}
                    readOnly={formLocked}
                    disabled={fieldDisabled}
                    onChange={(e) => patch({ urlWebService: e.target.value })}
                  />
                </div>
                <div className='grid gap-3 sm:grid-cols-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='dominio'>Domínio</Label>
                    <Input
                      id='dominio'
                      value={form.dominio}
                      readOnly={formLocked}
                      disabled={fieldDisabled}
                      onChange={(e) => patch({ dominio: e.target.value })}
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label htmlFor='user-login'>User Login</Label>
                    <Input
                      id='user-login'
                      value={form.userLogin}
                      readOnly={formLocked}
                      disabled={fieldDisabled}
                      onChange={(e) => patch({ userLogin: e.target.value })}
                    />
                  </div>
                  <PasswordField
                    id='password'
                    label='Password'
                    value={form.password}
                    onChange={(value) => patch({ password: value })}
                    readOnly={formLocked}
                    disabled={fieldDisabled}
                    showPassword={showPasswords}
                  />
                </div>
              </div>
            </section>

            <section className='space-y-3'>
              <PasswordField
                id='password-adse'
                label='Password ADSE'
                value={form.passwordAdse}
                onChange={(value) => patch({ passwordAdse: value })}
                readOnly={formLocked}
                disabled={fieldDisabled}
                showPassword={showPasswords}
              />
              <div className='space-y-1'>
                <Label htmlFor='numero-local'>Número Local</Label>
                <Input
                  id='numero-local'
                  type='number'
                  value={form.numeroLocal}
                  readOnly={formLocked}
                  disabled={fieldDisabled}
                  onChange={(e) => patch({ numeroLocal: e.target.value })}
                />
              </div>
            </section>
          </div>

          <div className='space-y-1'>
            <Label htmlFor='caminho-pdf'>Caminho PDF</Label>
            <Input
              id='caminho-pdf'
              value={form.caminhoPdf}
              readOnly={formLocked}
              disabled={fieldDisabled}
              onChange={(e) => patch({ caminhoPdf: e.target.value })}
            />
          </div>

          <div className='flex justify-end'>
            <Button
              type='button'
              onClick={handleGuardar}
              disabled={!formEditable || saveMutation.isPending}
            >
              {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
            </Button>
          </div>
        </AreaComumDashboardCard>
      </DashboardPageContainer>
    </>
  )
}
