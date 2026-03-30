import { useMemo, useState } from 'react'
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
import { useCreateDistritoQuick } from '@/lib/services/utility/lookups/address-quick-create-mutations'
import { useDistritosLight } from '@/lib/services/utility/lookups/lookups-queries'
import { useFormValidationFeedback } from '@/hooks/use-form-validation-feedback'

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
})
type FormValues = z.infer<typeof schema>

export function CreateDistritoModal({
  open,
  onOpenChange,
  paisId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  paisId: string
  onSuccess: (newId: string) => void
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const createMutation = useCreateDistritoQuick()
  const distritosQuery = useDistritosLight('')
  const allDistritos = distritosQuery.data?.info?.data ?? []
  const distritos = useMemo(
    () => (paisId ? allDistritos.filter((d) => d.paisId === paisId) : []),
    [paisId, allDistritos]
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '' },
  })

  const { onInvalid } = useFormValidationFeedback<FormValues>()

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!paisId) {
      setSubmitError('Selecionar primeiro o país.')
      return
    }
    setSubmitError(null)
    try {
      const newId = await createMutation.mutateAsync({ nome: values.nome, paisId })
      form.reset()
      onSuccess(newId)
      onOpenChange(false)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Falha ao criar distrito')
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
          <DialogTitle>Distritos – existentes e novo</DialogTitle>
        </DialogHeader>
        {!paisId ? (
          <p className='text-sm text-muted-foreground'>Selecionar primeiro o país na morada.</p>
        ) : (
          <div className='space-y-4 flex-1 min-h-0 flex flex-col'>
            <div>
              <p className='text-sm font-medium text-muted-foreground mb-2'>Existentes na BD (país selecionado)</p>
              <div className='border rounded-md overflow-auto max-h-48'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distritosQuery.isLoading ? (
                      <TableRow>
                        <TableCell className='text-center text-muted-foreground'>A carregar...</TableCell>
                      </TableRow>
                    ) : distritos.length === 0 ? (
                      <TableRow>
                        <TableCell className='text-center text-muted-foreground'>Nenhum distrito para este país.</TableCell>
                      </TableRow>
                    ) : (
                      distritos.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell>{d.nome ?? '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <p className='text-sm font-medium text-muted-foreground'>Adicionar novo distrito</p>
            <Form {...form}>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='nome'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder='Ex.: Lisboa' {...field} />
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
        )}
      </DialogContent>
    </Dialog>
  )
}
