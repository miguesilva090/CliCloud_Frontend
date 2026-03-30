import { useEffect, useState } from 'react'
import type { MotivoIsencaoTableDTO } from '@/types/dtos/taxas-iva/motivo-isencao.dtos'
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
import { MotivoIsencaoService } from '@/lib/services/taxas-iva/motivo-isencao-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface MotivoIsencaoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: MotivoIsencaoTableDTO | null
  onSuccess?: () => void
  /** Quando em modo create, pode passar o id do novo registo (ex.: para seleccionar no form que abriu o modal) */
  onSuccessWithId?: (id: string) => void
}

type FormValues = {
  descricao: string
}

export function MotivoIsencaoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
  onSuccessWithId,
}: MotivoIsencaoViewCreateModalProps) {
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
      const client = MotivoIsencaoService()
      const rawId =
        viewData &&
        ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId =
        typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      const existingCodigo = viewData?.codigo
      const generatedCodigo =
        existingCodigo && existingCodigo.trim().length > 0
          ? existingCodigo.trim()
          : `MOT-${Date.now()}`

      const body = {
        // O backend continua a esperar um código, mas este é gerado automaticamente
        // e não é exposto no UI.
        codigo: generatedCodigo,
        descricao: values.descricao.trim(),
      }

      if (isEdit && editId) {
        const response = await client.updateMotivoIsencao(editId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Motivo de isenção atualizado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao atualizar Motivo de isenção.'
          toast.error(msg)
        }
      } else {
        const response = await client.createMotivoIsencao(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Motivo de isenção criado com sucesso.')
          const newId =
            response.info.data != null ? String(response.info.data) : undefined
          onOpenChange(false)
          onSuccess?.()
          if (newId) onSuccessWithId?.(newId)
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao criar Motivo de isenção.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar o Motivo de isenção.')
    }
  }

  const title =
    mode === 'create'
      ? 'Novo Motivo de Isenção'
      : mode === 'edit'
        ? 'Editar Motivo de Isenção'
        : 'Detalhe do Motivo de Isenção'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'view'
              ? 'Visualizar detalhes do Motivo de isenção.'
              : 'Preencha os campos obrigatórios e guarde as alterações.'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='motivo-descricao'>Descrição</Label>
            <Input
              id='motivo-descricao'
              value={values.descricao}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, descricao: e.target.value }))
              }
              disabled={isView}
              placeholder='Descrição...'
              maxLength={200}
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

