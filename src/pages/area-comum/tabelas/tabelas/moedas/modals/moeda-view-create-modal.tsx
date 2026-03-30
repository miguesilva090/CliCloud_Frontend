import { useEffect, useState } from 'react'
import type { MoedaTableDTO } from '@/types/dtos/moedas/moeda.dtos'
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
import { MoedaService } from '@/lib/services/moedas/moeda-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface MoedaViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: MoedaTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  descricao: string
  plural: string
  cambio: string
  abreviatura: string
  centesimos: string
  centesimoPlural: string
  simbolo: string
}

export function MoedaViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: MoedaViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    descricao: '',
    plural: '',
    cambio: '1',
    abreviatura: '',
    centesimos: '',
    centesimoPlural: '',
    simbolo: '',
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        descricao: viewData.descricao ?? '',
        plural: viewData.plural ?? '',
        cambio: viewData.cambio != null ? String(viewData.cambio) : '1',
        abreviatura: viewData.abreviatura ?? '',
        centesimos: viewData.centesimos ?? '',
        centesimoPlural: viewData.centesimoPlural ?? '',
        simbolo: viewData.simbolo ?? '',
      })
    }
    if (open && mode === 'create') {
      setValues({
        descricao: '',
        plural: '',
        cambio: '1',
        abreviatura: '',
        centesimos: '',
        centesimoPlural: '',
        simbolo: '',
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
    const cambioNum = parseFloat(values.cambio.replace(',', '.'))
    if (isNaN(cambioNum) || cambioNum < 0) {
      toast.error('Câmbio deve ser maior ou igual a 0.')
      return
    }

    try {
      const client = MoedaService()

      const body = {
        Codigo: (viewData as { codigo?: number })?.codigo ?? 0,
        Descricao: values.descricao.trim(),
        Plural: values.plural?.trim() || undefined,
        Cambio: cambioNum,
        Abreviatura: values.abreviatura?.trim() || undefined,
        Centesimos: values.centesimos?.trim() || undefined,
        CentesimoPlural: values.centesimoPlural?.trim() || undefined,
        Simbolo: values.simbolo?.trim() || undefined,
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
          ? await client.updateMoeda(editId, body)
          : await client.createMoeda(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit ? 'Moeda atualizada com sucesso.' : 'Moeda criada com sucesso.',
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit ? 'Falha ao atualizar Moeda.' : 'Falha ao criar Moeda.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar a Moeda.')
    }
  }

  const title =
    mode === 'view'
      ? 'Moeda'
      : mode === 'edit'
        ? 'Editar Moeda'
        : 'Adicionar Moeda'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar moeda.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4 max-h-[60vh] overflow-y-auto'>
          <div className='grid gap-2'>
            <Label>Descrição</Label>
            <Input
              readOnly={isView}
              value={values.descricao}
              maxLength={50}
              placeholder='Descrição (ex: EURO)...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, descricao: e.target.value }))
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>Plural</Label>
            <Input
              readOnly={isView}
              value={values.plural}
              maxLength={50}
              placeholder='Plural (ex: Euros)...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, plural: e.target.value }))
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>Câmbio</Label>
            <Input
              type='number'
              step='any'
              min={0}
              readOnly={isView}
              value={values.cambio}
              placeholder='1'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, cambio: e.target.value }))
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>Abreviatura</Label>
            <Input
              readOnly={isView}
              value={values.abreviatura}
              maxLength={10}
              placeholder='Abreviatura (ex: EUR)...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, abreviatura: e.target.value }))
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>Centésimos</Label>
            <Input
              readOnly={isView}
              value={values.centesimos}
              maxLength={10}
              placeholder='Centésimos (ex: Cêntimo)...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, centesimos: e.target.value }))
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>Centésimo Plural</Label>
            <Input
              readOnly={isView}
              value={values.centesimoPlural}
              maxLength={50}
              placeholder='Centésimo plural (ex: Cêntimos)...'
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  centesimoPlural: e.target.value,
                }))
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>Símbolo</Label>
            <Input
              readOnly={isView}
              value={values.simbolo}
              maxLength={3}
              placeholder='Símbolo (ex: €)...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, simbolo: e.target.value }))
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

