import { useEffect, useState } from 'react'
import type { CategoriaEspecialidadeTableDTO } from '@/types/dtos/especialidades/categoria-especialidade.dtos'
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
import { CategoriaEspecialidadeService } from '@/lib/services/especialidades/categoria-especialidade-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface CategoriaEspecialidadeViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: CategoriaEspecialidadeTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  descricao: string
}

export function CategoriaEspecialidadeViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: CategoriaEspecialidadeViewCreateModalProps) {
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
      toast.error('Descrição é obrigatória.')
      return
    }

    try {
      const client = CategoriaEspecialidadeService()

      const body = {
        Codigo:
          (viewData as { codigo?: string })?.codigo ??
          values.descricao.trim().slice(0, 50),
        Descricao: values.descricao.trim(),
      }

      // Id: a listagem devolve camelCase (id); garantir que usamos string válida para o PUT
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
          ? await client.updateCategoriaEspecialidade(editId, body)
          : await client.createCategoriaEspecialidade(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Categoria de Especialidade atualizada com sucesso.'
            : 'Categoria de Especialidade criada com sucesso.',
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar Categoria de Especialidade.'
            : 'Falha ao criar Categoria de Especialidade.')
        toast.error(msg)
      }
    } catch (error: any) {
      toast.error(
        error?.message ?? 'Ocorreu um erro ao guardar a Categoria de Especialidade.',
      )
    }
  }

  const title =
    mode === 'view'
      ? 'Categoria de Especialidade'
      : mode === 'edit'
        ? 'Editar Categoria de Especialidade'
        : 'Adicionar Categoria de Especialidade'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar categoria de especialidade (código e descrição).
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Descrição</Label>
            <Input
              readOnly={isView}
              value={values.descricao}
              maxLength={80}
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

