import { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useWindowsStore } from '@/stores/use-windows-store'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UtenteEditFormValues } from '@/pages/utentes/types/utente-edit-form-types'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import { useProvenienciasUtenteLight } from '@/lib/services/utility/lookups/lookups-queries'
import { useMedicosLight } from '@/lib/services/saude/medicos-service/medicos-queries'
import { fieldGap, inputClass, labelClass, selectTriggerClass, buttonIconClass } from './utente-edit-tabs-constants'
import { openPathInApp } from '@/utils/window-utils'

export function TabOutrasInformacoes({
  form,
  utente,
}: {
  form: UseFormReturn<UtenteEditFormValues>
  utente: UtenteDTO | undefined
}) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const provenienciasQuery = useProvenienciasUtenteLight('')
  const proveniencias = provenienciasQuery.data?.info?.data ?? []
  const medicosQuery = useMedicosLight('')
  const medicos = medicosQuery.data?.info?.data ?? []

  const medicosComUtente = useMemo(() => {
    const list = medicos
    if (utente?.medicoId && utente.medico && !list.some((m) => m.id === utente.medicoId)) {
      return [
        { id: utente.medico.id, nome: utente.medico.nome ?? '' },
        ...list,
      ]
    }
    return list
  }, [medicos, utente?.medicoId, utente?.medico])

  const provenienciasComUtente = useMemo(() => {
    const list = proveniencias
    if (utente?.provenienciaUtenteId && utente.provenienciaUtente && !list.some((p) => p.id === utente.provenienciaUtenteId)) {
      return [
        {
          id: utente.provenienciaUtente.id,
          codigo: utente.provenienciaUtente.codigo ?? null,
          descricao: utente.provenienciaUtente.descricao ?? '',
        },
        ...list,
      ]
    }
    return list
  }, [proveniencias, utente?.provenienciaUtenteId, utente?.provenienciaUtente])

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <div className={fieldGap}>
          <FormLabel className={labelClass}>Número Cartão</FormLabel>
          <Input placeholder='999999999' className={inputClass} />
        </div>
        <div className={fieldGap}>
          <FormLabel className={labelClass}>Próximo Número Cartão</FormLabel>
          <Input placeholder='' className={inputClass} />
        </div>
        <div className={fieldGap}>
          <FormLabel className={labelClass}>Validade do Cartão</FormLabel>
          <Input type='date' placeholder='' className={inputClass} />
        </div>
        <div className={fieldGap}>
          <FormLabel className={labelClass}>Nome do Titular</FormLabel>
          <Input placeholder='' className={inputClass} />
        </div>
        <FormField
          control={form.control}
          name='medicoId'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Médico</FormLabel>
              <div className='flex gap-1.5 w-full min-w-0'>
                <div className='flex-1 min-w-0'>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v === '' ? null : v)}
                      disabled={medicosQuery.isLoading}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder='Selecionar médico...' />
                      </SelectTrigger>
                      <SelectContent>
                        {medicosComUtente.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.nome}
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
                  title='Listagem de Médicos'
                  onClick={() =>
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/entidades/medicos',
                      'Médicos'
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
        <div className={fieldGap}>
          <FormLabel className={labelClass}>Número Interno</FormLabel>
          <Input placeholder='1234' className={inputClass} />
        </div>
        <div className={fieldGap}>
          <FormLabel className={labelClass}>Setor</FormLabel>
          <Input placeholder='' className={inputClass} />
        </div>
        <div className={fieldGap}>
          <FormLabel className={labelClass}>Desconto Clínica</FormLabel>
          <Input placeholder='10,00' className={inputClass} />
        </div>
        <div className={fieldGap}>
          <FormLabel className={labelClass}>Função</FormLabel>
          <Input placeholder='' className={inputClass} />
        </div>
        <div className={fieldGap}>
          <FormLabel className={labelClass}>Posto de Trabalho</FormLabel>
          <Input placeholder='' className={inputClass} />
        </div>
        <FormField
          control={form.control}
          name='provenienciaUtenteId'
          render={({ field }) => (
            <FormItem className={`lg:col-span-2 ${fieldGap}`}>
              <FormLabel className={labelClass}>Proveniência do Utente</FormLabel>
              <div className='flex items-end gap-1.5 w-full min-w-0'>
                <div className='flex-1 min-w-0'>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v === '' ? null : v)}
                      disabled={provenienciasQuery.isLoading}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder='Selecionar...' />
                      </SelectTrigger>
                      <SelectContent>
                        {provenienciasComUtente.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.descricao ?? p.id}
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
                  title='Gestão de Proveniências de Utente'
                  onClick={() =>
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/tabelas/proveniencias-utentes',
                      'Proveniências de Utente'
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
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t'>
        <FormField
          control={form.control}
          name='status'
          render={({ field: statusField }) => {
            const desistencia = form.watch('desistencia')
            const statusSelecionado = form.watch('statusSelecionado') ?? true
            const isRenovacao = statusSelecionado && statusField.value === 0 && !desistencia
            const isDesistencia = statusSelecionado && !!desistencia
            const isInativo = statusSelecionado && statusField.value === 1 && !desistencia
            return (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>Status</FormLabel>
                <div className='flex flex-wrap gap-2'>
                  <Button
                    type='button'
                    variant={isRenovacao ? 'secondary' : 'outline'}
                    size='sm'
                    className='rounded-full'
                    onClick={() => {
                      if (isRenovacao) {
                        // clicar de novo remove a seleção
                        form.setValue('statusSelecionado', false)
                        form.setValue('desistencia', false)
                      } else {
                        statusField.onChange(0)
                        form.setValue('desistencia', false)
                        form.setValue('statusSelecionado', true)
                      }
                    }}
                  >
                    {isRenovacao ? '✔' : '×'} Renovação
                  </Button>
                  <Button
                    type='button'
                    variant={isDesistencia ? 'secondary' : 'outline'}
                    size='sm'
                    className='rounded-full'
                    onClick={() => {
                      if (isDesistencia) {
                        form.setValue('statusSelecionado', false)
                        form.setValue('desistencia', false)
                      } else {
                        statusField.onChange(0)
                        form.setValue('desistencia', true)
                        form.setValue('statusSelecionado', true)
                      }
                    }}
                  >
                    {isDesistencia ? '✔' : '×'} Desistência
                  </Button>
                  <Button
                    type='button'
                    variant={isInativo ? 'secondary' : 'outline'}
                    size='sm'
                    className='rounded-full'
                    onClick={() => {
                      if (isInativo) {
                        form.setValue('statusSelecionado', false)
                        form.setValue('desistencia', false)
                      } else {
                        statusField.onChange(1)
                        form.setValue('desistencia', false)
                        form.setValue('statusSelecionado', true)
                      }
                    }}
                  >
                    {isInativo ? '✔' : '×'} Inativo
                  </Button>
                </div>
              </FormItem>
            )
          }}
        />
        <div className='flex flex-wrap gap-4 items-start'>
          <div className={`${fieldGap} min-w-0 flex-1`}>
            <FormLabel className={labelClass}>Api</FormLabel>
            <div className='flex gap-1.5'>
              <Input
                placeholder='User...'
                autoComplete='off'
                name='utente-api-user'
                className={`${inputClass} flex-1 min-w-0 bg-muted/50`}
              />
              <Input
                type='password'
                placeholder='Password'
                autoComplete='new-password'
                name='utente-api-password'
                className={`${inputClass} flex-1 min-w-0 bg-muted/50`}
              />
            </div>
          </div>
          <div className={`${fieldGap} min-w-0 flex-1`}>
            <FormLabel className={labelClass}>Utilizador</FormLabel>
            <Input readOnly placeholder='—' className={`${inputClass} bg-muted`} />
          </div>
        </div>
      </div>

      <div className='space-y-4 pt-4 border-t'>
        <h4 className='text-sm font-semibold'>Consentimento</h4>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {[
            {
              key: 'rgpd',
              label: 'RGPD',
              consent: utente?.dataConsentimentoRgpd,
              revog: utente?.dataRevogacaoRgpd,
              checked: !!utente?.rgpdConsentimento,
            },
            {
              key: 'marketing',
              label: 'Marketing',
              consent: utente?.dataConsentimentoMark,
              revog: utente?.dataRevogacaoMark,
              checked: !!utente?.markConsentimento,
            },
            {
              key: 'tratamentoDados',
              label: 'Tratamento Dados',
              consent: null,
              revog: null,
              checked: utente?.markTratamentoDados ?? false,
            },
          ].map(({ key, label, consent, revog, checked }) => (
            <div key={key} className='flex flex-col gap-2 p-3 rounded-lg border'>
              <div className='flex items-center space-x-2'>
                <Checkbox id={key} defaultChecked={checked} />
                <label htmlFor={key} className='text-sm font-medium cursor-pointer'>
                  {label}
                </label>
              </div>
              <Input type='date' placeholder='Consentimento' className={inputClass} defaultValue={consent ?? ''} />
              <Input type='date' placeholder='Revogação' className={inputClass} defaultValue={revog ?? ''} />
            </div>
          ))}
        </div>
      </div>

      <div className='space-y-4 pt-4 border-t'>
        <h4 className='text-sm font-semibold'>Exportação de Ficheiros de Contabilidade</h4>
        <div className='space-y-4'>
          <div className={fieldGap}>
            <FormLabel className={labelClass}>Contabilidade - Fatura</FormLabel>
            <div className='flex flex-wrap gap-4 items-center'>
              <Input placeholder='' className={`${inputClass} flex-1 min-w-0`} />
              <RadioGroup defaultValue='cliente' className='flex gap-4 items-center'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='cliente' id='fat-cli' />
                  <label htmlFor='fat-cli' className='text-xs cursor-pointer'>Conta Cliente</label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='cg' id='fat-cg' />
                  <label htmlFor='fat-cg' className='text-xs cursor-pointer'>Conta CG</label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='bancaria' id='fat-banc' />
                  <label htmlFor='fat-banc' className='text-xs cursor-pointer'>Conta Bancária</label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div className={fieldGap}>
            <FormLabel className={labelClass}>Contabilidade - Fatura Recibo</FormLabel>
            <div className='flex flex-wrap gap-4 items-center'>
              <Input placeholder='' className={`${inputClass} flex-1 min-w-0`} />
              <RadioGroup defaultValue='cliente' className='flex gap-4 items-center'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='cliente' id='fr-cli' />
                  <label htmlFor='fr-cli' className='text-xs cursor-pointer'>Conta Cliente</label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='cg' id='fr-cg' />
                  <label htmlFor='fr-cg' className='text-xs cursor-pointer'>Conta CG</label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='bancaria' id='fr-banc' />
                  <label htmlFor='fr-banc' className='text-xs cursor-pointer'>Conta Bancária</label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
