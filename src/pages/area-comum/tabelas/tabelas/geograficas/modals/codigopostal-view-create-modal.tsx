import { useState, useEffect } from 'react'
import type {
  CodigoPostalTableDTO,
  CreateCodigoPostalDTO,
} from '@/types/dtos/base/codigospostais.dtos'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useCreateCodigoPostal,
  useUpdateCodigoPostal,
} from '@/pages/base/codigospostais/queries/codigospostais-mutations'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'

type ModalMode = 'view' | 'create' | 'edit'

interface CodigoPostalViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: CodigoPostalTableDTO | null
  onSuccess?: () => void
}

export function CodigoPostalViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: CodigoPostalViewCreateModalProps) {
  const [createValues, setCreateValues] = useState<CreateCodigoPostalDTO>({
    codigo: '',
    localidade: '',
  })

  const createCodigoPostalMutation = useCreateCodigoPostal()
  const updateCodigoPostalMutation = useUpdateCodigoPostal()

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && mode === 'edit' && viewData) {
      setCreateValues({
        codigo: viewData.codigo ?? '',
        localidade: viewData.localidade ?? '',
      })
    }
    if (open && mode === 'create') {
      setCreateValues({ codigo: '', localidade: '' })
    }
  }, [open, mode, viewData])

  const handleOk = () => {
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
    setCreateValues({ codigo: '', localidade: '' })
  }

  const handleGuardar = async () => {
    if (!createValues.codigo?.trim() || !createValues.localidade?.trim()) {
      toast.error('Preencha Código e Localidade.')
      return
    }
    try {
      if (mode === 'edit' && viewData?.id) {
        const response = await updateCodigoPostalMutation.mutateAsync({
          id: viewData.id,
          data: createValues,
        })
        const result = handleApiResponse(
          response,
          'Código Postal atualizado com sucesso',
          'Erro ao atualizar Código Postal',
          'Código Postal atualizado com avisos',
        )
        if (result.success) {
          onOpenChange(false)
          setCreateValues({ codigo: '', localidade: '' })
          onSuccess?.()
        }
      } else {
        const response =
          await createCodigoPostalMutation.mutateAsync(createValues)
        const result = handleApiResponse(
          response,
          'Código Postal adicionado com sucesso',
          'Erro ao adicionar Código Postal',
          'Código Postal adicionado com avisos',
        )
        if (result.success) {
          onOpenChange(false)
          setCreateValues({ codigo: '', localidade: '' })
          onSuccess?.()
        }
      }
    } catch {
      toast.error(
        mode === 'edit'
          ? 'Erro ao atualizar Código Postal'
          : 'Erro ao adicionar Código Postal',
      )
    }
  }

  const isSaving =
    createCodigoPostalMutation.isPending || updateCodigoPostalMutation.isPending
  const title = isView
    ? 'Códigos Postais'
    : isEdit
      ? 'Editar Código Postal'
      : 'Adicionar Código Postal'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          {isView && viewData ? (
            <>
              <div className='grid gap-2'>
                <Label>Código</Label>
                <Input readOnly value={viewData.codigo ?? ''} className='bg-muted' />
              </div>
              <div className='grid gap-2'>
                <Label>Localidade</Label>
                <Input
                  readOnly
                  value={viewData.localidade ?? ''}
                  className='bg-muted'
                />
              </div>
            </>
          ) : (
            <>
              <div className='grid gap-2'>
                <Label>Código</Label>
                <Input
                  value={createValues.codigo}
                  onChange={(e) =>
                    setCreateValues((p) => ({ ...p, codigo: e.target.value }))
                  }
                  placeholder='Código Postal'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Localidade</Label>
                <Input
                  value={createValues.localidade}
                  onChange={(e) =>
                    setCreateValues((p) => ({ ...p, localidade: e.target.value }))
                  }
                  placeholder='Localidade'
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={handleOk}>
              OK
            </Button>
          ) : (
            <>
              <Button type='button' variant='outline' onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type='button' onClick={handleGuardar} disabled={isSaving}>
                {isSaving ? 'A guardar...' : 'Guardar'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

