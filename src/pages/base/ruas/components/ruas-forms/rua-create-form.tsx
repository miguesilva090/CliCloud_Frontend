import { useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useGetCodigosPostaisSelect } from '@/pages/base/codigospostais/queries/codigospostais-queries'
import { useGetFreguesiasSelect } from '@/pages/base/freguesias/queries/freguesias-queries'
import { useCreateRua } from '@/pages/base/ruas/queries/ruas-mutations'
import { MapPin, Building2, Mail, Plus, Eye } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFormState, useFormsStore } from '@/stores/use-forms-store'
import { useWindowsStore } from '@/stores/use-windows-store'
import { toast } from '@/utils/toast-utils'
import {
  useCurrentWindowId,
  handleWindowClose,
  updateCreateFormData,
  cleanupWindowForms,
  updateCreateWindowTitle,
  detectFormChanges,
  openFreguesiaCreationWindow,
  openCodigoPostalCreationWindow,
  openFreguesiaViewWindow,
  openCodigoPostalViewWindow,
} from '@/utils/window-utils'
import { useAutoSelectionWithReturnData } from '@/hooks/use-auto-selection-with-return-data'
import { useFormChangeTracking } from '@/hooks/use-form-change-tracking'
import { useFormDataLoader } from '@/hooks/use-form-data-loader'
import { useFormInitialization } from '@/hooks/use-form-initialization'
import { useFormSubmission } from '@/hooks/use-form-submission'
import { useFormValidationFeedback } from '@/hooks/use-form-validation-feedback'
import { useTabManager } from '@/hooks/use-tab-manager'
import { useZodResolver } from '@/hooks/use-zod-resolver'
import { Autocomplete } from '@/components/ui/autocomplete'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  PersistentTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/persistent-tabs'

const ruaFormSchema = z.object({
  nome: z.string().min(1, { message: 'O nome é obrigatório' }),
  freguesiaId: z.string().min(1, { message: 'A freguesia é obrigatória' }),
  codigoPostalId: z
    .string()
    .min(1, { message: 'O código postal é obrigatório' }),
})

type RuaFormValues = z.infer<typeof ruaFormSchema>

interface RuaCreateFormProps {
  modalClose: () => void
  preSelectedFreguesiaId?: string
  preSelectedCodigoPostalId?: string
  initialNome?: string
  onSuccess?: (newRua: { id: string; nome: string }) => void
  shouldCloseWindow?: boolean
}

