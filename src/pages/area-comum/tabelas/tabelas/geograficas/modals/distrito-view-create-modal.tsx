import { useState, useEffect } from 'react'
import type { DistritoTableDTO } from '@/types/dtos/base/distritos.dtos'
import type { CreateDistritoDTO } from '@/types/dtos/base/distritos.dtos'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCreateDistrito,
  useUpdateDistrito,
} from '@/pages/base/distritos/queries/distritos-mutations'
import { useGetPaisesSelect } from '@/pages/base/paises/queries/paises-queries'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'

type ModalMode = 'view' | 'create' | 'edit'

interface DistritoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: DistritoTableDTO | null
  onSuccess?: () => void
}

export function DistritoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: DistritoViewCreateModalProps) {
  const [createValues, setCreateValues] = useState<CreateDistritoDTO>({
    nome: '',
    paisId: '',
  })

  const createDistritoMutation = useCreateDistrito()
  const updateDistritoMutation = useUpdateDistrito()
  const { data: paisesData } = useGetPaisesSelect()
  const paises = paisesData ?? []

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && mode === 'edit' && viewData) {
      setCreateValues({
        nome: viewData.nome ?? '',
        paisId: viewData.paisId ?? '',
      })
    }
    if (open && mode === 'create') {
      setCreateValues({ nome: '', paisId: '' })
    }
  }, [open, mode, viewData])

  const handleOk = () => {
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
    setCreateValues({ nome: '', paisId: '' })
  }

  const handleGuardar = async () => {
    if (!createValues.nome?.trim() || !createValues.paisId?.trim()) {
      toast.error('Preencha Nome e País.')
      return
    }
    try {
      if (mode === 'edit' && viewData?.id) {
        const response = await updateDistritoMutation.mutateAsync({
          id: viewData.id,
          data: createValues,
        })
        const result = handleApiResponse(
          response,
          'Distrito atualizado com sucesso',
          'Erro ao atualizar distrito',
          'Distrito atualizado com avisos',
        )
        if (result.success) {
          onOpenChange(false)
          setCreateValues({ nome: '', paisId: '' })
          onSuccess?.()
        }
      } else {
        const response = await createDistritoMutation.mutateAsync(createValues)
        const result = handleApiResponse(
          response,
          'Distrito adicionado com sucesso',
          'Erro ao adicionar distrito',
          'Distrito adicionado com avisos',
        )
        if (result.success) {
          onOpenChange(false)
          setCreateValues({ nome: '', paisId: '' })
          onSuccess?.()
        }
      }
    } catch {
      toast.error(
        mode === 'edit'
          ? 'Erro ao atualizar distrito'
          : 'Erro ao adicionar distrito',
      )
    }
  }

  const isSaving =
    createDistritoMutation.isPending || updateDistritoMutation.isPending
  const title = isView
    ? 'Distritos'
    : isEdit
      ? 'Editar Distrito'
      : 'Adicionar Distrito'

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
                <Label>Nome</Label>
                <Input readOnly value={viewData.nome ?? ''} className='bg-muted' />
              </div>
              <div className='grid gap-2'>
                <Label>País</Label>
                <Input
                  readOnly
                  value={viewData.pais?.nome ?? '-'}
                  className='bg-muted'
                />
              </div>
            </>
          ) : (
            <>
              <div className='grid gap-2'>
                <Label>Nome</Label>
                <Input
                  value={createValues.nome}
                  onChange={(e) =>
                    setCreateValues((p) => ({ ...p, nome: e.target.value }))
                  }
                  placeholder='Nome do distrito'
                />
              </div>
              <div className='grid gap-2'>
                <Label>País</Label>
                <Select
                  value={createValues.paisId || undefined}
                  onValueChange={(value) =>
                    setCreateValues((p) => ({ ...p, paisId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecionar país' />
                  </SelectTrigger>
                  <SelectContent>
                    {paises.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

