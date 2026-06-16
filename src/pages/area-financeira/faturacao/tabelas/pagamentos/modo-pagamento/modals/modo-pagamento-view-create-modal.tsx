import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ModoPagamentoTableDTO } from '@/types/dtos/pagamentos/modo-pagamento.dtos'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/utils/toast-utils'
import { ModoPagamentoService } from '@/lib/services/pagamentos/modo-pagamento-service'
import { TipoPagamentoService } from '@/lib/services/pagamentos/tipo-pagamento-service'
import { ContaBancariaService } from '@/lib/services/bancos/conta-bancaria-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface ModoPagamentoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: ModoPagamentoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  codigo: string
  descricao: string
  abreviatura: string
  temNumAssociado: boolean
  temContaBancaria: boolean
  contaBancariaId: string
}

const emptyValues: FormValues = {
  codigo: '',
  descricao: '',
  abreviatura: '',
  temNumAssociado: false,
  temContaBancaria: false,
  contaBancariaId: '',
}

function resolveRowId(data: ModoPagamentoTableDTO | null): string {
  if (!data) return ''
  const raw = 'id' in data ? data.id : (data as { Id?: string }).Id
  return typeof raw === 'string' ? raw : raw != null ? String(raw) : ''
}

export function ModoPagamentoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: ModoPagamentoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>(emptyValues)
  const [loading, setLoading] = useState(false)

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const { data: tiposRes } = useQuery({
    queryKey: ['tipos-pagamento-light', { open }],
    queryFn: () => TipoPagamentoService().getTiposPagamentoLight(),
    enabled: open,
    staleTime: 10 * 60 * 1000,
  })

  const { data: contasRes } = useQuery({
    queryKey: ['contas-bancarias-light', { open, temConta: values.temContaBancaria }],
    queryFn: () => ContaBancariaService().getContasBancariasLight(),
    enabled: open && values.temContaBancaria,
    staleTime: 5 * 60 * 1000,
  })

  const tiposPagamento = tiposRes?.info?.data ?? []
  const contasBancarias = contasRes?.info?.data ?? []

  const abreviaturaOptions = useMemo(
    () =>
      tiposPagamento.map((t) => ({
        codigo: t.codigo,
        label: t.autocompleteLabel ?? `${t.descricao} (${t.codigo})`,
      })),
    [tiposPagamento],
  )

  useEffect(() => {
    if (!open) return

    if (mode === 'create') {
      setValues(emptyValues)
      return
    }

    const rowId = resolveRowId(viewData)
    if (!rowId) return

    let cancelled = false
    setLoading(true)

    void (async () => {
      try {
        const response = await ModoPagamentoService().getModoPagamentoById(rowId)
        if (cancelled) return

        if (response.info.status !== ResponseStatus.Success || !response.info.data) {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Não foi possível carregar o modo de pagamento.'
          toast.error(msg)
          return
        }

        const data = response.info.data
        setValues({
          codigo: data.codigo != null ? String(data.codigo) : '',
          descricao: data.descricao ?? '',
          abreviatura: data.abreviatura ?? '',
          temNumAssociado: data.temNumAssociado ?? false,
          temContaBancaria: data.temContaBancaria ?? false,
          contaBancariaId: data.contaBancariaId ?? '',
        })
      } catch (error: unknown) {
        if (!cancelled) {
          const err = error as { message?: string }
          toast.error(err?.message ?? 'Erro ao carregar modo de pagamento.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, mode, viewData])

  const handleGuardar = async () => {
    if (isView) return

    if (!values.descricao?.trim()) {
      toast.error('Descrição é obrigatória.')
      return
    }
    if (!values.abreviatura?.trim()) {
      toast.error('Abreviatura SAFT é obrigatória.')
      return
    }
    if (values.temContaBancaria && !values.contaBancariaId?.trim()) {
      toast.error('Conta bancária é obrigatória quando o modo exige conta.')
      return
    }

    const body = {
      descricao: values.descricao.trim(),
      abreviatura: values.abreviatura.trim(),
      temNumAssociado: values.temNumAssociado,
      temContaBancaria: values.temContaBancaria,
      contaBancariaId: values.temContaBancaria
        ? values.contaBancariaId || null
        : null,
    }

    try {
      const client = ModoPagamentoService()
      const editId = resolveRowId(viewData)

      if (isEdit && editId) {
        const response = await client.updateModoPagamento(editId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Modo de pagamento atualizado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao atualizar modo de pagamento.'
          toast.error(msg)
        }
      } else {
        const response = await client.createModoPagamento(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Modo de pagamento criado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao criar modo de pagamento.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar o modo de pagamento.',
      )
    }
  }

  const title =
    mode === 'create'
      ? 'Novo Modo de Pagamento'
      : mode === 'edit'
        ? 'Editar Modo de Pagamento'
        : 'Modo de Pagamento'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário de modo de pagamento.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className='py-6 text-sm text-muted-foreground'>A carregar...</p>
        ) : (
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='modo-codigo'>Código</Label>
              <Input
                id='modo-codigo'
                value={values.codigo || (mode === 'create' ? '—' : '')}
                readOnly
                className='bg-muted'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='modo-descricao'>Descrição</Label>
              <Input
                id='modo-descricao'
                value={values.descricao}
                onChange={(e) =>
                  setValues((p) => ({ ...p, descricao: e.target.value }))
                }
                readOnly={isView}
                maxLength={50}
              />
            </div>
            <div className='space-y-2'>
              <Label>Abreviatura SAFT</Label>
              <Select
                value={values.abreviatura || undefined}
                onValueChange={(v) =>
                  setValues((p) => ({ ...p, abreviatura: v }))
                }
                disabled={isView}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar tipo SAFT...' />
                </SelectTrigger>
                <SelectContent>
                  {abreviaturaOptions.map((t) => (
                    <SelectItem key={t.codigo} value={t.codigo}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-3'>
              <div className='flex items-center justify-between gap-4'>
                <Label htmlFor='modo-tem-num'>Tem n.º associado</Label>
                <Switch
                  id='modo-tem-num'
                  checked={values.temNumAssociado}
                  onCheckedChange={(checked) =>
                    !isView &&
                    setValues((p) => ({ ...p, temNumAssociado: checked }))
                  }
                  disabled={isView}
                />
              </div>
              <div className='flex items-center justify-between gap-4'>
                <Label htmlFor='modo-tem-conta'>Tem conta bancária</Label>
                <Switch
                  id='modo-tem-conta'
                  checked={values.temContaBancaria}
                  onCheckedChange={(checked) =>
                    !isView &&
                    setValues((p) => ({
                      ...p,
                      temContaBancaria: checked,
                      contaBancariaId: checked ? p.contaBancariaId : '',
                    }))
                  }
                  disabled={isView}
                />
              </div>
            </div>
            {values.temContaBancaria ? (
              <div className='space-y-2'>
                <Label>Conta bancária</Label>
                <Select
                  value={values.contaBancariaId || undefined}
                  onValueChange={(v) =>
                    setValues((p) => ({ ...p, contaBancariaId: v }))
                  }
                  disabled={isView}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar conta...' />
                  </SelectTrigger>
                  <SelectContent>
                    {contasBancarias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.numero}
                        {c.iban ? ` (${c.iban})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={() => onOpenChange(false)}>
              OK
            </Button>
          ) : (
            <>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='button' onClick={handleGuardar} disabled={loading}>
                OK
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
