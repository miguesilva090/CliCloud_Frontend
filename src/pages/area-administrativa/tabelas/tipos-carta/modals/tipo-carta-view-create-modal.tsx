import { useEffect, useState } from 'react'
import type { TipoCartaTableDTO } from '@/types/dtos/utility/tipo-carta.dtos'
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
import { TipoCartaService } from '@/lib/services/utility/tipo-carta-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: TipoCartaTableDTO | null
  onSuccess?: () => void
}

export function TipoCartaViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: Props) {
  const [descricao, setDescricao] = useState('')
  const [obs, setObs] = useState('')
  const [caminho, setCaminho] = useState('')
  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (!open) return
    if ((isView || isEdit) && viewData) {
      setDescricao(viewData.descricao ?? '')
      setObs(viewData.obs ?? '')
      setCaminho(viewData.caminho ?? '')
    } else {
      setDescricao('')
      setObs('')
      setCaminho('')
    }
  }, [open, isView, isEdit, viewData])

  const handleSave = async () => {
    if (isView) return
    if (!descricao.trim()) {
      toast.error('Descrição é obrigatória.')
      return
    }

    const payload = { Descricao: descricao.trim(), Obs: obs.trim(), Caminho: caminho.trim() }
    try {
      const client = TipoCartaService()
      const response = isEdit && viewData?.id
        ? await client.updateTipoCarta(viewData.id, payload)
        : await client.createTipoCarta(payload)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(isEdit ? 'Tipo de carta atualizado.' : 'Tipo de carta criado.')
        onOpenChange(false)
        onSuccess?.()
        return
      }
      toast.error(response.info.messages?.['$']?.[0] ?? 'Falha ao guardar tipo de carta.')
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Erro ao guardar tipo de carta.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'view'
              ? 'Tipo de Carta'
              : mode === 'edit'
                ? 'Editar Tipo de Carta'
                : 'Adicionar Tipo de Carta'}
          </DialogTitle>
          <DialogDescription className='sr-only'>Formulário de tipo de carta.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Descrição</Label>
            <Input readOnly={isView} value={descricao} maxLength={150} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div className='grid gap-2'>
            <Label>Obs</Label>
            <Input readOnly={isView} value={obs} maxLength={500} onChange={(e) => setObs(e.target.value)} />
          </div>
          <div className='grid gap-2'>
            <Label>Caminho</Label>
            <Input readOnly={isView} value={caminho} maxLength={500} onChange={(e) => setCaminho(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={() => onOpenChange(false)}>OK</Button>
          ) : (
            <>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type='button' onClick={handleSave}>OK</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
