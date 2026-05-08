import { useEffect, useState } from 'react'
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
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'
import { EstadoSinistroService } from '@/lib/services/sinistrados/estado-sinistro-service'
import type { EstadoSinistroDTO } from '@/types/dtos/sinistrados/estado-sinistro.dto'

type ModalMode = 'view' | 'create' | 'edit'

export function EstadoSinistroViewEditModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: EstadoSinistroDTO | null
  onSuccess?: () => void
}) {
  const [designacao, setDesignacao] = useState('')
  const isView = mode === 'view'

  useEffect(() => {
    if (!open) return
    if (mode === 'create') setDesignacao('')
    else setDesignacao(viewData?.designacao ?? '')
  }, [open, mode, viewData])

  const handleSave = async () => {
    if (isView) return
    if (!designacao.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }
    try {
      const service = EstadoSinistroService()
      const response =
        mode === 'edit' && viewData?.id
          ? await service.update(viewData.id, { designacao: designacao.trim() })
          : await service.create({ designacao: designacao.trim() })
      if (response.info.status === ResponseStatus.Success) {
        toast.success(mode === 'edit' ? 'Registo atualizado.' : 'Registo criado.')
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(response.info.messages?.['$']?.[0] ?? 'Falha ao guardar registo.')
      }
    } catch {
      toast.error('Erro ao guardar estado de sinistro.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Estado de Sinistro</DialogTitle>
          <DialogDescription className='sr-only'>Ver ou editar estado de sinistro.</DialogDescription>
        </DialogHeader>
        <Input
          disabled={isView}
          value={designacao}
          onChange={(e) => setDesignacao(e.target.value)}
          placeholder='Designação'
          maxLength={80}
        />
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {isView ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isView ? <Button onClick={handleSave}>Guardar</Button> : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
