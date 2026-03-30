import { useEffect, useState } from 'react'
import type { HabilitacaoTableDTO } from '@/types/dtos/habilitacoes/habilitacao.dtos'
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
import { HabilitacaoService } from '@/lib/services/habilitacoes/habilitacao-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface HabilitacaoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: HabilitacaoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  descricao: string
}

export function HabilitacaoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: HabilitacaoViewCreateModalProps) {
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
      toast.error('Designação é obrigatória.')
      return
    }

    try {
      const client = HabilitacaoService()

      const body = {
        Codigo:
          (viewData as { codigo?: string })?.codigo ??
          values.descricao.trim().slice(0, 50),
        Descricao: values.descricao.trim(),
      }

      const rawId =
        viewData &&
        ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
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
          ? await client.updateHabilitacao(editId, body)
          : await client.createHabilitacao(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Habilitação atualizada com sucesso.'
            : 'Habilitação criada com sucesso.',
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar Habilitação.'
            : 'Falha ao criar Habilitação.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar a Habilitação.')
    }
  }

  const title =
    mode === 'view'
      ? 'Habilitação'
      : mode === 'edit'
        ? 'Editar Habilitação'
        : 'Adicionar Habilitação'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar habilitação (código e designação).
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Designação</Label>
            <Input
              readOnly={isView}
              value={values.descricao}
              maxLength={80}
              placeholder='Designação (ex: 12º Ano, Licenciatura)...'
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

