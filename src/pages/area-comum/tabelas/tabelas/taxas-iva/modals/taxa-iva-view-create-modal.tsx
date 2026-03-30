import { useEffect, useState } from 'react'
import type { TaxaIvaTableDTO } from '@/types/dtos/taxas-iva/taxa-iva.dtos'
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
import { TaxaIvaService } from '@/lib/services/taxas-iva/taxa-iva-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface TaxaIvaViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: TaxaIvaTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  descricao: string
  taxa: string
}

export function TaxaIvaViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: TaxaIvaViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    descricao: '',
    taxa: '0',
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        descricao: viewData.descricao ?? '',
        taxa: String(viewData.taxa ?? 0),
      })
    }
    if (open && mode === 'create') {
      setValues({
        descricao: '',
        taxa: '0',
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

    const taxaNum = Number(values.taxa)
    if (Number.isNaN(taxaNum) || taxaNum < 0 || taxaNum > 100) {
      toast.error('Taxa deve estar entre 0 e 100.')
      return
    }

    try {
      const client = TaxaIvaService()

      const body = {
        Codigo:
          (viewData as { codigo?: string })?.codigo ??
          values.descricao.trim().slice(0, 50),
        Descricao: values.descricao.trim(),
        Taxa: taxaNum,
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
          ? await client.updateTaxaIva(editId, body)
          : await client.createTaxaIva(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Taxa IVA atualizada com sucesso.'
            : 'Taxa IVA criada com sucesso.',
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar Taxa IVA.'
            : 'Falha ao criar Taxa IVA.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar a Taxa IVA.')
    }
  }

  const title =
    mode === 'view'
      ? 'Taxa IVA'
      : mode === 'edit'
        ? 'Editar Taxa IVA'
        : 'Adicionar Taxa IVA'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar taxa IVA (código, descrição e taxa).
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Descrição</Label>
            <Input
              readOnly={isView}
              value={values.descricao}
              maxLength={80}
              placeholder='Descrição (ex: Isento, IVA 6%)...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, descricao: e.target.value }))
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>Taxa (%)</Label>
            <Input
              readOnly={isView}
              type='number'
              min={0}
              max={100}
              step={0.01}
              value={values.taxa}
              placeholder='Taxa (0 a 100)...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, taxa: e.target.value }))
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

