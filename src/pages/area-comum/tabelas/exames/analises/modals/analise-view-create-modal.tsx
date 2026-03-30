import { useEffect, useState } from 'react'
import type { AnaliseTableDTO } from '@/types/dtos/exames/analises'
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
import { AnalisesService } from '@/lib/services/exames/analises-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface AnaliseViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: AnaliseTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  nome: string
  unidadeMedida: string
  valoresReferencia: string
}

export function AnaliseViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: AnaliseViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    nome: '',
    unidadeMedida: '',
    valoresReferencia: '',
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        nome: viewData.nome ?? '',
        unidadeMedida: viewData.unidadeMedida ?? '',
        valoresReferencia: viewData.valoresReferencia ?? '',
      })
    }
    if (open && mode === 'create') {
      setValues({
        nome: '',
        unidadeMedida: '',
        valoresReferencia: '',
      })
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleGuardar = async () => {
    if (isView) return

    if (!values.nome?.trim()) {
      toast.error('Nome é obrigatório.')
      return
    }

    try {
      const client = AnalisesService()

      const rawId =
        viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId =
        typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      if (isEdit && (!editId || editId === 'undefined')) {
        toast.error(
          'Não foi possível identificar o registo a atualizar. Feche e abra novamente a edição.'
        )
        return
      }

      const body = {
        nome: values.nome.trim(),
        unidadeMedida: values.unidadeMedida.trim() || null,
        valoresReferencia: values.valoresReferencia.trim() || null,
      }

      if (isEdit && viewData && editId) {
        const response = await client.updateAnalise(editId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Análise atualizada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao atualizar Análise.'
          toast.error(msg)
        }
      } else {
        const response = await client.createAnalise(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Análise criada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao criar Análise.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar a Análise.'
      )
    }
  }

  const title =
    mode === 'create'
      ? 'Nova Análise'
      : mode === 'edit'
      ? 'Editar Análise'
      : 'Detalhe da Análise'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'view'
              ? 'Visualizar detalhes da Análise.'
              : 'Preencha os campos obrigatórios e guarde as alterações.'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='nome'>Nome</Label>
            <Input
              id='nome'
              value={values.nome}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, nome: e.target.value }))
              }
              disabled={isView}
              placeholder='Nome da análise'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='unidadeMedida'>Unidade de Medida</Label>
            <Input
              id='unidadeMedida'
              value={values.unidadeMedida}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, unidadeMedida: e.target.value }))
              }
              disabled={isView}
              placeholder='Ex.: mg/dL'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='valoresReferencia'>Valores de Referência</Label>
            <Input
              id='valoresReferencia'
              value={values.valoresReferencia}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, valoresReferencia: e.target.value }))
              }
              disabled={isView}
              placeholder='Ex.: 70 - 110'
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

