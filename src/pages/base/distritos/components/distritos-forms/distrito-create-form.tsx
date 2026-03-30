import { useMemo, useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useCreateDistrito } from '@/pages/base/distritos/queries/distritos-mutations'
import { useGetPaisesSelect } from '@/pages/base/paises/queries/paises-queries'
import { Tag, Globe } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFormState, useFormsStore } from '@/stores/use-forms-store'
import { useWindowsStore } from '@/stores/use-windows-store'
import {
  useCurrentWindowId,
  handleWindowClose,
  updateCreateFormData,
  cleanupWindowForms,
  updateCreateWindowTitle,
  detectFormChanges,
} from '@/utils/window-utils'
import { useAutoSelectionWithReturnData } from '@/hooks/use-auto-selection-with-return-data'
import { useFormChangeTracking } from '@/hooks/use-form-change-tracking'
import { useFormDataLoader } from '@/hooks/use-form-data-loader'
import { useFormInitialization } from '@/hooks/use-form-initialization'
import { useFormSubmission } from '@/hooks/use-form-submission'
import { useFormValidationFeedback } from '@/hooks/use-form-validation-feedback'
import { useTabManager } from '@/hooks/use-tab-manager'
import { useZodResolver } from '@/hooks/use-zod-resolver'
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

const distritoFormSchema = z.object({
  nome: z.string().min(1, { message: 'O nome é obrigatório' }),
  paisId: z.string().min(1, { message: 'O país é obrigatório' }),
})

type DistritoFormValues = z.infer<typeof distritoFormSchema>

interface DistritoCreateFormProps {
  modalClose: () => void
  preSelectedPaisId?: string
  initialNome?: string
  onSuccess?: (newDistrito: { id: string; nome: string }) => void
  shouldCloseWindow?: boolean
}

const DistritoCreateForm = ({
  modalClose,
  preSelectedPaisId,
  initialNome,
  onSuccess,
  shouldCloseWindow = true,
}: DistritoCreateFormProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const windowId = useCurrentWindowId()
  const searchParams = new URLSearchParams(location.search)
  const instanceId = searchParams.get('instanceId') || 'default'
  const formId = `distrito-${instanceId}`

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
  const { removeWindow, updateWindowState } = useWindowsStore()
  const setWindowHasFormData = useWindowsStore(
    (state) => state.setWindowHasFormData
  )

  const { data: paisesData, isLoading, refetch } = useGetPaisesSelect()
  const createDistritoMutation = useCreateDistrito()

  // Location selection states
  const [selectedPaisId, setSelectedPaisId] = useState<string>('')
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Define default values for proper change detection
  const defaultValues = useMemo(
    () => ({
      nome: '',
      paisId: '',
    }),
    []
  )

  const distritoResolver = useZodResolver(distritoFormSchema)

  const form = useForm<DistritoFormValues>({
    resolver: distritoResolver,
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    criteriaMode: 'all',
  })

  const { setActiveTab } = useTabManager({
    defaultTab: 'dados',
    tabKey: `distrito-${instanceId}`,
  })
  const { onInvalid } = useFormValidationFeedback<DistritoFormValues>({
    setActiveTab,
  })

  // Use the combined auto-selection hook for paises (create form doesn't need return data)
  useAutoSelectionWithReturnData({
    windowId: effectiveWindowId,
    instanceId,
    data: paisesData || [],
    setValue: (value: string) => {
      setSelectedPaisId(value)
      form.setValue('paisId', value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    },
    refetch,
    itemName: 'País',
    successMessage: 'País selecionado automaticamente',
    manualSelectionMessage:
      'País criado com sucesso. Por favor, selecione-o manualmente.',
    queryKey: ['paises-select'],
    returnDataKey: `return-data-${effectiveWindowId}-pais`, // Not used in create forms, but required by hook
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
      paisId: preSelectedPaisId || '',
    },
    shouldApplyFallback: !!preSelectedPaisId || !!initialNome,
    onDataLoaded: (data) => {
      // Synchronize local state variables with restored form data
      if (data?.paisId) {
        setSelectedPaisId(data.paisId)
        // Also ensure form has the paisId value (in case form.reset() cleared it)
        setTimeout(() => {
          const currentFormPaisId = form.getValues('paisId')
          if (!currentFormPaisId || currentFormPaisId !== data.paisId) {
            form.setValue('paisId', data.paisId, { shouldDirty: false })
          }
          setTimeout(() => {
            // Verify form still has the value before enabling tracking
            const finalFormPaisId = form.getValues('paisId')
            if (finalFormPaisId === data.paisId) {
              setIsDataLoaded(true)
            } else {
              // Form value was cleared, restore it again
              form.setValue('paisId', data.paisId, { shouldDirty: false })
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

  const handleClose = () => {
    // Clean up all form instances for the current window
    cleanupWindowForms(effectiveWindowId)

    if (shouldCloseWindow) {
      handleWindowClose(effectiveWindowId, navigate, removeWindow)
    } else {
      modalClose()
    }
  }

  // Use the custom form submission hook to handle the common submission pattern
  const { onSubmit, isSubmitting } = useFormSubmission({
    formId,
    effectiveWindowId,
    instanceId,
    parentWindowIdFromStorage,
    mutation: createDistritoMutation,
    successMessage: 'Distrito criado com sucesso',
    errorMessage: 'Erro ao criar distrito',
    warningMessage: 'Distrito criado com avisos',
    entityType: 'distrito',
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

  const sortedPaises =
    paisesData?.slice().sort((a, b) => a.nome.localeCompare(b.nome)) || []

  return (
    <div className='space-y-4'>
      <Form {...form}>
        <form
          id='distritoCreateForm'
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className='space-y-4'
          autoComplete='off'
        >
          <PersistentTabs
            defaultValue='dados'
            className='w-full'
            tabKey={`distrito-${instanceId}`}
          >
            <TabsList>
              <TabsTrigger value='dados'>Dados do Distrito</TabsTrigger>
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
                        Informações do Distrito
                        <Badge variant='secondary' className='text-xs'>
                          Obrigatório
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Defina as informações básicas do distrito
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
                              }}
                              disabled={isLoading}
                            >
                              <SelectTrigger className='px-4 py-6 shadow-inner drop-shadow-xl'>
                                <SelectValue
                                  placeholder={
                                    isLoading
                                      ? 'A carregar...'
                                      : 'Selecione um país'
                                  }
                                >
                                  {field.value &&
                                    paisesData?.find(
                                      (p) => p.id === field.value
                                    ) && (
                                      <div className='flex items-center gap-2'>
                                        <LazyFlag
                                          code={
                                            paisesData?.find(
                                              (p) => p.id === field.value
                                            )?.codigo
                                          }
                                          height={16}
                                          width={24}
                                          fallback={<span>🏳️</span>}
                                        />
                                        {
                                          paisesData?.find(
                                            (p) => p.id === field.value
                                          )?.nome
                                        }
                                      </div>
                                    )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {sortedPaises.map((pais) => (
                                  <SelectItem
                                    key={pais.id || ''}
                                    value={pais.id || ''}
                                  >
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

export { DistritoCreateForm }
