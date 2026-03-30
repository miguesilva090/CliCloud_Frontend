import { useEffect, useState } from 'react'
import type { TipoServicoTableDTO } from '@/types/dtos/servicos/tipo-servico.dtos'
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
import { TipoServicoService } from '@/lib/services/servicos/tipo-servico-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface TipoServicoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: TipoServicoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  descricao: string
  taxaModeradoraSns: string
  partilhaSemRequisicao: boolean
}

export function TipoServicoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: TipoServicoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    descricao: '',
    taxaModeradoraSns: '',
    partilhaSemRequisicao: false,
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        descricao: viewData.descricao ?? '',
        taxaModeradoraSns:
          viewData.taxaModeradoraSns != null
            ? String(viewData.taxaModeradoraSns)
            : '',
        partilhaSemRequisicao: viewData.partilhaSemRequisicao ?? false,
      })
    }
    if (open && mode === 'create') {
      setValues({
        descricao: '',
        taxaModeradoraSns: '',
        partilhaSemRequisicao: false,
      })
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleGuardar = async () => {
    if (isView) return

    if (!values.descricao.trim()) {
      toast.error('Descrição é obrigatória.')
      return
    }

    const taxaNum = values.taxaModeradoraSns
      ? Number(values.taxaModeradoraSns)
      : undefined
    if (values.taxaModeradoraSns && Number.isNaN(taxaNum)) {
      toast.error('Valor inválido para Taxa Moderadora.')
      return
    }

    try {
      const client = TipoServicoService()

      const body = {
        descricao: values.descricao.trim(),
        taxaModeradoraSns: taxaNum,
        partilhaSemRequisicao: values.partilhaSemRequisicao,
      }

      const rawId =
        viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId =
        typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      const response =
        isEdit && viewData && editId
          ? await client.updateTipoServico(editId, { ...body, id: editId })
          : await client.createTipoServico(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Tipo de Serviço atualizado com sucesso.'
            : 'Tipo de Serviço criado com sucesso.'
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar Tipo de Serviço.'
            : 'Falha ao criar Tipo de Serviço.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar o Tipo de Serviço.'
      )
    }
  }

  const title =
    mode === 'view'
      ? 'Tipo de Serviço'
      : mode === 'edit'
        ? 'Editar Tipo de Serviço'
        : 'Adicionar Tipo de Serviço'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar um Tipo de Serviço.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Descrição</Label>
            <Input
              disabled={isView}
              value={values.descricao}
              maxLength={80}
              placeholder='Descrição...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, descricao: e.target.value }))
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>Taxa Moderadora (S.N.S)</Label>
            <Input
              disabled={isView}
              type='number'
              step={0.01}
              value={values.taxaModeradoraSns}
              placeholder='0,00'
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  taxaModeradoraSns: e.target.value,
                }))
              }
            />
          </div>
          <div className='flex items-center gap-2 mt-2'>
            <Checkbox
              disabled={isView}
              checked={values.partilhaSemRequisicao}
              onCheckedChange={(checked) =>
                setValues((prev) => ({
                  ...prev,
                  partilhaSemRequisicao: Boolean(checked),
                }))
              }
            />
            <Label>Partilha Sem Requisição</Label>
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

