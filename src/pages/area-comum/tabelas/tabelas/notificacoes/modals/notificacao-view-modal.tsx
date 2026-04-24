import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { NotificacaoService } from '@/lib/services/notificacoes/notificacao-service'
import type { NotificacaoDTO } from '@/types/dtos/notificacoes/notificacao.dtos'
import { ResponseStatus } from '@/types/api/responses'

interface NotificacaoViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notificacaoId: string | null
}

export function NotificacaoViewModal({
  open,
  onOpenChange,
  notificacaoId,
}: NotificacaoViewModalProps) {
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<NotificacaoDTO | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Notificação</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className='text-sm text-muted-foreground'>A carregar…</p>
        ) : error ? (
          <p className='text-sm text-destructive'>{error}</p>
        ) : detail ? (
          <div className='grid gap-3 py-2 text-sm'>
            <div>
              <Label className='text-muted-foreground'>Título</Label>
              <p className='font-medium'>{detail.titulo}</p>
            </div>
            {detail.descricao ? (
              <div>
                <Label className='text-muted-foreground'>Descrição</Label>
                <p className='whitespace-pre-wrap'>{detail.descricao}</p>
              </div>
            ) : null}
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <Label className='text-muted-foreground'>Tipo</Label>
                <p>{detail.tipoDesignacao ?? '—'}</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Estado</Label>
                <p>{detail.estado}</p>
              </div>
            </div>
            <div>
              <Label className='text-muted-foreground'>Criada em</Label>
              <p>{detail.createdOn}</p>
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
