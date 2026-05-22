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
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  admissaoId: string | null
  utenteLabel?: string
  listPermId: string
  readOnly?: boolean
  onSaved?: () => void
}

export function AdmissaoObservacoesModal({
  open,
  onOpenChange,
  admissaoId,
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
    if (!open || !admissaoId) {
      return
    }

    let cancelled = false
    setLoading(true)
    setTextoNovo('')
    setHistorico('')

    void AdmissaoAdministrativoService(listPermId)
      .getObservacoes(admissaoId)
      .then((res) => {
        if (cancelled) {
          return
        }
        if (res.info?.status === ResponseStatus.Success && res.info.data) {
          setHistorico(res.info.data.observacoes ?? '')
        } else {
          toast.error(res.info?.messages?.[0] ?? 'Não foi possível carregar observações.')
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Não foi possível carregar observações.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [open, admissaoId, listPermId])

  const handleGuardar = async () => {
    if (!admissaoId || readOnly) {
      return
    }
    if (!textoNovo.trim()) {
      onOpenChange(false)
      return
    }

    setSaving(true)
    try {
      const res = await AdmissaoAdministrativoService(listPermId).appendObservacao(
        admissaoId,
        { texto: textoNovo.trim() }
      )
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Observação registada.')
        onOpenChange(false)
        onSaved?.()
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Erro ao guardar observação.')
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
          <DialogTitle>Observações</DialogTitle>
        </DialogHeader>

        {utenteLabel ? (
          <p className='text-sm text-muted-foreground'>
            <span className='font-medium text-foreground'>Utente:</span> {utenteLabel}
          </p>
        ) : null}

        <div className='space-y-2'>
          <Label>Histórico</Label>
          <Textarea
            rows={8}
            readOnly
            disabled={loading}
            value={loading ? 'A carregar…' : historico}
            className='max-h-48 resize-none overflow-y-auto bg-muted/40 leading-relaxed whitespace-pre-wrap'
          />
        </div>

        {!readOnly ? (
          <div className='space-y-2'>
            <Label>Nova observação</Label>
            <Textarea
              rows={4}
              placeholder='Observações'
              value={textoNovo}
              onChange={(e) => setTextoNovo(e.target.value)}
              disabled={loading || saving}
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={saving}>
            {readOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!readOnly ? (
            <Button onClick={() => void handleGuardar()} disabled={loading || saving}>
              {saving ? 'A guardar…' : 'OK'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
