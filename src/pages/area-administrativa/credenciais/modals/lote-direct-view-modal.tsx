import { useEffect, useState } from 'react'
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
import { LoteDirectService } from '@/lib/services/credenciais/lote-direct-service'
import { useLoteDirectFuncionalidadeId } from '../queries/listagem-lote-direct-queries'
import type { LoteDirectDTO } from '@/types/dtos/credenciais/lote-direct.dtos'
import { ResponseStatus } from '@/types/api/responses'

function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-PT')
}

function formatMoney(value?: number | null): string {
  if (value == null) return '—'
  return Number(value).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='grid grid-cols-[10rem_1fr] gap-2 text-sm'>
      <Label className='text-muted-foreground'>{label}</Label>
      <span>{value}</span>
    </div>
  )
}

export function LoteDirectViewModal({
  open,
  onOpenChange,
  loteId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  loteId: string | null
}) {
  const listPermId = useLoteDirectFuncionalidadeId()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<LoteDirectDTO | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !loteId) {
      setDetail(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const response = await LoteDirectService(listPermId).getById(loteId)
        if (cancelled) return

        if (response.info.status === ResponseStatus.Success && response.info.data) {
          setDetail(response.info.data)
        } else {
          setDetail(null)
          setError(response.info.messages?.['$']?.[0] ?? 'Não foi possível carregar o lote.')
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setDetail(null)
          setError((e as Error)?.message ?? 'Erro ao carregar o lote.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, loteId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Lote de credenciais</DialogTitle>
          <DialogDescription className='sr-only'>
            Detalhe do lançamento de credenciais.
          </DialogDescription>
        </DialogHeader>

        {loading ? <p className='text-sm text-muted-foreground'>A carregar...</p> : null}
        {error ? <p className='text-sm text-destructive'>{error}</p> : null}

        {detail ? (
          <div className='space-y-2'>
            <DetailRow label='Credencial' value={detail.credencial || '—'} />
            <DetailRow label='Utente' value={detail.utenteNome || '—'} />
            <DetailRow label='Mês/Ano' value={detail.mesAno || '—'} />
            <DetailRow
              label='N.º Lote'
              value={detail.numeroLote != null ? String(detail.numeroLote) : '—'}
            />
            <DetailRow
              label='Índice'
              value={detail.indiceLote != null ? String(detail.indiceLote) : '—'}
            />
            <DetailRow
              label='Organismo'
              value={
                detail.organismoSigla?.trim()
                  ? detail.organismoSigla.trim()
                  : detail.codigoOrganismo != null
                    ? String(detail.codigoOrganismo)
                    : '—'
              }
            />
            <DetailRow label='Data início' value={formatDate(detail.dataInicio)} />
            <DetailRow label='Data fim' value={formatDate(detail.dataFim)} />
            <DetailRow label='Taxas' value={formatMoney(detail.valorTaxas)} />
            <DetailRow label='Total' value={formatMoney(detail.valorTotal)} />
            <DetailRow
              label='Histórico'
              value={detail.historico ? 'Sim' : 'Não'}
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}