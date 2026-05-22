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
import { ListaEsperaAdministrativoService } from '@/lib/services/consultas/lista-espera-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  listaEsperaId: string | null
  utenteLabel?: string
  listPermId: string
  readOnly?: boolean
  onSaved?: () => void
}

export function ListaEsperaObservacoesModal({
  open,
  onOpenChange,
  listaEsperaId,
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
    if (!open || !listaEsperaId) return

    let cancelled = false
    setLoading(true)
    setTextoNovo('')
    setHistorico('')

    void ListaEsperaAdministrativoService(listPermId)
      .getObservacoes(listaEsperaId)
      .then((res) => {
        if (cancelled) return
        if (res.info?.status === ResponseStatus.Success && res.info.data) {
          setHistorico(res.info.data.observacoes ?? '')
        } else {
          toast.error(res.info?.messages?.[0] ?? 'Não foi possível carregar observações.')
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
  }, [open, listaEsperaId, listPermId])

  const handleGuardar = async () => {
    if (!listaEsperaId || readOnly || !textoNovo.trim()) return

    setSaving(true)
    try {
      const res = await ListaEsperaAdministrativoService(listPermId).appendObservacao(
        listaEsperaId,
        { texto: textoNovo.trim() }
      )
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Observação registada.')
        setTextoNovo('')
        onSaved?.()
        onOpenChange(false)
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível guardar.')
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
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {!readOnly ? (
            <Button
              type='button'
              disabled={saving || loading || !textoNovo.trim()}
              onClick={handleGuardar}
            >
              {saving ? 'A guardar…' : 'Adicionar'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
