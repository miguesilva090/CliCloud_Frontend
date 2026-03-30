import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateSeguradoraQuick } from '@/lib/services/utility/entity-quick-create/entity-quick-create-mutations'
import { useSeguradorasLight } from '@/lib/services/utility/entity-quick-create/entity-quick-create-queries'
import { useFormValidationFeedback } from '@/hooks/use-form-validation-feedback'

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  abreviatura: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function CreateSeguradoraModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (newId: string) => void
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const createMutation = useCreateSeguradoraQuick()
  const seguradorasQuery = useSeguradorasLight('')
  const seguradoras = seguradorasQuery.data?.info?.data ?? []

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', abreviatura: '' },
  })

  const { onInvalid } = useFormValidationFeedback<FormValues>()

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      const newId = await createMutation.mutateAsync({
        nome: values.nome,
        abreviatura: values.abreviatura || null,
      })
      form.reset()
      onSuccess(newId)
      onOpenChange(false)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Falha ao criar seguradora')
    }
  }, onInvalid)

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset()
    setSubmitError(null)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Seguradoras – existentes e nova</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 flex-1 min-h-0 flex flex-col'>
          <div>
            <p className='text-sm font-medium text-muted-foreground mb-2'>Existentes na BD</p>
            <div className='border rounded-md overflow-auto max-h-48'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Abreviatura</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seguradorasQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className='text-center text-muted-foreground'>A carregar...</TableCell>
                    </TableRow>
                  ) : seguradoras.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className='text-center text-muted-foreground'>Nenhuma seguradora registada.</TableCell>
                    </TableRow>
                  ) : (
                    seguradoras.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.nome ?? '—'}</TableCell>
                        <TableCell>{s.abreviatura ?? '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <p className='text-sm font-medium text-muted-foreground'>Adicionar nova seguradora</p>
          <Form {...form}>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <FormField
                control={form.control}
                name='nome'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex.: Allianz' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='abreviatura'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abreviatura</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex.: ALL' {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {submitError && (
                <p className='text-sm text-destructive'>{submitError}</p>
              )}
              <DialogFooter>
                <Button type='button' variant='outline' onClick={() => handleOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type='submit' disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'A guardar...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
