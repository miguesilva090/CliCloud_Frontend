import { useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useCreateCodigoPostal } from '@/pages/base/codigospostais/queries/codigospostais-mutations'
import { useGetCodigosPostaisSelect } from '@/pages/base/codigospostais/queries/codigospostais-queries'
import { MapPin, Tag, Building2 } from 'lucide-react'
import { handleApiError } from '@/utils/error-handlers'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import { useZodResolver } from '@/hooks/use-zod-resolver'
import { useFormValidationFeedback } from '@/hooks/use-form-validation-feedback'
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

const codigoPostalFormSchema = z.object({
  codigo: z.string().min(1, { message: 'O código é obrigatório' }),
  localidade: z.string().min(1, { message: 'A localidade é obrigatória' }),
})

type CodigoPostalFormValues = z.infer<typeof codigoPostalFormSchema>

interface CodigoPostalCreateFormModalProps {
  modalClose: () => void
  onSuccess?: (newCodigoPostal: {
    id: string
    codigo: string
    localidade: string
  }) => void
  initialCodigo?: string
  shouldCloseWindow?: boolean
}

const CodigoPostalCreateFormModal = ({
  modalClose,
  onSuccess,
  initialCodigo,
}: CodigoPostalCreateFormModalProps) => {
  const createCodigoPostalMutation = useCreateCodigoPostal()
  const {
    data: codigosPostaisSelectData = [],
    isLoading: isLoadingCodigosPostais,
  } = useGetCodigosPostaisSelect()

  const [selectedCodigoPostalId, setSelectedCodigoPostalId] =
    useState<string>('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const localidadeInputRef = useRef<HTMLInputElement>(null)

  // Define default values for proper change detection
  const defaultValues = useMemo(
    () => ({
      codigo: '',
      localidade: '',
    }),
    []
  )

  const codigoPostalResolver = useZodResolver(codigoPostalFormSchema)
  const { onInvalid } = useFormValidationFeedback<CodigoPostalFormValues>()

  const form = useForm<CodigoPostalFormValues>({
    resolver: codigoPostalResolver,
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    criteriaMode: 'all',
  })

  // Load initial codigo if provided
  useEffect(() => {
    if (initialCodigo) {
      // Check if the initial codigo exists in the options
      const existingCodigo = codigosPostaisSelectData.find(
        (cp) => cp.codigo === initialCodigo
      )

      if (existingCodigo) {
        // If it exists, select it
        setSelectedCodigoPostalId(existingCodigo.id)
        setIsCreatingNew(false)
        form.reset({
          codigo: existingCodigo.codigo,
          localidade: existingCodigo.localidade,
        })
      } else {
        // If it doesn't exist, set to creating new mode
        setIsCreatingNew(true)
        setSelectedCodigoPostalId('')
        form.reset({
          codigo: initialCodigo,
          localidade: '',
        })
        // Focus localidade input since codigo is already filled
        setTimeout(() => {
          localidadeInputRef.current?.focus()
        }, 100)
      }
    }
  }, [initialCodigo, form, codigosPostaisSelectData])

  // Custom submit handler - select existing or create new
  const handleSubmit = async (values: CodigoPostalFormValues) => {
    try {
      // If an existing código postal was selected, just return it
      if (selectedCodigoPostalId) {
        const selectedCp = codigosPostaisSelectData.find(
          (cp) => cp.id === selectedCodigoPostalId
        )
        if (selectedCp && onSuccess) {
          console.log('Selecting existing código postal:', selectedCp)
          onSuccess({
            id: selectedCp.id,
            codigo: selectedCp.codigo,
            localidade: selectedCp.localidade,
          })
          modalClose()
          return
        }
      }

      // Otherwise, create a new código postal
      const response = await createCodigoPostalMutation.mutateAsync({
        codigo: values.codigo,
        localidade: values.localidade,
      })

      const result = handleApiResponse(
        response,
        'Código Postal criado com sucesso',
        'Erro ao criar código postal',
        'Código Postal criado com avisos'
      )

      if (result.success) {
        const newCodigoPostalId = response.info.data

        if (onSuccess) {
          onSuccess({
            id: newCodigoPostalId,
            codigo: values.codigo,
            localidade: values.localidade,
          })
        }
        modalClose()
      }
    } catch (error: any) {
      toast.error(handleApiError(error, 'Erro ao processar código postal'))
    }
  }

  return (
    <div className='space-y-4'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
          className='space-y-4'
          autoComplete='off'
        >
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
                    Selecione um código postal existente ou crie um novo
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
                    <FormItem>
                      <FormLabel className='flex items-center gap-2'>
                        <Tag className='h-4 w-4' />
                        Código Postal
                      </FormLabel>
                      <FormControl>
                        <Autocomplete
                          autoFocus={!initialCodigo || !isCreatingNew}
                          options={codigosPostaisSelectData.map((cp) => ({
                            value: cp.id,
                            label: cp.codigo,
                          }))}
                          value={
                            isCreatingNew
                              ? ''
                              : selectedCodigoPostalId ||
                                (field.value
                                  ? codigosPostaisSelectData.find(
                                      (cp) => cp.codigo === field.value
                                    )?.id || ''
                                  : '')
                          }
                          initialInputValue={
                            isCreatingNew && field.value
                              ? field.value
                              : undefined
                          }
                          onValueChange={(value) => {
                            const selectedCp = codigosPostaisSelectData.find(
                              (cp) => cp.id === value
                            )
                            if (selectedCp) {
                              // Existing código postal selected
                              setIsCreatingNew(false)
                              setSelectedCodigoPostalId(value)
                              field.onChange(selectedCp.codigo)
                              form.setValue('localidade', selectedCp.localidade)
                            } else if (value && value !== '') {
                              // User is typing free text (creating new código postal)
                              setIsCreatingNew(true)
                              setSelectedCodigoPostalId('')
                              field.onChange(value)
                              // Clear localidade so user can type it
                              if (form.getValues('localidade')) {
                                form.setValue('localidade', '')
                              }
                            } else {
                              // Value cleared
                              setIsCreatingNew(false)
                              setSelectedCodigoPostalId('')
                              field.onChange('')
                            }
                          }}
                          placeholder={
                            isLoadingCodigosPostais
                              ? 'A carregar...'
                              : 'Selecione ou crie um código postal'
                          }
                          emptyText='Nenhum código postal encontrado.'
                          disabled={isLoadingCodigosPostais}
                          className='px-4 py-6 shadow-inner drop-shadow-xl'
                          createOption={(inputValue) => ({
                            value: 'new',
                            label: `Criar novo: "${inputValue}"`,
                            inputValue,
                          })}
                          onCreateOption={(inputValue) => {
                            // User wants to create a new código postal
                            setIsCreatingNew(true)
                            field.onChange(inputValue)
                            setSelectedCodigoPostalId('')
                            // Clear localidade so user can type it
                            form.setValue('localidade', '')
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='localidade'
                  render={({ field }) => {
                    const { ref, ...fieldProps } = field
                    return (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Building2 className='h-4 w-4' />
                          Localidade
                        </FormLabel>
                        <FormControl>
                          <Input
                            ref={(e) => {
                              localidadeInputRef.current = e
                              if (typeof ref === 'function') {
                                ref(e)
                              } else if (ref && 'current' in ref) {
                                ;(
                                  ref as React.MutableRefObject<HTMLInputElement | null>
                                ).current = e
                              }
                            }}
                            placeholder='Introduza a localidade'
                            {...fieldProps}
                            className='px-4 py-6 shadow-inner drop-shadow-xl'
                            disabled={
                              !!selectedCodigoPostalId && !isCreatingNew
                            }
                            tabIndex={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className='flex flex-col justify-end space-y-2 pt-4 md:flex-row md:space-x-4 md:space-y-0'>
            <Button
              type='button'
              variant='outline'
              onClick={modalClose}
              className='w-full md:w-auto'
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={createCodigoPostalMutation.isPending}
              className='w-full md:w-auto'
            >
              {createCodigoPostalMutation.isPending
                ? selectedCodigoPostalId
                  ? 'A selecionar...'
                  : 'A criar...'
                : selectedCodigoPostalId
                  ? 'Selecionar'
                  : 'Criar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export { CodigoPostalCreateFormModal }
