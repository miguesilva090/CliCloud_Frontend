import { useEffect, useMemo, useState } from 'react'
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
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { fieldGap, inputClass, labelClass } from '@/lib/form-styles'
import type { ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import {
  extractSubsistemaServicoRows,
} from '@/pages/area-administrativa/consultas/admissoes/modals/admissao-form-utils'
import {
  newListaEsperaServicoForm,
  type ListaEsperaTratamentoServicoForm,
} from './lista-espera-tratamento-form-utils'

export function ListaEsperaTratamentoServicoLinhaModal({
  open,
  onOpenChange,
  organismoId,
  subsistemasPayload,
  servicosLight,
  initialLinha,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  organismoId: string
  subsistemasPayload: unknown
  servicosLight: ServicoLightDTO[]
  initialLinha?: ListaEsperaTratamentoServicoForm | null
  onConfirm: (linha: ListaEsperaTratamentoServicoForm) => void
}) {
  const [linha, setLinha] = useState<ListaEsperaTratamentoServicoForm>(newListaEsperaServicoForm(1))
  const [servicoSearch, setServicoSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setLinha(initialLinha ? { ...initialLinha } : newListaEsperaServicoForm(1))
    setServicoSearch('')
  }, [open, initialLinha])

  const subsistemas = useMemo(
    () => extractSubsistemaServicoRows(subsistemasPayload).filter((s) => !s.inativo),
    [subsistemasPayload]
  )

  const servicoMap = useMemo(() => {
    const map = new Map<string, ServicoLightDTO>()
    for (const s of servicosLight) map.set(s.id, s)
    return map
  }, [servicosLight])

  const subsistemaItems = useMemo(() => {
    return subsistemas.map((sub) => {
      const servico = servicoMap.get(sub.servicoId)
      const codigo = servico?.id.slice(0, 8) || sub.servicoId.slice(0, 8)
      const nome = servico?.designacao ?? sub.servicoId
      return {
        value: sub.id,
        label: `[${codigo}] ${nome}`,
        secondary: sub.subsistemaId?.slice(0, 8),
      }
    })
  }, [subsistemas, servicoMap])

  const servicoItems = useMemo(() => {
    const q = servicoSearch.trim().toLowerCase()
    const base = servicosLight.map((s) => ({
      value: s.id,
      label: s.designacao,
      secondary: s.id.slice(0, 8),
    }))
    if (!q) return base
    return base.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        (i.secondary?.toLowerCase().includes(q) ?? false)
    )
  }, [servicosLight, servicoSearch])

  const handleSelectSubsistema = (subsistemaId: string) => {
    const sub = subsistemas.find((s) => s.id === subsistemaId)
    if (!sub) return
    const servico = servicoMap.get(sub.servicoId)
    setLinha((prev) => ({
      ...prev,
      subsistemaServicoId: sub.id,
      servicoId: sub.servicoId,
      codigoServico: servico?.id.slice(0, 8) || sub.servicoId.slice(0, 8),
      designacao: servico?.designacao ?? '',
      subsistemaDesignacao: sub.subsistemaId ?? '',
    }))
  }

  const handleSelectServico = (servicoId: string) => {
    const servico = servicoMap.get(servicoId)
    if (!servico) return
    const sub = subsistemas.find((s) => s.servicoId === servicoId)
    setLinha((prev) => ({
      ...prev,
      servicoId,
      subsistemaServicoId: sub?.id ?? '',
      codigoServico: sub ? sub.servicoId.slice(0, 8) : servico.id.slice(0, 8),
      designacao: servico.designacao,
      subsistemaDesignacao: sub?.subsistemaId ?? '',
    }))
  }

  const handleConfirm = () => {
    if (!linha.servicoId && !linha.designacao.trim()) return
    onConfirm(linha)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Serviço</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          <div className={fieldGap}>
            <Label className={labelClass}>Serviço / subsistema</Label>
            <AsyncCombobox
              value={linha.subsistemaServicoId || linha.servicoId}
              onChange={(v) => {
                const isSub = subsistemas.some((s) => s.id === v)
                if (isSub) handleSelectSubsistema(v)
                else handleSelectServico(v)
              }}
              items={
                organismoId && subsistemaItems.length > 0 ? subsistemaItems : servicoItems
              }
              searchValue={servicoSearch}
              onSearchValueChange={setServicoSearch}
              placeholder='Selecionar serviço…'
              searchPlaceholder='Pesquisar…'
              emptyText='Sem resultados'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className={fieldGap}>
              <Label className={labelClass}>Duração</Label>
              <Input
                className={inputClass}
                value={linha.duracao}
                onChange={(e) => setLinha((p) => ({ ...p, duracao: e.target.value }))}
                placeholder='HH:mm'
              />
            </div>
            <div className={fieldGap}>
              <Label className={labelClass}>Ordem</Label>
              <Input
                className={inputClass}
                type='number'
                value={linha.ordem}
                onChange={(e) =>
                  setLinha((p) => ({ ...p, ordem: Number.parseInt(e.target.value, 10) || 1 }))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            type='button'
            disabled={!organismoId || (!linha.servicoId && !linha.designacao.trim())}
            onClick={handleConfirm}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
