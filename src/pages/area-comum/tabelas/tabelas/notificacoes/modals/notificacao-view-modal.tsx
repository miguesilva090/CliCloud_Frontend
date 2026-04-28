import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { NotificacaoService } from '@/lib/services/notificacoes/notificacao-service'
import type { NotificacaoDTO } from '@/types/dtos/notificacoes/notificacao.dtos'
import { ResponseStatus } from '@/types/api/responses'
import state from '@/states/state'

function fmtData(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-PT')
}

interface NotificacaoViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notificacaoId: string | null
  /** 0=inbox — replica o comportamento de marcar ao ver quando aplicável. */
  listMode?: number
  onMarkedReadInvalidate?: () => void
}

export function NotificacaoViewModal({
  open,
  onOpenChange,
  notificacaoId,
  listMode = -1,
  onMarkedReadInvalidate,
}: NotificacaoViewModalProps) {
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<NotificacaoDTO | null>(null)
  const [error, setError] = useState<string | null>(null)
  const autoLidaFeita = useRef(false)

  useEffect(() => {
    autoLidaFeita.current = false
  }, [open, notificacaoId])

  useEffect(() => {
    if (!open || !notificacaoId) {
      setDetail(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    void (async () => {
      try {
        const res = await NotificacaoService().getNotificacaoById(notificacaoId)
        if (cancelled) return
        if (res.info.status === ResponseStatus.Success && res.info.data) {
          setDetail(res.info.data)
        } else {
          setError(res.info.messages?.['$']?.[0] ?? 'Não foi possível carregar.')
          setDetail(null)
        }
      } catch (e: unknown) {
        if (!cancelled)
          setError((e as Error)?.message ?? 'Erro ao carregar.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, notificacaoId])

  useEffect(() => {
    if (!detail || !open || autoLidaFeita.current) return
    if (listMode !== 0) return
    const uid = state.UserId?.trim().toLowerCase()
    const dest = detail.destinatarioUtilizadorId?.trim().toLowerCase()
    if (!uid || !dest || uid !== dest || detail.dataLeitura) return

    autoLidaFeita.current = true
    void (async () => {
      try {
        const res = await NotificacaoService().marcarComoLida(detail.id)
        if (res.info.status !== ResponseStatus.Success) return
        onMarkedReadInvalidate?.()
        const again = await NotificacaoService().getNotificacaoById(detail.id)
        if (again.info.status === ResponseStatus.Success && again.info.data) {
          setDetail(again.info.data)
        }
      } catch {
        autoLidaFeita.current = false
      }
    })()
  }, [detail, open, listMode, onMarkedReadInvalidate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader className='space-y-1 text-left'>
          <DialogTitle className='text-base font-semibold text-muted-foreground'>
            Detalhe da notificação
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className='text-sm text-muted-foreground'>A carregar…</p>
        ) : error ? (
          <p className='text-sm text-destructive'>{error}</p>
        ) : detail ? (
          <div className='space-y-4'>
            <div>
              <h2 className='text-lg font-semibold leading-snug text-foreground'>
                {detail.titulo?.trim() ? detail.titulo : 'Sem título'}
              </h2>
            </div>

            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <Label className='text-xs text-muted-foreground'>Tipo</Label>
                <p className='mt-0.5'>{detail.tipoDesignacao ?? '—'}</p>
              </div>
              <div>
                <Label className='text-xs text-muted-foreground'>Prioridade</Label>
                <p className='mt-0.5'>{detail.prioridadeDesignacao ?? '—'}</p>
              </div>
              <div>
                <Label className='text-xs text-muted-foreground'>Estado</Label>
                <p className='mt-0.5'>{detail.estadoDesignacao ?? '—'}</p>
              </div>
              <div>
                <Label className='text-xs text-muted-foreground'>Lida em</Label>
                <p className='mt-0.5'>{fmtData(detail.dataLeitura)}</p>
              </div>
            </div>

            <Separator />

            <div className='rounded-md border bg-muted/30 px-3 py-3'>
              <Label className='text-xs text-muted-foreground'>Descrição</Label>
              <p className='mt-2 whitespace-pre-wrap text-sm leading-relaxed'>
                {detail.descricao?.trim() ? detail.descricao : '—'}
              </p>
            </div>

            <div className='space-y-2 text-sm'>
              <div>
                <Label className='text-xs text-muted-foreground'>Alcance</Label>
                <p className='mt-0.5'>{detail.alcanceResumo ?? '—'}</p>
              </div>
              <div>
                <Label className='text-xs text-muted-foreground'>Enviado por</Label>
                <p className='mt-0.5'>Utilizador</p>
              </div>
            </div>

            <Separator />

            <div className='grid grid-cols-2 gap-3 text-sm text-muted-foreground'>
              <div>
                <Label className='text-xs'>Criada em</Label>
                <p className='mt-0.5 text-foreground'>{fmtData(detail.createdOn)}</p>
              </div>
              <div>
                <Label className='text-xs'>Última alteração</Label>
                <p className='mt-0.5 text-foreground'>{fmtData(detail.lastModifiedOn)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className='text-sm text-muted-foreground'>Sem dados.</p>
        )}
        <DialogFooter>
          <Button type='button' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
