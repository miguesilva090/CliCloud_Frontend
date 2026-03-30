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
import { ENTIDADE_TIPO } from '@/lib/entidade-tipo'
import { useCreateOrganismoQuick } from '@/lib/services/utility/entity-quick-create/entity-quick-create-mutations'
import { useOrganismosLight } from '@/lib/services/utility/entity-quick-create/entity-quick-create-queries'
import { useFormValidationFeedback } from '@/hooks/use-form-validation-feedback'

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  abreviatura: z.string().optional(),
  nomeComercial: z.string().optional(),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  numeroContribuinte: z.string().min(1, 'NIF é obrigatório'),
})
type FormValues = z.infer<typeof schema>

export interface OrganismoAddress {
  paisId: string
  distritoId: string
  concelhoId: string
  freguesiaId: string
  codigoPostalId: string
  ruaId: string
  numeroPorta: string
  andarRua: string
}

export function CreateOrganismoModal({
  open,
  onOpenChange,
  onSuccess,
  address,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (newId: string) => void
  address: OrganismoAddress | null
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const createMutation = useCreateOrganismoQuick()
  const organismosQuery = useOrganismosLight('')
  const organismos = organismosQuery.data?.info?.data ?? []

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      abreviatura: '',
      nomeComercial: '',
      email: '',
      numeroContribuinte: '',
    },
  })

  const { onInvalid } = useFormValidationFeedback<FormValues>()

  const canCreate = address && [
    address.paisId,
    address.distritoId,
    address.concelhoId,
    address.freguesiaId,
    address.codigoPostalId,
    address.ruaId,
    address.numeroPorta,
    address.andarRua,
  ].every((v) => v?.trim())

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!address || !canCreate) return
    setSubmitError(null)
    try {
      const payload = {
        nome: values.nome,
        tipoEntidadeId: ENTIDADE_TIPO.Organismo,
        email: values.email,
        numeroContribuinte: values.numeroContribuinte,
        ruaId: address.ruaId,
        codigoPostalId: address.codigoPostalId,
        freguesiaId: address.freguesiaId,
        concelhoId: address.concelhoId,
        distritoId: address.distritoId,
        paisId: address.paisId,
        numeroPorta: address.numeroPorta || '-',
        andarRua: address.andarRua || '-',
        observacoes: '—',
        status: 1,
        entidadeContactos: [
          { entidadeContactoTipoId: 3, valor: values.email, principal: true },
        ],
        nomeComercial: values.nomeComercial || null,
        abreviatura: values.abreviatura || null,
      }
      const newId = await createMutation.mutateAsync(payload)
      form.reset()
      onSuccess(newId)
      onOpenChange(false)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Falha ao criar organismo')
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
          <DialogTitle>Organismos – existentes e novo</DialogTitle>
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
                  {organismosQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className='text-center text-muted-foreground'>A carregar...</TableCell>
                    </TableRow>
                  ) : organismos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className='text-center text-muted-foreground'>Nenhum organismo registado.</TableCell>
                    </TableRow>
                  ) : (
                    organismos.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>{o.nome ?? o.nomeComercial ?? '—'}</TableCell>
                        <TableCell>{o.abreviatura ?? '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <p className='text-sm font-medium text-muted-foreground'>Adicionar novo organismo</p>
          {!canCreate && (
            <p className='text-sm text-muted-foreground'>
              Para guardar um novo organismo, preencha a morada do utente na aba Contactos (País, Distrito, Concelho, Freguesia, Código Postal, Rua, N.º Porta, Andar).
            </p>
          )}
          <Form {...form}>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <FormField
                control={form.control}
                name='nome'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex.: ARS Lisboa' {...field} />
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
                      <Input placeholder='Ex.: ARSLVT' {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='nomeComercial'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome comercial</FormLabel>
                    <FormControl>
                      <Input placeholder='' {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail *</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder='Ex.: contacto@organismo.pt' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='numeroContribuinte'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIF *</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex.: 500000000' {...field} />
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
                <Button type='submit' disabled={createMutation.isPending || !canCreate} title={!canCreate ? 'Preencher a morada do utente na aba Contactos para poder guardar' : undefined}>
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
