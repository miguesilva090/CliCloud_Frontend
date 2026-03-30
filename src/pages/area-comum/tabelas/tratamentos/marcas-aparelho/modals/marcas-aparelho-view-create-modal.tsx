import { useEffect, useState } from 'react'
import type { MarcaAparelhoTableDTO } from '@/types/dtos/marca-aparelho/marca-aparelho.dtos'
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
import { MarcaAparelhoService } from '@/lib/services/marca-aparelho'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface MarcasAparelhoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: MarcaAparelhoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  designacao: string
}

export function MarcasAparelhoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: MarcasAparelhoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    designacao: '',
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        designacao:
          (viewData as { designacao?: string }).designacao ??
          (viewData as { Designacao?: string }).Designacao ??
          '',
      })
    }
    if (open && mode === 'create') {
      setValues({ designacao: '' })
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleGuardar = async () => {
    if (isView) return

    if (!values.designacao?.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }

    try {
      const client = MarcaAparelhoService()
      const rawId =
        viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId =
        typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      if (isEdit && (!editId || editId === 'undefined')) {
        toast.error(
          'Não foi possível identificar o registo a atualizar. Feche e abra novamente a edição.'
        )
        return
      }

      if (isEdit && viewData && editId) {
        const body = { designacao: values.designacao.trim() }
        const response = await client.updateMarcaAparelho(editId, body)
        const status = (response.info as { status?: number })?.status
        if (status === ResponseStatus.Success) {
          toast.success('Marca de aparelho atualizada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ??
            'Falha ao atualizar Marca de Aparelho.'
          toast.error(msg)
        }
      } else {
        const body = { designacao: values.designacao.trim() }
        const response = await client.createMarcaAparelho(body)
        const status = (response.info as { status?: number })?.status
        if (status === ResponseStatus.Success) {
          toast.success('Marca de aparelho criada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ??
            'Falha ao criar Marca de Aparelho.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar a Marca de Aparelho.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Marca de Aparelho</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar marca de aparelho.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Designação</Label>
            <Input
              readOnly={isView}
              value={values.designacao}
              maxLength={100}
              placeholder='Designação...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, designacao: e.target.value }))
              }
            />
          </div>
        </div>
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
              <Button type='button' onClick={handleGuardar}>
                Guardar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
