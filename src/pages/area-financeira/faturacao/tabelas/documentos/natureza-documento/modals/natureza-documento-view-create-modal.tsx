import { useEffect, useState } from 'react'
import type { NaturezaDocumentoTableDTO } from '@/types/dtos/faturacao/natureza-documento.dtos'
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
import { NaturezaDocumentoService } from '@/lib/services/faturacao/natureza-documento-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface NaturezaDocumentoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: NaturezaDocumentoTableDTO | null
  onSuccess?: () => void
}

type FormValues = { sigla: string; descricao: string }

export function NaturezaDocumentoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: NaturezaDocumentoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({ sigla: '', descricao: '' })
  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        sigla: viewData.sigla ?? '',
        descricao: viewData.descricao ?? '',
      })
    }
    if (open && mode === 'create') {
      setValues({ sigla: '', descricao: '' })
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleGuardar = async () => {
    if (isView) return

    const sigla = values.sigla.trim()
    const descricao = values.descricao.trim()

    if (!sigla || sigla.length !== 1) {
      toast.error('Sigla é obrigatória e deve ter 1 carácter.')
      return
    }
    if (!descricao) {
      toast.error('Descrição é obrigatória.')
      return
    }

    try {
      const client = NaturezaDocumentoService()
      const body = { sigla, descricao }
      const editId = viewData?.id

      if (isEdit && editId) {
        const response = await client.updateNaturezaDocumento(editId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Natureza do documento atualizada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          toast.error(response.info.messages?.['$']?.[0] ?? 'Falha ao atualizar.')
        }
      } else {
        const response = await client.createNaturezaDocumento(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Natureza do documento criada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          toast.error(response.info.messages?.['$']?.[0] ?? 'Falha ao criar.')
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Erro ao guardar a natureza do documento.')
    }
  }

  const title =
    mode === 'create'
      ? 'Nova Natureza do Documento'
      : mode === 'edit'
        ? 'Editar Natureza do Documento'
        : 'Detalhe da Natureza do Documento'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isView
              ? 'Visualizar natureza do documento.'
              : 'Preencha Sigla e Descrição.'}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='natureza-doc-sigla'>Sigla</Label>
            <Input
              id='natureza-doc-sigla'
              value={values.sigla}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, sigla: e.target.value }))
              }
              disabled={isView}
              maxLength={1}
              placeholder='Ex.: D'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='natureza-doc-descricao'>Descrição</Label>
            <Input
              id='natureza-doc-descricao'
              value={values.descricao}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, descricao: e.target.value }))
              }
              disabled={isView}
              maxLength={50}
              placeholder='Ex.: Débito'
            />
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
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
