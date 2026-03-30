import { useEffect, useState } from 'react'
import type { GrauParentescoTableDTO } from '@/types/dtos/graus-parentesco/grau-parentesco.dtos'
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
import { GrauParentescoService } from '@/lib/services/graus-parentesco/grau-parentesco-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface GrauParentescoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: GrauParentescoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  descricao: string
}

export function GrauParentescoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: GrauParentescoViewCreateModalProps) {
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

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleGuardar = async () => {
    if (isView) return

    if (!values.descricao?.trim()) {
      toast.error('Nome é obrigatório.')
      return
    }

    try {
      const client = GrauParentescoService()

      const body = {
        Codigo:
          (viewData as { codigo?: string })?.codigo ??
          values.descricao.trim().slice(0, 50),
        Descricao: values.descricao.trim(),
      }

      const rawId =
        viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId =
        typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      if (isEdit && (!editId || editId === 'undefined')) {
        toast.error(
          'Não foi possível identificar o registo a atualizar. Feche e abra novamente a edição.',
        )
        return
      }

      const response =
        isEdit && viewData && editId
          ? await client.updateGrauParentesco(editId, body)
          : await client.createGrauParentesco(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Grau Parentesco atualizado com sucesso.'
            : 'Grau Parentesco criado com sucesso.',
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar Grau Parentesco.'
            : 'Falha ao criar Grau Parentesco.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar o Grau Parentesco.')
    }
  }

  const title =
    mode === 'view'
      ? 'Grau Parentesco'
      : mode === 'edit'
        ? 'Editar Grau Parentesco'
        : 'Adicionar Grau Parentesco'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar grau parentesco (código e nome).
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Nome</Label>
            <Input
              readOnly={isView}
              value={values.descricao}
              maxLength={80}
              placeholder='Nome (ex: Pai, Mãe, Avó materna)...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, descricao: e.target.value }))
              }
            />
          </div>
        </div>
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

