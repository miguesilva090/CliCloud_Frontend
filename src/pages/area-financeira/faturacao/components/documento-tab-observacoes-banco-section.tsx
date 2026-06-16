import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { fieldGap, inputClass, labelClass } from '@/lib/form-styles'
import { BancosService } from '@/lib/services/utility/bancos-service'
import { modoPagamentoRequerBanco } from '../utils/documento-pagamento-utils'
import type { ModoPagamentoLightDTO } from '@/types/dtos/pagamentos/modo-pagamento.dtos'
import type { DocumentoEditorState } from '../types/documento-editor.types'

const ID_FUNCIONALIDADE = 'documentos'

export function DocumentoTabObservacoesBancoSection({
  state,
  onChange,
  readOnly,
  modosPagamento = [],
}: {
  state: DocumentoEditorState
  onChange: (p: Partial<DocumentoEditorState>) => void
  readOnly?: boolean
  modosPagamento?: ModoPagamentoLightDTO[]
}) {
  const [bankSearch, setBankSearch] = useState('')
  const [debBank] = useDebounce(bankSearch, 300)

  const bancosQ = useQuery({
    queryKey: ['bancos', 'light', 'faturacao', debBank],
    queryFn: async () => {
      const res = await BancosService(ID_FUNCIONALIDADE).getBancosLight(debBank)
      return res.info?.data ?? []
    },
    enabled: modoPagamentoRequerBanco(state.modoPagamentoId, modosPagamento),
  })

  const bankItems = (bancosQ.data ?? []).map((b) => ({
    value: b.id,
    label: b.nome ?? b.id,
  }))

  return (
    <div className='grid gap-4 md:grid-cols-2 border-t pt-4 mt-2'>
      <div className={`md:col-span-2 ${fieldGap}`}>
        <Label className={labelClass}>Observações</Label>
        <Textarea
          className={inputClass}
          rows={3}
          value={state.observacoes}
          onChange={(e) => onChange({ observacoes: e.target.value })}
          readOnly={readOnly}
        />
      </div>
      {modoPagamentoRequerBanco(state.modoPagamentoId, modosPagamento) ? (
        <div className={`md:col-span-2 ${fieldGap}`}>
          <Label className={labelClass}>Banco</Label>
          <AsyncCombobox
            value={state.bancoId ?? ''}
            onChange={(id) => onChange({ bancoId: id || null })}
            items={bankItems}
            isLoading={bancosQ.isFetching}
            placeholder='Pesquisar banco…'
            searchValue={bankSearch}
            onSearchValueChange={setBankSearch}
            disabled={readOnly}
          />
        </div>
      ) : null}
    </div>
  )
}
