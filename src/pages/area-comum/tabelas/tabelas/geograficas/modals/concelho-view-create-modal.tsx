import { useState, useEffect } from 'react'
import type { ConcelhoTableDTO } from '@/types/dtos/base/concelhos.dtos'
import type { CreateConcelhoDTO } from '@/types/dtos/base/concelhos.dtos'
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
  useCreateConcelho,
  useUpdateConcelho,
} from '@/pages/base/concelhos/queries/concelhos-mutations'
import { useGetDistritosSelect } from '@/pages/base/distritos/queries/distritos-queries'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'

type ModalMode = 'view' | 'create' | 'edit'

interface ConcelhoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: ConcelhoTableDTO | null
  onSuccess?: () => void
}

export function ConcelhoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: ConcelhoViewCreateModalProps) {
  const [createValues, setCreateValues] = useState<CreateConcelhoDTO>({
    nome: '',
    distritoId: '',
  })

  const createConcelhoMutation = useCreateConcelho()
  const updateConcelhoMutation = useUpdateConcelho()
  const { data: distritosData } = useGetDistritosSelect()
  const distritos = distritosData ?? []

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && mode === 'edit' && viewData) {
      setCreateValues({
        nome: viewData.nome ?? '',
        distritoId: viewData.distritoId ?? '',
      })
    }
    if (open && mode === 'create') {
      setCreateValues({ nome: '', distritoId: '' })
    }
  }, [open, mode, viewData])

  const handleOk = () => {
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
    setCreateValues({ nome: '', distritoId: '' })
  }

  const handleGuardar = async () => {
    if (!createValues.nome?.trim() || !createValues.distritoId?.trim()) {
      toast.error('Preencha Nome e Distrito.')
      return
    }
    try {
      if (mode === 'edit' && viewData?.id) {
        const response = await updateConcelhoMutation.mutateAsync({
          id: viewData.id,
          data: createValues,
        })
        const result = handleApiResponse(
          response,
          'Concelho atualizado com sucesso',
          'Erro ao atualizar concelho',
          'Concelho atualizado com avisos',
        )
        if (result.success) {
          onOpenChange(false)
          setCreateValues({ nome: '', distritoId: '' })
          onSuccess?.()
        }
      } else {
        const response = await createConcelhoMutation.mutateAsync(createValues)
        const result = handleApiResponse(
          response,
          'Concelho adicionado com sucesso',
          'Erro ao adicionar concelho',
          'Concelho adicionado com avisos',
        )
        if (result.success) {
          onOpenChange(false)
          setCreateValues({ nome: '', distritoId: '' })
          onSuccess?.()
        }
      }
    } catch {
      toast.error(
        mode === 'edit'
          ? 'Erro ao atualizar concelho'
          : 'Erro ao adicionar concelho',
      )
    }
  }

  const isSaving =
    createConcelhoMutation.isPending || updateConcelhoMutation.isPending
  const title = isView
    ? 'Concelhos'
    : isEdit
      ? 'Editar Concelho'
      : 'Adicionar Concelho'

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
                <Label>Distrito</Label>
                <Input
                  readOnly
                  value={viewData.distrito?.nome ?? '-'}
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
                  placeholder='Nome do concelho'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Distrito</Label>
                <Select
                  value={createValues.distritoId || undefined}
                  onValueChange={(value) =>
                    setCreateValues((p) => ({ ...p, distritoId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecionar distrito' />
                  </SelectTrigger>
                  <SelectContent>
                    {distritos.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nome}
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

