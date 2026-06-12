import { useEffect, useMemo, useState } from 'react'

import { useDebounce } from 'use-debounce'

import { useQuery } from '@tanstack/react-query'

import { Plus } from 'lucide-react'

import type {

  ContaBancariaFormDTO,

  ContaBancariaTableDTO,

} from '@/types/dtos/bancos/conta-bancaria.dtos'

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

import { Textarea } from '@/components/ui/textarea'

import { Switch } from '@/components/ui/switch'

import { AsyncCombobox } from '@/components/shared/async-combobox'

import { toast } from '@/utils/toast-utils'

import { ContaBancariaService } from '@/lib/services/bancos/conta-bancaria-service'

import { BancosService } from '@/lib/services/utility/bancos-service'

import { ResponseStatus } from '@/types/api/responses'



type ModalMode = 'view' | 'create' | 'edit'



interface ContaBancariaViewCreateModalProps {

  open: boolean

  onOpenChange: (open: boolean) => void

  mode: ModalMode

  viewData: ContaBancariaTableDTO | null

  onSuccess?: () => void

}



const emptyForm = (): ContaBancariaFormDTO => ({

  Numero: '',

  TipoConta: '',

  BancoId: null,

  DataAbertura: null,

  NIB: '',

  SaldoActual: 0,

  GestorConta: '',

  AlertaSaldo: 0,

  ValorAlertaSaldo: 0,

  OBS: '',

  IBAN: '',

  BIC: '',

})



