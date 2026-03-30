import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { AsyncCombobox, type ComboboxItem } from '@/components/shared/async-combobox'
import { AlergiaService } from '@/lib/services/alergias/alergia-service'
import { AlergiaUtenteService } from '@/lib/services/alergias/alergia-utente-service'
import { useInvalidateAlergiasUtente } from '../queries/alergias-utente-queries'
import { toast } from '@/utils/toast-utils'
import { Plus } from 'lucide-react'
import type { AlergiaUtenteDTO } from '@/types/dtos/alergias/alergia-utente.dtos'
import { AlergiaViewCreateModal } from '@/pages/area-comum/tabelas/consultas/alergias/modals/alergia-view-create-modal'

function toDateOnlyStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface AlergiasUtenteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  utenteId: string
  /** Quando definido, o modal abre em modo edição para esta entrada. */
  editData?: AlergiaUtenteDTO | null
  onSuccess?: () => void
}

export function AlergiasUtenteModal({
  open,
  onOpenChange,
  utenteId,
  editData,
  onSuccess,
}: AlergiasUtenteModalProps) {
  const queryClient = useQueryClient()
  const [alergiaId, setAlergiaId] = useState('')
  const [alergiaSearch, setAlergiaSearch] = useState('')
  const [dataDesde, setDataDesde] = useState<Date | undefined>()
  const [dataAte, setDataAte] = useState<Date | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const [createAlergiaOpen, setCreateAlergiaOpen] = useState(false)
  const invalidate = useInvalidateAlergiasUtente()
  const isEdit = Boolean(editData?.id)

  const { data: alergiasResponse, isLoading: isLoadingAlergias } = useQuery({
    queryKey: ['alergias-light', alergiaSearch],
    queryFn: () => AlergiaService().getAlergiasLight(alergiaSearch || undefined),
    enabled: open,
    staleTime: 60 * 1000,
  })

  const baseItems: ComboboxItem[] =
    (alergiasResponse?.info?.data ?? []).map((a: { id: string; descricao?: string | null }) => ({
      value: a.id,
      label: a.descricao ?? '',
    })) ?? []
  const alergiasItems =
    isEdit && editData?.alergiaId && editData?.alergiaDescricao
      ? baseItems.some((i) => i.value === editData.alergiaId)
        ? baseItems
        : [{ value: editData.alergiaId, label: editData.alergiaDescricao }, ...baseItems]
      : baseItems

  useEffect(() => {
    if (!open) {
      setAlergiaId('')
      setAlergiaSearch('')
      setDataDesde(undefined)
      setDataAte(undefined)
    } else if (editData) {
      setAlergiaId(editData.alergiaId ?? '')
      setAlergiaSearch(editData.alergiaDescricao ?? '')
      setDataDesde(editData.dataDesde ? new Date(editData.dataDesde) : undefined)
      setDataAte(editData.dataAte ? new Date(editData.dataAte) : undefined)
    }
  }, [open, editData])

  const handleGuardar = async () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }
    if (!alergiaId) {
      toast.error('Selecione uma alergia.')
      return
    }
    setIsSaving(true)
    const payload = {
      utenteId,
      alergiaId,
      dataDesde: dataDesde ? toDateOnlyStr(dataDesde) : undefined,
      dataAte: dataAte ? toDateOnlyStr(dataAte) : undefined,
    }
    try {
      const resp = isEdit && editData
        ? await AlergiaUtenteService().updateAlergiaUtente(editData.id, payload)
        : await AlergiaUtenteService().createAlergiaUtente(payload)
      if (resp.info?.data !== undefined) {
        toast.success(isEdit ? 'Alergia do utente atualizada.' : 'Alergia do utente guardada.')
        invalidate()
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg = (resp.info as { messages?: Record<string, string[]> })?.messages
        toast.error(msg ? Object.values(msg).flat().join(' ') : 'Erro ao guardar.')
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao guardar.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar alergia do utente' : 'Alergias do Utente'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Altere a alergia ou as datas desde/até e guarde.'
              : 'Adicione uma alergia ao utente. Selecione a alergia e, se quiser, as datas desde/até.'}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='flex gap-2 items-end'>
            <div className='flex-1 space-y-2'>
              <Label>Alergia</Label>
              <AsyncCombobox
                value={alergiaId}
                onChange={setAlergiaId}
                items={alergiasItems}
                isLoading={isLoadingAlergias}
                placeholder='Alergia'
                searchPlaceholder='Pesquisar alergia…'
                emptyText='Nenhuma alergia encontrada.'
                searchValue={alergiaSearch}
                onSearchValueChange={setAlergiaSearch}
              />
            </div>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='shrink-0'
              title='Criar nova alergia'
              onClick={() => {
                setCreateAlergiaOpen(true)
              }}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Desde</Label>
              <DatePicker
                value={dataDesde}
                onChange={setDataDesde}
                placeholder='Desde'
                displayFormat='dd/MM/yyyy'
              />
            </div>
            <div className='space-y-2'>
              <Label>Até</Label>
              <DatePicker
                value={dataAte}
                onChange={setDataAte}
                placeholder='Até'
                displayFormat='dd/MM/yyyy'
              />
            </div>
          </div>
        </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button type='button' onClick={handleGuardar} disabled={isSaving}>
              {isSaving ? 'A guardar…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlergiaViewCreateModal
        open={createAlergiaOpen}
        onOpenChange={setCreateAlergiaOpen}
        mode='create'
        viewData={null}
        onSuccess={() => {
          setCreateAlergiaOpen(false)
          queryClient.invalidateQueries({ queryKey: ['alergias-light'] })
        }}
      />
    </>
  )
}
