import { useEffect, useState } from 'react'
import type { MotivoIsencaoTableDTO } from '@/types/dtos/taxas-iva/motivo-isencao.dtos'
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
import { toast } from '@/utils/toast-utils'
import { MotivoIsencaoService } from '@/lib/services/taxas-iva/motivo-isencao-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface MotivoIsencaoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: MotivoIsencaoTableDTO | null
  onSuccess?: () => void
  onSuccessWithId?: (id: string) => void
}

type FormValues = {
  codigo: string
  codigoSaft: string
  descricao: string
  norma: string
  mencao: string
}

const emptyValues: FormValues = {
  codigo: '',
  codigoSaft: '',
  descricao: '',
  norma: '',
  mencao: '',
}

const MODAL_TITLE = 'Motivos de Retenção de Imposto'

function resolveRowId(data: MotivoIsencaoTableDTO | null): string {
  if (!data) return ''
  const raw = 'id' in data ? data.id : (data as { Id?: string }).Id
  return typeof raw === 'string' ? raw : raw != null ? String(raw) : ''
}

export function MotivoIsencaoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
  onSuccessWithId,
}: MotivoIsencaoViewCreateModalProps) {
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
        const client = MotivoIsencaoService()
        const response = await client.getMotivoIsencaoById(rowId)
        if (cancelled) return

        if (response.info.status !== ResponseStatus.Success || !response.info.data) {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Não foi possível carregar o motivo de isenção.'
          toast.error(msg)
          return
        }

        const data = response.info.data
        setValues({
          codigo: data.codigo ?? '',
          codigoSaft: data.codigoSaft ?? '',
          descricao: data.descricao ?? '',
          norma: data.norma ?? '',
          mencao: data.mencao ?? '',
        })
      } catch (error: unknown) {
        if (!cancelled) {
          const err = error as { message?: string }
          toast.error(err?.message ?? 'Erro ao carregar motivo de isenção.')
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

    if (!values.codigo?.trim()) {
      toast.error('Número é obrigatório.')
      return
    }
    if (!values.codigoSaft?.trim()) {
      toast.error('Código SAFT é obrigatório.')
      return
    }
    if (!values.descricao?.trim()) {
      toast.error('Motivo é obrigatório.')
      return
    }

    try {
      const client = MotivoIsencaoService()
      const editId = resolveRowId(viewData)

      const body = {
        codigo: values.codigo.trim(),
        codigoSaft: values.codigoSaft.trim(),
        descricao: values.descricao.trim(),
        norma: values.norma.trim() || null,
        mencao: values.mencao.trim() || null,
      }

      if (isEdit && editId) {
        const response = await client.updateMotivoIsencao(editId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Motivo de isenção atualizado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao atualizar motivo de isenção.'
          toast.error(msg)
        }
      } else {
        const response = await client.createMotivoIsencao(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Motivo de isenção criado com sucesso.')
          const newId =
            response.info.data != null ? String(response.info.data) : undefined
          onOpenChange(false)
          onSuccess?.()
          if (newId) onSuccessWithId?.(newId)
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao criar motivo de isenção.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar o motivo de isenção.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{MODAL_TITLE}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário de motivos de retenção de imposto (isenção IVA).
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className='py-6 text-sm text-muted-foreground'>A carregar...</p>
        ) : (
          <div className='space-y-4 py-2'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='motivo-codigo'>Número</Label>
                <Input
                  id='motivo-codigo'
                  value={values.codigo}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, codigo: e.target.value }))
                  }
                  readOnly={isView}
                  placeholder='Número'
                  maxLength={12}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='motivo-codigo-saft'>Código SAFT</Label>
                <Input
                  id='motivo-codigo-saft'
                  value={values.codigoSaft}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      codigoSaft: e.target.value,
                    }))
                  }
                  readOnly={isView}
                  placeholder='Código SAFT'
                  maxLength={12}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='motivo-descricao'>Motivo</Label>
              <Textarea
                id='motivo-descricao'
                value={values.descricao}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, descricao: e.target.value }))
                }
                readOnly={isView}
                placeholder='Motivo'
                maxLength={254}
                rows={3}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='motivo-norma'>Norma</Label>
              <Textarea
                id='motivo-norma'
                value={values.norma}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, norma: e.target.value }))
                }
                readOnly={isView}
                placeholder='Norma'
                maxLength={254}
                rows={3}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='motivo-mencao'>Menção</Label>
              <Textarea
                id='motivo-mencao'
                value={values.mencao}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, mencao: e.target.value }))
                }
                readOnly={isView}
                placeholder='Menção'
                maxLength={254}
                rows={3}
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
