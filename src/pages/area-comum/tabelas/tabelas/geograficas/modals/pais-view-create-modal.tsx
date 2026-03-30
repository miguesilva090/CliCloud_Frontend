import { useState, useEffect } from 'react'
import type { PaisTableDTO } from '@/types/dtos/base/paises.dtos'
import type { CreatePaisDTO } from '@/types/dtos/base/paises.dtos'
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
  useCreatePais,
  useUpdatePais,
} from '@/pages/base/paises/queries/paises-mutations'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'

type ModalMode = 'view' | 'create' | 'edit'

interface PaisViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: PaisTableDTO | null
  onSuccess?: () => void
}

export function PaisViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: PaisViewCreateModalProps) {
  const [createValues, setCreateValues] = useState<CreatePaisDTO>({
    codigo: '',
    nome: '',
    prefixo: '',
  })

  const createPaisMutation = useCreatePais()
  const updatePaisMutation = useUpdatePais()

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && mode === 'edit' && viewData) {
      setCreateValues({
        codigo: viewData.codigo ?? '',
        nome: viewData.nome ?? '',
        prefixo: viewData.prefixo ?? '',
      })
    }
    if (open && mode === 'create') {
      setCreateValues({ codigo: '', nome: '', prefixo: '' })
    }
  }, [open, mode, viewData])

  const handleOk = () => {
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
    setCreateValues({ codigo: '', nome: '', prefixo: '' })
  }

  const handleGuardar = async () => {
    if (
      !createValues.codigo?.trim() ||
      !createValues.nome?.trim() ||
      !createValues.prefixo?.trim()
    ) {
      toast.error('Preencha Sigla, Nome e Prefixo.')
      return
    }
    try {
      if (mode === 'edit' && viewData?.id) {
        const response = await updatePaisMutation.mutateAsync({
          id: viewData.id,
          data: createValues,
        })
        const result = handleApiResponse(
          response,
          'País atualizado com sucesso',
          'Erro ao atualizar país',
          'País atualizado com avisos',
        )
        if (result.success) {
          onOpenChange(false)
          setCreateValues({ codigo: '', nome: '', prefixo: '' })
          onSuccess?.()
        }
      } else {
        const response = await createPaisMutation.mutateAsync(createValues)
        const result = handleApiResponse(
          response,
          'País adicionado com sucesso',
          'Erro ao adicionar país',
          'País adicionado com avisos',
        )
        if (result.success) {
          onOpenChange(false)
          setCreateValues({ codigo: '', nome: '', prefixo: '' })
          onSuccess?.()
        }
      }
    } catch {
      toast.error(
        mode === 'edit' ? 'Erro ao atualizar país' : 'Erro ao adicionar país',
      )
    }
  }

  const isSaving = createPaisMutation.isPending || updatePaisMutation.isPending

  const title = isView ? 'Países' : isEdit ? 'Editar País' : 'Adicionar País'

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
                <Label>Sigla</Label>
                <Input readOnly value={viewData.codigo ?? ''} className='bg-muted' />
              </div>
              <div className='grid gap-2'>
                <Label>Nome</Label>
                <Input readOnly value={viewData.nome ?? ''} className='bg-muted' />
              </div>
              <div className='grid gap-2'>
                <Label>Prefixo</Label>
                <Input
                  readOnly
                  value={viewData.prefixo ?? ''}
                  className='bg-muted'
                />
              </div>
            </>
          ) : (
            <>
              <div className='grid gap-2'>
                <Label>Sigla</Label>
                <Input
                  value={createValues.codigo}
                  onChange={(e) =>
                    setCreateValues((p) => ({ ...p, codigo: e.target.value }))
                  }
                  placeholder='Ex.: PT'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Nome</Label>
                <Input
                  value={createValues.nome}
                  onChange={(e) =>
                    setCreateValues((p) => ({ ...p, nome: e.target.value }))
                  }
                  placeholder='Nome do país'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Prefixo</Label>
                <Input
                  value={createValues.prefixo}
                  onChange={(e) =>
                    setCreateValues((p) => ({ ...p, prefixo: e.target.value }))
                  }
                  placeholder='Ex.: +351'
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

