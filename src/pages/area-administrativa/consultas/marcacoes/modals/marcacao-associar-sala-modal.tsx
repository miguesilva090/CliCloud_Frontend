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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { SalaDisponivelDTO } from '@/types/dtos/consultas/marcacoes-administrativo.dtos'
import { toTimeSpan } from './marcacao-administrativo-form-utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  marcacaoId: string | null
  data: string
  horaInicio: string
  salaAtualNome?: string | null
  listPermId: string
  onSaved?: () => void
}

export function MarcacaoAssociarSalaModal({
  open,
  onOpenChange,
  marcacaoId,
  data,
  horaInicio,
  salaAtualNome,
  listPermId,
  onSaved,
}: Props) {
  const [salas, setSalas] = useState<SalaDisponivelDTO[]>([])
  const [salaId, setSalaId] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !marcacaoId || !data || !horaInicio) return

    let cancelled = false
    setLoading(true)
    setSalaId('')

    const hi = toTimeSpan(horaInicio)
    if (!hi) {
      setLoading(false)
      return
    }

    void MarcacoesAdministrativoService(listPermId)
      .getSalasDisponiveis({
        data: `${data.slice(0, 10)}T00:00:00`,
        horaInicio: hi,
      })
      .then((res) => {
        if (cancelled) return
        if (res.info?.status === ResponseStatus.Success && res.info.data) {
          setSalas(res.info.data)
        } else {
          toast.error(res.info?.messages?.[0] ?? 'Não foi possível carregar salas.')
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Erro ao carregar salas.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, marcacaoId, data, horaInicio, listPermId])

  const handleAssociar = async () => {
    if (!marcacaoId || !salaId) {
      toast.error('Selecione uma sala.')
      return
    }

    setSaving(true)
    try {
      const res = await MarcacoesAdministrativoService(listPermId).associarSala(marcacaoId, {
        salaId,
      })
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Sala associada.')
        onOpenChange(false)
        onSaved?.()
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível associar a sala.')
      }
    } catch {
      toast.error('Erro ao associar sala.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemover = async () => {
    if (!marcacaoId) return
    setSaving(true)
    try {
      const res = await MarcacoesAdministrativoService(listPermId).removerSala(marcacaoId)
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Sala removida.')
        onOpenChange(false)
        onSaved?.()
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível remover a sala.')
      }
    } catch {
      toast.error('Erro ao remover sala.')
    } finally {
      setSaving(false)
    }
  }

  const disponiveis = salas.filter((s) => s.disponivel)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Associar sala</DialogTitle>
        </DialogHeader>

        {salaAtualNome ? (
          <p className='text-sm text-muted-foreground'>
            Sala atual: <strong>{salaAtualNome}</strong>
          </p>
        ) : null}

        <div>
          <Label>Sala disponível</Label>
          {loading ? (
            <p className='mt-2 text-sm text-muted-foreground'>A carregar salas…</p>
          ) : (
            <Select value={salaId || '__none__'} onValueChange={(v) => setSalaId(v === '__none__' ? '' : v)}>
              <SelectTrigger className='mt-1'>
                <SelectValue placeholder='Selecionar…' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__none__'>—</SelectItem>
                {disponiveis.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nome} ({s.numeroSala})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!loading && disponiveis.length === 0 ? (
            <p className='mt-2 text-sm text-amber-800'>Sem salas livres neste horário.</p>
          ) : null}
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          {salaAtualNome ? (
            <Button type='button' variant='outline' disabled={saving} onClick={handleRemover}>
              Remover sala
            </Button>
          ) : null}
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' disabled={saving || !salaId} onClick={handleAssociar}>
            {saving ? 'A guardar…' : 'Associar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
