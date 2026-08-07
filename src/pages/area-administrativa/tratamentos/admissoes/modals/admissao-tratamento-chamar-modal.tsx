import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChamadaUtentesService } from '@/lib/services/core/chamada-utentes-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { AdmissaoTratamentoTableDTO } from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: AdmissaoTratamentoTableDTO | null
  listPermId: string
}

export function AdmissaoTratamentoChamarModal({
  open,
  onOpenChange,
  row,
  listPermId,
}: Props) {
  const [sala, setSala] = useState('')
  const [tecnico, setTecnico] = useState('')
  const [nomeUtente, setNomeUtente] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !row?.id) return

    setLoading(true)
    void (async () => {
      try {
        const res = await ChamadaUtentesService(listPermId).getDadosChamadaTratamento(
          row.id,
          false
        )
        const d = res.info?.data
        if (res.info?.status !== ResponseStatus.Success || !d) {
          toast.error('Não foi possível obter dados para chamar.')
          onOpenChange(false)
          return
        }
        if (d.existeChamadaAtiva) {
          toast.error('Já existe uma chamada pendente para a consulta.')
          onOpenChange(false)
          return
        }
        if (d.existeChamadaFeita) {
          const ok = window.confirm(
            'Já existe uma chamada efetuada para a sessão, deseja chamar outra vez?'
          )
          if (!ok) {
            onOpenChange(false)
            return
          }
          const res2 = await ChamadaUtentesService(listPermId).getDadosChamadaTratamento(
            row.id,
            true
          )
          const d2 = res2.info?.data
          if (!d2) {
            onOpenChange(false)
            return
          }
          setNomeUtente(d2.nomeUtente)
          setSala(d2.sala ?? row.localTratamentoNome ?? '')
          setTecnico(
            d2.nomeProfissional
              ?? row.fisioterapeutaNome
              ?? row.auxiliarNome
              ?? row.outroTecnicoNome
              ?? ''
          )
          return
        }
        setNomeUtente(d.nomeUtente)
        setSala(d.sala ?? row.localTratamentoNome ?? '')
        setTecnico(
          d.nomeProfissional
            ?? row.fisioterapeutaNome
            ?? row.auxiliarNome
            ?? row.outroTecnicoNome
            ?? ''
        )
      } catch {
        toast.error('Erro ao carregar dados da chamada.')
        onOpenChange(false)
      } finally {
        setLoading(false)
      }
    })()
  }, [open, row, listPermId, onOpenChange])

  const handleChamar = async () => {
    if (!row?.id) return
    if (!sala.trim()) {
      toast.error('Indique a sala.')
      return
    }
    if (!tecnico.trim()) {
      toast.error('É necessário escolher um técnico')
      return
    }

    setSaving(true)
    try {
      const res = await ChamadaUtentesService(listPermId).chamarUtenteTratamento(
        row.id,
        { sala: sala.trim(), nomeTecnico: tecnico.trim() }
      )
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Utente chamado com sucesso.')
        onOpenChange(false)
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .find(Boolean) ?? 'Não foi possível chamar.'
        toast.error(msg)
      }
    } catch {
      toast.error('Não foi possível chamar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Chamar utente</DialogTitle>
        </DialogHeader>
        <div className='space-y-3 py-2'>
          <div className='space-y-1'>
            <Label>Utente</Label>
            <Input value={nomeUtente || row?.utenteNome || ''} disabled />
          </div>
          <div className='space-y-1'>
            <Label>Sala</Label>
            <Input
              value={sala}
              onChange={(e) => setSala(e.target.value)}
              disabled={loading || saving}
            />
          </div>
          <div className='space-y-1'>
            <Label>Técnico</Label>
            <Input
              value={tecnico}
              onChange={(e) => setTecnico(e.target.value)}
              disabled={loading || saving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            onClick={() => void handleChamar()}
            disabled={loading || saving}
          >
            {saving ? 'A chamar…' : 'Chamar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}