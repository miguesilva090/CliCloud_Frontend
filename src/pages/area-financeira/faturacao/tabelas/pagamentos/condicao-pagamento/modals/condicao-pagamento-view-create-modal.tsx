import { useEffect, useState } from 'react'
import type { CondicaoPagamentoTableDTO } from '@/types/dtos/pagamentos/condicao-pagamento.dtos'
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
import { toast } from '@/utils/toast-utils'
import { CondicaoPagamentoService } from '@/lib/services/pagamentos/condicao-pagamento-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface CondicaoPagamentoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: CondicaoPagamentoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  codigo: string
  descricao: string
  nDiasPagamento: string
  desconto: string
}

const emptyValues: FormValues = {
  codigo: '',
  descricao: '',
  nDiasPagamento: '',
  desconto: '',
}

function resolveRowId(data: CondicaoPagamentoTableDTO | null): string {
  if (!data) return ''
  const raw = 'id' in data ? data.id : (data as { Id?: string }).Id
  return typeof raw === 'string' ? raw : raw != null ? String(raw) : ''
}

export function CondicaoPagamentoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: CondicaoPagamentoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>(emptyValues)
  const [loading, setLoading] = useState(false)

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

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
        const response =
          await CondicaoPagamentoService().getCondicaoPagamentoById(rowId)
        if (cancelled) return

        if (response.info.status !== ResponseStatus.Success || !response.info.data) {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Não foi possível carregar a condição de pagamento.'
          toast.error(msg)
          return
        }

        const data = response.info.data
        setValues({
          codigo: data.codigo != null ? String(data.codigo) : '',
          descricao: data.descricao ?? '',
          nDiasPagamento:
            data.nDiasPagamento != null ? String(data.nDiasPagamento) : '',
          desconto: data.desconto != null ? String(data.desconto) : '',
        })
      } catch (error: unknown) {
        if (!cancelled) {
          const err = error as { message?: string }
          toast.error(err?.message ?? 'Erro ao carregar condição de pagamento.')
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

    const nDias = values.nDiasPagamento.trim()
      ? Number(values.nDiasPagamento.replace(',', '.'))
      : null
    if (nDias != null && (Number.isNaN(nDias) || nDias < 0)) {
      toast.error('N.º dias inválido.')
      return
    }

    const desconto = values.desconto.trim()
      ? Number(values.desconto.replace(',', '.'))
      : null
    if (desconto != null && (Number.isNaN(desconto) || desconto < 0)) {
      toast.error('Desconto inválido.')
      return
    }

    const body = {
      descricao: values.descricao.trim(),
      nDiasPagamento: nDias,
      desconto,
    }

    try {
      const client = CondicaoPagamentoService()
      const editId = resolveRowId(viewData)

      if (isEdit && editId) {
        const response = await client.updateCondicaoPagamento(editId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Condição de pagamento atualizada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao atualizar condição de pagamento.'
          toast.error(msg)
        }
      } else {
        const response = await client.createCondicaoPagamento(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Condição de pagamento criada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao criar condição de pagamento.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar a condição de pagamento.',
      )
    }
  }

  const title =
    mode === 'create'
      ? 'Nova Condição de Pagamento'
      : mode === 'edit'
        ? 'Editar Condição de Pagamento'
        : 'Condição de Pagamento'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário de condição de pagamento.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className='py-6 text-sm text-muted-foreground'>A carregar...</p>
        ) : (
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='condicao-codigo'>Número</Label>
              <Input
                id='condicao-codigo'
                value={values.codigo || (mode === 'create' ? '—' : '')}
                readOnly
                className='bg-muted'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='condicao-descricao'>Descrição</Label>
              <Input
                id='condicao-descricao'
                value={values.descricao}
                onChange={(e) =>
                  setValues((p) => ({ ...p, descricao: e.target.value }))
                }
                readOnly={isView}
                maxLength={30}
                placeholder='Descrição'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='condicao-dias'>N.º dias pagamento</Label>
                <Input
                  id='condicao-dias'
                  type='number'
                  min={0}
                  value={values.nDiasPagamento}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, nDiasPagamento: e.target.value }))
                  }
                  readOnly={isView}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='condicao-desconto'>Desconto %</Label>
                <Input
                  id='condicao-desconto'
                  value={values.desconto}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, desconto: e.target.value }))
                  }
                  readOnly={isView}
                  placeholder='0'
                />
              </div>
            </div>
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
