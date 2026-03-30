import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useUpdateDistrito } from '@/pages/base/distritos/queries/distritos-mutations'
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
  openPaisCreationWindow,
  openPaisViewWindow,
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

const distritoFormSchema = z.object({
  nome: z.string().min(1, { message: 'O nome é obrigatório' }),
  paisId: z.string().min(1, { message: 'O país é obrigatório' }),
})

type DistritoFormValues = z.infer<typeof distritoFormSchema>

interface DistritoUpdateFormProps {
  modalClose: () => void
  distritoId: string
  initialData: {
    nome: string
    paisId: string
  }
}

const DistritoUpdateForm = ({
  modalClose,
  distritoId,
  initialData,
}: DistritoUpdateFormProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const windowId = useCurrentWindowId()
  const searchParams = new URLSearchParams(location.search)
  const instanceId = searchParams.get('instanceId') || 'default'
  // Use BOTH entityId and instanceId for form data persistence
  // - entityId: Groups data for the same entity (survives page refresh)
  // - instanceId: Separates data per window (allows multiple windows for same entity)
  const formId = `distrito-update-${distritoId}-${instanceId}`

  const { formData, isInitialized, hasBeenVisited } = useFormState(formId)
  const {
    setFormState,
    updateFormState,
    resetFormState,
    hasFormData,
    initializeForm,
  } = useFormsStore()
  const removeWindow = useWindowsStore((state) => state.removeWindow)
  const setWindowHasFormData = useWindowsStore(
    (state) => state.setWindowHasFormData
  )
  const updateWindowState = useWindowsStore((state) => state.updateWindowState)
  const findWindowByPathAndInstanceId = useWindowsStore(
    (state) => state.findWindowByPathAndInstanceId
  )

  const updateDistritoMutation = useUpdateDistrito()
  const { data: paisesData, refetch } = useGetPaisesSelect()

  const distritoResolver = useZodResolver(distritoFormSchema)

  // CRITICAL: Don't use defaultValues from initialData - let the hook load data instead
  // This prevents showing old data when component remounts after update
  // Initialize with empty values, the hook will populate them
  const form = useForm<DistritoFormValues>({
    resolver: distritoResolver,
    defaultValues: {
      nome: '',
      paisId: '',
    },
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
    getDisplayName: (value) => value.nome || 'Distrito',
  })

  // Set initial window title when form loads
  useEffect(() => {
    const currentNome = form.getValues('nome')
    if (currentNome) {
      updateUpdateWindowTitle(windowId, currentNome, updateWindowState)
    }
  }, [windowId, updateWindowState])

  // Use the combined auto-selection and return data hook for paises
  useAutoSelectionWithReturnData({
    windowId,
    instanceId,
    data: paisesData || [],
    setValue: (value: string) => {
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
    returnDataKey: `return-data-${windowId}-pais`,
  })

  const handleClose = () => {
    // Clean up all form instances for the current window
    cleanupWindowForms(windowId)

    handleWindowClose(windowId, navigate, removeWindow)
  }

  const handleCreatePais = () => {
    // Store parent window ID in sessionStorage for return data handling
    sessionStorage.setItem(`parent-window-${instanceId}`, windowId)

    // Open pais creation in a new window with parent reference
    openPaisCreationWindow(
      navigate,
      windowId,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }

  const handleViewPais = () => {
    const paisId = form.getValues('paisId')
    if (!paisId) {
      toast.error('Por favor, selecione um país primeiro')
      return
    }

    // Open pais view in a new window
    openPaisViewWindow(
      navigate,
      windowId,
      paisId,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }

  // Use the custom form update submission hook to handle the common submission pattern
  const { onSubmit, isSubmitting } = useFormUpdateSubmission({
    formId,
    entityId: distritoId,
    mutation: updateDistritoMutation,
    successMessage: 'Distrito atualizado com sucesso',
    errorMessage: 'Erro ao atualizar distrito',
    warningMessage: 'Distrito atualizado com avisos',
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
      id: distritoId,
      data: {
        nome: values.nome,
        paisId: values.paisId,
      },
    }),
  })

  const sortedPaises =
    paisesData?.slice().sort((a, b) => a.nome.localeCompare(b.nome)) || []

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
                            <div className='relative'>
                              <Autocomplete
                                options={sortedPaises.map((pais) => ({
                                  value: pais.id || '',
                                  label: pais.nome,
                                }))}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder='Selecione um país'
                                emptyText='Nenhum país encontrado.'
                                className='px-4 py-6 pr-32 shadow-inner drop-shadow-xl'
                              />
                              <div className='absolute right-12 top-1/2 -translate-y-1/2 flex gap-1'>
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={handleViewPais}
                                  className='h-8 w-8 p-0'
                                  title='Ver País'
                                  disabled={!field.value}
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={handleCreatePais}
                                  className='h-8 w-8 p-0'
                                  title='Criar Novo País'
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

export { DistritoUpdateForm }
