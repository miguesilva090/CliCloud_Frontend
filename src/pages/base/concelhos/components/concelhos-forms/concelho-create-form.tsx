import { useMemo, useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useCreateConcelho } from '@/pages/base/concelhos/queries/concelhos-mutations'
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
  updateCreateFormData,
  cleanupWindowForms,
  updateCreateWindowTitle,
  detectFormChanges,
  openDistritoCreationWindow,
  openDistritoViewWindow,
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

interface ConcelhoCreateFormProps {
  modalClose: () => void
  preSelectedDistritoId?: string
  initialNome?: string
  onSuccess?: (newConcelho: { id: string; nome: string }) => void
  shouldCloseWindow?: boolean
}

const ConcelhoCreateForm = ({
  modalClose,
  preSelectedDistritoId,
  initialNome,
  onSuccess,
  shouldCloseWindow = true,
}: ConcelhoCreateFormProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const windowId = useCurrentWindowId()
  const searchParams = new URLSearchParams(location.search)
  const instanceId = searchParams.get('instanceId') || 'default'
  const formId = `concelho-${instanceId}`

  // Get parent window ID from sessionStorage as fallback
  const parentWindowIdFromStorage = sessionStorage.getItem(
    `parent-window-${instanceId}`
  )
  const effectiveWindowId = windowId || instanceId

  const { formData, isInitialized, hasBeenVisited } = useFormState(formId)
  const { setFormState, resetFormState, hasFormData } = useFormsStore()

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
  const { removeWindow, updateWindowState, findWindowByPathAndInstanceId } =
    useWindowsStore()
  const setWindowHasFormData = useWindowsStore(
    (state) => state.setWindowHasFormData
  )

  // Location selection states
  const [selectedPaisId, setSelectedPaisId] = useState<string>('')
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Fetch the pre-selected distrito to get its paisId (if available)
  const { data: preSelectedDistrito } = useGetDistrito(
    preSelectedDistritoId || ''
  )

  // Get paisId from pre-selected distrito (if available)
  const initialPaisId = useMemo(() => {
    if (preSelectedDistrito?.paisId) {
      return preSelectedDistrito.paisId
    }
    return undefined
  }, [preSelectedDistrito])

  // Fetch paises
  const { data: paisesSelectData = [], isLoading: isLoadingPaises } =
    useGetPaisesSelect()

  // Fetch distritos (same pattern as entidades - fetch all, filter in frontend)
  const {
    data: distritosSelectData = [],
    isLoading: isLoadingDistritos,
    refetch,
  } = useGetDistritosSelect()
  const createConcelhoMutation = useCreateConcelho()

  // Define default values for proper change detection
  const defaultValues = useMemo(
    () => ({
      nome: '',
      paisId: '',
      distritoId: '',
    }),
    []
  )

  const concelhoResolver = useZodResolver(concelhoFormSchema)

  const form = useForm<ConcelhoFormValues>({
    resolver: concelhoResolver,
    defaultValues,
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
    fieldToTabMap: {
      default: 'dados',
      nome: 'dados',
      paisId: 'dados',
      distritoId: 'dados',
    },
  })

  // ============================================================================
  // FORM INITIALIZATION - Handled by useFormInitialization hook
  // ============================================================================

  // Filter distritos by selectedPaisId (same pattern as entidades)
  const filteredDistritos = useMemo(() => {
    if (!selectedPaisId && !initialPaisId) return []
    const paisIdToFilter = selectedPaisId || initialPaisId
    return distritosSelectData.filter(
      (distrito) => distrito.paisId === paisIdToFilter
    )
  }, [distritosSelectData, selectedPaisId, initialPaisId])

  // CRITICAL: Set selectedPaisId from initialPaisId when it becomes available
  // This handles the case when form is loaded before initialPaisId is available
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

  // Use the custom form data loader hook to load saved form data
  useFormDataLoader({
    form,
    formData,
    isInitialized,
    formId,
    hasFormData,
    fallbackValues: {
      nome: initialNome || '',
      paisId: initialPaisId || '',
      distritoId: preSelectedDistritoId || '',
    },
    shouldApplyFallback: !!preSelectedDistritoId || !!initialNome,
    onDataLoaded: (data) => {
      // Synchronize local state variables with restored form data
      // Same pattern as entidades - restore all location states
      if (data?.paisId) {
        setSelectedPaisId(data.paisId)
        // Also ensure form has the paisId value (in case form.reset() cleared it)
        // Use multiple timeouts to ensure form is fully restored before enabling tracking
        setTimeout(() => {
          const currentFormPaisId = form.getValues('paisId')
          const currentFormDistritoId = form.getValues('distritoId')
          if (!currentFormPaisId || currentFormPaisId !== data.paisId) {
            form.setValue('paisId', data.paisId, { shouldDirty: false })
          }
          // Also restore distritoId if it exists in the data
          if (
            data?.distritoId &&
            (!currentFormDistritoId ||
              currentFormDistritoId !== data.distritoId)
          ) {
            form.setValue('distritoId', data.distritoId, { shouldDirty: false })
          }
          // Wait a bit more before enabling tracking to ensure form is stable
          setTimeout(() => {
            // Verify form still has the values before enabling tracking
            const finalFormPaisId = form.getValues('paisId')
            const finalFormDistritoId = form.getValues('distritoId')
            if (
              finalFormPaisId === data.paisId &&
              (!data.distritoId || finalFormDistritoId === data.distritoId)
            ) {
              setIsDataLoaded(true)
            } else {
              // Form values were cleared, restore them again
              if (finalFormPaisId !== data.paisId) {
                form.setValue('paisId', data.paisId, { shouldDirty: false })
              }
              if (data.distritoId && finalFormDistritoId !== data.distritoId) {
                form.setValue('distritoId', data.distritoId, {
                  shouldDirty: false,
                })
              }
              setTimeout(() => setIsDataLoaded(true), 50)
            }
          }, 50)
        }, 0)
      } else {
        // Mark that data has been loaded even if no paisId
        setIsDataLoaded(true)
      }
    },
  })

  // CRITICAL: Sync selectedPaisId with form value when form data is loaded (e.g., after reload)
  // This ensures selectedPaisId is always in sync with the form value
  // Same pattern as entidades
  useEffect(() => {
    if (isInitialized && isDataLoaded) {
      const currentPaisId = form.getValues('paisId')
      // Always sync if form has a paisId value, even if selectedPaisId is empty
      if (currentPaisId && currentPaisId !== selectedPaisId) {
        setSelectedPaisId(currentPaisId)
      } else if (!currentPaisId && selectedPaisId && hasFormData(formId)) {
        // If form.paisId is empty but selectedPaisId has value and we have persisted data,
        // restore the form value
        form.setValue('paisId', selectedPaisId, { shouldDirty: false })
      }
    }
  }, [
    isInitialized,
    formData,
    form,
    selectedPaisId,
    formId,
    hasFormData,
    isDataLoaded,
  ])

  // Enable tracking after initialization if there's no persisted data
  // (for new forms that don't need to load data)
  useEffect(() => {
    if (isInitialized && !hasFormData(formId)) {
      // Small delay to ensure form is ready
      const timer = setTimeout(() => {
        setIsDataLoaded(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isInitialized, formId, hasFormData])

  // Use the custom form change tracking hook to handle form persistence
  // CRITICAL: Only enable tracking after data is loaded to prevent clearing formData
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
    enabled: isDataLoaded, // Only enable after data is loaded
  })

  // Use the combined auto-selection hook for distritos (create form doesn't need return data)
  // Filter distritos by selectedPaisId (same pattern as entidades)
  useAutoSelectionWithReturnData({
    windowId: effectiveWindowId,
    instanceId,
    data: filteredDistritos,
    setValue: (value: string) => {
      form.setValue('distritoId', value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    },
    refetch,
    itemName: 'Distrito',
    successMessage: 'Distrito selecionado automaticamente',
    manualSelectionMessage:
      'Distrito criado com sucesso. Por favor, selecione-o manualmente.',
    queryKey: ['distritos-select'],
    returnDataKey: `return-data-${effectiveWindowId}-distrito`, // Not used in create forms, but required by hook
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

  const handleCreateDistrito = () => {
    // Open distrito creation in a new window with parent reference
    openDistritoCreationWindow(
      navigate,
      effectiveWindowId,
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
      effectiveWindowId,
      distritoId,
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
    mutation: createConcelhoMutation,
    successMessage: 'Concelho criado com sucesso',
    errorMessage: 'Erro ao criar concelho',
    warningMessage: 'Concelho criado com avisos',
    entityType: 'concelho',
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

  const sortedDistritos = filteredDistritos
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome))

  return (
    <div className='space-y-4'>
      <Form {...form}>
        <form
          id='concelhoCreateForm'
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
                        Defina as informações básicas do concelho
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
                                options={sortedDistritos.map((distrito) => ({
                                  value: distrito.id || '',
                                  label: distrito.nome,
                                }))}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder={
                                  isLoadingDistritos
                                    ? 'A carregar...'
                                    : 'Selecione um distrito'
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
              {isSubmitting ? 'A criar...' : 'Criar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export { ConcelhoCreateForm }
