import { useEffect, useState } from 'react'
import type { GrauAlergiaTableDTO } from '@/types/dtos/graus-alergia/grau-alergia.dtos'
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
import { GrauAlergiaService } from '@/lib/services/graus-alergia/grau-alergia-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface GrauAlergiaViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: GrauAlergiaTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  descricao: string
}

export function GrauAlergiaViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: GrauAlergiaViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    descricao: '',
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        descricao: viewData.descricao ?? '',
      })
    }
    if (open && mode === 'create') {
      setValues({
        descricao: '',
      })
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleGuardar = async () => {
    if (isView) return

    if (!values.descricao?.trim()) {
      toast.error('Nome é obrigatório.')
      return
    }

    try {
      const client = GrauAlergiaService()

      const body = {
        Descricao: values.descricao.trim(),
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
          ? await client.updateGrauAlergia(editId, body)
          : await client.createGrauAlergia(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Grau Alergia atualizado com sucesso.'
            : 'Grau Alergia criado com sucesso.'
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar Grau Alergia.'
            : 'Falha ao criar Grau Alergia.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar o Grau Alergia.'
      )
    }
  }

  const title =
    mode === 'view'
      ? 'Grau Alergia'
      : mode === 'edit'
        ? 'Editar Grau Alergia'
        : 'Adicionar Grau Alergia'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar grau alergia (nome).
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Nome</Label>
            <Input
              readOnly={isView}
              value={values.descricao}
              maxLength={80}
              placeholder='Nome (ex: Leve, Moderada, Grave)...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, descricao: e.target.value }))
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
