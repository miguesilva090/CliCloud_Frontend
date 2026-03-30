import { useEffect, useState } from 'react'
import type { TipoConsultaTableDTO } from '@/types/dtos/tipos-consulta/tipo-consulta.dtos'
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
import { TipoConsultaService } from '@/lib/services/tipos-consulta/tipo-consulta-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'edit'

interface TipoConsultaViewEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: TipoConsultaTableDTO | null
  onSuccess?: () => void
}

export function TipoConsultaViewEditModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: TipoConsultaViewEditModalProps) {
  const [designacao, setDesignacao] = useState('')

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setDesignacao(viewData.designacao ?? '')
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleGuardar = async () => {
    if (isView) return

    if (!designacao?.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }

    try {
      const client = TipoConsultaService()
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

      const response = await client.updateTipoConsulta(editId, {
        designacao: designacao.trim(),
      })

      if (response.info.status === ResponseStatus.Success) {
        toast.success('Tipo de Consulta atualizado com sucesso.')
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ?? 'Falha ao atualizar Tipo de Consulta.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar o Tipo de Consulta.',
      )
    }
  }

  const title = mode === 'view' ? 'Tipo de Consulta' : 'Editar Tipo de Consulta'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver ou editar tipo de consulta.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Designação</Label>
            <Input
              readOnly={isView}
              value={designacao}
              maxLength={80}
              placeholder='Ex: 1ª Consulta, AV. Final, Feriado...'
              onChange={(e) => setDesignacao(e.target.value)}
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

