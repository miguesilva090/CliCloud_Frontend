import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { fieldGap, formBlockGap, inputClass, labelClass } from '@/lib/form-styles'
import type { DocumentoEditorState } from '../types/documento-editor.types'
import type { DocumentoEditorTotais } from '../types/documento-editor.types'

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
              value={state.retencaoImposto || impostos[0]?.value || ''}
              onValueChange={(v) =>
                onChange({ retencaoImposto: v as DocumentoEditorState['retencaoImposto'] })
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
            <Input
              className={inputClass}
              value={state.retencaoMotivo}
              onChange={(e) => onChange({ retencaoMotivo: e.target.value })}
              placeholder='Motivo da retenção (obrigatório)'
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
