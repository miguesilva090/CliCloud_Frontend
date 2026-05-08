import { useEffect, useState } from 'react'
import type { MotivoConsultaTableDTO } from '@/types/dtos/consultas/motivo-consulta-table.dtos'
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
import { MotivoConsultaService } from '@/lib/services/consultas/motivo-consulta-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: MotivoConsultaTableDTO | null
  onSuccess?: () => void
}

export function MotivoConsultaViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: Props) {
  const [designacao, setDesignacao] = useState('')
  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (!open) return
    if ((isView || isEdit) && viewData) {
      setDesignacao(viewData.designacao ?? '')
    } else {
      setDesignacao('')
    }
  }, [open, isView, isEdit, viewData])

  const handleSave = async () => {
    if (isView) return
    if (!designacao.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }
    try {
      const client = MotivoConsultaService()
      const payload = { Designacao: designacao.trim() }
      const response = isEdit && viewData?.id
        ? await client.updateMotivoConsulta(viewData.id, payload)
        : await client.createMotivoConsulta(payload)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(isEdit ? 'Motivo de consulta atualizado.' : 'Motivo de consulta criado.')
        onOpenChange(false)
        onSuccess?.()
        return
      }
      toast.error(response.info.messages?.['$']?.[0] ?? 'Falha ao guardar motivo de consulta.')
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Erro ao guardar motivo de consulta.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'view'
              ? 'Motivo de Consulta'
              : mode === 'edit'
                ? 'Editar Motivo de Consulta'
                : 'Adicionar Motivo de Consulta'}
          </DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário de motivo de consulta.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Designação</Label>
            <Input
              readOnly={isView}
              value={designacao}
              maxLength={80}
              placeholder='Designação...'
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
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type='button' onClick={handleSave}>
                OK
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
