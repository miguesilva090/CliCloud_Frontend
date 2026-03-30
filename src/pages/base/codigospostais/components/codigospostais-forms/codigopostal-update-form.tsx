import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useUpdateCodigoPostal } from '@/pages/base/codigospostais/queries/codigospostais-mutations'
import { MapPin, Tag, Building2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFormState, useFormsStore } from '@/stores/use-forms-store'
import { useWindowsStore } from '@/stores/use-windows-store'
import {
  useCurrentWindowId,
  handleWindowClose,
  updateWindowFormData,
  cleanupWindowForms,
  updateUpdateWindowTitle,
  detectUpdateFormChanges,
} from '@/utils/window-utils'
import { useFormDataLoaderUpdate } from '@/hooks/use-form-data-loader-update'
import { useFormUpdateChangeTracking } from '@/hooks/use-form-update-change-tracking'
import { useFormUpdateInitialization } from '@/hooks/use-form-update-initialization'
import { useFormUpdateSubmission } from '@/hooks/use-form-update-submission'
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

interface CodigoPostalUpdateFormProps {
  modalClose: () => void
  codigoPostalId: string
  initialData: {
    codigo: string
    localidade: string
  }
}

const CodigoPostalUpdateForm = ({
  modalClose,
  codigoPostalId,
  initialData,
}: CodigoPostalUpdateFormProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const windowId = useCurrentWindowId()
  const searchParams = new URLSearchParams(location.search)
  const instanceId = searchParams.get('instanceId') || 'default'
  // Use BOTH entityId and instanceId for form data persistence
  // - entityId: Groups data for the same entity (survives page refresh)
  // - instanceId: Separates data per window (allows multiple windows for same entity)
  const formId = `codigopostal-update-${codigoPostalId}-${instanceId}`

  const { formData, isInitialized, hasBeenVisited } = useFormState(formId)
  const {
    setFormState,
    updateFormState,
    resetFormState,
    hasFormData,
    initializeForm,
  } = useFormsStore()
  const { removeWindow } = useWindowsStore()
  const setWindowHasFormData = useWindowsStore(
    (state) => state.setWindowHasFormData
  )
  const updateWindowState = useWindowsStore((state) => state.updateWindowState)

  const updateCodigoPostalMutation = useUpdateCodigoPostal()

  const codigoPostalResolver = useZodResolver(codigoPostalFormSchema)

  // CRITICAL: Don't use defaultValues from initialData - let the hook load data instead
  // This prevents showing old data when component remounts after update
  // Initialize with empty values, the hook will populate them
  const form = useForm<CodigoPostalFormValues>({
    resolver: codigoPostalResolver,
    defaultValues: {
      codigo: '',
      localidade: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    criteriaMode: 'all',
  })

  const { setActiveTab } = useTabManager({
    defaultTab: 'dados',
    tabKey: `codigopostal-${instanceId}`,
  })
  const { onInvalid } = useFormValidationFeedback<CodigoPostalFormValues>({
    setActiveTab,
    fieldToTabMap: {
      default: 'dados',
      codigo: 'dados',
      localidade: 'dados',
    },
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
    apiData: { nome: initialData.codigo },
    updateWindowState,
    updateUpdateWindowTitle,
  })

  // Use the custom form data loader hook for update forms
  useFormDataLoaderUpdate({
    form,
    formData,
    isInitialized,
    formId,
    hasFormData,
    apiData: initialData,
  })

  // Use the custom form update change tracking hook to handle form persistence
  useFormUpdateChangeTracking({
    formId,
    effectiveWindowId: windowId,
    form: form as any, // Type assertion needed due to strict typing
    setFormState,
    normalizedOriginalData: initialData || {},
    setWindowHasFormData,
    updateWindowFormData,
    updateUpdateWindowTitle,
    updateWindowState,
    detectUpdateFormChanges,
    // Callback to get the display name for the window title - CodigoPostal uses 'codigo'
    getDisplayName: (value) => value.codigo || 'Código Postal',
  })

  // Set initial window title when form loads
  useEffect(() => {
    const currentCodigo = form.getValues('codigo')
    if (currentCodigo) {
      updateUpdateWindowTitle(windowId, currentCodigo, updateWindowState)
    }
  }, [windowId, updateWindowState])

  const handleClose = () => {
    // Clean up all form instances for the current window
    cleanupWindowForms(windowId)

    handleWindowClose(windowId, navigate, removeWindow)
  }

  // Use the custom form update submission hook to handle the common submission pattern
  const { onSubmit, isSubmitting } = useFormUpdateSubmission({
    formId,
    entityId: codigoPostalId,
    mutation: updateCodigoPostalMutation,
    successMessage: 'Código Postal atualizado com sucesso',
    errorMessage: 'Erro ao atualizar código postal',
    warningMessage: 'Código Postal atualizado com avisos',
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
      id: codigoPostalId,
      data: {
        // Don't send codigo in update - it's immutable
        // Use the original codigo from initialData
        codigo: initialData.codigo,
        localidade: values.localidade,
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
            tabKey={`codigopostal-${instanceId}`}
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
                        Atualize a localidade correspondente ao código postal
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
                              disabled
                              readOnly
                              className='px-4 py-6 shadow-inner drop-shadow-xl bg-muted cursor-not-allowed'
                              title='O código postal não pode ser alterado'
                            />
                          </FormControl>
                          <FormMessage />
                          <p className='text-xs text-muted-foreground mt-1'>
                            O código postal não pode ser alterado após a criação
                          </p>
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

export { CodigoPostalUpdateForm }
