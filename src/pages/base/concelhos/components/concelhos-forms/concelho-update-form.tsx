import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useUpdateConcelho } from '@/pages/base/concelhos/queries/concelhos-mutations'
import {
  useGetDistritosSelect,
  useGetDistrito,
} from '@/pages/base/distritos/queries/distritos-queries'
import { useGetPaisesSelect } from '@/pages/base/paises/queries/paises-queries'
import { Tag, Globe, Plus, Eye } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFormState, useFormsStore } from '@/stores/use-forms-store'
import { useWindowsStore } from '@/stores/use-windows-store'
import { toast } from '@/utils/toast-utils'
import {
  useCurrentWindowId,
  handleWindowClose,
  updateWindowFormData,
  cleanupWindowForms,
  updateUpdateWindowTitle,
  detectUpdateFormChanges,
  openDistritoViewWindow,
  openDistritoCreationWindow,
} from '@/utils/window-utils'
import { useAutoSelectionWithReturnData } from '@/hooks/use-auto-selection-with-return-data'
import { useFormDataLoaderUpdate } from '@/hooks/use-form-data-loader-update'
import { useFormUpdateChangeTracking } from '@/hooks/use-form-update-change-tracking'
import { useFormUpdateInitialization } from '@/hooks/use-form-update-initialization'
import { useFormUpdateSubmission } from '@/hooks/use-form-update-submission'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LazyFlag } from '@/components/shared/lazy-flag'

const concelhoFormSchema = z.object({
  nome: z.string().min(1, { message: 'O nome é obrigatório' }),
  paisId: z.string().min(1, { message: 'O país é obrigatório' }),
  distritoId: z.string().min(1, { message: 'O distrito é obrigatório' }),
})

type ConcelhoFormValues = z.infer<typeof concelhoFormSchema>

interface ConcelhoUpdateFormProps {
  modalClose: () => void
  concelhoId: string
  initialData: {
    nome: string
    distritoId: string
  }
}

