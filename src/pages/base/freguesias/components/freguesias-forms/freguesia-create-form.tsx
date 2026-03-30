// ============================================================================
// IMPORTS - All necessary dependencies for the Freguesia Create Form
// ============================================================================
import { useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useGetConcelhosSelect } from '@/pages/base/concelhos/queries/concelhos-queries'
import { useCreateFreguesia } from '@/pages/base/freguesias/queries/freguesias-mutations'
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
  openConcelhoCreationWindow,
  openConcelhoViewWindow,
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

// ============================================================================
// FORM SCHEMA & TYPES - Validation rules and TypeScript interfaces
// ============================================================================

// Zod schema for form validation - defines what fields are required and their validation rules
const freguesiaFormSchema = z.object({
  nome: z.string().min(1, { message: 'O nome é obrigatório' }),
  concelhoId: z.string().min(1, { message: 'O concelho é obrigatório' }),
})

// TypeScript type inferred from the Zod schema - used for type safety
type FreguesiaFormValues = z.infer<typeof freguesiaFormSchema>

// Props interface for the FreguesiaCreateForm component
interface FreguesiaCreateFormProps {
  modalClose: () => void // Function to close the modal
  preSelectedConcelhoId?: string // Optional pre-selected concelho ID
  initialNome?: string // Optional initial nome value
  onSuccess?: (newFreguesia: { id: string; nome: string }) => void // Callback when creation succeeds
  shouldCloseWindow?: boolean // Whether to close the window after creation (default: true)
}

// ============================================================================
// MAIN COMPONENT - FreguesiaCreateForm
// ============================================================================

