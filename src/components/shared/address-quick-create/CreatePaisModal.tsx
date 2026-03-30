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
import { useCreatePaisQuick } from '@/lib/services/utility/lookups/address-quick-create-mutations'
import { usePaisesLight } from '@/lib/services/utility/lookups/lookups-queries'
import { useFormValidationFeedback } from '@/hooks/use-form-validation-feedback'

const schema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  prefixo: z.string().min(1, 'Prefixo é obrigatório'),
})
type FormValues = z.infer<typeof schema>

export function CreatePaisModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (newId: string) => void
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const createMutation = useCreatePaisQuick()
  const paisesQuery = usePaisesLight('')
  const paises = paisesQuery.data?.info?.data ?? []

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { codigo: '', nome: '', prefixo: '' },
  })

  const { onInvalid } = useFormValidationFeedback<FormValues>()

  const handleSubmit = form.handleSubmit(
    async (values) => {
      setSubmitError(null)
      try {
        const newId = await createMutation.mutateAsync(values)
        form.reset()
        onSuccess(newId)
        onOpenChange(false)
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : 'Falha ao criar país')
      }
    },
    onInvalid
  )

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset()
    setSubmitError(null)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Países – existentes e novo</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 flex-1 min-h-0 flex flex-col'>
          <div>
            <p className='text-sm font-medium text-muted-foreground mb-2'>Existentes na BD</p>
            <div className='border rounded-md overflow-auto max-h-48'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Prefixo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paisesQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className='text-center text-muted-foreground'>A carregar...</TableCell>
                    </TableRow>
                  ) : paises.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className='text-center text-muted-foreground'>Nenhum país registado.</TableCell>
                    </TableRow>
                  ) : (
                    paises.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className='font-mono'>{p.codigo ?? '—'}</TableCell>
                        <TableCell>{p.nome ?? '—'}</TableCell>
                        <TableCell>{p.prefixo ?? '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <p className='text-sm font-medium text-muted-foreground'>Adicionar novo país</p>
          <Form {...form}>
            <form onSubmit={handleSubmit} className='space-y-4'>
            <FormField
              control={form.control}
              name='nome'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex.: Portugal' {...field} />
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
                  <FormLabel>Código *</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex.: PT' {...field} />
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
                  <FormLabel>Prefixo *</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex.: +351' {...field} />
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
