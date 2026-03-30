import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useGetCodigosPostaisSelect } from '@/pages/base/codigospostais/queries/codigospostais-queries'
import { useGetFreguesiasSelect } from '@/pages/base/freguesias/queries/freguesias-queries'
import { useUpdateRua } from '@/pages/base/ruas/queries/ruas-mutations'
import { MapPin, Building2, Mail, Plus, Eye } from 'lucide-react'
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
  openFreguesiaCreationWindow,
  openCodigoPostalCreationWindow,
  openFreguesiaViewWindow,
  openCodigoPostalViewWindow,
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

const ruaFormSchema = z.object({
  nome: z.string().min(1, { message: 'O nome é obrigatório' }),
  freguesiaId: z.string().min(1, { message: 'A freguesia é obrigatória' }),
  codigoPostalId: z
    .string()
    .min(1, { message: 'O código postal é obrigatório' }),
})

type RuaFormValues = z.infer<typeof ruaFormSchema>

interface RuaUpdateFormProps {
  modalClose: () => void
  ruaId: string
  initialData: {
    nome: string
    freguesiaId: string
    codigoPostalId: string
  }
}

const RuaUpdateForm = ({
  modalClose,
  ruaId,
  initialData,
}: RuaUpdateFormProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const windowId = useCurrentWindowId()
  const searchParams = new URLSearchParams(location.search)
  const instanceId = searchParams.get('instanceId') || 'default'
  // Use BOTH entityId and instanceId for form data persistence
  // - entityId: Groups data for the same entity (survives page refresh)
  // - instanceId: Separates data per window (allows multiple windows for same entity)
  const formId = `rua-update-${ruaId}-${instanceId}`

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

  const updateRuaMutation = useUpdateRua()
  const { data: freguesiasData, refetch: refetchFreguesias } =
    useGetFreguesiasSelect()
  const { data: codigosPostaisData, refetch: refetchCodigosPostais } =
    useGetCodigosPostaisSelect()

  const ruaResolver = useZodResolver(ruaFormSchema)

  // CRITICAL: Don't use defaultValues from initialData - let the hook load data instead
  // This prevents showing old data when component remounts after update
  // Initialize with empty values, the hook will populate them
  const form = useForm<RuaFormValues>({
    resolver: ruaResolver,
    defaultValues: {
      nome: '',
      freguesiaId: '',
      codigoPostalId: '',
    },
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
    getDisplayName: (value) => value.nome || 'Rua',
  })

  // Set initial window title when form loads
  useEffect(() => {
    const currentNome = form.getValues('nome')
    if (currentNome) {
      updateUpdateWindowTitle(windowId, currentNome, updateWindowState)
    }
  }, [windowId, updateWindowState])

  // Use the combined auto-selection and return data hook for freguesias
  useAutoSelectionWithReturnData({
    windowId,
    instanceId,
    data: freguesiasData || [],
    setValue: (value: string) => {
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
    returnDataKey: `return-data-${windowId}-freguesia`,
  })

  // Use the combined auto-selection and return data hook for codigos postais
  useAutoSelectionWithReturnData({
    windowId,
    instanceId,
    data: codigosPostaisData || [],
    setValue: (value: string) => {
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
    returnDataKey: `return-data-${windowId}-codigo postal`,
  })

  const handleClose = () => {
    // Clean up all form instances for the current window
    cleanupWindowForms(windowId)

    handleWindowClose(windowId, navigate, removeWindow)
  }

  const handleCreateFreguesia = () => {
    // Store parent window ID in sessionStorage for return data handling
    sessionStorage.setItem(`parent-window-${instanceId}`, windowId)

    // Open freguesia creation in a new window with parent reference
    openFreguesiaCreationWindow(
      navigate,
      windowId,
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
      windowId,
      freguesiaId,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }

  const handleCreateCodigoPostal = () => {
    // Store parent window ID in sessionStorage for return data handling
    sessionStorage.setItem(`parent-window-${instanceId}`, windowId)

    // Open codigo postal creation in a new window with parent reference
    openCodigoPostalCreationWindow(
      navigate,
      windowId,
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
      windowId,
      codigoPostalId,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }

  // Use the custom form update submission hook to handle the common submission pattern
  const { onSubmit, isSubmitting } = useFormUpdateSubmission({
    formId,
    entityId: ruaId,
    mutation: updateRuaMutation,
    successMessage: 'Rua atualizada com sucesso',
    errorMessage: 'Erro ao atualizar rua',
    warningMessage: 'Rua atualizada com avisos',
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
      id: ruaId,
      data: {
        nome: values.nome,
        freguesiaId: values.freguesiaId,
        codigoPostalId: values.codigoPostalId,
      },
    }),
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
                        Atualize os dados básicos da rua e sua localização
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
                                placeholder='Selecione uma freguesia'
                                emptyText='Nenhuma freguesia encontrada.'
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
                                placeholder='Selecione um código postal'
                                emptyText='Nenhum código postal encontrado.'
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
              {isSubmitting ? 'A atualizar...' : 'Atualizar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export { RuaUpdateForm }
