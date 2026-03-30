import { useEffect, useState } from 'react'
import type { CategoriaProcedimentoTableDTO } from '@/types/dtos/exames/categoria-procedimento'
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
import { CategoriaProcedimentoService } from '@/lib/services/exames/categoria-procedimento-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface CategoriaProcedimentoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: CategoriaProcedimentoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  descricao: string
}

export function CategoriaProcedimentoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: CategoriaProcedimentoViewCreateModalProps) {
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
      toast.error('Descrição é obrigatória.')
      return
    }

    try {
      const client = CategoriaProcedimentoService()
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

      const body = {
        descricao: values.descricao.trim(),
      }

      if (isEdit && viewData && editId) {
        const response = await client.updateCategoriaProcedimento(editId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Categoria de procedimento atualizada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao atualizar Categoria de procedimento.'
          toast.error(msg)
        }
      } else {
        const response = await client.createCategoriaProcedimento(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Categoria de procedimento criada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao criar Categoria de procedimento.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar a Categoria de procedimento.'
      )
    }
  }

  const title =
    mode === 'create'
      ? 'Nova Categoria de Procedimento'
      : mode === 'edit'
      ? 'Editar Categoria de Procedimento'
      : 'Detalhe da Categoria de Procedimento'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'view'
              ? 'Visualizar detalhes da Categoria de procedimento.'
              : 'Preencha os campos obrigatórios e guarde as alterações.'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='descricao'>Descrição</Label>
            <Input
              id='descricao'
              value={values.descricao}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, descricao: e.target.value }))
              }
              disabled={isView}
              placeholder='Descrição da categoria de procedimento'
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          {!isView && (
            <Button type='button' onClick={handleGuardar}>
              Guardar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
