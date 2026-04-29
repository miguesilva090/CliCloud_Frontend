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
import type { UtenteEditFormValues } from '@/pages/utentes/types/utente-edit-form-types'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import { usePaisesLight, useCodigosPostaisLight } from '@/lib/services/utility/lookups/lookups-queries'
import { type FormLike, useAddressCascadingLookups } from '@/hooks/use-address-cascading-lookups'
import { useNavigate } from 'react-router-dom'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp } from '@/utils/window-utils'
import { fieldGap, inputClass, labelClass, selectTriggerClass, buttonIconClass } from './utente-edit-tabs-constants'
import { RuaSelectInferCodigoPostal } from '@/components/shared/address-quick-create/RuaSelectInferCodigoPostal'

const INDICATIVOS = [
  { value: '+351', label: 'Portugal (+351)' },
  { value: '+34', label: 'Espanha (+34)' },
  { value: '+33', label: 'França (+33)' },
]

export function TabContactos({
  form,
  utente,
}: {
  form: UseFormReturn<UtenteEditFormValues>
  utente: UtenteDTO | undefined
}) {
  void utente
  const navigate = useNavigate()
  const addWindow = useWindowsStore((state) => state.addWindow)

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
      <section className='space-y-4'>
      <h3 className='text-md font-semibold text-muted-foreground border-b pb-1.5'>Morada</h3>
        <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
      <FormField
        control={form.control}
        name='paisId'
        render={({ field }) => (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>País *</FormLabel>
            <div className='flex items-end gap-1.5 w-full min-w-0'>
              <div className='flex-1 min-w-0'>
                <FormControl>
                  <Select value={field.value ?? ''} onValueChange={onPaisChange} disabled={paisesQuery.isLoading}>
                    <SelectTrigger className={selectTriggerClass}>
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
              </div>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className={buttonIconClass}
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
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Distrito *</FormLabel>
            <div className='flex items-end gap-1.5 w-full min-w-0'>
              <div className='flex-1 min-w-0'>
                <FormControl>
                  <Select value={field.value ?? ''} onValueChange={onDistritoChange} disabled={distritosQuery.isLoading || !paisId}>
                    <SelectTrigger className={selectTriggerClass}>
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
              </div>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className={buttonIconClass}
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
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Concelho *</FormLabel>
            <div className='flex items-end gap-1.5 w-full min-w-0'>
              <div className='flex-1 min-w-0'>
                <FormControl>
                  <Select value={field.value ?? ''} onValueChange={onConcelhoChange} disabled={concelhosQuery.isLoading || !distritoId}>
                    <SelectTrigger className={selectTriggerClass}>
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
              </div>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className={buttonIconClass}
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
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Freguesia *</FormLabel>
            <div className='flex items-end gap-1.5 w-full min-w-0'>
              <div className='flex-1 min-w-0'>
                <FormControl>
                  <Select value={field.value ?? ''} onValueChange={onFreguesiaChange} disabled={freguesiasQuery.isLoading || !concelhoId}>
                    <SelectTrigger className={selectTriggerClass}>
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
              </div>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className={buttonIconClass}
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
            ? `${cp.codigo ?? cp.id}${cp.localidade ? `- ${cp.localidade} ` : ''}`
            : ''

        return (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Código Postal *</FormLabel>
            <div className='flex gap-1.5 w-full min-w-0'>
              <div className='flex-1 min-w-0'>
                <FormControl>
                  <Input readOnly className={inputClass} value={display} />
                </FormControl>
              </div>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className={buttonIconClass}
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
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}> Rua *</FormLabel>
            <div className='flex gap-1.5 w-full min-w-0'>
              <div className='flex-1 min-w-0'>
                <FormControl>
                  <RuaSelectInferCodigoPostal form={form as any} /> 
                </FormControl>
              </div>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className={buttonIconClass}
                title='Adicionar rua'
                onClick={() => {
                  const params = new URLSearchParams()
                  const paisId = String(form.watch('paisId') ?? '').trim()
                  const distritoId = String(form.watch('distritoId') ?? '').trim()
                  const concelhoId = String(form.watch('concelhoId') ?? '').trim()
                  const freguesiaId = String(form.watch('freguesiaId') ?? '').trim()
                  const codigoPostalId = String(form.watch('codigoPostalId') ?? '').trim()
                  if (paisId) params.set('paisId', paisId)
                  if (distritoId) params.set('distritoId', distritoId)
                  if (concelhoId) params.set('concelhoId', concelhoId)
                  if (freguesiaId) params.set('freguesiaId', freguesiaId)
                  if (codigoPostalId) params.set('codigoPostalId', codigoPostalId)
                  const qs = params.toString()
                  openPathInApp(
                    navigate,
                    addWindow,
                    `/area-comum/tabelas/tabelas/geograficas/ruas${qs ? `?${qs}` : ''}`,
                    'Ruas',
                  )
                }}
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
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>N.º Porta *</FormLabel>
                <FormControl>
                  <Input className={inputClass} placeholder='Ex.: 1, 2-A' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='andarRua'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>Andar *</FormLabel>
                <FormControl>
                  <Input className={inputClass} placeholder='Ex.: 0, 1, R/C' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <section className='space-y-4'>
        <h3 className='text-md font-semibold text-muted-foreground border-b pb-1.5'>Contactos</h3>
        <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
      <FormField
        control={form.control}
        name='indicativoTelefone'
        render={({ field }) => (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Indicativo</FormLabel>
            <Select value={field.value ?? '+351'} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className={selectTriggerClass}>
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
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Telefone</FormLabel>
            <FormControl>
              <Input className={inputClass} placeholder='' {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='email'
        render={({ field }) => (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>E-mail</FormLabel>
            <FormControl>
              <Input className={inputClass} type='email' placeholder='' {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='telemovel'
        render={({ field }) => (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Telemóvel</FormLabel>
            <FormControl>
              <Input className={inputClass} placeholder='' {...field} value={field.value ?? ''} />
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
