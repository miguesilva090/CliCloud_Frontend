import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useMemo, useState } from 'react'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { fieldGap, formBlockGap, inputClass, labelClass } from '@/lib/form-styles'
import type { DocumentoEditorState, DocumentoEditorTotais } from '../types/documento-editor.types'
import { useMotivosRetencaoDocumento } from '../queries/documento-editor-queries'

export function DocumentoTabRetencaoSection({
  state,
  totais,
  onChange,
  impostos,
}: {
  state: DocumentoEditorState
  totais: DocumentoEditorTotais
  onChange: (p: Partial<DocumentoEditorState>) => void
  impostos: Array<{ value: 'IRS' | 'IRC' | 'IS'; label: string }>
}) {
  const baseRetencao = totais.total + totais.acerto
  const imposto = state.retencaoImposto || impostos[0]?.value || ''
  const [motivoSearch, setMotivoSearch] = useState('')
  const motivosQ = useMotivosRetencaoDocumento(imposto, motivoSearch)

  const motivoItems = useMemo(
    () =>
      (motivosQ.data ?? []).map((m) => ({
        value: String(m.codigo),
        label: m.descricao,
      })),
    [motivosQ.data],
  )

  const aplicarTaxa = (taxa: number) => {
    if (taxa <= 0) {
      onChange({ retencaoTaxa: 0, retencaoValor: 0 })
      return
    }
    const valor = Math.round(baseRetencao * (taxa / 100) * 100) / 100
    onChange({ retencaoTaxa: taxa, retencaoValor: valor })
  }

  return (
    <div className={`max-w-2xl space-y-4 ${formBlockGap}`}>
      <div className='flex items-center gap-3'>
        <Switch
          id='retencao-ativa'
          checked={state.retencaoAtiva}
          onCheckedChange={(v) =>
            onChange({
              retencaoAtiva: v,
              ...(v
                ? {}
                : {
                    retencaoImposto: '',
                    retencaoTaxa: 0,
                    retencaoValor: 0,
                    retencaoMotivo: '',
                    retencaoCodigoMotivo: null,
                  }),
            })
          }
        />
        <Label htmlFor='retencao-ativa' className={labelClass}>
          Ativar retenção na fonte
        </Label>
      </div>

      {state.retencaoAtiva ? (
        <>
          <div className={fieldGap}>
            <Label className={labelClass}>Imposto</Label>
            <RadioGroup
              value={imposto}
              onValueChange={(v) =>
                onChange({
                  retencaoImposto: v as DocumentoEditorState['retencaoImposto'],
                  retencaoCodigoMotivo: null,
                  retencaoMotivo: '',
                })
              }
              className='flex flex-wrap gap-4'
            >
              {impostos.map((i) => (
                <div key={i.value} className='flex items-center gap-2'>
                  <RadioGroupItem value={i.value} id={`imp-${i.value}`} />
                  <Label htmlFor={`imp-${i.value}`}>{i.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className={fieldGap}>
            <Label className={labelClass}>Motivo</Label>
            <AsyncCombobox
              value={
                state.retencaoCodigoMotivo != null
                  ? String(state.retencaoCodigoMotivo)
                  : ''
              }
              onChange={(id) => {
                const item = motivoItems.find((m) => m.value === id)
                onChange({
                  retencaoCodigoMotivo: id ? Number(id) : null,
                  retencaoMotivo: item?.label ?? '',
                })
              }}
              items={motivoItems}
              isLoading={motivosQ.isFetching}
              placeholder='Seleccionar motivo…'
              searchValue={motivoSearch}
              onSearchValueChange={setMotivoSearch}
            />
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className={fieldGap}>
              <Label className={labelClass}>Taxa (%)</Label>
              <Input
                type='number'
                min={0}
                step={0.01}
                className={inputClass}
                value={state.retencaoTaxa || ''}
                onChange={(e) => aplicarTaxa(Number(e.target.value) || 0)}
              />
            </div>
            <div className={fieldGap}>
              <Label className={labelClass}>Valor</Label>
              <Input
                type='number'
                min={0}
                step={0.01}
                className={inputClass}
                value={state.retencaoValor || ''}
                onChange={(e) =>
                  onChange({
                    retencaoValor: Number(e.target.value) || 0,
                    retencaoTaxa: 0,
                  })
                }
              />
            </div>
          </div>
          <p className='text-muted-foreground text-xs'>
            Com taxa preenchida, o valor é calculado sobre o total do documento (após acertos).
          </p>
        </>
      ) : null}
    </div>
  )
}
