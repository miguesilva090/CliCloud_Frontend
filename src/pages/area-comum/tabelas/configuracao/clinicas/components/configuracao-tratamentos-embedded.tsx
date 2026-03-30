import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { TipoServicoService } from '@/lib/services/servicos/tipo-servico-service'
import type {
  AtualizarConfiguracaoTratamentosRequest,
  ConfiguracaoTratamentosDTO,
} from '@/types/dtos/core/configuracao-tratamentos.dtos'

type FormValues = {
  tipoSrvTratamentos: string
  areaPrestacaoDefeitoAreaZ: string
  controlarAparelhos: boolean

  segundos: string
  faltasMax: string
  faltasConsecutivasMax: string
  taxamoderadora: string
  credencialExternaAdse: boolean

  tipoPagamento: string
  avisoInqueritoSessoesDiarias: boolean
}

const schema = z
  .object({
    tipoSrvTratamentos: z.string().max(50).optional(),
    areaPrestacaoDefeitoAreaZ: z.string().max(200).optional(),
    controlarAparelhos: z.boolean().optional(),

    segundos: z
      .string()
      .optional()
      .refine(
        (v) => v === undefined || v.trim() === '' || !Number.isNaN(Number(v)),
        'Valor inválido',
      ),
    faltasMax: z
      .string()
      .optional()
      .refine(
        (v) => v === undefined || v.trim() === '' || !Number.isNaN(Number(v)),
        'Valor inválido',
      ),
    faltasConsecutivasMax: z
      .string()
      .optional()
      .refine(
        (v) => v === undefined || v.trim() === '' || !Number.isNaN(Number(v)),
        'Valor inválido',
      ),
    taxamoderadora: z
      .string()
      .optional()
      .refine(
        (v) => v === undefined || v.trim() === '' || !Number.isNaN(Number(v)),
        'Valor inválido',
      ),
    credencialExternaAdse: z.boolean().optional(),

    tipoPagamento: z.string().max(10).optional(),
    avisoInqueritoSessoesDiarias: z.boolean().optional(),
  })
  .passthrough()

function asValue(v: unknown) {
  if (v === null || v === undefined) return ''
  return String(v)
}

