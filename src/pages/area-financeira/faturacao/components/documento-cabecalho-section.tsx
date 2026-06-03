import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  fieldGap,
  formBlockGap,
  inputClass,
  labelClass,
  selectTriggerClass,
} from '@/lib/form-styles'
import type { DocumentoEditorState } from '../types/documento-editor.types'
import type { DocumentoEditorProfile } from '../utils/documento-tipo-editor-profile'
import { DocumentoTabOrigemSection } from './documento-tab-origem-section'

export function DocumentoCabecalhoSection({
  state,
  perfil,
  onChange,
  readOnly,
  motivoIsencaoItems = [],
  condicaoPagamentoItems = [],
  modoPagamentoItems = [],
  tipoSerieItems = [],
}: {
  state: DocumentoEditorState
  perfil: DocumentoEditorProfile
  onChange: (p: Partial<DocumentoEditorState>) => void
  readOnly?: boolean
  motivoIsencaoItems?: Array<{ id: string; label: string }>
  condicaoPagamentoItems?: Array<{ value: string; label: string }>
  modoPagamentoItems?: Array<{ value: string; label: string }>
  tipoSerieItems?: Array<{ value: 'N' | 'D' | 'M'; label: string }>
}) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${formBlockGap}`}>
      <div className={fieldGap}>
        <Label className={labelClass}>Tipo Documento</Label>
        <Input
          className={inputClass}
          readOnly
          value={`${state.tipoAbreviatura} — ${state.tipoDescricao}`}
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>N.º Documento</Label>
        <Input className={inputClass} readOnly placeholder='Atribuído ao guardar' />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Data</Label>
        <Input
          type='date'
          className={inputClass}
          value={state.dataDocumento}
          onChange={(e) => onChange({ dataDocumento: e.target.value })}
          readOnly={readOnly}
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Data Vencimento</Label>
        <Input
          type='date'
          className={inputClass}
          value={state.dataVencimentoPagamento}
          onChange={(e) => onChange({ dataVencimentoPagamento: e.target.value })}
          readOnly={readOnly}
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Condição Pagamento</Label>
        <Select
          value={state.condicaoPagamento != null ? String(state.condicaoPagamento) : ''}
          onValueChange={(v) =>
            onChange({ condicaoPagamento: v ? Number(v) : null })
          }
          disabled={readOnly}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder='Selecionar…' />
          </SelectTrigger>
          <SelectContent>
            {condicaoPagamentoItems.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Modo Pagamento</Label>
        <Select
          value={state.tipoModoPagamento != null ? String(state.tipoModoPagamento) : ''}
          onValueChange={(v) =>
            onChange({ tipoModoPagamento: v ? Number(v) : null })
          }
          disabled={readOnly}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder='Selecionar…' />
          </SelectTrigger>
          <SelectContent>
            {modoPagamentoItems.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Tipo Série</Label>
        <Select
          value={state.tipoSerie}
          onValueChange={(v) => onChange({ tipoSerie: v as 'N' | 'D' | 'M' })}
          disabled={readOnly}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder='Selecionar…' />
          </SelectTrigger>
          <SelectContent>
            {tipoSerieItems.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {perfil.mostraTransporte ? (
        <>
          <div className={fieldGap}>
            <Label className={labelClass}>Data Transporte</Label>
            <Input
              type='date'
              className={inputClass}
              value={state.dataTransporte}
              onChange={(e) => onChange({ dataTransporte: e.target.value })}
            />
          </div>
          <div className={fieldGap}>
            <Label className={labelClass}>Hora Transporte</Label>
            <Input
              type='time'
              className={inputClass}
              value={state.horaTransporte}
              onChange={(e) => onChange({ horaTransporte: e.target.value })}
            />
          </div>
          <div className={fieldGap}>
            <Label className={labelClass}>Código Validação Transporte</Label>
            <Input
              className={inputClass}
              value={state.codigoValidacaoTransporte ?? ''}
              onChange={(e) =>
                onChange({ codigoValidacaoTransporte: e.target.value })
              }
            />
          </div>
        </>
      ) : null}

      <div className={`flex items-center gap-2 ${fieldGap}`}>
        <Switch
          id='isento-iva'
          checked={state.isentoIva}
          onCheckedChange={(v) => onChange({ isentoIva: v })}
          disabled={readOnly}
        />
        <Label htmlFor='isento-iva' className={labelClass}>
          Isento IVA
        </Label>
      </div>
      {state.isentoIva ? (
        <div className={fieldGap}>
          <Label className={labelClass}>Motivo Isenção IVA *</Label>
          <Select
            value={state.motivoIsencaoId ?? ''}
            onValueChange={(v) => onChange({ motivoIsencaoId: v || null })}
            disabled={readOnly}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder='Selecionar motivo…' />
            </SelectTrigger>
            <SelectContent>
              {motivoIsencaoItems.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {perfil.mostraDocOrigem ? (
        <div className='md:col-span-2 lg:col-span-3 border-t pt-4'>
          <DocumentoTabOrigemSection
            state={state}
            onChange={onChange}
            readOnly={readOnly}
          />
        </div>
      ) : null}
    </div>
  )
}
