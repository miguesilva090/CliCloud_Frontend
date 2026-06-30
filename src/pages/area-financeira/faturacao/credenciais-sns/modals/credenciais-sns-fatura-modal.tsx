import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { fieldGap, inputClass, labelClass, selectTriggerClass } from '@/lib/form-styles'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { ContaBancariaService } from '@/lib/services/bancos/conta-bancaria-service'
import { ResponseStatus } from '@/types/api/responses'
import type { CredenciaisSnsModulo } from '@/types/dtos/faturacao/credenciais-sns.dtos'
import type { ModoPagamentoLightDTO } from '@/types/dtos/pagamentos/modo-pagamento.dtos'
import { NATUREZAS_ORGANISMO } from '@/pages/area-comum/tabelas/entidades/organismos/constants/naturezas-organismo'
import { useGetTiposDocumentoLight } from '@/pages/area-financeira/faturacao/queries/tipo-documento-queries'
import {
  formatModoPagamentoOptionLabel,
  useModosPagamentoLight,
} from '@/lib/services/pagamentos/pagamentos-lookups-queries'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp } from '@/utils/window-utils'
import { toast } from '@/utils/toast-utils'
import { CREDENCIAIS_SNS_PERM_ID } from '../queries/listagem-credenciais-sns-queries'
import {
  useCredenciaisSnsOrganismoDetail,
  useCredenciaisSnsTiposServico,
} from '../queries/credenciais-sns-form-queries'
import {
  CREDENCIAIS_SNS_MESES,
  createCredenciaisSnsFaturaFormDefaults,
  type CredenciaisSnsFaturaFormValues,
} from '../utils/credenciais-sns-form-constants'
import {
  credenciaisSnsFaturaHasErrors,
  validateCredenciaisSnsFaturaForm,
} from '../utils/credenciais-sns-fatura-form-utils'
import { submitCredenciaisSnsFatura } from '../utils/credenciais-sns-fatura-submit'

type CredenciaisSnsFaturaModalProps = {
  open: boolean
  modulo: CredenciaisSnsModulo
  onClose: () => void
}

