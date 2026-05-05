import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { AtestadoDTO, AtestadoTableDTO } from '@/types/dtos/saude/atestados.dtos'
import { AtestadosService } from '@/lib/services/saude/atestados-service'
import { ResponseStatus } from '@/types/api/responses'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('pt-PT')
}

interface AtestadoViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rowData: AtestadoTableDTO | null
}

export function AtestadoViewModal({
  open,
  onOpenChange,
  rowData,
}: AtestadoViewModalProps) {
  const [detalhe, setDetalhe] = useState<AtestadoDTO | null>(null)
  const [loading, setLoading] = useState(false)

  const toStr = (v: unknown): string | null =>
    v != null && typeof v === 'string' ? v : null

  useEffect(() => {
    if (open && rowData?.id) {
      setLoading(true)
      AtestadosService('saude')
        .getAtestado(rowData.id)
        .then((res) => {
          if (res.info?.status === ResponseStatus.Success && res.info?.data) {
            const d = res.info.data as AtestadoDTO & Record<string, unknown>
            setDetalhe({
              id: (d.id ?? d.Id ?? rowData.id) as string,
              utenteId: (d.utenteId ?? d.UtenteId ?? rowData.utenteId) as string,
              medicoId: (d.medicoId ?? d.MedicoId ?? rowData.medicoId) as string,
              clinicaId: (d.clinicaId ?? d.ClinicaId ?? '') as string,
              codigoPostalId: toStr(d.codigoPostalId ?? d.CodigoPostalId),
              dataAtestado: (d.dataAtestado ?? d.DataAtestado ?? rowData.dataAtestado) as string,
              numeroSPMS: toStr(d.numeroSPMS ?? d.NumeroSPMS),
              estadoEnvio: (d.estadoEnvio ?? d.EstadoEnvio ?? rowData.estadoEnvio) as number,
              dataEnvio: toStr(d.dataEnvio ?? d.DataEnvio),
              observacoes: toStr(d.observacoes ?? d.Observacoes),
              numeroSNS: toStr(d.numeroSNS ?? d.NumeroSNS),
              createdOn: (d.createdOn ?? d.CreatedOn ?? '') as string,
              lastModifiedOn: toStr(d.lastModifiedOn ?? d.LastModifiedOn),
            })
          } else {
            setDetalhe(null)
          }
        })
        .catch(() => setDetalhe(null))
        .finally(() => setLoading(false))
    } else {
      setDetalhe(null)
    }
  }, [open, rowData?.id])

  const data = detalhe ?? rowData
  const nomeUtenteDisplay =
    rowData?.nomeUtente ??
    ((detalhe as AtestadoTableDTO | null)?.nomeUtente ?? null) ??
    (data as AtestadoTableDTO | null)?.nomeUtente ??
    data?.utenteId ??
    '—'

  const nomeMedicoDisplay =
    rowData?.nomeMedico ??
    ((detalhe as AtestadoTableDTO | null)?.nomeMedico ?? null) ??
    (data as AtestadoTableDTO | null)?.nomeMedico ??
    data?.medicoId ??
    '—'

  const estadoEnvioText =
    data?.estadoEnvio === 1
      ? 'Enviado'
      : data?.estadoEnvio === 0 || data?.estadoEnvio === 2
        ? 'Não enviado'
        : '—'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Ver atestado</DialogTitle>
          <DialogDescription>
            Detalhes do atestado
            {rowData?.numeroSNS ? ` (Nº SNS: ${rowData.numeroSNS})` : ''}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className='py-8 text-center text-muted-foreground'>
            A carregar...
          </div>
        ) : data ? (
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label className='text-muted-foreground'>Nº SNS</Label>
              <p className='text-sm'>{data.numeroSNS ?? '—'}</p>
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted-foreground'>Data atestado</Label>
              <p className='text-sm'>{formatDate(data.dataAtestado)}</p>
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted-foreground'>Utente</Label>
              <p className='text-sm'>{nomeUtenteDisplay}</p>
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted-foreground'>Médico</Label>
              <p className='text-sm'>{nomeMedicoDisplay}</p>
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted-foreground'>Estado envio</Label>
              <p className='text-sm'>{estadoEnvioText}</p>
            </div>
            {detalhe?.observacoes ? (
              <div className='grid gap-2'>
                <Label className='text-muted-foreground'>Observações</Label>
                <p className='text-sm'>{detalhe.observacoes}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className='py-8 text-center text-muted-foreground'>
            Não foi possível carregar os detalhes.
          </div>
        )}
        <div className='flex justify-end'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