export function ConfiguracaoTratamentosEmbedded({
  disabled,
  configuracaoTratamentos,
  onPayloadChange,
}: {
  disabled?: boolean
  configuracaoTratamentos?: ConfiguracaoTratamentosDTO | null
  onPayloadChange?: (payload: AtualizarConfiguracaoTratamentosRequest | null) => void
}) {
  const lastPayloadKeyRef = useRef<string | null>(null)
  const config = configuracaoTratamentos

  const tiposServicoQuery = useQuery({
    queryKey: ['tipo-servico', 'light'],
    queryFn: () => TipoServicoService().getTipoServicoLight(),
    staleTime: 5 * 60_000,
  })
  const tiposServico = tiposServicoQuery.data?.info?.data ?? []

  const defaultValues = useMemo<FormValues>(() => {
    // Se a clínica ainda não chegou, os defaults não importam porque não renderizamos.
    if (config === undefined) {
      return {
        tipoSrvTratamentos: '',
        areaPrestacaoDefeitoAreaZ: '',
        controlarAparelhos: false,
        segundos: '',
        faltasMax: '',
        faltasConsecutivasMax: '',
        taxamoderadora: '',
        credencialExternaAdse: false,
        tipoPagamento: '',
        avisoInqueritoSessoesDiarias: false,
      }
    }

    // Se não existe registo, mostramos os defaults (o backend cria no save).
    if (!config) {
      return {
        tipoSrvTratamentos: '',
        areaPrestacaoDefeitoAreaZ: '',
        controlarAparelhos: false,
        segundos: '',
        faltasMax: '',
        faltasConsecutivasMax: '',
        taxamoderadora: '',
        credencialExternaAdse: false,
        tipoPagamento: '',
        avisoInqueritoSessoesDiarias: false,
      }
    }

    // Carrega valores logo à primeira renderização (evita flicker off->on).
    return {
      tipoSrvTratamentos: config.tipoSrvTratamentos ?? '',
      areaPrestacaoDefeitoAreaZ: config.areaPrestacaoDefeitoAreaZ ?? '',
      controlarAparelhos: config.controlarAparelhos ?? false,

      segundos: config.segundos != null ? String(config.segundos) : '',
      faltasMax: config.faltasMax != null ? String(config.faltasMax) : '',
      faltasConsecutivasMax:
        config.faltasConsecutivasMax != null
          ? String(config.faltasConsecutivasMax)
          : '',
      taxamoderadora: config.taxamoderadora != null ? String(config.taxamoderadora) : '',
      credencialExternaAdse: config.credencialExternaAdse ?? false,

      tipoPagamento: config.tipoPagamento != null ? String(config.tipoPagamento) : '',
      avisoInqueritoSessoesDiarias: config.avisoInqueritoSessoesDiarias ?? false,
    }
  }, [config])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const [
    tipoSrvTratamentos,
    areaPrestacaoDefeitoAreaZ,
    controlarAparelhos,
    segundos,
    faltasMax,
    faltasConsecutivasMax,
    taxamoderadora,
    credencialExternaAdse,
    tipoPagamento,
    avisoInqueritoSessoesDiarias,
  ] = form.watch([
    'tipoSrvTratamentos',
    'areaPrestacaoDefeitoAreaZ',
    'controlarAparelhos',
    'segundos',
    'faltasMax',
    'faltasConsecutivasMax',
    'taxamoderadora',
    'credencialExternaAdse',
    'tipoPagamento',
    'avisoInqueritoSessoesDiarias',
  ])

  useEffect(() => {
    // Se ainda não chegou a clínica (config == undefined), não fazemos reset.
    if (config === undefined) return
    // Nova clínica (ou registo de tratamentos mudou): re-inicializa a comparação.
    lastPayloadKeyRef.current = null
    // Se não existe registo de tratamentos, mantemos os defaults (o backend cria no save).
    if (!config) return
    form.reset({
      tipoSrvTratamentos: config.tipoSrvTratamentos ?? '',
      areaPrestacaoDefeitoAreaZ: config.areaPrestacaoDefeitoAreaZ ?? '',
      controlarAparelhos: config.controlarAparelhos ?? false,
      segundos: config.segundos != null ? String(config.segundos) : '',
      faltasMax: config.faltasMax != null ? String(config.faltasMax) : '',
      faltasConsecutivasMax:
        config.faltasConsecutivasMax != null
          ? String(config.faltasConsecutivasMax)
          : '',
      taxamoderadora:
        config.taxamoderadora != null ? String(config.taxamoderadora) : '',
      credencialExternaAdse: config.credencialExternaAdse ?? false,
      tipoPagamento:
        config.tipoPagamento != null ? String(config.tipoPagamento) : '',
      avisoInqueritoSessoesDiarias:
        config.avisoInqueritoSessoesDiarias ?? false,
    })
  }, [config, form])

  const buildPayload = (values: FormValues) => {
    const payload: AtualizarConfiguracaoTratamentosRequest = {
      tipoSrvTratamentos: values.tipoSrvTratamentos.trim() || null,
      areaPrestacaoDefeitoAreaZ: values.areaPrestacaoDefeitoAreaZ.trim() || null,
      controlarAparelhos: values.controlarAparelhos ?? null,

      segundos: values.segundos.trim() ? parseInt(values.segundos.trim(), 10) : null,
      faltasMax: values.faltasMax.trim() ? parseInt(values.faltasMax.trim(), 10) : null,
      faltasConsecutivasMax: values.faltasConsecutivasMax.trim()
        ? parseInt(values.faltasConsecutivasMax.trim(), 10)
        : null,
      taxamoderadora: values.taxamoderadora.trim()
        ? Number(values.taxamoderadora.trim())
        : null,
      credencialExternaAdse: values.credencialExternaAdse ?? null,

      tipoPagamento: values.tipoPagamento.trim()
        ? parseInt(values.tipoPagamento.trim(), 10)
        : null,
      avisoInqueritoSessoesDiarias: values.avisoInqueritoSessoesDiarias ?? null,
    }

    return payload
  }

  useEffect(() => {
    if (!onPayloadChange) return

    if (config === undefined) {
      lastPayloadKeyRef.current = null
      onPayloadChange(null)
      return
    }

    const values: FormValues = {
      tipoSrvTratamentos: (tipoSrvTratamentos ?? '') as string,
      areaPrestacaoDefeitoAreaZ: (areaPrestacaoDefeitoAreaZ ?? '') as string,
      controlarAparelhos: Boolean(controlarAparelhos),
      segundos: (segundos ?? '') as string,
      faltasMax: (faltasMax ?? '') as string,
      faltasConsecutivasMax: (faltasConsecutivasMax ?? '') as string,
      taxamoderadora: (taxamoderadora ?? '') as string,
      credencialExternaAdse: Boolean(credencialExternaAdse),
      tipoPagamento: (tipoPagamento ?? '') as string,
      avisoInqueritoSessoesDiarias: Boolean(avisoInqueritoSessoesDiarias),
    }

    const payload = buildPayload(values)
    const payloadKey = JSON.stringify(payload)

    // Primeiro cálculo após hidratação: define o payload inicial, sem disparar save.
    if (lastPayloadKeyRef.current === null) {
      lastPayloadKeyRef.current = payloadKey
      onPayloadChange(null)
      return
    }

    // Se voltou aos valores iniciais, limpamos o payload no parent.
    if (payloadKey === lastPayloadKeyRef.current) {
      onPayloadChange(null)
      return
    }

    lastPayloadKeyRef.current = payloadKey
    onPayloadChange(payload)
  }, [
    config,
    onPayloadChange,
    tipoSrvTratamentos,
    areaPrestacaoDefeitoAreaZ,
    controlarAparelhos,
    segundos,
    faltasMax,
    faltasConsecutivasMax,
    taxamoderadora,
    credencialExternaAdse,
    tipoPagamento,
    avisoInqueritoSessoesDiarias,
  ])

  // Evita "flicker" de switches (render default -> depois reset)
  // enquanto o `ClinicaEditPage` ainda está a carregar a clínica/DTO.
  if (config === undefined) return null

  return (
    <Form {...form}>
      <div className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
          <section className='md:col-span-12 space-y-3 rounded border border-primary/20 bg-muted/10 p-3'>
            <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
              Subsistemas de Saúde
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-12 gap-3'>
              <FormField
                control={form.control}
                name='faltasMax'
                render={({ field }) => (
                  <FormItem className='md:col-span-3'>
                    <FormLabel className='text-xs'>Máx. Faltas</FormLabel>
                    <FormControl>
                      <Input
                        className='h-7'
                        readOnly={disabled}
                        type='number'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='faltasConsecutivasMax'
                render={({ field }) => (
                  <FormItem className='md:col-span-3'>
                    <FormLabel className='text-xs'>Máx. Faltas Consec.</FormLabel>
                    <FormControl>
                      <Input
                        className='h-7'
                        readOnly={disabled}
                        type='number'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='taxamoderadora'
                render={({ field }) => (
                  <FormItem className='md:col-span-3'>
                    <FormLabel className='text-xs'>Taxa Moderadora (SNS)</FormLabel>
                    <FormControl>
                      <Input
                        className='h-7'
                        readOnly={disabled}
                        type='number'
                        step='0.01'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='credencialExternaAdse'
                render={({ field }) => (
                  <FormItem className='md:col-span-3 flex flex-row items-center justify-between gap-3 space-y-0 pt-6'>
                    <FormLabel className=' ml-2 mb-2 text-xs whitespace-nowrap'>
                      Credencial Externa ADSE
                    </FormLabel>
                    <FormControl inline>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                        disabled={disabled}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section className='md:col-span-4 space-y-3 rounded border border-primary/20 bg-muted/10 p-3'>
            <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
              Atualização automática
            </h3>
            <FormField
              control={form.control}
              name='segundos'
              render={({ field }) => (
                <FormItem className='max-w-md'>
                  <FormLabel className='text-xs'>Intervalo (segundos)</FormLabel>
                  <FormControl>
                    <Input
                      className='h-7'
                      readOnly={disabled}
                      type='number'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>

          <section className='md:col-span-4 space-y-3 rounded border border-primary/20 bg-muted/10 p-3'>
            <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
              Inquérito sessões diárias
            </h3>
            <FormField
              control={form.control}
              name='avisoInqueritoSessoesDiarias'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between gap-3 space-y-2 pt-1 '>
                  <FormLabel className=' mb-0 text-xs'>Ativo</FormLabel>
                  <FormControl inline>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>

          <section className='md:col-span-4 space-y-3 rounded border border-primary/20 bg-muted/10 p-3'>
            <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
              Configuração da forma de pagamento
            </h3>
            <FormField
              control={form.control}
              name='tipoPagamento'
              render={({ field }) => (
                <FormItem>
                  <RadioGroup
                    value={asValue(field.value)}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <RadioGroupItem value='0' id='tp-0' />
                      <span className='text-xs'>Por sessão</span>
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <RadioGroupItem value='1' id='tp-1' />
                      <span className='text-xs'>Por tratamento</span>
                    </label>
                  </RadioGroup>
                </FormItem>
              )}
            />
          </section>

          <section className='md:col-span-4 space-y-3 rounded border border-primary/20 bg-muted/10 p-3'>
            <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
              Tipos de Serviço
            </h3>
            <FormField
              control={form.control}
              name='tipoSrvTratamentos'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs whitespace-nowrap'>Tratamentos</FormLabel>
                  <FormControl>
                    <Select
                      value={
                        asValue(field.value) === '' ? undefined : asValue(field.value)
                      }
                      onValueChange={field.onChange}
                      disabled={disabled || tiposServicoQuery.isLoading}
                    >
                      <SelectTrigger className='h-7'>
                        <SelectValue
                          placeholder={
                            tiposServicoQuery.isLoading ? 'A carregar…' : 'Selecione…'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposServico.map((t: { id: string; descricao: string }) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className='md:col-span-4 space-y-3 rounded border border-primary/20 bg-muted/10 p-3'>
            <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
              Áreas de Prestação por Defeito
            </h3>
            <FormField
              control={form.control}
              name='areaPrestacaoDefeitoAreaZ'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>PNPs da Área Z</FormLabel>
                  <FormControl>
                    <Input
                      className='h-7'
                      readOnly={disabled}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>

          <section className='md:col-span-4 space-y-3 rounded border border-primary/20 bg-muted/10 p-3'>
            <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
              Aparelhos
            </h3>
            <FormField
              control={form.control}
              name='controlarAparelhos'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between gap-3 space-y-2 pt-1'>
                  <FormLabel className='mb-0 text-xs whitespace-nowrap'>
                    Controlar Aparelhos
                  </FormLabel>
                  <FormControl inline>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>
        </div>
      </div>
    </Form>
  )
}

