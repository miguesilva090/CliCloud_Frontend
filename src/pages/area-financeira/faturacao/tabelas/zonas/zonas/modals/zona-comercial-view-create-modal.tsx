import { useEffect, useState } from 'react'
import type { ZonaComercialTableDTO } from '@/types/dtos/faturacao/zona-comercial.dtos'
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
import { ZonaComercialService } from '@/lib/services/faturacao/zona-comercial-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface ZonaComercialViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: ZonaComercialTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  codigo: string
  descricao: string
}

const emptyValues: FormValues = {
  codigo: '',
  descricao: '',
}

function resolveRowId(data: ZonaComercialTableDTO | null): string {
  if (!data) return ''
  const raw = 'id' in data ? data.id : (data as { Id?: string }).Id
  return typeof raw === 'string' ? raw : raw != null ? String(raw) : ''
}

export function ZonaComercialViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: ZonaComercialViewCreateModalProps) {
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
        const response = await ZonaComercialService().getZonaComercialById(rowId)
        if (cancelled) return

        if (response.info.status !== ResponseStatus.Success || !response.info.data) {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Não foi possível carregar a zona.'
          toast.error(msg)
          return
        }

        const data = response.info.data
        setValues({
          codigo: data.codigo != null ? String(data.codigo) : '',
          descricao: data.descricao ?? '',
        })
      } catch (error: unknown) {
        if (!cancelled) {
          const err = error as { message?: string }
          toast.error(err?.message ?? 'Erro ao carregar zona.')
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

    const body = {
      descricao: values.descricao.trim(),
    }

    try {
      const client = ZonaComercialService()
      const editId = resolveRowId(viewData)

      if (isEdit && editId) {
        const response = await client.updateZonaComercial(editId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Zona atualizada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ?? 'Falha ao atualizar zona.'
          toast.error(msg)
        }
      } else {
        const response = await client.createZonaComercial(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Zona criada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ?? 'Falha ao criar zona.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar a zona.')
    }
  }

  const title =
    mode === 'create'
      ? 'Nova Zona'
      : mode === 'edit'
        ? 'Editar Zona'
        : 'Zona'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário de zona comercial.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className='py-6 text-sm text-muted-foreground'>A carregar...</p>
        ) : (
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='zona-codigo'>Número</Label>
              <Input
                id='zona-codigo'
                value={values.codigo || (mode === 'create' ? '—' : '')}
                readOnly
                className='bg-muted'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='zona-descricao'>Descrição</Label>
              <Input
                id='zona-descricao'
                value={values.descricao}
                onChange={(e) =>
                  setValues((p) => ({ ...p, descricao: e.target.value }))
                }
                readOnly={isView}
                maxLength={40}
                placeholder='Descrição'
              />
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
