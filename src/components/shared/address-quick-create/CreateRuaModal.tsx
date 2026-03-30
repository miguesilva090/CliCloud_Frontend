import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateRuaQuick } from '@/lib/services/utility/lookups/address-quick-create-mutations'
import { useRuasLight } from '@/lib/services/utility/lookups/lookups-queries'
import { useFormValidationFeedback } from '@/hooks/use-form-validation-feedback'

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
})
type FormValues = z.infer<typeof schema>

export function CreateRuaModal({
  open,
  onOpenChange,
  freguesiaId,
  codigoPostalId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  freguesiaId: string
  codigoPostalId: string
  onSuccess: (newId: string) => void
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const createMutation = useCreateRuaQuick()
  const ruasQuery = useRuasLight('')
  const allRuas = ruasQuery.data?.info?.data ?? []
  const ruas = useMemo(
    () =>
      freguesiaId && codigoPostalId
        ? allRuas.filter((r) => r.freguesiaId === freguesiaId && r.codigoPostalId === codigoPostalId)
        : [],
    [freguesiaId, codigoPostalId, allRuas]
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '' },
  })

  const { onInvalid } = useFormValidationFeedback<FormValues>()

  const handleSubmit = form.handleSubmit(async (values) => {
    const fregId = (freguesiaId ?? '').trim()
    const cpId = (codigoPostalId ?? '').trim()
    if (!fregId || !cpId) {
      setSubmitError('Selecionar primeiro a freguesia e o código postal na morada.')
      return
    }
    setSubmitError(null)
    try {
      const newId = await createMutation.mutateAsync({
        nome: values.nome.trim(),
        freguesiaId: fregId,
        codigoPostalId: cpId,
      })
      form.reset()
      onSuccess(newId)
      onOpenChange(false)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Falha ao criar rua')
    }
  }, onInvalid)

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset()
    setSubmitError(null)
    onOpenChange(next)
  }

  const canSubmit = !!freguesiaId && !!codigoPostalId

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Ruas – existentes e nova</DialogTitle>
          <DialogDescription className='sr-only'>
            Lista de ruas existentes para a freguesia e código postal selecionados e formulário para adicionar nova rua.
          </DialogDescription>
        </DialogHeader>
        {!canSubmit ? (
          <p className='text-sm text-muted-foreground'>
            Selecionar primeiro a freguesia e o código postal na morada.
          </p>
        ) : (
          <div className='space-y-4 flex-1 min-h-0 flex flex-col'>
            <div>
              <p className='text-sm font-medium text-muted-foreground mb-2'>Existentes na BD (freguesia e CP selecionados)</p>
              <div className='border rounded-md overflow-auto max-h-48'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ruasQuery.isLoading ? (
                      <TableRow>
                        <TableCell className='text-center text-muted-foreground'>A carregar...</TableCell>
                      </TableRow>
                    ) : ruas.length === 0 ? (
                      <TableRow>
                        <TableCell className='text-center text-muted-foreground'>Nenhuma rua para esta freguesia/CP.</TableCell>
                      </TableRow>
                    ) : (
                      ruas.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.nome ?? '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <p className='text-sm font-medium text-muted-foreground'>Adicionar nova rua</p>
            <Form {...form}>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='nome'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder='Ex.: Rua das Flores' {...field} />
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