const RuaCreateForm = ({
  modalClose,
  preSelectedFreguesiaId,
  preSelectedCodigoPostalId,
  initialNome,
  onSuccess,
  shouldCloseWindow = true,
}: RuaCreateFormProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const windowId = useCurrentWindowId()
  const searchParams = new URLSearchParams(location.search)
  const instanceId = searchParams.get('instanceId') || 'default'
  const formId = `rua-${instanceId}`

  // Get parent window ID from sessionStorage as fallback
  const parentWindowIdFromStorage = sessionStorage.getItem(
    `parent-window-${instanceId}`
  )
  const effectiveWindowId = windowId || instanceId

  const { formData, isInitialized, hasBeenVisited } = useFormState(formId)
  const { setFormState, resetFormState, hasFormData } = useFormsStore()
  const { removeWindow, updateWindowState, findWindowByPathAndInstanceId } =
    useWindowsStore()
  const setWindowHasFormData = useWindowsStore(
    (state) => state.setWindowHasFormData
  )

  // Use the custom form initialization hook to handle first-render setup
  useFormInitialization({
    formId,
    effectiveWindowId,
    hasBeenVisited,
    hasFormData,
    resetFormState,
    setFormState,
    initialFormData: {}, // Create forms start with empty data
    initialIsValid: false, // Create forms start as invalid
  })

  const {
    data: freguesiasData,
    isLoading: isLoadingFreguesias,
    refetch: refetchFreguesias,
  } = useGetFreguesiasSelect()
  const {
    data: codigosPostaisData,
    isLoading: isLoadingCodigosPostais,
    refetch: refetchCodigosPostais,
  } = useGetCodigosPostaisSelect()
  const createRuaMutation = useCreateRua()

  // Define default values for proper change detection
  const defaultValues = useMemo(
    () => ({
      nome: '',
      freguesiaId: '',
      codigoPostalId: '',
    }),
    []
  )

  const ruaResolver = useZodResolver(ruaFormSchema)

  const form = useForm<RuaFormValues>({
    resolver: ruaResolver,
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    criteriaMode: 'all',
  })

  const { setActiveTab } = useTabManager({
    defaultTab: 'dados',
    tabKey: `rua-${instanceId}`,
  })
  const { onInvalid } = useFormValidationFeedback<RuaFormValues>({
    setActiveTab,
  })

  // ============================================================================
  // FORM INITIALIZATION - Handled by useFormInitialization hook
  // ============================================================================

  // Use the custom form data loader hook to load saved form data
  useFormDataLoader({
    form,
    formData,
    isInitialized,
    formId,
    hasFormData,
    fallbackValues: {
      nome: initialNome || '',
      freguesiaId: preSelectedFreguesiaId || '',
      codigoPostalId: preSelectedCodigoPostalId || '',
    },
    shouldApplyFallback:
      !!preSelectedFreguesiaId || !!preSelectedCodigoPostalId || !!initialNome,
  })

  // Use the custom form change tracking hook to handle form persistence
  useFormChangeTracking({
    formId,
    effectiveWindowId,
    form,
    setFormState,
    defaultValues,
    setWindowHasFormData,
    updateCreateFormData,
    updateCreateWindowTitle,
    updateWindowState,
    detectFormChanges,
  })

  // Use the combined auto-selection hook for freguesias (create form doesn't need return data)
  console.log('[RUA-FORM] Freguesia auto-selection setup:', {
    effectiveWindowId,
    instanceId,
    parentWindowIdFromStorage,
    windowId,
  })
  useAutoSelectionWithReturnData({
    windowId: effectiveWindowId,
    instanceId,
    data: freguesiasData || [],
    setValue: (value: string) => {
      console.log('[RUA-FORM] Setting freguesiaId:', value)
      form.setValue('freguesiaId', value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    },
    refetch: refetchFreguesias,
    itemName: 'Freguesia',
    successMessage: 'Freguesia selecionada automaticamente',
    manualSelectionMessage:
      'Freguesia criada com sucesso. Por favor, selecione-a manualmente.',
    queryKey: ['freguesias-select'],
    returnDataKey: `return-data-${effectiveWindowId}-freguesia`, // Not used in create forms, but required by hook
  })

  // Use the combined auto-selection hook for codigos postais (create form doesn't need return data)
  console.log('[RUA-FORM] Codigo Postal auto-selection setup:', {
    effectiveWindowId,
    instanceId,
    parentWindowIdFromStorage,
    windowId,
  })
  useAutoSelectionWithReturnData({
    windowId: effectiveWindowId,
    instanceId,
    data: codigosPostaisData || [],
    setValue: (value: string) => {
      console.log('[RUA-FORM] Setting codigoPostalId:', value)
      form.setValue('codigoPostalId', value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    },
    refetch: refetchCodigosPostais,
    itemName: 'Código Postal',
    successMessage: 'Código postal selecionado automaticamente',
    manualSelectionMessage:
      'Código postal criado com sucesso. Por favor, selecione-o manualmente.',
    queryKey: ['codigospostais-select'],
    returnDataKey: `return-data-${effectiveWindowId}-codigo postal`, // Match the normalized entity type format
  })

  const handleClose = () => {
    // Clean up all form instances for the current window
    cleanupWindowForms(effectiveWindowId)

    if (shouldCloseWindow) {
      handleWindowClose(effectiveWindowId, navigate, removeWindow)
    } else {
      modalClose()
    }
  }

  const handleCreateFreguesia = () => {
    // Open freguesia creation in a new window with parent reference
    openFreguesiaCreationWindow(
      navigate,
      effectiveWindowId,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }

  const handleViewFreguesia = () => {
    const freguesiaId = form.getValues('freguesiaId')
    if (!freguesiaId) {
      toast.error('Por favor, selecione uma freguesia primeiro')
      return
    }

    // Open freguesia view in a new window
    openFreguesiaViewWindow(
      navigate,
      effectiveWindowId,
      freguesiaId,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }

  const handleCreateCodigoPostal = () => {
    // Open codigo postal creation in a new window with parent reference
    openCodigoPostalCreationWindow(
      navigate,
      effectiveWindowId,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }

  const handleViewCodigoPostal = () => {
    const codigoPostalId = form.getValues('codigoPostalId')
    if (!codigoPostalId) {
      toast.error('Por favor, selecione um código postal primeiro')
      return
    }

    // Open codigo postal view in a new window
    openCodigoPostalViewWindow(
      navigate,
      effectiveWindowId,
      codigoPostalId,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }

  // Use the custom form submission hook to handle the common submission pattern
  const { onSubmit, isSubmitting } = useFormSubmission({
    formId,
    effectiveWindowId,
    instanceId,
    parentWindowIdFromStorage,
    mutation: createRuaMutation,
    successMessage: 'Rua criada com sucesso',
    errorMessage: 'Erro ao criar rua',
    warningMessage: 'Rua criada com avisos',
    entityType: 'rua',
    onSuccess: onSuccess
      ? (newEntity: { id: string; [key: string]: any }) => {
          onSuccess({
            id: newEntity.id,
            nome: newEntity.nome,
          })
        }
      : undefined,
    modalClose,
    shouldCloseWindow,
  })

  const sortedFreguesias =
    freguesiasData?.slice().sort((a, b) => a.nome.localeCompare(b.nome)) || []
  const sortedCodigosPostais =
    codigosPostaisData
      ?.slice()
      .sort((a, b) => a.codigo.localeCompare(b.codigo)) || []

  return (
    <div className='space-y-4'>
      <Form {...form}>
        <form
          id='ruaCreateForm'
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className='space-y-4'
          autoComplete='off'
        >
          <PersistentTabs
            defaultValue='dados'
            className='w-full'
            tabKey={`rua-${instanceId}`}
          >
            <TabsList>
              <TabsTrigger value='dados'>Dados da Rua</TabsTrigger>
            </TabsList>
            <TabsContent value='dados'>
              <Card className='overflow-hidden border-l-4 border-l-primary/20 hover:border-l-primary/40 transition-all duration-200 hover:shadow-md'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary'>
                      <MapPin className='h-4 w-4' />
                    </div>
                    <div>
                      <CardTitle className='text-base flex items-center gap-2'>
                        Informações da Rua
                        <Badge variant='secondary' className='text-xs'>
                          Obrigatório
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Defina os dados básicos da rua e sua localização
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='nome'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <MapPin className='h-4 w-4' />
                            Nome da Rua
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Introduza o nome da rua'
                              {...field}
                              className='px-4 py-6 shadow-inner drop-shadow-xl'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='freguesiaId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Building2 className='h-4 w-4' />
                            Freguesia
                          </FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <Autocomplete
                                options={sortedFreguesias.map((freguesia) => ({
                                  value: freguesia.id || '',
                                  label: freguesia.nome,
                                }))}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder={
                                  isLoadingFreguesias
                                    ? 'A carregar...'
                                    : 'Selecione uma freguesia'
                                }
                                emptyText='Nenhuma freguesia encontrada.'
                                disabled={isLoadingFreguesias}
                                className='px-4 py-6 pr-32 shadow-inner drop-shadow-xl'
                              />
                              <div className='absolute right-12 top-1/2 -translate-y-1/2 flex gap-1'>
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={handleViewFreguesia}
                                  className='h-8 w-8 p-0'
                                  title='Ver Freguesia'
                                  disabled={!field.value}
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={handleCreateFreguesia}
                                  className='h-8 w-8 p-0'
                                  title='Criar Nova Freguesia'
                                >
                                  <Plus className='h-4 w-4' />
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='codigoPostalId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Mail className='h-4 w-4' />
                            Código Postal
                          </FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <Autocomplete
                                options={sortedCodigosPostais.map(
                                  (codigoPostal) => ({
                                    value: codigoPostal.id || '',
                                    label: codigoPostal.codigo,
                                  })
                                )}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder={
                                  isLoadingCodigosPostais
                                    ? 'A carregar...'
                                    : 'Selecione um código postal'
                                }
                                emptyText='Nenhum código postal encontrado.'
                                disabled={isLoadingCodigosPostais}
                                className='px-4 py-6 pr-32 shadow-inner drop-shadow-xl'
                              />
                              <div className='absolute right-12 top-1/2 -translate-y-1/2 flex gap-1'>
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={handleViewCodigoPostal}
                                  className='h-8 w-8 p-0'
                                  title='Ver Código Postal'
                                  disabled={!field.value}
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={handleCreateCodigoPostal}
                                  className='h-8 w-8 p-0'
                                  title='Criar Novo Código Postal'
                                >
                                  <Plus className='h-4 w-4' />
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </PersistentTabs>

          <div className='flex flex-col justify-end space-y-2 pt-4 md:flex-row md:space-x-4 md:space-y-0'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              className='w-full md:w-auto'
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='w-full md:w-auto'
            >
              {isSubmitting ? 'A criar...' : 'Criar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export { RuaCreateForm }
