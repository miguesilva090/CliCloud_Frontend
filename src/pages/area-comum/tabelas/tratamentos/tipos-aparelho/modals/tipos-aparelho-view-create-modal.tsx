import { useEffect, useState } from 'react'
import type { TipoAparelhoTableDTO } from '@/types/dtos/tipo-aparelho/tipo-aparelho.dtos'
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
import { TipoAparelhoService } from '@/lib/services/tipo-aparelho'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface TiposAparelhoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: TipoAparelhoTableDTO | null
  onSuccess?: () => void
}

export function TiposAparelhoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: TiposAparelhoViewCreateModalProps) {
  const [designacao, setDesignacao] = useState('')

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setDesignacao(
        (viewData as { designacao?: string }).designacao ??
          (viewData as { Designacao?: string }).Designacao ??
          ''
      )
    }
    if (open && mode === 'create') setDesignacao('')
  }, [open, mode, isView, isEdit, viewData])

  const handleGuardar = async () => {
    if (isView) return
    if (!designacao?.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }
    try {
      const client = TipoAparelhoService()
      const rawId = viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId = typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''
      if (isEdit && (!editId || editId === 'undefined')) {
        toast.error('Não foi possível identificar o registo a atualizar.')
        return
      }
      if (isEdit && editId) {
        const response = await client.updateTipoAparelho(editId, { designacao: designacao.trim() })
        const status = (response.info as { status?: number })?.status
        if (status === ResponseStatus.Success) {
          toast.success('Tipo de aparelho atualizado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg = (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ?? 'Falha ao atualizar.'
          toast.error(msg)
        }
      } else {
        const response = await client.createTipoAparelho({ designacao: designacao.trim() })
        const status = (response.info as { status?: number })?.status
        if (status === ResponseStatus.Success) {
          toast.success('Tipo de aparelho criado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg = (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ?? 'Falha ao criar.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message ?? 'Erro ao guardar.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Tipo de Aparelho</DialogTitle>
          <DialogDescription className='sr-only'>Ver/criar/editar tipo de aparelho.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Designação</Label>
            <Input
              readOnly={isView}
              value={designacao}
              maxLength={100}
              placeholder='Designação...'
              onChange={(e) => setDesignacao(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={() => onOpenChange(false)}>OK</Button>
          ) : (
            <>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type='button' onClick={handleGuardar}>Guardar</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
