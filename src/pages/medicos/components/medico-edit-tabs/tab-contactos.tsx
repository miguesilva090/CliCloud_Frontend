import type { UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
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
import type { MedicoEditFormValues } from '@/pages/medicos/types/medico-edit-form-types'
import { RuaSelectInferCodigoPostal } from '@/components/shared/address-quick-create/RuaSelectInferCodigoPostal'
import type { MedicoDTO } from '@/types/dtos/saude/medicos.dtos'
import {
  usePaisesLight,
  useCodigosPostaisLight,
} from '@/lib/services/utility/lookups/lookups-queries'
import {
  type FormLike,
  useAddressCascadingLookups,
} from '@/hooks/use-address-cascading-lookups'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp } from '@/utils/window-utils'

const INDICATIVOS = [
  { value: '+351', label: 'Portugal (+351)' },
  { value: '+34', label: 'Espanha (+34)' },
  { value: '+33', label: 'França (+33)' },
]

export function TabContactos({
  form,
  medico,
}: {
  form: UseFormReturn<MedicoEditFormValues>
  medico: MedicoDTO | undefined
}) {
  void medico
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)

  const paisesQuery = usePaisesLight('')
  const codigosPostaisQuery = useCodigosPostaisLight('')
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
  } = useAddressCascadingLookups(form as FormLike)

  const paises = paisesQuery.data?.info?.data ?? []
  const codigosPostais = codigosPostaisQuery.data?.info?.data ?? []

  return (
    <div className='space-y-8'>
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1.5'>Morada</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'>
          <FormField
            control={form.control}
            name='paisId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <div className='flex gap-1.5'>
                  <FormControl>
                    <Select value={field.value ?? ''} onValueChange={onPaisChange} disabled={paisesQuery.isLoading}>
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
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='shrink-0 h-7 w-7'
                    title='Adicionar país'
                    onClick={() =>
                      openPathInApp(
                        navigate,
                        addWindow,
                        '/area-comum/tabelas/tabelas/geograficas/paises',
                        'Países',
                      )
                    }
                  >
                    <Plus className='h-3.5 w-3.5' />
                  </Button>
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
                <FormLabel>Distrito</FormLabel>
                <div className='flex gap-1.5'>
                  <FormControl>
                    <Select value={field.value ?? ''} onValueChange={onDistritoChange} disabled={distritosQuery.isLoading || !paisId}>
                      <SelectTrigger className='h-7 w-full min-w-0'>
                        <SelectValue placeholder={paisId ? 'Selecionar distrito...' : 'Selecione primeiro o país'} />
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
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='shrink-0 h-7 w-7'
                    title='Adicionar distrito'
                    onClick={() =>
                      openPathInApp(
                        navigate,
                        addWindow,
                        '/area-comum/tabelas/tabelas/geograficas/distritos',
                        'Distritos',
                      )
                    }
                  >
                    <Plus className='h-3.5 w-3.5' />
                  </Button>
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
                <FormLabel>Concelho</FormLabel>
                <div className='flex gap-1.5'>
                  <FormControl>
                    <Select value={field.value ?? ''} onValueChange={onConcelhoChange} disabled={concelhosQuery.isLoading || !distritoId}>
                      <SelectTrigger className='h-7 w-full min-w-0'>
                        <SelectValue placeholder={distritoId ? 'Selecionar concelho...' : 'Selecione primeiro o distrito'} />
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
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='shrink-0 h-7 w-7'
                    title='Adicionar concelho'
                    onClick={() =>
                      openPathInApp(
                        navigate,
                        addWindow,
                        '/area-comum/tabelas/tabelas/geograficas/concelhos',
                        'Concelhos',
                      )
                    }
                  >
                    <Plus className='h-3.5 w-3.5' />
                  </Button>
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
                <FormLabel>Freguesia</FormLabel>
                <div className='flex gap-1.5'>
                  <FormControl>
                    <Select value={field.value ?? ''} onValueChange={onFreguesiaChange} disabled={freguesiasQuery.isLoading || !concelhoId}>
                      <SelectTrigger className='h-7 w-full min-w-0'>
                        <SelectValue placeholder={concelhoId ? 'Selecionar freguesia...' : 'Selecione primeiro o concelho'} />
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
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='shrink-0 h-7 w-7'
                    title='Adicionar freguesia'
                    onClick={() =>
                      openPathInApp(
                        navigate,
                        addWindow,
                        '/area-comum/tabelas/tabelas/geograficas/freguesias',
                        'Freguesias',
                      )
                    }
                  >
                    <Plus className='h-3.5 w-3.5' />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='codigoPostalId'
            render={({ field }) => {
              const cp = codigosPostais.find((x) => x.id === field.value)
              const display = cp
                ? `${cp.codigo ?? cp.id}${cp.localidade ? `- ${cp.localidade}` : ''}`
                : ''

            return (
              <FormItem>
                <FormLabel>Código Postal *</FormLabel>
                <div className='flex gap-1.5'>
                  <FormControl>
                    <Input className='h-7 bg-muted' readOnly value={display} /> 
                  </FormControl>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='shrink-0 h-7 w-7'
                    title='Adicionar código postal'
                    onClick={() =>
                      openPathInApp(
                        navigate,
                        addWindow,
                        '/area-comum/tabelas/tabelas/geograficas/codigospostais',
                        'Códigos Postais',
                      )
                    }
                  >
                    <Plus className='h-3.5 w-3.5' />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )
            }}
          />
          <FormField
            control={form.control}
            name='rua'
            render={() => (
              <FormItem>
                <FormLabel>Rua / Morada</FormLabel>
                <div className='flex gap-1.5'>
                  <FormControl>
                    <RuaSelectInferCodigoPostal form={form as any} />
                  </FormControl>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='shrink-0 h-7 w-7'
                    title='Adicionar rua'
                    onClick={() =>
                      openPathInApp(
                        navigate,
                        addWindow,
                        '/area-comum/tabelas/tabelas/geograficas/ruas',
                        'Ruas',
                      )
                    }
                    disabled={!form.watch('freguesiaId')}
                  >
                    <Plus className='h-3.5 w-3.5' />
                  </Button>
                </div>
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
                  <Input className='h-7' placeholder='' {...field} value={field.value ?? ''} />
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
                  <Input className='h-7' placeholder='' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1.5'>Contactos</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'>
          <FormField
            control={form.control}
            name='indicativoTelefone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Indicativo</FormLabel>
                <Select value={field.value ?? '+351'} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className='h-7'>
                      <SelectValue placeholder='+351' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INDICATIVOS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='telefone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input className='h-7' placeholder='' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='telemovel'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telemóvel</FormLabel>
                <FormControl>
                  <Input className='h-7' placeholder='' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='fax'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fax</FormLabel>
                <FormControl>
                  <Input className='h-7' placeholder='Fax...' {...field} value={field.value ?? ''} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type='email' className='h-7' placeholder='Email...' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>
    </div>
  )
}
