import { useEffect, useState } from 'react'
import type { LocalTratamentoTableDTO } from '@/types/dtos/locais-tratamento/local-tratamento.dtos'
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
import { LocalTratamentoService } from '@/lib/services/locais-tratamento/local-tratamento-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface LocalTratamentoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: LocalTratamentoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  designacao: string
}

export function LocalTratamentoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: LocalTratamentoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    designacao: '',
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        designacao: viewData.designacao ?? '',
      })
    }
    if (open && mode === 'create') {
      setValues({
        designacao: '',
      })
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleGuardar = async () => {
    if (isView) return

    if (!values.designacao?.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }

    try {
      const client = LocalTratamentoService()

      const body = {
        Designacao: values.designacao.trim(),
      }

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

      const response =
        isEdit && viewData && editId
          ? await client.updateLocalTratamento(editId, body)
          : await client.createLocalTratamento(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Local de Tratamento atualizado com sucesso.'
            : 'Local de Tratamento criado com sucesso.'
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar Local de Tratamento.'
            : 'Falha ao criar Local de Tratamento.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar o Local de Tratamento.'
      )
    }
  }

  const title =
    mode === 'view'
      ? 'Locais de Tratamentos'
      : mode === 'edit'
        ? 'Editar Local de Tratamento'
        : 'Adicionar Local de Tratamento'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar local de tratamento.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Designação</Label>
            <Input
              readOnly={isView}
              value={values.designacao}
              maxLength={80}
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
