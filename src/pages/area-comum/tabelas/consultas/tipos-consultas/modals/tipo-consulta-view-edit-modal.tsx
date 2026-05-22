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

type ModalMode = 'view' | 'edit' | 'create'

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
  const [codigoLegado, setCodigoLegado] = useState('')

  const isView = mode === 'view'
  const isEdit = mode === 'edit'
  const isCreate = mode === 'create'

  useEffect(() => {
    if (!open) return
    if (isCreate) {
      setDesignacao('')
      setCodigoLegado('')
      return
    }
    if ((isView || isEdit) && viewData) {
      setDesignacao(viewData.designacao ?? '')
      setCodigoLegado(
        viewData.codigoLegado != null ? String(viewData.codigoLegado) : ''
      )
    }
  }, [open, mode, isView, isEdit, isCreate, viewData])

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

      const codigo =
        codigoLegado.trim() === '' ? null : Number.parseInt(codigoLegado, 10)
      if (codigoLegado.trim() !== '' && !Number.isFinite(codigo)) {
        toast.error('Código legado deve ser um número inteiro.')
        return
      }

      const response = isCreate
        ? await client.createTipoConsulta({
            designacao: designacao.trim(),
            codigoLegado: codigo,
          })
        : await client.updateTipoConsulta(editId, {
            designacao: designacao.trim(),
            codigoLegado: codigo,
          })

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isCreate
            ? 'Tipo de consulta criado com sucesso.'
            : 'Tipo de Consulta atualizado com sucesso.',
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isCreate
            ? 'Falha ao criar tipo de consulta.'
            : 'Falha ao atualizar Tipo de Consulta.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar o Tipo de Consulta.',
      )
    }
  }

  const title =
    mode === 'view'
      ? 'Tipo de Consulta'
      : mode === 'create'
        ? 'Novo tipo de consulta'
        : 'Editar Tipo de Consulta'

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
              autoFocus={isCreate}
            />
          </div>
          <div className='grid gap-2'>
            <Label>Código legado</Label>
            <Input
              readOnly={isView}
              type='number'
              min={1}
              value={codigoLegado}
              placeholder='Ex: 1 (1ª consulta — duração Prim_Conslt)'
              onChange={(e) => setCodigoLegado(e.target.value)}
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

