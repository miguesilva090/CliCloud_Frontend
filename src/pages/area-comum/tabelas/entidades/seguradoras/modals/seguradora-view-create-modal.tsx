import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import type { SeguradoraTableDTO } from '@/types/dtos/seguradoras/seguradora.dtos'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { toast } from '@/utils/toast-utils'
import { SeguradoraService } from '@/lib/services/seguradoras/seguradora-service'
import { BancosService } from '@/lib/services/utility/bancos-service'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'

const seguradorasPermId = modules.areaComum.permissions.seguradoras.id
const bancosPermId = modules.areaComum.permissions.bancos.id

type ModalMode = 'view' | 'create' | 'edit'

type FormValues = {
  nome: string
  apolice: string
  avenca: string
  abreviatura: string
  dataInicioContrato: string
  dataFimContrato: string
  bancoId: string
  numeroIdentificacaoBancaria: string
}

const emptyValues = (): FormValues => ({
  nome: '',
  apolice: '',
  avenca: '',
  abreviatura: '',
  dataInicioContrato: '',
  dataFimContrato: '',
  bancoId: '',
  numeroIdentificacaoBancaria: '',
})

function toIsoDate(value: string | null | undefined): string {
  if (!value) return ''
  return value.length >= 10 ? value.slice(0, 10) : value
}

function toDate(value: string): Date | undefined {
  return value ? new Date(`${value}T12:00:00`) : undefined
}

interface SeguradoraViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: SeguradoraTableDTO | null
  onSuccess?: () => void
}