export function CredenciaisSnsFaturaModal({
  open,
  modulo,
  onClose,
}: CredenciaisSnsFaturaModalProps) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const [values, setValues] = useState<CredenciaisSnsFaturaFormValues>(
    createCredenciaisSnsFaturaFormDefaults
  )
  const [submitting, setSubmitting] = useState(false)
  const [orgSearch, setOrgSearch] = useState('')
  const [debOrg] = useDebounce(orgSearch, 300)
  const [modoPagSearch, setModoPagSearch] = useState('')
  const [debModoPag] = useDebounce(modoPagSearch, 300)
  const [tipoDocSearch, setTipoDocSearch] = useState('')
  const [debTipoDoc] = useDebounce(tipoDocSearch, 300)

  const orgsQ = useQuery({
    queryKey: ['credenciais-sns', 'organismos-light', debOrg],
    queryFn: () => OrganismoService(CREDENCIAIS_SNS_PERM_ID).getOrganismoLight(debOrg),
    enabled: open,
    staleTime: 60_000,
  })

  const organismoDetailQ = useCredenciaisSnsOrganismoDetail(values.organismoId, open)
  const tiposServicoQ = useCredenciaisSnsTiposServico(open)
  const tiposDocumentoQ = useGetTiposDocumentoLight(debTipoDoc, CREDENCIAIS_SNS_PERM_ID)
  const modosPagamentoQ = useModosPagamentoLight(
    CREDENCIAIS_SNS_PERM_ID,
    debModoPag,
    true
  )

  const contasBancariasQ = useQuery({
    queryKey: ['credenciais-sns', 'contas-bancarias-light'],
    queryFn: async () => {
      const res = await ContaBancariaService(CREDENCIAIS_SNS_PERM_ID).getContasBancariasLight()
      if (res.info?.status !== ResponseStatus.Success) return []
      return res.info.data ?? []
    },
    enabled: open && values.opcaoFatura === 'gerar',
    staleTime: 120_000,
  })

  const orgItems = useMemo(
    () =>
      (orgsQ.data?.info?.data ?? []).map((o) => ({
        value: o.id,
        label: o.abreviatura?.trim() || o.nomeComercial?.trim() || o.nome,
        secondary: o.numeroContribuinte ?? undefined,
      })),
    [orgsQ.data]
  )

  const modosPagamento = (modosPagamentoQ.data ?? []) as ModoPagamentoLightDTO[]
  const modoSelecionado = modosPagamento.find((m) => m.id === values.modoPagamentoId)

  const tipoDocumentoItems = useMemo(
    () =>
      (tiposDocumentoQ.data?.info?.data ?? []).map((t) => ({
        value: t.id,
        label: t.descricao?.trim() || t.abreviatura?.trim() || t.id,
      })),
    [tiposDocumentoQ.data]
  )

  const modoPagamentoItems = useMemo(
    () =>
      modosPagamento.map((m) => ({
        value: m.id,
        label: formatModoPagamentoOptionLabel(m),
      })),
    [modosPagamento]
  )

  const contaBancariaItems = useMemo(
    () =>
      (contasBancariasQ.data ?? []).map((c) => ({
        value: c.id,
        label: c.numero?.trim() ? c.numero : c.id,
      })),
    [contasBancariasQ.data]
  )

  useEffect(() => {
    if (!open) return
    setValues(createCredenciaisSnsFaturaFormDefaults())
    setOrgSearch('')
    setModoPagSearch('')
    setTipoDocSearch('')
  }, [open])

  useEffect(() => {
    const organismo = organismoDetailQ.data?.info?.data
    if (!organismo || !values.organismoId) return

    setValues((prev) => ({
      ...prev,
      codigoOrganismo: organismo.codigoULSNova ?? null,
      modoPagamentoId: organismo.modoPagamentoId ?? prev.modoPagamentoId,
      contaBancariaId: '',
    }))
  }, [organismoDetailQ.data, values.organismoId])

  useEffect(() => {
    if (!modoSelecionado?.contaBancariaId) return
    setValues((prev) => {
      if (prev.contaBancariaId) return prev
      return { ...prev, contaBancariaId: modoSelecionado.contaBancariaId ?? '' }
    })
  }, [modoSelecionado])

  const patch = (p: Partial<CredenciaisSnsFaturaFormValues>) =>
    setValues((prev) => ({ ...prev, ...p }))

  const handleConfirm = async () => {
    const errors = validateCredenciaisSnsFaturaForm(values, modosPagamento)
    if (credenciaisSnsFaturaHasErrors(errors)) {
      const first = Object.values(errors)[0]
      toast.error(first ?? 'Verifique os campos obrigatórios.')
      return
    }

    setSubmitting(true)
    try {
      await submitCredenciaisSnsFatura(modulo, values)
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível processar a fatura.')
    } finally {
      setSubmitting(false)
    }
  }

  const naturezaDisabled = !values.organismoId
  const gerarFatura = values.opcaoFatura === 'gerar'

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Fatura</DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-12 gap-4'>
          <div className={`col-span-12 md:col-span-8 ${fieldGap}`}>
            <Label className={labelClass}>Organismo</Label>
            <div className='flex gap-2'>
              <div className='min-w-0 flex-1'>
                <AsyncCombobox
                  value={values.organismoId}
                  onChange={(id) => {
                    const item = orgItems.find((o) => o.value === id)
                    patch({
                      organismoId: id,
                      organismoLabel: item?.label ?? '',
                      naturezaPrestacoes: '',
                      codigoOrganismo: null,
                    })
                  }}
                  items={orgItems}
                  isLoading={orgsQ.isFetching}
                  placeholder='Pesquisar organismo…'
                  searchValue={orgSearch}
                  onSearchValueChange={setOrgSearch}
                />
              </div>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='h-9 w-9 shrink-0'
                title='Abrir organismos'
                onClick={() =>
                  openPathInApp(
                    navigate,
                    addWindow,
                    '/area-comum/tabelas/entidades/organismos',
                    'Organismos'
                  )
                }
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className={`col-span-12 md:col-span-4 ${fieldGap}`}>
            <Label className={labelClass}>Ano</Label>
            <Input
              className={inputClass}
              value={values.ano}
              onChange={(e) => patch({ ano: e.target.value })}
              inputMode='numeric'
            />
          </div>

          <div className={`col-span-12 md:col-span-6 ${fieldGap}`}>
            <Label className={labelClass}>Tipo Serviço</Label>
            <Select
              value={values.tipoServicoId || undefined}
              onValueChange={(v) => patch({ tipoServicoId: v })}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder='Selecionar…' />
              </SelectTrigger>
              <SelectContent>
                {(tiposServicoQ.data ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.descricao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={`col-span-12 md:col-span-6 ${fieldGap}`}>
            <Label className={labelClass}>Mês</Label>
            <Select
              value={values.mes || undefined}
              onValueChange={(v) => patch({ mes: v })}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder='Selecionar…' />
              </SelectTrigger>
              <SelectContent>
                {CREDENCIAIS_SNS_MESES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={`col-span-12 md:col-span-8 ${fieldGap}`}>
            <Label className={labelClass}>Natureza de Prestações</Label>
            <Select
              value={values.naturezaPrestacoes || undefined}
              onValueChange={(v) => patch({ naturezaPrestacoes: v })}
              disabled={naturezaDisabled}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder={naturezaDisabled ? 'Selecione organismo…' : 'Selecionar…'} />
              </SelectTrigger>
              <SelectContent>
                {NATUREZAS_ORGANISMO.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={`col-span-12 md:col-span-4 ${fieldGap}`}>
            <Label className={labelClass}>N.º Vias</Label>
            <Input
              className={inputClass}
              value={values.numVias}
              onChange={(e) => patch({ numVias: e.target.value })}
              inputMode='numeric'
            />
          </div>

          <div className='col-span-12 space-y-2'>
            <Label className={labelClass}>Opção</Label>
            <RadioGroup
              value={values.opcaoFatura}
              onValueChange={(v) =>
                patch({
                  opcaoFatura: v as CredenciaisSnsFaturaFormValues['opcaoFatura'],
                  ...(v === 'visualizar'
                    ? {
                        tipoDocumentoId: '',
                        modoPagamentoId: '',
                        contaBancariaId: '',
                        numeroCheque: '',
                        preDatado: false,
                        dataVencimento: '',
                      }
                    : {}),
                })
              }
              className='flex flex-col gap-2 sm:flex-row sm:gap-6'
            >
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='visualizar' id='sns-fatura-visualizar' />
                <Label htmlFor='sns-fatura-visualizar' className='font-normal'>
                  Apenas Visualizar
                </Label>
              </div>
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='gerar' id='sns-fatura-gerar' />
                <Label htmlFor='sns-fatura-gerar' className='font-normal'>
                  Gerar Fatura
                </Label>
              </div>
            </RadioGroup>
          </div>

          {gerarFatura ? (
            <>
              <div className={`col-span-12 md:col-span-8 ${fieldGap}`}>
                <Label className={labelClass}>Tipo Documento</Label>
                <AsyncCombobox
                  value={values.tipoDocumentoId}
                  onChange={(id) => patch({ tipoDocumentoId: id })}
                  items={tipoDocumentoItems}
                  isLoading={tiposDocumentoQ.isFetching}
                  placeholder='Pesquisar tipo de documento…'
                  searchValue={tipoDocSearch}
                  onSearchValueChange={setTipoDocSearch}
                />
              </div>

              <div className={`col-span-12 md:col-span-8 ${fieldGap}`}>
                <Label className={labelClass}>Modo de Pagamento</Label>
                <AsyncCombobox
                  value={values.modoPagamentoId}
                  onChange={(id) =>
                    patch({
                      modoPagamentoId: id,
                      contaBancariaId: '',
                      numeroCheque: '',
                      preDatado: false,
                      dataVencimento: '',
                    })
                  }
                  items={modoPagamentoItems}
                  isLoading={modosPagamentoQ.isFetching}
                  placeholder='Pesquisar modo de pagamento…'
                  searchValue={modoPagSearch}
                  onSearchValueChange={setModoPagSearch}
                />
              </div>

              {modoSelecionado?.temContaBancaria ? (
                <div className={`col-span-12 md:col-span-8 ${fieldGap}`}>
                  <Label className={labelClass}>Conta Bancária</Label>
                  <Select
                    value={values.contaBancariaId || undefined}
                    onValueChange={(v) => patch({ contaBancariaId: v })}
                  >
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder='Selecionar conta…' />
                    </SelectTrigger>
                    <SelectContent>
                      {contaBancariaItems.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {modoSelecionado?.temNumAssociado ? (
                <>
                  <div className={`col-span-12 md:col-span-4 ${fieldGap}`}>
                    <Label className={labelClass}>N.º Cheque</Label>
                    <Input
                      className={inputClass}
                      value={values.numeroCheque}
                      onChange={(e) => patch({ numeroCheque: e.target.value })}
                    />
                  </div>
                  <div className={`col-span-12 md:col-span-4 flex items-end gap-2 pb-1 ${fieldGap}`}>
                    <Checkbox
                      id='sns-fatura-predatado'
                      checked={values.preDatado}
                      onCheckedChange={(checked) =>
                        patch({
                          preDatado: checked === true,
                          dataVencimento: checked === true ? values.dataVencimento : '',
                        })
                      }
                    />
                    <Label htmlFor='sns-fatura-predatado' className='font-normal'>
                      Pré-datado
                    </Label>
                  </div>
                  {values.preDatado ? (
                    <div className={`col-span-12 md:col-span-4 ${fieldGap}`}>
                      <Label className={labelClass}>Data Vencimento</Label>
                      <Input
                        type='date'
                        className={inputClass}
                        value={values.dataVencimento}
                        onChange={(e) => patch({ dataVencimento: e.target.value })}
                      />
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button type='button' variant='outline' onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type='button' onClick={() => void handleConfirm()} disabled={submitting}>
            {submitting ? 'A processar…' : 'OK'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