const FreguesiaCreateForm = ({
  modalClose,
  preSelectedConcelhoId,
  initialNome,
  onSuccess,
  shouldCloseWindow = true,
}: FreguesiaCreateFormProps) => {
  // ============================================================================
  // ROUTING & WINDOW MANAGEMENT - Handle URL parameters and window identification
  // ============================================================================

  const location = useLocation() // React Router hook to get current location
  const navigate = useNavigate() // React Router hook for navigation
  const windowId = useCurrentWindowId() // Custom hook to get current window ID
  const searchParams = new URLSearchParams(location.search) // Parse URL search parameters
  const instanceId = searchParams.get('instanceId') || 'default' // Get instance ID from URL or use default
  const formId = `freguesia-${instanceId}` // Unique form ID for this instance

  // Get parent window ID from sessionStorage as fallback for return data handling
  const parentWindowIdFromStorage = sessionStorage.getItem(
    `parent-window-${instanceId}`
  )
  const effectiveWindowId = windowId || instanceId // Use windowId if available, otherwise instanceId

  // ============================================================================
  // STATE MANAGEMENT - Form state, window state, and data fetching
  // ============================================================================

  // Form state management - handles form data persistence and state tracking
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

  // Window state management - handles window operations and return data
  const { removeWindow, updateWindowState, findWindowByPathAndInstanceId } =
    useWindowsStore()
  const setWindowHasFormData = useWindowsStore(
    (state) => state.setWindowHasFormData
  )

  // Data fetching hooks - get concelhos data and create mutation
  const { data: concelhosData, isLoading, refetch } = useGetConcelhosSelect()
  const createFreguesiaMutation = useCreateFreguesia()

  // ============================================================================
  // FORM CONFIGURATION - Default values, validation resolver, and form setup
  // ============================================================================

  // Define default values for proper change detection - used to determine if form has been modified
  const defaultValues = useMemo(
    () => ({
      nome: '',
      concelhoId: '',
    }),
    []
  )

  // Custom resolver for react-hook-form that integrates with Zod validation
  // This handles form validation and error formatting
  const freguesiaResolver = useZodResolver(freguesiaFormSchema)

  // React Hook Form setup with custom resolver and configuration
  const form = useForm<FreguesiaFormValues>({
    resolver: freguesiaResolver,
    defaultValues,
    mode: 'onSubmit', // Only validate on submit
    reValidateMode: 'onSubmit', // Only re-validate on submit
    criteriaMode: 'all', // Show all validation errors
  })

  // ============================================================================
  // TAB MANAGEMENT & ERROR HANDLING - Handle tab switching and error display
  // ============================================================================

  // Tab manager hook - handles tab state persistence and switching
  const { setActiveTab } = useTabManager({
    defaultTab: 'dados',
    tabKey: `freguesia-${instanceId}`,
  })

  // Error handling hook - automatically switches to the correct tab when validation errors occur
  const { onInvalid } = useFormValidationFeedback<FreguesiaFormValues>({
    setActiveTab,
  })

  // ============================================================================
  // FORM INITIALIZATION - Handled by useFormInitialization hook
  // ============================================================================

  // ============================================================================
  // FORM DATA LOADING - Load saved form data or pre-selected values
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
      concelhoId: preSelectedConcelhoId || '',
    },
    shouldApplyFallback: !!preSelectedConcelhoId || !!initialNome,
  })

  // ============================================================================
  // FORM CHANGE TRACKING - Handled by useFormChangeTracking hook
  // ============================================================================

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

  // ============================================================================
  // AUTO-SELECTION HOOK - Handle automatic selection of concelhos from parent windows
  // ============================================================================

  // Use the combined auto-selection hook for concelhos (create form doesn't need return data)
  // This hook automatically selects a concelho if one was created in a parent window
  useAutoSelectionWithReturnData({
    windowId: effectiveWindowId,
    instanceId,
    data: concelhosData || [],
    setValue: (value: string) => {
      form.setValue('concelhoId', value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    },
    refetch,
    itemName: 'Concelho',
    successMessage: 'Concelho selecionado automaticamente',
    manualSelectionMessage:
      'Concelho criado com sucesso. Por favor, selecione-o manualmente.',
    queryKey: ['concelhos-select'],
    returnDataKey: `return-data-${effectiveWindowId}-concelho`, // Not used in create forms, but required by hook
  })

  // ============================================================================
  // EVENT HANDLERS - Handle form actions and window operations
  // ============================================================================

  // Handle form close - cleans up form data and closes window/modal
  const handleClose = () => {
    // Clean up all form instances for the current window
    cleanupWindowForms(effectiveWindowId)

    if (shouldCloseWindow) {
      // Close the entire window and navigate back
      handleWindowClose(effectiveWindowId, navigate, removeWindow)
    } else {
      // Just close the modal
      modalClose()
    }
  }

  // Handle concelho creation - opens a new window to create a concelho
  const handleCreateConcelho = () => {
    // Open concelho creation in a new window with parent reference
    openConcelhoCreationWindow(
      navigate,
      effectiveWindowId,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }

  // Handle concelho viewing - opens a new window to view the selected concelho
  const handleViewConcelho = () => {
    const concelhoId = form.getValues('concelhoId')
    if (!concelhoId) {
      toast.error('Por favor, selecione um concelho primeiro')
      return
    }

    openConcelhoViewWindow(
      navigate,
      effectiveWindowId,
      concelhoId,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }

  // ============================================================================
  // FORM SUBMISSION - Handle form submission and API calls using custom hook
  // ============================================================================

  // Use the custom form submission hook to handle the common submission pattern
  const { onSubmit, isSubmitting } = useFormSubmission({
    formId,
    effectiveWindowId,
    instanceId,
    parentWindowIdFromStorage,
    mutation: createFreguesiaMutation,
    successMessage: 'Freguesia criada com sucesso',
    errorMessage: 'Erro ao criar freguesia',
    warningMessage: 'Freguesia criada com avisos',
    entityType: 'freguesia',
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

  // ============================================================================
  // DATA PREPARATION - Sort and prepare data for display
  // ============================================================================

  // Sort concelhos alphabetically for better UX in the autocomplete dropdown
  const sortedConcelhos =
    concelhosData?.slice().sort((a, b) => a.nome.localeCompare(b.nome)) || []

  // ============================================================================
  // RENDER - The JSX that renders the form UI
  // ============================================================================

  return (
    <div className='space-y-4'>
      {/* Main form wrapper with react-hook-form integration */}
      <Form {...form}>
        <form
          id='freguesiaCreateForm'
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className='space-y-4'
          autoComplete='off'
        >
          {/* Persistent tabs - maintains tab state across re-renders */}
          <PersistentTabs
            defaultValue='dados'
            className='w-full'
            tabKey={`freguesia-${instanceId}`}
          >
            <TabsList>
              <TabsTrigger value='dados'>Dados da Freguesia</TabsTrigger>
            </TabsList>
            <TabsContent value='dados'>
              {/* Main form card with visual styling and header */}
              <Card className='overflow-hidden border-l-4 border-l-primary/20 hover:border-l-primary/40 transition-all duration-200 hover:shadow-md'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary'>
                      <Globe className='h-4 w-4' />
                    </div>
                    <div>
                      <CardTitle className='text-base flex items-center gap-2'>
                        Informações da Freguesia
                        <Badge variant='secondary' className='text-xs'>
                          Obrigatório
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Defina as informações básicas da freguesia
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Form fields grid - responsive layout */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* Nome field - required text input */}
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

                    {/* Concelho field - autocomplete with action buttons */}
                    <FormField
                      control={form.control}
                      name='concelhoId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Globe className='h-4 w-4' />
                            Concelho
                          </FormLabel>
                          <FormControl>
                            <div className='relative'>
                              {/* Autocomplete component for concelho selection */}
                              <Autocomplete
                                options={sortedConcelhos.map((concelho) => ({
                                  value: concelho.id || '',
                                  label: concelho.nome,
                                }))}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder={
                                  isLoading
                                    ? 'A carregar...'
                                    : 'Selecione um concelho'
                                }
                                emptyText='Nenhum concelho encontrado.'
                                className='px-4 py-6 pr-32 shadow-inner drop-shadow-xl'
                              />
                              {/* Action buttons for viewing and creating concelhos */}
                              <div className='absolute right-12 top-1/2 -translate-y-1/2 flex gap-1'>
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={handleViewConcelho}
                                  className='h-8 w-8 p-0'
                                  title='Ver Concelho'
                                  disabled={!field.value}
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={handleCreateConcelho}
                                  className='h-8 w-8 p-0'
                                  title='Criar Novo Concelho'
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

          {/* Form action buttons - Cancel and Submit */}
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

// ============================================================================
// EXPORT - Export the component for use in other parts of the application
// ============================================================================

export { FreguesiaCreateForm }
