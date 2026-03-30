import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import type { AparelhoTableDTO } from '@/types/dtos/aparelho/aparelho.dtos'
import type { TipoAparelhoLightDTO } from '@/types/dtos/tipo-aparelho/tipo-aparelho.dtos'
import type { ModeloAparelhoLightDTO } from '@/types/dtos/modelo-aparelho/modelo-aparelho.dtos'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/utils/toast-utils'
import { AparelhoService } from '@/lib/services/aparelho'
import { TipoAparelhoService } from '@/lib/services/tipo-aparelho'
import { ModeloAparelhoService } from '@/lib/services/modelo-aparelho'
import { ResponseStatus } from '@/types/api/responses'
import { MarcasAparelhoViewCreateModal } from '../../marcas-aparelho/modals/marcas-aparelho-view-create-modal'
import { ModelosAparelhoViewCreateModal } from '../../modelos-aparelho/modals/modelos-aparelho-view-create-modal'

type ModalMode = 'view' | 'create' | 'edit'

interface AparelhosViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: AparelhoTableDTO | null
  onSuccess?: () => void
}

export function AparelhosViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: AparelhosViewCreateModalProps) {
  const [tipoAparelhoId, setTipoAparelhoId] = useState('')
  const [modeloAparelhoId, setModeloAparelhoId] = useState<string | null>(null)
  const [codigoSerie, setCodigoSerie] = useState('')
  const [codigoInventario, setCodigoInventario] = useState('')
  const [local, setLocal] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [tipos, setTipos] = useState<TipoAparelhoLightDTO[]>([])
  const [modelos, setModelos] = useState<ModeloAparelhoLightDTO[]>([])
  const [modalMarcaOpen, setModalMarcaOpen] = useState(false)
  const [modalModeloOpen, setModalModeloOpen] = useState(false)

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  // Marca é sempre derivada do modelo selecionado — só leitura, não editável
  const marcaDisplay =
    modeloAparelhoId
      ? (modelos.find((m) => m.id === modeloAparelhoId) as { marcaAparelhoDesignacao?: string } | undefined)?.marcaAparelhoDesignacao ??
        (viewData && (isView || isEdit) ? (viewData as { marcaAparelhoDesignacao?: string }).marcaAparelhoDesignacao : null) ??
        ''
      : (viewData && (isView || isEdit) ? (viewData as { marcaAparelhoDesignacao?: string }).marcaAparelhoDesignacao : null) ?? ''

  useEffect(() => {
    if (open) {
      TipoAparelhoService()
        .getTipoAparelhoLight()
        .then((r) => {
          const data = (r.info as { data?: TipoAparelhoLightDTO[] })?.data ?? []
          setTipos(Array.isArray(data) ? data : [])
        })
        .catch(() => setTipos([]))
      ModeloAparelhoService()
        .getModeloAparelhoLight()
        .then((r) => {
          const data = (r.info as { data?: ModeloAparelhoLightDTO[] })?.data ?? []
          setModelos(Array.isArray(data) ? data : [])
        })
        .catch(() => setModelos([]))
    }
  }, [open])

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setTipoAparelhoId((viewData as { tipoAparelhoId?: string }).tipoAparelhoId ?? (viewData as { TipoAparelhoId?: string }).TipoAparelhoId ?? '')
      const mid = (viewData as { modeloAparelhoId?: string | null }).modeloAparelhoId ?? (viewData as { ModeloAparelhoId?: string | null }).ModeloAparelhoId ?? null
      setModeloAparelhoId(mid ?? null)
      setCodigoSerie((viewData as { codigoSerie?: string }).codigoSerie ?? (viewData as { CodigoSerie?: string }).CodigoSerie ?? '')
      setCodigoInventario((viewData as { codigoInventario?: string }).codigoInventario ?? (viewData as { CodigoInventario?: string }).CodigoInventario ?? '')
      setLocal((viewData as { local?: string }).local ?? (viewData as { Local?: string }).Local ?? '')
      setObservacoes((viewData as { observacoes?: string }).observacoes ?? (viewData as { Observacoes?: string }).Observacoes ?? '')
      setOcupado((viewData as { ocupado?: boolean }).ocupado ?? (viewData as { Ocupado?: boolean }).Ocupado ?? false)
    }
    if (open && mode === 'create') {
      setTipoAparelhoId('')
      setModeloAparelhoId(null)
      setCodigoSerie('')
      setCodigoInventario('')
      setLocal('')
      setObservacoes('')
      setOcupado(false)
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleGuardar = async () => {
    if (isView) return
    if (!tipoAparelhoId) {
      toast.error('Tipo de aparelho é obrigatório.')
      return
    }
    try {
      const client = AparelhoService()
      const rawId = viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId = typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''
      const body = {
        tipoAparelhoId,
        modeloAparelhoId: modeloAparelhoId && modeloAparelhoId.trim() ? modeloAparelhoId.trim() : null,
        codigoSerie: codigoSerie.trim() || null,
        codigoInventario: codigoInventario.trim() || null,
        local: local.trim() || null,
        observacoes: observacoes.trim() || null,
        ocupado,
      }
      if (isEdit && editId) {
        const response = await client.updateAparelho(editId, body)
        const status = (response.info as { status?: number })?.status
        if (status === ResponseStatus.Success) {
          toast.success('Aparelho atualizado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg = (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ?? 'Falha ao atualizar.'
          toast.error(msg)
        }
      } else {
        const response = await client.createAparelho(body)
        const status = (response.info as { status?: number })?.status
        if (status === ResponseStatus.Success) {
          toast.success('Aparelho criado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg = (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ?? 'Falha ao criar.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message ?? 'Erro ao guardar.')
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Aparelho</DialogTitle>
          <DialogDescription className='sr-only'>Ver/criar/editar aparelho.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Tipo de Aparelho</Label>
            <Select disabled={isView} value={tipoAparelhoId} onValueChange={setTipoAparelhoId}>
              <SelectTrigger><SelectValue placeholder='Selecionar tipo...' /></SelectTrigger>
              <SelectContent>
                {tipos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {(t as { designacao?: string }).designacao ?? (t as { Designacao?: string }).Designacao ?? t.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>Modelo</Label>
            <div className='flex gap-1.5'>
              <Select
                disabled={isView}
                value={modeloAparelhoId ?? undefined}
                onValueChange={(v) => setModeloAparelhoId(v && v.trim() ? v : null)}
              >
                <SelectTrigger className='flex-1 min-w-0'><SelectValue placeholder='Selecionar modelo (opcional)...' /></SelectTrigger>
                <SelectContent>
                  {modelos.filter((m) => m.id != null && String(m.id).trim() !== '').map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {(m as { designacao?: string }).designacao ?? (m as { Designacao?: string }).Designacao ?? m.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isView && (
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='shrink-0 h-9 w-9'
                  title='Adicionar modelo'
                  onClick={() => setModalModeloOpen(true)}
                >
                  <Plus className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>
          <div className='grid gap-2'>
            <Label>Marca</Label>
            <div className='flex gap-1.5'>
              <Input
                readOnly
                disabled
                value={marcaDisplay}
                placeholder="Preenchido ao escolher um modelo"
                className="bg-muted cursor-not-allowed flex-1 min-w-0"
              />
              {!isView && (
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='shrink-0 h-9 w-9'
                  title='Adicionar marca'
                  onClick={() => setModalMarcaOpen(true)}
                >
                  <Plus className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>
          <div className='grid gap-2'>
            <Label>Código Série</Label>
            <Input readOnly={isView} value={codigoSerie} maxLength={50} placeholder='Código série...' onChange={(e) => setCodigoSerie(e.target.value)} />
          </div>
          <div className='grid gap-2'>
            <Label>Código Inventário</Label>
            <Input readOnly={isView} value={codigoInventario} maxLength={50} placeholder='Código inventário...' onChange={(e) => setCodigoInventario(e.target.value)} />
          </div>
          <div className='grid gap-2'>
            <Label>Local</Label>
            <Input readOnly={isView} value={local} maxLength={100} placeholder='Local...' onChange={(e) => setLocal(e.target.value)} />
          </div>
          <div className='grid gap-2'>
            <Label>Observações</Label>
            <Input readOnly={isView} value={observacoes} maxLength={500} placeholder='Observações...' onChange={(e) => setObservacoes(e.target.value)} />
          </div>
          <div className='flex items-center gap-2'>
            <Checkbox id='ocupado' checked={ocupado} disabled={isView} onCheckedChange={(c) => setOcupado(!!c)} />
            <Label htmlFor='ocupado'>Ocupado</Label>
          </div>
        </div>
        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={() => onOpenChange(false)}>OK</Button>
          ) : (
            <>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type='button' onClick={handleGuardar}>Guardar</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <>
      <MarcasAparelhoViewCreateModal
        open={modalMarcaOpen}
        onOpenChange={setModalMarcaOpen}
        mode='create'
        viewData={null}
        onSuccess={() => setModalMarcaOpen(false)}
      />
      <ModelosAparelhoViewCreateModal
        open={modalModeloOpen}
        onOpenChange={setModalModeloOpen}
        mode='create'
        viewData={null}
        onSuccess={() => {
          setModalModeloOpen(false)
          ModeloAparelhoService()
            .getModeloAparelhoLight()
            .then((r) => {
              const data = (r.info as { data?: ModeloAparelhoLightDTO[] })?.data ?? []
              setModelos(Array.isArray(data) ? data : [])
            })
            .catch(() => setModelos([]))
        }}
      />
    </>
    </>
  )
}
