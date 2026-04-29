import { useEffect, useMemo, useState } from 'react'
import type { RuaTableDTO, CreateRuaDTO } from '@/types/dtos/base/ruas.dtos'
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
import { useCreateRua, useUpdateRua } from '@/pages/base/ruas/queries/ruas-mutations'
import { useGetFreguesiasSelect } from '@/pages/base/freguesias/queries/freguesias-queries'
import { useGetCodigosPostaisSelect } from '@/pages/base/codigospostais/queries/codigospostais-queries'
import {
  useConcelhosLight,
  useDistritosLight,
} from '@/lib/services/utility/lookups/lookups-queries'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'

type ModalMode = 'view' | 'create' | 'edit'

interface RuaViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: RuaTableDTO | null
  onSuccess?: () => void
  context?: {
    paisId?: string
    distritoId?: string
    concelhoId?: string
    freguesiaId?: string
    codigoPostalId?: string
  }
}

export function RuaViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
  context,
}: RuaViewCreateModalProps) {
  const [createValues, setCreateValues] = useState<CreateRuaDTO>({
    nome: '',
    freguesiaId: '',
    codigoPostalId: '',
  })

  const createRuaMutation = useCreateRua()
  const updateRuaMutation = useUpdateRua()
  const { data: freguesiasData } = useGetFreguesiasSelect()
  const distritosQuery = useDistritosLight('')
  const concelhosQuery = useConcelhosLight('')
  const { data: codigosPostaisData } = useGetCodigosPostaisSelect()
  const freguesias = freguesiasData ?? []
  const distritos = distritosQuery.data?.info?.data ?? []
  const concelhos = concelhosQuery.data?.info?.data ?? []
  const codigosPostais = codigosPostaisData ?? []

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const freguesiasFiltradas = useMemo(() => {
    const paisId = context?.paisId?.trim()
    const distritoId = context?.distritoId?.trim()
    const concelhoId = context?.concelhoId?.trim()

    if (concelhoId) {
      return freguesias.filter((f) => String(f.concelhoId ?? '') === concelhoId)
    }

    if (distritoId) {
      const concelhosDoDistrito = new Set(
        concelhos
          .filter((c: { distritoId?: string | null }) => String(c.distritoId ?? '') === distritoId)
          .map((c: { id?: string | null }) => String(c.id ?? ''))
      )
      return freguesias.filter((f) => concelhosDoDistrito.has(String(f.concelhoId ?? '')))
    }

    if (paisId) {
      const distritosDoPais = new Set(
        distritos
          .filter((d: { paisId?: string | null }) => String(d.paisId ?? '') === paisId)
          .map((d: { id?: string | null }) => String(d.id ?? ''))
      )
      const concelhosDoPais = new Set(
        concelhos
          .filter((c: { distritoId?: string | null }) => distritosDoPais.has(String(c.distritoId ?? '')))
          .map((c: { id?: string | null }) => String(c.id ?? ''))
      )
      return freguesias.filter((f) => concelhosDoPais.has(String(f.concelhoId ?? '')))
    }

    return freguesias
  }, [context?.paisId, context?.distritoId, context?.concelhoId, freguesias, distritos, concelhos])

  useEffect(() => {
    if (open && mode === 'edit' && viewData) {
      setCreateValues({
        nome: viewData.nome ?? '',
        freguesiaId: viewData.freguesiaId ?? '',
        codigoPostalId: viewData.codigoPostalId ?? '',
      })
    }
    if (open && mode === 'create') {
      setCreateValues({
        nome: '',
        freguesiaId: context?.freguesiaId?.trim() ?? '',
        codigoPostalId: context?.codigoPostalId?.trim() ?? '',
      })
    }
  }, [open, mode, viewData, context?.freguesiaId, context?.codigoPostalId])

  const handleOk = () => onOpenChange(false)

  const handleCancel = () => {
    onOpenChange(false)
    setCreateValues({ nome: '', freguesiaId: '', codigoPostalId: '' })
  }

  const handleGuardar = async () => {
    if (
      !createValues.nome?.trim() ||
      !createValues.freguesiaId?.trim() ||
      !createValues.codigoPostalId?.trim()
    ) {
      toast.error('Preencha Nome, Freguesia e Código Postal.')
      return
    }
    try {
      if (mode === 'edit' && viewData?.id) {
        const response = await updateRuaMutation.mutateAsync({
          id: viewData.id,
          data: createValues,
        })
        const result = handleApiResponse(
          response,
          'Rua atualizada com sucesso',
          'Erro ao atualizar rua',
          'Rua atualizada com avisos'
        )
        if (result.success) {
          onOpenChange(false)
          setCreateValues({ nome: '', freguesiaId: '', codigoPostalId: '' })
          onSuccess?.()
        }
      } else {
        const response = await createRuaMutation.mutateAsync(createValues)
        const result = handleApiResponse(
          response,
          'Rua adicionada com sucesso',
          'Erro ao adicionar rua',
          'Rua adicionada com avisos'
        )
        if (result.success) {
          onOpenChange(false)
          setCreateValues({ nome: '', freguesiaId: '', codigoPostalId: '' })
          onSuccess?.()
        }
      }
    } catch {
      toast.error(mode === 'edit' ? 'Erro ao atualizar rua' : 'Erro ao adicionar rua')
    }
  }

  const isSaving = createRuaMutation.isPending || updateRuaMutation.isPending
  const title = isView ? 'Ruas' : isEdit ? 'Editar Rua' : 'Adicionar Rua'

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
                <Label>Freguesia</Label>
                <Input
                  readOnly
                  value={viewData.freguesia?.nome ?? '-'}
                  className='bg-muted'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Código Postal</Label>
                <Input
                  readOnly
                  value={viewData.codigoPostal?.codigo ?? '-'}
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
                  placeholder='Nome da rua'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Freguesia</Label>
                <Select
                  value={createValues.freguesiaId || undefined}
                  onValueChange={(value) =>
                    setCreateValues((p) => ({ ...p, freguesiaId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecionar freguesia' />
                  </SelectTrigger>
                  <SelectContent>
                    {freguesiasFiltradas.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label>Código Postal</Label>
                <Select
                  value={createValues.codigoPostalId || undefined}
                  onValueChange={(value) =>
                    setCreateValues((p) => ({ ...p, codigoPostalId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecionar código postal' />
                  </SelectTrigger>
                  <SelectContent>
                    {codigosPostais.map((cp) => (
                      <SelectItem key={cp.id} value={cp.id}>
                        {cp.codigo}
                        {cp.localidade ? ` - ${cp.localidade}` : ''}
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
