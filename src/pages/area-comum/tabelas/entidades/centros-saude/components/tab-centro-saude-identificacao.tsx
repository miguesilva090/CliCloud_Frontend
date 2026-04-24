import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { CentroSaudeEditFormValues } from '../types/centro-saude-edit-form-types'
import {
  usePaisesLight,
  useCodigosPostaisLight,
} from '@/lib/services/utility/lookups/lookups-queries'
import { useAddressCascadingLookups } from '@/hooks/use-address-cascading-lookups'
import {
  CreatePaisModal,
  CreateDistritoModal,
  CreateConcelhoModal,
  CreateFreguesiaModal,
  CreateCodigoPostalModal,
} from '@/components/shared/address-quick-create'

export function TabCentroSaudeIdentificacao({
  form,
  readOnly,
}: {
  form: UseFormReturn<CentroSaudeEditFormValues>
  readOnly?: boolean
}) {
  const [modalPais, setModalPais] = useState(false)
  const [modalDistrito, setModalDistrito] = useState(false)
  const [modalConcelho, setModalConcelho] = useState(false)
  const [modalFreguesia, setModalFreguesia] = useState(false)
  const [modalCodigoPostal, setModalCodigoPostal] = useState(false)

  const paisesQuery = usePaisesLight('')
  const codigosPostaisQuery = useCodigosPostaisLight('')
  const addressLookups = useAddressCascadingLookups(
    form as { watch: (n: string) => unknown; setValue: (n: string, v: unknown) => void }
  )

  const paises = paisesQuery.data?.info?.data ?? []
  const codigosPostais = codigosPostaisQuery.data?.info?.data ?? []
  const {
    distritos,
    concelhos,
    freguesias,
    paisId,
    distritoId,
    concelhoId,
    distritosQuery,
    concelhosQuery,
    freguesiasQuery,
    onPaisChange,
    onDistritoChange,
    onConcelhoChange,
    onFreguesiaChange,
  } = addressLookups

  return (
    <div className='space-y-4'>
      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Dados do Centro de Saúde
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2'>
          <FormField
            control={form.control}
            name='nome'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Nome do centro de saúde'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='codigoLocalCS'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Local Centro Saúde</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Código local CS'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                  />
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
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    className='h-7'
                    placeholder='Email'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='observacoes'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Observações...'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Morada 
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2'>
          <FormField
            control={form.control}
            name='paisId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>País *</FormLabel>
                <div className='flex gap-1.5'>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => {
                        field.onChange(v)
                        onPaisChange(v)
                      }}
                      disabled={paisesQuery.isLoading || readOnly}
                    >
                      <SelectTrigger className='h-7 w-full min-w-0'>
                        <SelectValue placeholder='Selecionar país...' />
                      </SelectTrigger>
                      <SelectContent>
                        {paises.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome ?? p.codigo ?? p.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {!readOnly && (
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='shrink-0 h-7 w-7'
                      title='Adicionar país'
                      onClick={() => setModalPais(true)}
                    >
                      <Plus className='h-3.5 w-3.5' />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='distritoId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distrito *</FormLabel>
                <div className='flex gap-1.5'>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => {
                        field.onChange(v)
                        onDistritoChange(v)
                      }}
                      disabled={
                        distritosQuery.isLoading || readOnly || !paisId
                      }
                    >
                      <SelectTrigger className='h-7 w-full min-w-0'>
                        <SelectValue
                          placeholder={
                            paisId
                              ? 'Selecionar distrito...'
                              : 'Selecione primeiro o país'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {distritos.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.nome ?? d.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {!readOnly && (
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='shrink-0 h-7 w-7'
                      title='Adicionar distrito'
                      onClick={() => setModalDistrito(true)}
                    >
                      <Plus className='h-3.5 w-3.5' />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='concelhoId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concelho *</FormLabel>
                <div className='flex gap-1.5'>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => {
                        field.onChange(v)
                        onConcelhoChange(v)
                      }}
                      disabled={
                        concelhosQuery.isLoading ||
                        readOnly ||
                        !distritoId
                      }
                    >
                      <SelectTrigger className='h-7 w-full min-w-0'>
                        <SelectValue
                          placeholder={
                            distritoId
                              ? 'Selecionar concelho...'
                              : 'Selecione primeiro o distrito'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {concelhos.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome ?? c.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {!readOnly && (
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='shrink-0 h-7 w-7'
                      title='Adicionar concelho'
                      onClick={() => setModalConcelho(true)}
                    >
                      <Plus className='h-3.5 w-3.5' />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='freguesiaId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Freguesia *</FormLabel>
                <div className='flex gap-1.5'>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => {
                        field.onChange(v)
                        onFreguesiaChange(v)
                      }}
                      disabled={
                        freguesiasQuery.isLoading ||
                        readOnly ||
                        !concelhoId
                      }
                    >
                      <SelectTrigger className='h-7 w-full min-w-0'>
                        <SelectValue
                          placeholder={
                            concelhoId
                              ? 'Selecionar freguesia...'
                              : 'Selecione primeiro o concelho'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {freguesias.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.nome ?? f.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {!readOnly && (
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='shrink-0 h-7 w-7'
                      title='Adicionar freguesia'
                      onClick={() => setModalFreguesia(true)}
                    >
                      <Plus className='h-3.5 w-3.5' />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='codigoPostalId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Postal *</FormLabel>
                <div className='flex gap-1.5'>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      disabled={codigosPostaisQuery.isLoading || readOnly}
                    >
                      <SelectTrigger className='h-7 w-full min-w-0'>
                        <SelectValue placeholder='Selecionar código postal...' />
                      </SelectTrigger>
                      <SelectContent>
                        {codigosPostais.map((cp) => (
                          <SelectItem key={cp.id} value={cp.id}>
                            {cp.codigo ?? cp.id} {cp.localidade ? `– ${cp.localidade}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {!readOnly && (
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='shrink-0 h-7 w-7'
                      title='Adicionar código postal'
                      onClick={() => setModalCodigoPostal(true)}
                    >
                      <Plus className='h-3.5 w-3.5' />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='rua'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rua *</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Ex.: Rua das Flores'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                      form.setValue('ruaId', '')
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='numeroPorta'
            render={({ field }) => (
              <FormItem>
                <FormLabel>N.º Porta</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Ex.: 1, 2-A'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='andarRua'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Andar</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Ex.: 0, 1, R/C'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      {!readOnly && (
        <>
          <CreatePaisModal
            open={modalPais}
            onOpenChange={setModalPais}
            onSuccess={(newId) => form.setValue('paisId', newId)}
          />
          <CreateDistritoModal
            open={modalDistrito}
            onOpenChange={setModalDistrito}
            paisId={form.watch('paisId') ?? ''}
            onSuccess={(newId) => form.setValue('distritoId', newId)}
          />
          <CreateConcelhoModal
            open={modalConcelho}
            onOpenChange={setModalConcelho}
            distritoId={form.watch('distritoId') ?? ''}
            onSuccess={(newId) => form.setValue('concelhoId', newId)}
          />
          <CreateFreguesiaModal
            open={modalFreguesia}
            onOpenChange={setModalFreguesia}
            concelhoId={form.watch('concelhoId') ?? ''}
            onSuccess={(newId) => form.setValue('freguesiaId', newId)}
          />
          <CreateCodigoPostalModal
            open={modalCodigoPostal}
            onOpenChange={setModalCodigoPostal}
            onSuccess={(newId) => form.setValue('codigoPostalId', newId)}
          />
        </>
      )}
    </div>
  )
}
