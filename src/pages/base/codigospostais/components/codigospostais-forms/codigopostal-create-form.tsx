import { useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useCreateCodigoPostal } from '@/pages/base/codigospostais/queries/codigospostais-mutations'
import { MapPin, Tag, Building2 } from 'lucide-react'
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

const codigoPostalFormSchema = z.object({
  codigo: z.string().min(1, { message: 'O código é obrigatório' }),
  localidade: z.string().min(1, { message: 'A localidade é obrigatória' }),
})

type CodigoPostalFormValues = z.infer<typeof codigoPostalFormSchema>

interface CodigoPostalCreateFormProps {
  modalClose: () => void
  onSuccess?: (newCodigoPostal: { id: string; codigo: string }) => void
  initialCodigo?: string
  shouldCloseWindow?: boolean
}

const CodigoPostalCreateForm = ({
  modalClose,
  onSuccess,
  initialCodigo,
  shouldCloseWindow = true,
}: CodigoPostalCreateFormProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const windowId = useCurrentWindowId()
  const searchParams = new URLSearchParams(location.search)
  const instanceId = searchParams.get('instanceId') || 'default'
  const formId = 'codigo-postal'

  // Get parent window ID from sessionStorage as fallback
  const parentWindowIdFromStorage = sessionStorage.getItem(
    `parent-window-${instanceId}`
  )
  const effectiveWindowId = windowId || instanceId

  // Form state management
  const { formData, isInitialized, hasBeenVisited } = useFormState(formId)
  const { setFormState, resetFormState, hasFormData } = useFormsStore()
  const { removeWindow, updateWindowState } = useWindowsStore()
  const setWindowHasFormData = useWindowsStore(
    (state) => state.setWindowHasFormData
  )

  const createCodigoPostalMutation = useCreateCodigoPostal()

  // Define default values for proper change detection
  const defaultValues = useMemo(
    () => ({
      codigo: '',
      localidade: '',
    }),
    []
  )

  const codigoPostalResolver = useZodResolver(codigoPostalFormSchema)

  const form = useForm<CodigoPostalFormValues>({
    resolver: codigoPostalResolver,
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    criteriaMode: 'all',
  })

  // Tab management
  const { setActiveTab } = useTabManager({
    defaultTab: 'dados',
    tabKey: `${formId}-${instanceId}`,
  })
  const { onInvalid } = useFormValidationFeedback<CodigoPostalFormValues>({
    setActiveTab,
  })

  // Initialize form state on first render
  useFormInitialization({
    formId,
    effectiveWindowId,
    hasBeenVisited,
    hasFormData,
    resetFormState,
    setFormState,
    initialFormData: defaultValues,
  })

  // Use the custom form data loader hook to load saved form data
  useFormDataLoader({
    form,
    formData,
    isInitialized,
    formId,
    hasFormData,
    fallbackValues: {
      codigo: initialCodigo || '',
      localidade: '',
    },
    shouldApplyFallback: !!initialCodigo,
  })

  // Save form data when it changes
  useFormChangeTracking({
    formId,
    effectiveWindowId,
    form: form as any,
    setFormState,
    defaultValues,
    setWindowHasFormData,
    updateCreateFormData,
    updateCreateWindowTitle,
    updateWindowState,
    detectFormChanges,
    identifierField: 'codigo',
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

  // Capture the original modalClose to avoid naming conflict
  const originalModalClose = modalClose || (() => {})

  const { onSubmit } = useFormSubmission({
    formId,
    effectiveWindowId,
    instanceId,
    parentWindowIdFromStorage,
    mutation: createCodigoPostalMutation,
    successMessage: 'Código Postal criado com sucesso',
    errorMessage: 'Erro ao criar código postal',
    warningMessage: 'Código Postal criado com avisos',
    entityType: 'codigo postal',
    identifierField: 'codigo',
    onSuccess: onSuccess
      ? (newEntity) => {
          console.log('Calling onSuccess with:', newEntity)
          onSuccess({
            id: newEntity.id,
            codigo: newEntity.nome,
          })
        }
      : undefined,
    modalClose: () => {
      // Reset form state after successful creation
      resetFormState(formId)
      form.reset(defaultValues)
      // Call the original modalClose
      originalModalClose()
    },
    shouldCloseWindow,
  })

  return (
    <div className='space-y-4'>
      <Form {...form}>
        <form
          id={formId}
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className='space-y-4'
          autoComplete='off'
        >
          <PersistentTabs
            defaultValue='dados'
            className='w-full'
            tabKey={`${formId}-${instanceId}`}
          >
            <TabsList>
              <TabsTrigger value='dados'>Dados do Código Postal</TabsTrigger>
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
                        Informações do Código Postal
                        <Badge variant='secondary' className='text-xs'>
                          Obrigatório
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Defina o código postal e a localidade correspondente
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='codigo'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Tag className='h-4 w-4' />
                            Código Postal
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Introduza o código postal'
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
                      name='localidade'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Building2 className='h-4 w-4' />
                            Localidade
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Introduza a localidade'
                              {...field}
                              className='px-4 py-6 shadow-inner drop-shadow-xl'
                            />
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
              disabled={createCodigoPostalMutation.isPending}
              className='w-full md:w-auto'
            >
              {createCodigoPostalMutation.isPending ? 'A criar...' : 'Criar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export { CodigoPostalCreateForm }
