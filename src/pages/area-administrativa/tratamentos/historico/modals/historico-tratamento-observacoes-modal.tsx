import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { HistoricoTratamentoAdministrativoService } from '@/lib/services/tratamentos/historico-tratamento-administrativo-service/historico-tratamento-administrativo-client'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tratamentoId: string | null
  utenteLabel?: string
  listPermId: string
  readOnly?: boolean
  onSaved?: () => void
}

export function HistoricoTratamentoObservacoesModal({
  open,
  onOpenChange,
  tratamentoId,
  utenteLabel,
  listPermId,
  readOnly = false,
  onSaved,
}: Props) {
  const [historico, setHistorico] = useState('')
  const [textoNovo, setTextoNovo] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !tratamentoId) return

    let cancelled = false
    setLoading(true)
    setTextoNovo('')
    setHistorico('')

    void HistoricoTratamentoAdministrativoService(listPermId)
      .getObservacoes(tratamentoId)
      .then((res) => {
        if (cancelled) return
        if (res.info?.status === ResponseStatus.Success && res.info.data) {
          setHistorico(res.info.data.observacoes ?? '')
        } else {
          const msg =
            Object.values(res.info?.messages ?? {})
              .flat()
              .find(Boolean) ?? 'Não foi possível carregar observações.'
          toast.error(msg)
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Não foi possível carregar observações.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, tratamentoId, listPermId])

  const handleGuardar = async () => {
    if (!tratamentoId || readOnly || !textoNovo.trim()) return

    setSaving(true)
    try {
      const res = await HistoricoTratamentoAdministrativoService(
        listPermId
      ).appendObservacao(tratamentoId, { texto: textoNovo.trim() })
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Observação registada.')
        setTextoNovo('')
        onSaved?.()
        onOpenChange(false)
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .find(Boolean) ?? 'Não foi possível guardar.'
        toast.error(msg)
      }
    } catch {
      toast.error('Erro ao guardar observação.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            Observações{utenteLabel ? ` — ${utenteLabel}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          <div>
            <Label>Histórico</Label>
            <Textarea
              readOnly
              value={loading ? 'A carregar…' : historico}
              rows={8}
              className='mt-1'
            />
          </div>
          {!readOnly ? (
            <div>
              <Label>Nova observação</Label>
              <Textarea
                value={textoNovo}
                onChange={(e) => setTextoNovo(e.target.value)}
                rows={4}
                className='mt-1'
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          {!readOnly ? (
            <Button
              type='button'
              disabled={saving || loading || !textoNovo.trim()}
              onClick={() => void handleGuardar()}
            >
              {saving ? 'A guardar…' : 'Adicionar'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
