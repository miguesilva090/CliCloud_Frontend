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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AsyncCombobox, type ComboboxItem } from '@/components/shared/async-combobox'
import { fieldGap, formBlockGap, inputClass, labelClass, selectTriggerClass } from '@/lib/form-styles'
import type { SubsistemaServicoDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import type { ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import {
  ELECTRO_OPTIONS,
  computeLinhaTotal,
  extractSubsistemaServicoRows,
  formatDecimalInput,
  linhaFromSubsistema,
  newLinhaServicoForm,
  parseDecimal,
  type LinhaServicoForm,
  type TaxaModeradora,
} from './admissao-form-utils'

export function AdmissaoServicoLinhaModal({
  open,
  onOpenChange,
  organismoId,
  subsistemasPayload,
  servicosLight,
  taxaModeradora,
  taxaModeradoraAtiva,
  initialLinha,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  organismoId: string
  subsistemasPayload: unknown
  servicosLight: ServicoLightDTO[]
  taxaModeradora: TaxaModeradora
  taxaModeradoraAtiva: boolean
  initialLinha?: LinhaServicoForm | null
  onConfirm: (linha: LinhaServicoForm) => void
}) {
  const [linha, setLinha] = useState<LinhaServicoForm>(newLinhaServicoForm())
  const [servicoSearch, setServicoSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setLinha(initialLinha ? { ...initialLinha } : newLinhaServicoForm())
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

  const subsistemaItems: ComboboxItem[] = useMemo(() => {
    return subsistemas.map((sub) => {
      const servico = servicoMap.get(sub.servicoId)
      const codigo =
        (servico as { ean?: string })?.ean?.trim() ||
        servico?.id.slice(0, 8) ||
        sub.servicoId.slice(0, 8)
      const nome = servico?.designacao ?? sub.servicoId
      return {
        value: sub.id,
        label: `[${codigo}] ${nome}`,
        secondary: `${formatDecimalInput(sub.valorServico)} €`,
      }
    })
  }, [subsistemas, servicoMap])

  const filteredServicoItems = useMemo(() => {
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

  const patchLinha = (partial: Partial<LinhaServicoForm>) => {
    setLinha((prev) => {
      const next = { ...prev, ...partial }
      const totals = computeLinhaTotal(next, taxaModeradora, taxaModeradoraAtiva)
      return {
        ...next,
        total: formatDecimalInput(totals.total),
        valorUtente: formatDecimalInput(totals.valorUtente),
        percentagem: formatDecimalInput(totals.percentagem),
        valorOrganismo: formatDecimalInput(totals.valorOrganismo),
      }
    })
  }

  const handleSelectSubsistema = (subsistemaId: string) => {
    const sub = subsistemas.find((s) => s.id === subsistemaId)
    if (!sub) return
    const servico = servicoMap.get(sub.servicoId)
    const codigo = servico?.id.slice(0, 8) || ''
    const built = linhaFromSubsistema(
      sub,
      codigo,
      servico?.designacao ?? 'Serviço',
      taxaModeradora,
      taxaModeradoraAtiva
    )
    setLinha({ ...built, id: linha.id, selected: linha.selected })
  }

  const handleSelectServicoOnly = (servicoId: string) => {
    const servico = servicoMap.get(servicoId)
    if (!servico) return
    const sub = subsistemas.find((s) => s.servicoId === servicoId)
    if (sub) {
      handleSelectSubsistema(sub.id)
      return
    }
    patchLinha({
      servicoId,
      subsistemaServicoId: '',
      codigoServico: servico.id.slice(0, 8),
      descricao: servico.designacao,
      subsistemaLinhaLabel: servico.designacao,
      valorUnitario: formatDecimalInput((servico as { preco?: number }).preco),
    })
  }

  const handleConfirm = () => {
    if (!linha.servicoId && !linha.descricao.trim()) return
    onConfirm(linha)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Registar serviço / artigo</DialogTitle>
        </DialogHeader>

        {!organismoId ? (
          <p className='text-sm text-destructive'>
            Selecione utente e organismo na aba «Dados do Utente» antes de registar serviços.
          </p>
        ) : null}

        <div className={`grid grid-cols-12 ${formBlockGap} py-2`}>
          <div className={`col-span-6 ${fieldGap}`}>
            <Label className={labelClass}>Serviços</Label>
            <AsyncCombobox
              value={linha.subsistemaServicoId || linha.servicoId}
              onChange={(v) => {
                if (subsistemas.some((s) => s.id === v)) handleSelectSubsistema(v)
                else handleSelectServicoOnly(v)
              }}
              items={
                linha.subsistemaLinhaLabel && linha.subsistemaServicoId
                  ? [
                      {
                        value: linha.subsistemaServicoId,
                        label: linha.subsistemaLinhaLabel,
                      },
                      ...subsistemaItems,
                    ]
                  : subsistemaItems.length > 0
                    ? subsistemaItems
                    : filteredServicoItems
              }
              placeholder='Serviço...'
              searchPlaceholder='Pesquisar serviço...'
              emptyText={
                organismoId ? 'Sem serviços para este organismo' : 'Selecione organismo'
              }
              disabled={!organismoId}
              searchValue={servicoSearch}
              onSearchValueChange={setServicoSearch}
            />
          </div>

          <div className={`col-span-6 ${fieldGap}`}>
            <Label className={labelClass}>Artigos</Label>
            <Input
              className={inputClass}
              value={linha.codigoArtigo}
              placeholder='Cód. artigo (opcional)'
              onChange={(e) =>
                patchLinha({ codigoArtigo: e.target.value, descricao: e.target.value || linha.descricao })
              }
            />
          </div>

          <div className={`col-span-2 ${fieldGap}`}>
            <Label className={labelClass}>Quant.</Label>
            <Input
              className={inputClass}
              value={linha.quantidade}
              onChange={(e) => patchLinha({ quantidade: e.target.value })}
            />
          </div>
          <div className={`col-span-3 ${fieldGap}`}>
            <Label className={labelClass}>Valor unit.</Label>
            <Input
              className={inputClass}
              value={linha.valorUnitario}
              onChange={(e) => patchLinha({ valorUnitario: e.target.value })}
            />
          </div>
          <div className={`col-span-3 ${fieldGap}`}>
            <Label className={labelClass}>Org. (%)</Label>
            <Input
              className={inputClass}
              value={linha.percentagem}
              onChange={(e) => patchLinha({ percentagem: e.target.value })}
            />
          </div>
          <div className={`col-span-3 ${fieldGap}`}>
            <Label className={labelClass}>Valor utente</Label>
            <Input
              className={inputClass}
              value={linha.valorUtente}
              onChange={(e) => patchLinha({ valorUtente: e.target.value })}
            />
          </div>

          <div className={`col-span-3 ${fieldGap}`}>
            <Label className={labelClass}>Desc. clínica (%)</Label>
            <Input
              className={inputClass}
              value={linha.descClinica}
              onChange={(e) => patchLinha({ descClinica: e.target.value })}
            />
          </div>
          <div className={`col-span-3 ${fieldGap}`}>
            <Label className={labelClass}>Nº chq</Label>
            <Input
              className={inputClass}
              value={linha.nrCheque}
              onChange={(e) => patchLinha({ nrCheque: e.target.value })}
            />
          </div>
          <div className={`col-span-3 ${fieldGap}`}>
            <Label className={labelClass}>Electrocardiograma</Label>
            <Select
              value={linha.electro}
              onValueChange={(v) =>
                patchLinha({
                  electro: v,
                  electroDesc: ELECTRO_OPTIONS.find((o) => o.value === v)?.label ?? '',
                })
              }
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder='—' />
              </SelectTrigger>
              <SelectContent>
                {ELECTRO_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label || '—'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={`col-span-3 ${fieldGap}`}>
            <Label className={labelClass}>Nº dente</Label>
            <Input
              className={inputClass}
              value={linha.nrDente}
              onChange={(e) => patchLinha({ nrDente: e.target.value })}
            />
          </div>
          <div className={`col-span-3 ${fieldGap}`}>
            <Label className={labelClass}>Quadrante</Label>
            <Input
              className={inputClass}
              value={linha.quadrante}
              onChange={(e) => patchLinha({ quadrante: e.target.value })}
            />
          </div>

          <div className='col-span-3 flex items-end gap-2 pb-1'>
            <Checkbox
              checked={linha.exame}
              onCheckedChange={(v) => patchLinha({ exame: Boolean(v) })}
            />
            <Label className={labelClass}>Exame</Label>
          </div>

          <div className={`col-span-9 ${fieldGap}`}>
            <Label className={labelClass}>Total</Label>
            <Input className={inputClass} readOnly value={linha.total} />
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type='button'
            onClick={handleConfirm}
            disabled={!organismoId || (!linha.servicoId && !linha.descricao.trim())}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
