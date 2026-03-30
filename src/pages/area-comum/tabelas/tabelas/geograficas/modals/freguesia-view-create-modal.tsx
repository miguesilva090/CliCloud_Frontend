import { useState, useEffect } from 'react'
import type { FreguesiaTableDTO } from '@/types/dtos/base/freguesias.dtos'
import type { CreateFreguesiaDTO } from '@/types/dtos/base/freguesias.dtos'
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
  useCreateFreguesia,
  useUpdateFreguesia,
} from '@/pages/base/freguesias/queries/freguesias-mutations'
import { useGetConcelhosSelect } from '@/pages/base/concelhos/queries/concelhos-queries'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'

type ModalMode = 'view' | 'create' | 'edit'

interface FreguesiaViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: FreguesiaTableDTO | null
  onSuccess?: () => void
}

export function FreguesiaViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: FreguesiaViewCreateModalProps) {
  const [createValues, setCreateValues] = useState<CreateFreguesiaDTO>({
    nome: '',
    concelhoId: '',
  })

  const createFreguesiaMutation = useCreateFreguesia()
  const updateFreguesiaMutation = useUpdateFreguesia()
  const { data: concelhosData } = useGetConcelhosSelect()
  const concelhos = concelhosData ?? []

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && mode === 'edit' && viewData) {
      setCreateValues({
        nome: viewData.nome ?? '',
        concelhoId: viewData.concelhoId ?? '',
      })
    }
    if (open && mode === 'create') {
      setCreateValues({ nome: '', concelhoId: '' })
    }
  }, [open, mode, viewData])

  const handleOk = () => {
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
    setCreateValues({ nome: '', concelhoId: '' })
  }

  const handleGuardar = async () => {
    if (!createValues.nome?.trim() || !createValues.concelhoId?.trim()) {
      toast.error('Preencha Nome e Concelho.')
      return
    }
    try {
      if (mode === 'edit' && viewData?.id) {
        const response = await updateFreguesiaMutation.mutateAsync({
          id: viewData.id,
          data: createValues,
        })
        const result = handleApiResponse(
          response,
          'Freguesia atualizada com sucesso',
          'Erro ao atualizar freguesia',
          'Freguesia atualizada com avisos',
        )
        if (result.success) {
          onOpenChange(false)
          setCreateValues({ nome: '', concelhoId: '' })
          onSuccess?.()
        }
      } else {
        const response = await createFreguesiaMutation.mutateAsync(createValues)
        const result = handleApiResponse(
          response,
          'Freguesia adicionada com sucesso',
          'Erro ao adicionar freguesia',
          'Freguesia adicionada com avisos',
        )
        if (result.success) {
          onOpenChange(false)
          setCreateValues({ nome: '', concelhoId: '' })
          onSuccess?.()
        }
      }
    } catch {
      toast.error(
        mode === 'edit'
          ? 'Erro ao atualizar freguesia'
          : 'Erro ao adicionar freguesia',
      )
    }
  }

  const isSaving =
    createFreguesiaMutation.isPending || updateFreguesiaMutation.isPending
  const title = isView
    ? 'Freguesias'
    : isEdit
      ? 'Editar Freguesia'
      : 'Adicionar Freguesia'

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
                <Label>Concelho</Label>
                <Input
                  readOnly
                  value={viewData.concelho?.nome ?? '-'}
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
                  placeholder='Nome da freguesia'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Concelho</Label>
                <Select
                  value={createValues.concelhoId || undefined}
                  onValueChange={(value) =>
                    setCreateValues((p) => ({ ...p, concelhoId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecionar concelho' />
                  </SelectTrigger>
                  <SelectContent>
                    {concelhos.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
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

