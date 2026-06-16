import { useEffect, useState } from 'react'
import type { MotivoRetencaoTableDTO } from '@/types/dtos/taxas-iva/motivo-retencao.dtos'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/utils/toast-utils'
import { MotivoRetencaoService } from '@/lib/services/taxas-iva/motivo-retencao-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface MotivoRetencaoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: MotivoRetencaoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  codigo: string
  descricao: string
  tipoImposto: string
}

const emptyValues: FormValues = {
  codigo: '',
  descricao: '',
  tipoImposto: 'IRS',
}

const MODAL_TITLE = 'Motivo Retenção na Fonte'

function resolveRowId(data: MotivoRetencaoTableDTO | null): string {
  if (!data) return ''
  const raw = 'id' in data ? data.id : (data as { Id?: string }).Id
  return typeof raw === 'string' ? raw : raw != null ? String(raw) : ''
}

export function MotivoRetencaoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: MotivoRetencaoViewCreateModalProps) {
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
        const client = MotivoRetencaoService()
        const response = await client.getMotivoRetencaoById(rowId)
        if (cancelled) return

        if (response.info.status !== ResponseStatus.Success || !response.info.data) {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Não foi possível carregar o motivo de retenção.'
          toast.error(msg)
          return
        }

        const data = response.info.data
        setValues({
          codigo: data.codigo != null ? String(data.codigo) : '',
          descricao: data.descricao ?? '',
          tipoImposto: data.tipoImposto ?? 'IRS',
        })
      } catch (error: unknown) {
        if (!cancelled) {
          const err = error as { message?: string }
          toast.error(err?.message ?? 'Erro ao carregar motivo de retenção.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, mode, viewData])

  const handleClose = () => onOpenChange(false)

  const handleGuardar = async () => {
    if (isView) return

    const codigo = Number(values.codigo)
    if (!codigo || codigo <= 0) {
      toast.error('Código é obrigatório.')
      return
    }
    if (!values.descricao?.trim()) {
      toast.error('Descrição é obrigatória.')
      return
    }
    if (!values.tipoImposto?.trim()) {
      toast.error('Imposto é obrigatório.')
      return
    }

    try {
      const client = MotivoRetencaoService()
      const editId = resolveRowId(viewData)

      const body = {
        codigo,
        descricao: values.descricao.trim(),
        tipoImposto: values.tipoImposto.trim().toUpperCase(),
      }

      if (isEdit && editId) {
        const response = await client.updateMotivoRetencao(editId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Motivo de retenção atualizado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao atualizar motivo de retenção.'
          toast.error(msg)
        }
      } else {
        const response = await client.createMotivoRetencao(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Motivo de retenção criado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao criar motivo de retenção.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar o motivo de retenção.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{MODAL_TITLE}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário de motivos de retenção na fonte.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className='py-6 text-sm text-muted-foreground'>A carregar...</p>
        ) : (
          <div className='space-y-4 py-2'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='retencao-codigo'>Código</Label>
                <Input
                  id='retencao-codigo'
                  type='number'
                  min={1}
                  value={values.codigo}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, codigo: e.target.value }))
                  }
                  readOnly={isView}
                  placeholder='Código'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='retencao-imposto'>Imposto</Label>
                <Select
                  value={values.tipoImposto}
                  onValueChange={(v) =>
                    setValues((prev) => ({ ...prev, tipoImposto: v }))
                  }
                  disabled={isView}
                >
                  <SelectTrigger id='retencao-imposto'>
                    <SelectValue placeholder='Imposto' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='IRS'>IRS</SelectItem>
                    <SelectItem value='IRC'>IRC</SelectItem>
                    <SelectItem value='IS'>IS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='retencao-descricao'>Descrição</Label>
              <Textarea
                id='retencao-descricao'
                value={values.descricao}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, descricao: e.target.value }))
                }
                readOnly={isView}
                placeholder='Descrição'
                maxLength={150}
                rows={4}
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
                OK
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
