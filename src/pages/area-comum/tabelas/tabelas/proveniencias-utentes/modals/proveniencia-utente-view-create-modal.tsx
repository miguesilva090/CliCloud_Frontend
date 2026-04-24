import { useEffect, useState } from 'react'
import type { ProvenienciaUtenteTableDTO } from '@/types/dtos/proveniencias-utente/proveniencia-utente.dtos'
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
import { ProvenienciaUtenteService } from '@/lib/services/proveniencias-utente/proveniencia-utente-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface ProvenienciaUtenteViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: ProvenienciaUtenteTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  descricao: string
}

export function ProvenienciaUtenteViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: ProvenienciaUtenteViewCreateModalProps) {
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
      const client = ProvenienciaUtenteService()

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
          ? await client.updateProvenienciaUtente(editId, body)
          : await client.createProvenienciaUtente(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Proveniência atualizada com sucesso.'
            : 'Proveniência criada com sucesso.',
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit ? 'Falha ao atualizar proveniência.' : 'Falha ao criar proveniência.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar a proveniência.')
    }
  }

  const title =
    mode === 'view'
      ? 'Proveniência de utente'
      : mode === 'edit'
        ? 'Editar proveniência de utente'
        : 'Adicionar proveniência de utente'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar proveniência de utente.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Descrição</Label>
            <Input
              readOnly={isView}
              value={values.descricao}
              maxLength={80}
              placeholder='Descrição da proveniência...'
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
