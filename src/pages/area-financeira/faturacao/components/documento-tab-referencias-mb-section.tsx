import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { fieldGap, formBlockGap, labelClass } from '@/lib/form-styles'
import type { DocumentoEditorState } from '../types/documento-editor.types'

export function DocumentoTabReferenciasMbSection({
  state,
  onChange,
  opcoes,
}: {
  state: DocumentoEditorState
  onChange: (p: Partial<DocumentoEditorState>) => void
  opcoes: Array<{ value: string; label: string }>
}) {
  return (
    <div className={`max-w-xl space-y-4 ${formBlockGap}`}>
      <p className='text-muted-foreground text-sm'>
        A referência é criada após guardar o documento, usando a configuração MB da clínica
        (IfThenPay). Requer valor total superior ao mínimo configurado.
      </p>
      <div className={fieldGap}>
        <Label className={labelClass}>Opção</Label>
        <RadioGroup
          value={String(state.gerarReferenciaMb)}
          onValueChange={(v) => onChange({ gerarReferenciaMb: Number(v) as 0 | 1 | 2 })}
          className='flex flex-col gap-3'
        >
          {opcoes.map((o) => (
            <div key={o.value} className='flex items-center gap-2'>
              <RadioGroupItem value={o.value} id={`mb-${o.value}`} />
              <Label htmlFor={`mb-${o.value}`}>{o.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
