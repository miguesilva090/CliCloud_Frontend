import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useUpdatePais } from '@/pages/base/paises/queries/paises-mutations'
import { Globe, Tag, Hash } from 'lucide-react'
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

const paisFormSchema = z.object({
  nome: z.string().min(1, { message: 'O nome é obrigatório' }),
  codigo: z.string().min(1, { message: 'A sigla é obrigatória' }),
  prefixo: z.string().min(1, { message: 'O prefixo é obrigatório' }),
})

type PaisFormValues = z.infer<typeof paisFormSchema>

interface PaisUpdateFormProps {
  modalClose: () => void
  paisId: string
  initialData: {
    nome: string
    codigo: string
    prefixo: string
  }
}

const PaisUpdateForm = ({
  modalClose,
  paisId,
  initialData,
}: PaisUpdateFormProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const windowId = useCurrentWindowId()
  const searchParams = new URLSearchParams(location.search)
  const instanceId = searchParams.get('instanceId') || 'default'
  // Use BOTH entityId and instanceId for form data persistence
  // - entityId: Groups data for the same entity (survives page refresh)
  // - instanceId: Separates data per window (allows multiple windows for same entity)
  const formId = `pais-update-${paisId}-${instanceId}`

  const { formData, isInitialized, hasBeenVisited } = useFormState(formId)
  const {
    setFormState,
    updateFormState,
    resetFormState,
    hasFormData,
    initializeForm,
  } = useFormsStore()
  const { removeWindow, updateWindowState } = useWindowsStore()
  const setWindowHasFormData = useWindowsStore(
    (state) => state.setWindowHasFormData
  )

  const updatePaisMutation = useUpdatePais()

  const paisResolver = useZodResolver(paisFormSchema)

  // CRITICAL: Don't use defaultValues from initialData - let the hook load data instead
  // This prevents showing old data when component remounts after update
  // Initialize with empty values, the hook will populate them
  const form = useForm<PaisFormValues>({
    resolver: paisResolver,
    defaultValues: {
      nome: '',
      codigo: '',
      prefixo: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    criteriaMode: 'all',
  })

  const { setActiveTab } = useTabManager({
    defaultTab: 'dados',
    tabKey: `pais-${instanceId}`,
  })
  const { onInvalid } = useFormValidationFeedback<PaisFormValues>({
    setActiveTab,
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
    // Callback to get the display name for the window title
    getDisplayName: (value) => value.nome || 'País',
  })

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

  // Use the custom form update submission hook to handle the common submission pattern
  const { onSubmit, isSubmitting } = useFormUpdateSubmission({
    formId,
    entityId: paisId,
    mutation: updatePaisMutation,
    successMessage: 'País atualizado com sucesso',
    errorMessage: 'Erro ao atualizar país',
    warningMessage: 'País atualizado com avisos',
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
      id: paisId,
      data: {
        nome: values.nome,
        codigo: values.codigo,
        prefixo: values.prefixo,
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
            tabKey={`pais-${instanceId}`}
          >
            <TabsList>
              <TabsTrigger value='dados'>Dados do País</TabsTrigger>
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
                        Informações do País
                        <Badge variant='secondary' className='text-xs'>
                          Obrigatório
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Defina as informações básicas do país
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 gap-4'>
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
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='codigo'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Hash className='h-4 w-4' />
                            Sigla
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Introduza a sigla'
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
                      name='prefixo'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Hash className='h-4 w-4' />
                            Prefixo
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Introduza o prefixo'
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

export { PaisUpdateForm }
