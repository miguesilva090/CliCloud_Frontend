import { useEffect, useState } from 'react'
import type { DoencaTableDTO } from '@/types/dtos/doencas/doenca.dtos'
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
import { DoencaService } from '@/lib/services/doencas/doenca-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'edit'

interface DoencaViewEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: DoencaTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  title: string
  code: string
}

export function DoencaViewEditModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: DoencaViewEditModalProps) {
  const [values, setValues] = useState<FormValues>({
    title: '',
    code: '',
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        title: viewData.title ?? '',
        code: viewData.code ?? '',
      })
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleGuardar = async () => {
    if (isView) return

    if (!values.title?.trim()) {
      toast.error('Título é obrigatório.')
      return
    }

    try {
      const client = DoencaService()

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

      const response = await client.updateDoenca(editId, {
        title: values.title.trim(),
        code: values.code.trim() || null,
      })

      if (response.info.status === ResponseStatus.Success) {
        toast.success('Doença atualizada com sucesso.')
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ?? 'Falha ao atualizar Doença.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar a Doença.'
      )
    }
  }

  const title =
    mode === 'view' ? 'Doença' : 'Editar Doença'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver ou editar doença (ICD-11).
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Código</Label>
            <Input
              readOnly={isView}
              value={values.code}
              maxLength={20}
              placeholder='Código ICD-11'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, code: e.target.value }))
              }
              className={isView ? 'bg-muted' : ''}
            />
          </div>
          <div className='grid gap-2'>
            <Label>Título</Label>
            <Input
              readOnly={isView}
              value={values.title}
              maxLength={500}
              placeholder='Título da doença'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, title: e.target.value }))
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
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
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
