import { useEffect, useState } from 'react'
import type { NotificacaoTipoTableDTO } from '@/types/dtos/notificacoes/notificacao-tipo.dtos'
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
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/utils/toast-utils'
import { NotificacaoTipoService } from '@/lib/services/notificacoes/notificacao-tipo-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface NotificacaoTipoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: NotificacaoTipoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  designacaoTipo: string
  reservadoSistema: boolean
}

export function NotificacaoTipoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: NotificacaoTipoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    designacaoTipo: '',
    reservadoSistema: false,
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'
  /** Tipos reservados ao sistema não são editáveis (alinhado ao legado). */
  const formularioSoLeitura = isView || (isEdit && !!viewData?.reservadoSistema)

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        designacaoTipo: viewData.designacaoTipo ?? '',
        reservadoSistema: !!viewData.reservadoSistema,
      })
    }
    if (open && mode === 'create') {
      setValues({
        designacaoTipo: '',
        reservadoSistema: false,
      })
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleGuardar = async () => {
    if (isView || formularioSoLeitura) return

    if (!values.designacaoTipo?.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }

    try {
      const client = NotificacaoTipoService()
      const body = {
        designacaoTipo: values.designacaoTipo.trim(),
        reservadoSistema: values.reservadoSistema,
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
          ? await client.updateNotificacaoTipo(editId, body)
          : await client.createNotificacaoTipo(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Tipo de notificação atualizado com sucesso.'
            : 'Tipo de notificação criado com sucesso.',
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar o tipo.'
            : 'Falha ao criar o tipo.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar.')
    }
  }

  const title =
    isView || (isEdit && !!viewData?.reservadoSistema)
      ? 'Tipo de notificação'
      : isEdit
        ? 'Editar tipo de notificação'
        : 'Adicionar tipo de notificação'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para tipos de notificação.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Designação</Label>
            <Input
              readOnly={formularioSoLeitura}
              value={values.designacaoTipo}
              maxLength={60}
              placeholder='Ex.: Mensagem, Atualização de sistema...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, designacaoTipo: e.target.value }))
              }
            />
          </div>
          <div className='flex items-center gap-2'>
            <Checkbox
              id='reservado'
              disabled={formularioSoLeitura}
              checked={values.reservadoSistema}
              onCheckedChange={(v) =>
                setValues((prev) => ({
                  ...prev,
                  reservadoSistema: v === true,
                }))
              }
            />
            <Label htmlFor='reservado' className='font-normal cursor-pointer'>
              Reservado ao sistema (não editável nem eliminável)
            </Label>
          </div>
        </div>
        <DialogFooter>
          {isView || formularioSoLeitura ? (
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
