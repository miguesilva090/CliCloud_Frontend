import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { countries } from '@/data/countries'
import { useCreatePais } from '@/pages/base/paises/queries/paises-mutations'
import { Globe, Tag, Hash } from 'lucide-react'
import ReactFlagsSelect from 'react-flags-select'
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

const paisFormSchema = z.object({
  nome: z.string().min(1, { message: 'O nome é obrigatório' }),
  codigo: z.string().min(1, { message: 'A sigla é obrigatória' }),
  prefixo: z.string().min(1, { message: 'O prefixo é obrigatório' }),
})

type PaisFormValues = z.infer<typeof paisFormSchema>

interface PaisCreateFormProps {
  modalClose: () => void
  onSuccess?: (newPais: { id: string; nome: string }) => void
  shouldCloseWindow?: boolean
}

const PaisCreateForm = ({
  modalClose,
  onSuccess,
  shouldCloseWindow = true,
}: PaisCreateFormProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const windowId = useCurrentWindowId()
  const searchParams = new URLSearchParams(location.search)
  const instanceId = searchParams.get('instanceId') || 'default'
  const formId = `pais-${instanceId}`

  // Get parent window ID from sessionStorage as fallback
  const parentWindowIdFromStorage = sessionStorage.getItem(
    `parent-window-${instanceId}`
  )
  const effectiveWindowId = windowId || instanceId

  const { formData, isInitialized, hasBeenVisited } = useFormState(formId)
  const { setFormState, resetFormState, hasFormData } = useFormsStore()
  const { removeWindow, updateWindowState } = useWindowsStore()
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

  const createPaisMutation = useCreatePais()

  // Define default values for proper change detection
  const defaultValues = useMemo(
    () => ({
      nome: '',
      codigo: '',
      prefixo: '',
    }),
    []
  )

  const paisResolver = useZodResolver(paisFormSchema)

  const form = useForm<PaisFormValues>({
    resolver: paisResolver,
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    criteriaMode: 'all',
  })

  const [selectedCodigo, setSelectedCodigo] = useState<string>('')

  const { setActiveTab } = useTabManager({
    defaultTab: 'dados',
    tabKey: `pais-${instanceId}`,
  })
  const { onInvalid } = useFormValidationFeedback<PaisFormValues>({
    setActiveTab,
    fieldToTabMap: {
      default: 'dados',
      nome: 'dados',
      codigo: 'dados',
      prefixo: 'dados',
    },
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

  const handleClose = () => {
    // Clean up all form instances for the current window
    cleanupWindowForms(effectiveWindowId)

    if (shouldCloseWindow) {
      handleWindowClose(effectiveWindowId, navigate, removeWindow)
    } else {
      modalClose()
    }
  }

  const handleCountrySelect = (code: string) => {
    setSelectedCodigo(code)
    form.setValue('codigo', code)

    // Get country name from the countries data
    const countryName = countries[code]
    if (countryName) {
      form.setValue('nome', countryName)
    }
  }

  // Use the custom form submission hook to handle the common submission pattern
  const { onSubmit, isSubmitting } = useFormSubmission({
    formId,
    effectiveWindowId,
    instanceId,
    parentWindowIdFromStorage,
    mutation: createPaisMutation,
    successMessage: 'País criado com sucesso',
    errorMessage: 'Erro ao criar país',
    warningMessage: 'País criado com avisos',
    entityType: 'pais',
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
    // Prepare final values by merging selected codigo from country selector
    prepareFinalValues: (values) => ({
      ...values,
      codigo: selectedCodigo || values.codigo,
      prefixo: values.prefixo || '', // Ensure prefixo is always a string
    }),
  })

  return (
    <div className='space-y-4'>
      <Form {...form}>
        <form
          id='paisCreateForm'
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
                      name='codigo'
                      render={({ field }) => (
                        <FormItem className='relative z-50'>
                          <FormLabel className='flex items-center gap-2'>
                            <Globe className='h-4 w-4' />
                            País
                          </FormLabel>
                          <FormControl>
                            <ReactFlagsSelect
                              selected={selectedCodigo || field.value}
                              onSelect={(code) => {
                                handleCountrySelect(code)
                              }}
                              searchable
                              searchPlaceholder='Procurar país...'
                              placeholder='Selecione um país'
                              customLabels={countries}
                              className='flag-select'
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
                      name='nome'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Tag className='h-4 w-4' />
                            Nome
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Nome do país'
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
                      name='codigo'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Hash className='h-4 w-4' />
                            Sigla
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Sigla do país'
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
                              placeholder='Prefixo'
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
              {isSubmitting ? 'A criar...' : 'Criar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default PaisCreateForm