export function SeguradoraViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: SeguradoraViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>(emptyValues())
  const [loading, setLoading] = useState(false)
  const [bancoSearch, setBancoSearch] = useState('')
  const [debBancoSearch] = useDebounce(bancoSearch, 250)
  const [bancoItems, setBancoItems] = useState<Array<{ value: string; label: string }>>([])

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (!open) return

    if (mode === 'create') {
      setValues(emptyValues())
      return
    }

    const id = viewData?.id
    if (!id) return

    setLoading(true)
    SeguradoraService(seguradorasPermId)
      .getSeguradora(id)
      .then((res) => {
        const d = res.info?.data
        if (!d) return
        setValues({
          nome: d.nome ?? '',
          apolice: d.apolice ?? '',
          avenca: d.avenca != null ? String(d.avenca) : '',
          abreviatura: d.abreviatura ?? '',
          dataInicioContrato: toIsoDate(d.dataInicioContrato),
          dataFimContrato: toIsoDate(d.dataFimContrato),
          bancoId: d.bancoId ?? '',
          numeroIdentificacaoBancaria: d.numeroIdentificacaoBancaria ?? '',
        })
      })
      .catch(() => toast.error('Falha ao carregar seguradora.'))
      .finally(() => setLoading(false))
  }, [open, mode, viewData?.id])

  useEffect(() => {
    if (!open) return
    void BancosService(bancosPermId)
      .getBancosLight(debBancoSearch)
      .then((res) => {
        const list = res.info?.data ?? []
        setBancoItems(
          list.map((b) => ({
            value: b.id,
            label: b.nome ?? b.id,
          })),
        )
      })
  }, [open, debBancoSearch])

  const bancoItemsComSelecionado = useMemo(() => {
    if (!values.bancoId) return bancoItems
    if (bancoItems.some((b) => b.value === values.bancoId)) return bancoItems
    return [{ value: values.bancoId, label: values.bancoId }, ...bancoItems]
  }, [bancoItems, values.bancoId])

  const handleClose = () => onOpenChange(false)

  const buildPayload = () => ({
    Nome: values.nome.trim(),
    Apolice: values.apolice.trim() || null,
    Avenca: values.avenca.trim() ? Number(values.avenca.replace(',', '.')) : null,
    Abreviatura: values.abreviatura.trim() || null,
    DataInicioContrato: values.dataInicioContrato || null,
    DataFimContrato: values.dataFimContrato || null,
    BancoId: values.bancoId || null,
    NumeroIdentificacaoBancaria: values.numeroIdentificacaoBancaria.trim() || null,
  })

  const handleGuardar = async () => {
    if (isView) return
    if (!values.nome.trim()) {
      toast.error('Nome é obrigatório.')
      return
    }

    const editId = viewData?.id
    if (isEdit && !editId) {
      toast.error('Não foi possível identificar o registo a atualizar.')
      return
    }

    try {
      const client = SeguradoraService(seguradorasPermId)
      const body = buildPayload()
      const response =
        isEdit && editId
          ? await client.updateSeguradora(editId, body)
          : await client.createSeguradora(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit ? 'Seguradora atualizada com sucesso.' : 'Seguradora criada com sucesso.',
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit ? 'Falha ao atualizar seguradora.' : 'Falha ao criar seguradora.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar a seguradora.')
    }
  }

  const title =
    mode === 'view'
      ? 'Seguradora'
      : mode === 'edit'
        ? 'Editar seguradora'
        : 'Adicionar seguradora'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar seguradora.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className='py-4 text-sm text-muted-foreground'>A carregar...</p>
        ) : (
          <div className='grid gap-4 py-2'>
            <div className='grid gap-2'>
              <Label>Nome</Label>
              <Input
                readOnly={isView}
                value={values.nome}
                maxLength={200}
                onChange={(e) => setValues((p) => ({ ...p, nome: e.target.value }))}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label>Abreviatura</Label>
                <Input
                  readOnly={isView}
                  value={values.abreviatura}
                  maxLength={40}
                  onChange={(e) => setValues((p) => ({ ...p, abreviatura: e.target.value }))}
                />
              </div>
              <div className='grid gap-2'>
                <Label>Apólice</Label>
                <Input
                  readOnly={isView}
                  value={values.apolice}
                  maxLength={15}
                  onChange={(e) => setValues((p) => ({ ...p, apolice: e.target.value }))}
                />
              </div>
            </div>
            <div className='grid gap-2'>
              <Label>Avença</Label>
              <Input
                readOnly={isView}
                type='number'
                step='0.01'
                value={values.avenca}
                onChange={(e) => setValues((p) => ({ ...p, avenca: e.target.value }))}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label>Início contrato</Label>
                <DatePicker
                  value={toDate(values.dataInicioContrato)}
                  onChange={(date) =>
                    setValues((p) => ({
                      ...p,
                      dataInicioContrato: date
                        ? date.toISOString().slice(0, 10)
                        : '',
                    }))
                  }
                  disabled={isView}
                  displayFormat='dd/MM/yyyy'
                  placeholder='Data início'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Fim contrato</Label>
                <DatePicker
                  value={toDate(values.dataFimContrato)}
                  onChange={(date) =>
                    setValues((p) => ({
                      ...p,
                      dataFimContrato: date ? date.toISOString().slice(0, 10) : '',
                    }))
                  }
                  disabled={isView}
                  displayFormat='dd/MM/yyyy'
                  placeholder='Data fim'
                />
              </div>
            </div>
            <div className='grid gap-2'>
              <Label>Banco</Label>
              <AsyncCombobox
                disabled={isView}
                value={values.bancoId}
                onChange={(v) => setValues((p) => ({ ...p, bancoId: v }))}
                items={bancoItemsComSelecionado}
                placeholder='Selecionar banco...'
                searchPlaceholder='Pesquisar banco...'
                searchValue={bancoSearch}
                onSearchValueChange={setBancoSearch}
              />
            </div>
            <div className='grid gap-2'>
              <Label>NIB</Label>
              <Input
                readOnly={isView}
                value={values.numeroIdentificacaoBancaria}
                onChange={(e) =>
                  setValues((p) => ({ ...p, numeroIdentificacaoBancaria: e.target.value }))
                }
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={handleClose}>
              OK
            </Button>
          ) : (
            <>
              <Button type='button' variant='outline' onClick={handleClose}>
                Cancelar
              </Button>
              <Button type='button' onClick={handleGuardar} disabled={loading}>
                Guardar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
