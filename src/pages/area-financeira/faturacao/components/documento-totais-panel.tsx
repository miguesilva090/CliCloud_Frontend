import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fieldGap, inputClass, labelClass, selectTriggerClass } from '@/lib/form-styles'
import { formatMoneyPt } from '../utils/faturacao-documento-display'
import type { DocumentoEditorTotais } from '../types/documento-editor.types'

type MoedaItem = { id: string; label: string }

export function DocumentoTotaisPanel({
  totais,
  moedaId,
  moedaCodigo,
  cambio,
  moedas,
  onMoedaChange,
  onCambioChange,
  readOnly,
}: {
  totais: DocumentoEditorTotais
  moedaId: string | null
  moedaCodigo: string
  cambio: number
  moedas: MoedaItem[]
  onMoedaChange: (moedaId: string | null, moedaLabel: string) => void
  onCambioChange: (v: number) => void
  readOnly?: boolean
}) {
  const normalizarMoeda = (v: string) => v.trim().toUpperCase()
  const moedasSemEuro = moedas.filter((m) => {
    const n = normalizarMoeda(m.label)
    return n !== 'EUR' && n !== 'EURO'
  })

  const rows: [string, number][] = [
    ['Mercadorias/Serviços', totais.mercadorias],
    ['Descontos', totais.descontos],
    ['Impostos', totais.impostos],
    ['Total', totais.total],
    ['Acerto', totais.acerto],
    ['Retenção', totais.retencao],
    ['A pagar', totais.aPagar],
  ]

  return (
    <aside className='rounded-md border bg-muted/40 p-4 text-sm xl:sticky xl:top-4'>
      <p className='mb-3 font-semibold'>Totais</p>

      <div className='mb-4 grid grid-cols-2 gap-3'>
        <div className={fieldGap}>
          <Label className={labelClass}>Moeda</Label>
          <Select
            value={moedaId ?? '__eur__'}
            onValueChange={(v) => {
              if (v === '__eur__') {
                onMoedaChange(null, 'EUR')
                return
              }
              const row = moedas.find((m) => m.id === v)
              onMoedaChange(v, row?.label ?? moedaCodigo)
            }}
            disabled={readOnly}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder='Selecionar…' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='__eur__'>EUR</SelectItem>
              {moedasSemEuro.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={fieldGap}>
          <Label className={labelClass}>Câmbio</Label>
          <Input
            type='number'
            step={0.0001}
            min={0}
            className={inputClass}
            value={cambio}
            readOnly={readOnly || !moedaId}
            onChange={(e) => onCambioChange(Number(e.target.value) || 1)}
          />
        </div>
      </div>

      <dl className='space-y-2'>
        {rows.map(([label, value]) => (
          <div key={label} className='flex justify-between gap-4'>
            <dt className='text-muted-foreground'>{label}</dt>
            <dd className='font-medium tabular-nums'>{formatMoneyPt(value)}</dd>
          </div>
        ))}
      </dl>

      {totais.resumoIva.length > 0 ? (
        <div className='mt-4 border-t pt-3'>
          <p className='mb-2 text-xs font-semibold uppercase text-muted-foreground'>
            Resumo IVA
          </p>
          <div className='space-y-2 text-xs'>
            {totais.resumoIva.map((r) => (
              <div key={r.taxaIvaPercentagem} className='rounded border bg-background p-2'>
                <div className='flex justify-between'>
                  <span>Taxa {r.taxaIvaPercentagem}%</span>
                </div>
                <div className='mt-1 flex justify-between text-muted-foreground'>
                  <span>Incidência</span>
                  <span className='tabular-nums'>{formatMoneyPt(r.valorIncidencia)}</span>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                  <span>IVA</span>
                  <span className='tabular-nums'>{formatMoneyPt(r.totalIva)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  )
}