export function ContaBancariaViewCreateModal({

  open,

  onOpenChange,

  mode,

  viewData,

  onSuccess,

}: ContaBancariaViewCreateModalProps) {

  const [values, setValues] = useState<ContaBancariaFormDTO>(emptyForm())

  const [bancoLabel, setBancoLabel] = useState<string>('')

  const [bancoSearch, setBancoSearch] = useState('')

  const [bancoComboOpen, setBancoComboOpen] = useState(false)

  const [debBancoSearch] = useDebounce(bancoSearch, 300)

  const [loadingDetail, setLoadingDetail] = useState(false)

  const isView = mode === 'view'

  const isEdit = mode === 'edit'



  const bancosQ = useQuery({

    queryKey: ['bancos', 'light', 'conta-bancaria', debBancoSearch],

    queryFn: async () => {

      const res = await BancosService('bancos').getBancosLight(debBancoSearch)

      return res.info?.data ?? []

    },

    enabled: open,

    staleTime: 60_000,

  })



  const bancoItems = useMemo(() => {

    const items = (bancosQ.data ?? []).map((b) => ({

      value: b.id,

      label: b.nome ?? b.id,

    }))

    if (

      values.BancoId &&

      bancoLabel &&

      !items.some((i) => i.value === values.BancoId)

    ) {

      return [{ value: values.BancoId, label: bancoLabel }, ...items]

    }

    return items

  }, [bancosQ.data, values.BancoId, bancoLabel])



  useEffect(() => {

    if (!open) return

    if (mode === 'create') {

      setValues(emptyForm())

      setBancoLabel('')

      setBancoSearch('')

      return

    }

    if (!viewData?.id) return



    setLoadingDetail(true)

    void ContaBancariaService('bancos')

      .getContaBancariaById(viewData.id)

      .then((res) => {

        if (res.info.status !== ResponseStatus.Success || !res.info.data) {

          toast.error('Erro ao carregar detalhe da conta.')

          return

        }

        const dto = res.info.data

        setBancoLabel(dto.bancoNome ?? '')

        setValues({

          Numero: dto.numero ?? '',

          TipoConta: dto.tipoConta ?? '',

          BancoId: dto.bancoId ?? null,

          DataAbertura: dto.dataAbertura?.slice(0, 10) ?? null,

          NIB: dto.nib ?? '',

          SaldoActual: dto.saldoActual ?? 0,

          GestorConta: dto.gestorConta ?? '',

          AlertaSaldo: dto.alertaSaldo ?? 0,

          ValorAlertaSaldo: dto.valorAlertaSaldo ?? 0,

          OBS: dto.obs ?? '',

          IBAN: dto.iban ?? '',

          BIC: dto.bic ?? '',

        })

      })

      .catch(() => toast.error('Erro ao carregar detalhe da conta.'))

      .finally(() => setLoadingDetail(false))

  }, [open, mode, viewData?.id])



  const handleGuardar = async () => {

    if (isView) return



    if (!values.Numero.trim()) {

      toast.error('Nº Conta é obrigatório.')

      return

    }

    if (!values.TipoConta.trim()) {

      toast.error('Tipo Conta é obrigatório.')

      return

    }



    const body: ContaBancariaFormDTO = {

      ...values,

      Numero: values.Numero.trim(),

      TipoConta: values.TipoConta.trim(),

      BancoId: values.BancoId || null,

      DataAbertura: values.DataAbertura || null,

      AlertaSaldo: values.AlertaSaldo ? 1 : 0,

    }



    try {

      const client = ContaBancariaService('bancos')

      const response =

        isEdit && viewData?.id

          ? await client.updateContaBancaria(viewData.id, body)

          : await client.createContaBancaria(body)



      if (response.info.status === ResponseStatus.Success) {

        toast.success(

          isEdit

            ? 'Conta bancária atualizada com sucesso.'

            : 'Conta bancária criada com sucesso.',

        )

        onOpenChange(false)

        onSuccess?.()

      } else {

        toast.error(response.info.messages?.['$']?.[0] ?? 'Falha ao guardar.')

      }

    } catch (error: unknown) {

      const err = error as { message?: string }

      toast.error(err?.message ?? 'Erro ao guardar a conta bancária.')

    }

  }



  const disabled = isView || loadingDetail



  return (

    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-y-auto'>

        <DialogHeader>

          <DialogTitle>Conta Bancária</DialogTitle>

        </DialogHeader>



        {loadingDetail ? (

          <p className='py-4 text-sm text-muted-foreground'>A carregar...</p>

        ) : (

          <div className='grid grid-cols-12 gap-4 py-2'>

            {/* Linha 1 — Nº Conta, Tipo Conta, Data de Abertura */}

            <div className='col-span-12 sm:col-span-4 space-y-2'>

              <Label htmlFor='cb-numero'>Nº Conta</Label>

              <Input

                id='cb-numero'

                value={values.Numero}

                onChange={(e) =>

                  setValues((p) => ({ ...p, Numero: e.target.value }))

                }

                disabled={disabled}

                maxLength={24}

                placeholder='Nº Conta...'

              />

            </div>

            <div className='col-span-12 sm:col-span-4 space-y-2'>

              <Label htmlFor='cb-tipo'>Tipo Conta</Label>

              <Input

                id='cb-tipo'

                value={values.TipoConta}

                onChange={(e) =>

                  setValues((p) => ({ ...p, TipoConta: e.target.value }))

                }

                disabled={disabled}

                maxLength={150}

                placeholder='Tipo Conta...'

              />

            </div>

            <div className='col-span-12 sm:col-span-4 space-y-2'>

              <Label htmlFor='cb-data'>Data de Abertura</Label>

              <Input

                id='cb-data'

                type='date'

                value={values.DataAbertura ?? ''}

                onChange={(e) =>

                  setValues((p) => ({

                    ...p,

                    DataAbertura: e.target.value || null,

                  }))

                }

                disabled={disabled}

              />

            </div>



            {/* Linha 2 — NIB, BIC, IBAN */}

            <div className='col-span-12 sm:col-span-4 space-y-2'>

              <Label htmlFor='cb-nib'>NIB</Label>

              <Input

                id='cb-nib'

                value={values.NIB ?? ''}

                onChange={(e) => setValues((p) => ({ ...p, NIB: e.target.value }))}

                disabled={disabled}

                maxLength={24}

                placeholder='NIB...'

              />

            </div>

            <div className='col-span-12 sm:col-span-4 space-y-2'>

              <Label htmlFor='cb-bic'>BIC</Label>

              <Input

                id='cb-bic'

                value={values.BIC ?? ''}

                onChange={(e) => setValues((p) => ({ ...p, BIC: e.target.value }))}

                disabled={disabled}

                maxLength={11}

                placeholder='BIC...'

              />

            </div>

            <div className='col-span-12 sm:col-span-4 space-y-2'>

              <Label htmlFor='cb-iban'>IBAN</Label>

              <Input

                id='cb-iban'

                value={values.IBAN ?? ''}

                onChange={(e) => setValues((p) => ({ ...p, IBAN: e.target.value }))}

                disabled={disabled}

                maxLength={34}

                placeholder='IBAN...'

              />

            </div>



            {/* Linha 3 — Saldo Inicial, Valor Alerta Saldo, Alerta Saldo */}

            <div className='col-span-12 sm:col-span-4 space-y-2'>

              <Label htmlFor='cb-saldo'>Saldo Inicial (€)</Label>

              <Input

                id='cb-saldo'

                type='number'

                step='0.01'

                value={values.SaldoActual ?? 0}

                onChange={(e) =>

                  setValues((p) => ({

                    ...p,

                    SaldoActual: Number(e.target.value) || 0,

                  }))

                }

                disabled={disabled}

                placeholder='Saldo Inicial...'

              />

            </div>

            <div className='col-span-12 sm:col-span-4 space-y-2'>

              <Label htmlFor='cb-valor-alerta'>Valor Alerta Saldo (€)</Label>

              <Input

                id='cb-valor-alerta'

                type='number'

                step='0.01'

                value={values.ValorAlertaSaldo ?? 0}

                onChange={(e) =>

                  setValues((p) => ({

                    ...p,

                    ValorAlertaSaldo: Number(e.target.value) || 0,

                  }))

                }

                disabled={disabled}

                placeholder='Valor Alerta Saldo...'

              />

            </div>

            <div className='col-span-12 sm:col-span-4 space-y-2'>

              <Label htmlFor='cb-alerta-saldo'>Alerta Saldo</Label>

              <div className='flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3'>

                <Switch

                  id='cb-alerta-saldo'

                  checked={Boolean(values.AlertaSaldo)}

                  onCheckedChange={(checked) =>

                    setValues((p) => ({ ...p, AlertaSaldo: checked ? 1 : 0 }))

                  }

                  disabled={disabled}

                />

                <span className='text-sm text-muted-foreground'>

                  {values.AlertaSaldo ? 'Ativo' : 'Inativo'}

                </span>

              </div>

            </div>



            {/* Linha 4 — Cod. Instituição (+), Gestor de Conta */}

            <div className='col-span-12 sm:col-span-7 space-y-2'>

              <Label>Cod. Instituição</Label>

              <div className='flex gap-1'>

                <AsyncCombobox

                  className='flex-1'

                  value={values.BancoId ?? ''}

                  onChange={(id) => {

                    const item = bancoItems.find((b) => b.value === id)

                    setValues((p) => ({ ...p, BancoId: id || null }))

                    setBancoLabel(item?.label ?? '')

                  }}

                  items={bancoItems}

                  isLoading={bancosQ.isFetching}

                  placeholder='Cod. Instituição...'

                  searchValue={bancoSearch}

                  onSearchValueChange={setBancoSearch}

                  disabled={disabled}

                  open={bancoComboOpen}

                  onOpenChange={setBancoComboOpen}

                />

                <Button

                  type='button'

                  variant='outline'

                  size='icon'

                  className='shrink-0'

                  title='Seleccionar instituição'

                  disabled={disabled}

                  onClick={() => setBancoComboOpen(true)}

                >

                  <Plus className='h-4 w-4' />

                </Button>

              </div>

            </div>

            <div className='col-span-12 sm:col-span-5 space-y-2'>

              <Label htmlFor='cb-gestor'>Gestor de Conta</Label>

              <Input

                id='cb-gestor'

                value={values.GestorConta ?? ''}

                onChange={(e) =>

                  setValues((p) => ({ ...p, GestorConta: e.target.value }))

                }

                disabled={disabled}

                maxLength={24}

                placeholder='Gestor de Conta...'

              />

            </div>



            {/* Linha 5 — Observações */}

            <div className='col-span-12 space-y-2'>

              <Label htmlFor='cb-obs'>Observações</Label>

              <Textarea

                id='cb-obs'

                rows={4}

                value={values.OBS ?? ''}

                onChange={(e) => setValues((p) => ({ ...p, OBS: e.target.value }))}

                disabled={disabled}

                placeholder='Observações...'

              />

            </div>

          </div>

        )}



        <DialogFooter>

          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>

            {isView ? 'Fechar' : 'Cancelar'}

          </Button>

          {!isView && (

            <Button type='button' onClick={handleGuardar} disabled={loadingDetail}>

              OK

            </Button>

          )}

        </DialogFooter>

      </DialogContent>

    </Dialog>

  )

}


