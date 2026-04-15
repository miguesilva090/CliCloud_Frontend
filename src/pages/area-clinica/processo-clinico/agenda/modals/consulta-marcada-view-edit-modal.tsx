import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'
import { MarcacaoConsultaService } from '@/lib/services/consultas/marcacao-consulta-service'
import type { UpdateMarcacaoConsultaBody } from '@/types/dtos/consultas/marcacao-consulta.dtos'
import type { ConsultaMarcadaRow } from '../types/consulta-marcada-types'

type ModalMode = 'view' | 'edit'

interface ConsultaMarcadaViewEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  rowData: ConsultaMarcadaRow | null
  onSuccess?: (updated?: ConsultaMarcadaRow) => void
}

export function ConsultaMarcadaViewEditModal({
  open,
  onOpenChange,
  mode,
  rowData,
  onSuccess,
}: ConsultaMarcadaViewEditModalProps) {
  const isView = mode === 'view'
  const queryClient = useQueryClient()
  const [editData, setEditData] = useState('')
  const [editHora, setEditHora] = useState('')
  const [editObs, setEditObs] = useState('')
  const [sendEmail, setSendEmail] = useState(false)

  useEffect(() => {
    if (open && rowData) {
      setEditData(rowData.data?.slice(0, 10) ?? '')
      setEditHora(rowData.horaMarcacao?.slice(0, 5) ?? rowData.horaMarcacaoLabel ?? '')
      setEditObs('')
      setSendEmail(false)
      if (rowData.id && mode === 'edit') {
        MarcacaoConsultaService().getMarcacaoConsulta(rowData.id).then((res) => {
          const full = res?.info?.data
          if (full) setEditObs((full as any).obs ?? '')
        }).catch(() => {})
      }
    }
  }, [open, rowData, mode])

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateMarcacaoConsultaBody }) => MarcacaoConsultaService().updateMarcacaoConsulta(id, body),
    onSuccess: (res) => {
      const status = res.info?.status
      if (status === ResponseStatus.Success) {
        toast.success('Marcação atualizada com sucesso.')
        queryClient.invalidateQueries({ queryKey: ['consultas-do-dia-marcacoes'] })
        onSuccess?.()
        onOpenChange(false)
      } else {
        const msgs = res.info?.messages
        const firstMsg = msgs ? Object.values(msgs).flat()[0] : 'Não foi possível atualizar a marcação.'
        toast.error(String(firstMsg))
      }
    },
    onError: (err) => { toast.error(err instanceof Error ? err.message : 'Erro ao atualizar marcação.') },
  })

  const handleGuardar = () => {
    if (isView || !rowData) return
    if (!editData) return toast.error('Indique a data.')
    if (!editHora) return toast.error('Indique a hora.')
    const body: UpdateMarcacaoConsultaBody = {
      utenteId: rowData.utenteId,
      consultaId: rowData.consultaId ?? undefined,
      medicoId: rowData.medicoId ?? undefined,
      especialidadeId: rowData.especialidadeId ?? undefined,
      data: editData,
      horaInic: editHora,
      horaFim: null,
      obs: editObs || null,
      organismoId: null,
      motivoConsultaId: rowData.motivoConsultaId ?? undefined,
      tipoAdmissaoId: rowData.tipoAdmissaoId ?? undefined,
      sendEmail,
    }
    updateMutation.mutate({ id: rowData.id, body })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isView ? 'Ver marcação' : 'Editar marcação'}</DialogTitle>
          <DialogDescription>{isView ? 'Detalhes da marcação de consulta' : 'Altere os dados da marcação'}</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'><Label>Nº Utente</Label><Input value={rowData?.utenteNumero ?? '—'} disabled readOnly /></div>
          <div className='grid gap-2'><Label>Nome utente</Label><Input value={rowData?.utenteNome ?? '—'} disabled readOnly /></div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'><Label>Data</Label><Input type='date' value={isView ? (rowData?.data?.slice(0, 10) ?? '') : editData} disabled={isView} readOnly={isView} onChange={(e) => setEditData(e.target.value)} /></div>
            <div className='grid gap-2'><Label>Hora</Label><Input type='time' value={isView ? (rowData?.horaMarcacao?.slice(0, 5) ?? rowData?.horaMarcacaoLabel ?? '') : editHora} disabled={isView} readOnly={isView} onChange={(e) => setEditHora(e.target.value)} /></div>
          </div>
          <div className='grid gap-2'><Label>Organismo</Label><Input value={rowData?.organismoNome ?? rowData?.organismoCodigo ?? '—'} disabled readOnly /></div>
          <div className='grid gap-2'><Label>Estado</Label><Input value={rowData?.statusConsultaLabel ?? '—'} disabled readOnly /></div>
          {!isView && <div className='grid gap-2'><Label>Observações</Label><Textarea className='min-h-[80px]' placeholder='Observações (opcional)' value={editObs} onChange={(e) => setEditObs(e.target.value)} /></div>}
          {!isView && (
            <div className='flex items-center gap-2'>
              <input
                id='consulta-send-email'
                type='checkbox'
                className='h-4 w-4'
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
              />
              <Label htmlFor='consulta-send-email'>Enviar email</Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>{isView ? 'Fechar' : 'Cancelar'}</Button>
          {!isView && <Button onClick={handleGuardar} disabled={updateMutation.isPending}>{updateMutation.isPending ? 'A guardar…' : 'Guardar'}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