const ConcelhoUpdateForm = ({
  modalClose,
  concelhoId,
  initialData,
}: ConcelhoUpdateFormProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const windowId = useCurrentWindowId()
  const searchParams = new URLSearchParams(location.search)
  const instanceId = searchParams.get('instanceId') || 'default'
  // Use BOTH entityId and instanceId for form data persistence
  // - entityId: Groups data for the same entity (survives page refresh)
  // - instanceId: Separates data per window (allows multiple windows for same entity)
  const formId = `concelho-update-${concelhoId}-${instanceId}`

  const { formData, isInitialized, hasBeenVisited } = useFormState(formId)
  const {
    setFormState,
    updateFormState,
    resetFormState,
    hasFormData,
    initializeForm,
  } = useFormsStore()

  const { removeWindow, updateWindowState, findWindowByPathAndInstanceId } =
    useWindowsStore()
  const setWindowHasFormData = useWindowsStore(
    (state) => state.setWindowHasFormData
  )

  const updateConcelhoMutation = useUpdateConcelho()

  // Location selection states - initialize empty, will be set by hook
  const [selectedPaisId, setSelectedPaisId] = useState<string>('')
  const [isLoadingFromPersistedData, setIsLoadingFromPersistedData] =
    useState(false)

  // Fetch the initial distrito to get its paisId
  const { data: initialDistrito } = useGetDistrito(initialData.distritoId || '')

  // Get initial paisId from distrito (same pattern as entidades but we need to fetch it)
  const initialPaisId = useMemo(() => {
    if (initialDistrito?.paisId) {
      return initialDistrito.paisId
    }
    return undefined
  }, [initialDistrito])

  // Fetch paises
  const { data: paisesSelectData = [], isLoading: isLoadingPaises } =
    useGetPaisesSelect()

  // Fetch distritos (same pattern as entidades - fetch all, filter in frontend)
  const {
    data: distritosSelectData = [],
    isLoading: isLoadingDistritos,
    refetch: refetchDistritos,
  } = useGetDistritosSelect()

  const concelhoResolver = useZodResolver(concelhoFormSchema)

  // CRITICAL: Don't use defaultValues from initialData - let the hook load data instead
  // This prevents showing old data when component remounts after update
  // Initialize with empty values, the hook will populate them
  const form = useForm<ConcelhoFormValues>({
    resolver: concelhoResolver,
    defaultValues: {
      nome: '',
      paisId: '',
      distritoId: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    criteriaMode: 'all',
  })

  const { setActiveTab } = useTabManager({
    defaultTab: 'dados',
    tabKey: `concelho-${instanceId}`,
  })
  const { onInvalid } = useFormValidationFeedback<ConcelhoFormValues>({
    setActiveTab,
  })

  // Use the combined auto-selection and return data hook for distritos
  // Filter distritos by selectedPaisId (same pattern as entidades)
  const filteredDistritos = useMemo(() => {
    if (!selectedPaisId) return []
    return distritosSelectData.filter(
      (distrito) => distrito.paisId === selectedPaisId
    )
  }, [distritosSelectData, selectedPaisId])

  useAutoSelectionWithReturnData({
    windowId,
    instanceId,
    data: filteredDistritos,
    setValue: (value: string) => form.setValue('distritoId', value),
    refetch: refetchDistritos,
    itemName: 'Distrito',
    successMessage: 'Distrito selecionado automaticamente',
    manualSelectionMessage:
      'Distrito criado com sucesso. Por favor, selecione-o manualmente.',
    queryKey: ['distritos-select'],
    returnDataKey: `return-data-${windowId}-distrito`,
  })

  // Use the custom form update initialization hook to handle first-render setup
  useFormUpdateInitialization({
    formId,
    windowId,
    hasBeenVisited,
    hasFormData,
    resetFormState,
    setFormState,
    initializeForm,
    apiData: { nome: initialData.nome },
    updateWindowState,
    updateUpdateWindowTitle,
  })

  // Use the custom form data loader hook for update forms
  // Pass initialData with paisId added - hook will capture it once and never update it
  // Same pattern as entidades, but we add paisId from distrito
  useFormDataLoaderUpdate({
    form,
    formData,
    isInitialized,
    formId,
    hasFormData,
    apiData: {
      ...initialData,
      paisId: initialPaisId || '',
    },
    onDataLoaded: (data) => {
      // Set flag to prevent clearing selectedPaisId during form reset
      setIsLoadingFromPersistedData(true)

      // Synchronize local state variables with restored form data
      // This has priority over initialPaisId from API
      if (data?.paisId) {
        // Set immediately to prevent Select from clearing the value
        setSelectedPaisId(data.paisId)
        // Use setTimeout to ensure form value is restored after form.reset() completes
        setTimeout(() => {
          // Also ensure form has the paisId value (in case form.reset() cleared it)
          const currentFormPaisId = form.getValues('paisId')
          if (!currentFormPaisId || currentFormPaisId !== data.paisId) {
            form.setValue('paisId', data.paisId, { shouldDirty: false })
          }
          // Clear flag after form stabilizes
          setTimeout(() => setIsLoadingFromPersistedData(false), 50)
        }, 0)
      } else {
        setIsLoadingFromPersistedData(false)
      }
    },
    onApiDataLoaded: () => {
      const currentFormPaisId = form.getValues('paisId')
      const hasPersistedData = hasFormData(formId)

      // When loading from apiData (initialData), also sync local state variables
      // This ensures Select components have the correct parent IDs for filtering
      // Same pattern as entidades
      // BUT: Only set if there's no persisted data AND selectedPaisId is empty
      // This prevents overwriting selectedPaisId that was set by onDataLoaded
      if (!hasPersistedData) {
        // Use form value first (from apiData), then fallback to initialPaisId
        const paisIdToUse = currentFormPaisId || initialPaisId
        if (paisIdToUse && paisIdToUse !== selectedPaisId) {
          setSelectedPaisId(paisIdToUse)
          // Also ensure form has the paisId value if it's missing
          if (!currentFormPaisId && initialPaisId) {
            form.setValue('paisId', initialPaisId, { shouldDirty: false })
          }
        }
      }
    },
  })

  // Use the custom form update change tracking hook to handle form persistence
  // Same pattern as entidades - normalizedOriginalData should match what's in apiData
  useFormUpdateChangeTracking({
    formId,
    effectiveWindowId: windowId,
    form: form as any, // Type assertion needed due to strict typing
    setFormState,
    normalizedOriginalData: {
      ...initialData,
      paisId: initialPaisId || '',
    },
    setWindowHasFormData,
    updateWindowFormData,
    updateUpdateWindowTitle,
    updateWindowState,
    detectUpdateFormChanges,
    // Callback to get the display name for the window title
    getDisplayName: (value) => value.nome || 'Concelho',
  })

  // CRITICAL: Sync selectedPaisId with form value when form changes
  // This ensures selectedPaisId stays in sync if form.reset() is called
  // Same pattern as entidades - but we need to be careful not to clear when form is resetting
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Sync selectedPaisId with form value when form has paisId
      // This ensures selectedPaisId stays in sync if form.reset() is called with data
      // But don't sync if we're loading from persisted data (prevents race conditions)
      if (
        value.paisId &&
        value.paisId !== selectedPaisId &&
        !isLoadingFromPersistedData
      ) {
        setSelectedPaisId(value.paisId)
      }
      // CRITICAL: Don't clear selectedPaisId if form.paisId is empty - this prevents clearing
      // when form.reset() is called with incomplete data during loading
    })
    return () => subscription.unsubscribe()
  }, [
    form,
    selectedPaisId,
    formId,
    hasFormData,
    formData,
    isInitialized,
    isLoadingFromPersistedData,
  ])

  // CRITICAL: Set selectedPaisId from initialPaisId when it becomes available
  // This handles the case when onApiDataLoaded is called before initialPaisId is available
  // (e.g., when useGetDistrito is still loading)
  useEffect(() => {
    if (
      isInitialized &&
      initialPaisId &&
      !selectedPaisId &&
      !hasFormData(formId)
    ) {
      setSelectedPaisId(initialPaisId)
      // Also ensure form has the paisId value
      const currentFormPaisId = form.getValues('paisId')
      if (!currentFormPaisId || currentFormPaisId !== initialPaisId) {
        form.setValue('paisId', initialPaisId, { shouldDirty: false })
      }
    }
  }, [isInitialized, initialPaisId, selectedPaisId, formId, hasFormData, form])

  // Set initial window title when form loads
  useEffect(() => {
    const currentNome = form.getValues('nome')
    if (currentNome) {
      updateUpdateWindowTitle(windowId, currentNome, updateWindowState)
    }
  }, [windowId, updateWindowState])

  const handleClose = () => {
    // Clean up all form instances for the current window
    cleanupWindowForms(windowId)

    handleWindowClose(windowId, navigate, removeWindow)
  }

  const handleCreateDistrito = () => {
    // Store parent window ID in sessionStorage for return data handling
    sessionStorage.setItem(`parent-window-${instanceId}`, windowId)

    // Open distrito creation in a new window with parent reference
    openDistritoCreationWindow(
      navigate,
      windowId,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }

  const handleViewDistrito = () => {
    const distritoId = form.getValues('distritoId')
    if (!distritoId) {
      toast.error('Por favor, selecione um distrito primeiro')
      return
    }

    openDistritoViewWindow(
      navigate,
      windowId,
      distritoId,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }

  // Use the custom form update submission hook to handle the common submission pattern
  const { onSubmit, isSubmitting } = useFormUpdateSubmission({
    formId,
    entityId: concelhoId,
    mutation: updateConcelhoMutation,
    successMessage: 'Concelho atualizado com sucesso',
    errorMessage: 'Erro ao atualizar concelho',
    warningMessage: 'Concelho atualizado com avisos',
    modalClose: () => {
      // Close the window
      handleWindowClose(windowId, navigate, removeWindow)
      // Always call modalClose to close the modal
      modalClose()
    },
    updateFormState,
    removeWindow,
    windowId,
    prepareUpdateData: (values) => ({
      id: concelhoId,
      data: {
        nome: values.nome,
        distritoId: values.distritoId,
      },
    }),
  })

  return (
    <div className='space-y-4'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className='space-y-4'
          autoComplete='off'
        >
          <PersistentTabs
            defaultValue='dados'
            className='w-full'
            tabKey={`concelho-${instanceId}`}
          >
            <TabsList>
              <TabsTrigger value='dados'>Dados do Concelho</TabsTrigger>
            </TabsList>
            <TabsContent value='dados'>
              <Card className='overflow-hidden border-l-4 border-l-primary/20 hover:border-l-primary/40 transition-all duration-200 hover:shadow-md'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary'>
                      <Globe className='h-4 w-4' />
                    </div>
                    <div>
                      <CardTitle className='text-base flex items-center gap-2'>
                        Informações do Concelho
                        <Badge variant='secondary' className='text-xs'>
                          Obrigatório
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Atualize as informações básicas do concelho
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
                            <Tag className='h-4 w-4' />
                            Nome
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Introduza o nome'
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
                      name='paisId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Globe className='h-4 w-4' />
                            País
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={selectedPaisId || field.value}
                              onValueChange={(value) => {
                                // CRITICAL: Don't clear paisId if we're loading from persisted data
                                // or if the value is empty but field.value has a valid value
                                if (
                                  !value &&
                                  field.value &&
                                  isLoadingFromPersistedData
                                ) {
                                  return
                                }
                                setSelectedPaisId(value)
                                field.onChange(value)
                                // Reset dependent fields
                                form.setValue('distritoId', '')
                              }}
                              disabled={isLoadingPaises}
                            >
                              <SelectTrigger className='px-4 py-6 shadow-inner drop-shadow-xl'>
                                <SelectValue
                                  placeholder={
                                    isLoadingPaises
                                      ? 'A carregar...'
                                      : 'Selecione um país'
                                  }
                                >
                                  {field.value &&
                                    paisesSelectData?.find(
                                      (p) => p.id === field.value
                                    ) && (
                                      <div className='flex items-center gap-2'>
                                        <LazyFlag
                                          code={
                                            paisesSelectData?.find(
                                              (p) => p.id === field.value
                                            )?.codigo
                                          }
                                          height={16}
                                          width={24}
                                          fallback={<span>🏳️</span>}
                                        />
                                        {
                                          paisesSelectData?.find(
                                            (p) => p.id === field.value
                                          )?.nome
                                        }
                                      </div>
                                    )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {paisesSelectData.map((pais) => (
                                  <SelectItem key={pais.id} value={pais.id}>
                                    <div className='flex items-center gap-2'>
                                      <LazyFlag
                                        code={pais.codigo}
                                        height={16}
                                        width={24}
                                        fallback={<span>🏳️</span>}
                                      />
                                      {pais.nome}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='distritoId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Globe className='h-4 w-4' />
                            Distrito
                          </FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <Autocomplete
                                options={distritosSelectData
                                  .filter(
                                    (distrito) =>
                                      distrito.paisId === selectedPaisId
                                  )
                                  .map((distrito) => ({
                                    value: distrito.id,
                                    label: distrito.nome,
                                  }))}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder={
                                  isLoadingDistritos
                                    ? 'A carregar...'
                                    : 'Selecione o distrito'
                                }
                                emptyText='Nenhum distrito encontrado.'
                                disabled={isLoadingDistritos || !selectedPaisId}
                                className='px-4 py-6 pr-32 shadow-inner drop-shadow-xl'
                              />
                              <div className='absolute right-12 top-1/2 -translate-y-1/2 flex gap-1'>
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={handleViewDistrito}
                                  className='h-8 w-8 p-0'
                                  title='Ver Distrito'
                                  disabled={!field.value}
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={handleCreateDistrito}
                                  className='h-8 w-8 p-0'
                                  title='Criar Novo Distrito'
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
              {isSubmitting ? 'A atualizar...' : 'Atualizar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export { ConcelhoUpdateForm }
