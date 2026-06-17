import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fieldGap, inputClass, labelClass } from '@/lib/form-styles'
import { DocumentoService } from '@/lib/services/faturacao/documento-service'
import type { DocumentoTableDTO } from '@/types/dtos/faturacao/documento.dtos'
import { getDocumentoNumeroLabel } from '../utils/faturacao-documento-display'
import type { DocumentoEditorState } from '../types/documento-editor.types'

const ID = 'documentos'

export function DocumentoTabOrigemSection({
  state,
  onChange,
  readOnly,
}: {
  state: DocumentoEditorState
  onChange: (p: Partial<DocumentoEditorState>) => void
  readOnly?: boolean
}) {
  const [search, setSearch] = useState('')
  const [deb] = useDebounce(search, 300)

  const docsQ = useQuery({
    queryKey: ['documento-origem', 'search', deb],
    queryFn: async () => {
      const res = await DocumentoService(ID).getDocumentosPaginated({
        pageNumber: 1,
        pageSize: 25,
        filters: deb.trim()
          ? [{ id: 'numeroexibicao', value: deb.trim() }]
          : [],
        sorting: [{ id: 'data', desc: true }],
      })
      return res.info?.data ?? []
    },
    staleTime: 30_000,
  })

  const items = (docsQ.data ?? []).map((d: DocumentoTableDTO) => ({
    value: d.id,
    label: getDocumentoNumeroLabel(d),
    secondary: d.nomeCliente ?? undefined,
  }))

  return (
    <div className='grid max-w-2xl gap-4 md:grid-cols-2'>
      <div className={`md:col-span-2 ${fieldGap}`}>
        <Label className={labelClass}>Documento de origem</Label>
        <AsyncCombobox
          value={state.documentoOrigemId ?? ''}
          onChange={(id) => {
            const row = (docsQ.data ?? []).find((d: DocumentoTableDTO) => d.id === id)
            onChange({
              documentoOrigemId: id || null,
              identificadorUnicoDocumentoOrigem: row
                ? getDocumentoNumeroLabel(row)
                : state.identificadorUnicoDocumentoOrigem,
              dataDocumentoOrigem: row?.data?.slice(0, 10) ?? state.dataDocumentoOrigem,
            })
          }}
          items={items}
          isLoading={docsQ.isFetching}
          placeholder='Pesquisar n.º documento…'
          searchValue={search}
          onSearchValueChange={setSearch}
          disabled={readOnly}
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Identificador único origem</Label>
        <Input
          className={inputClass}
          value={state.identificadorUnicoDocumentoOrigem}
          readOnly={readOnly}
          onChange={(e) =>
            onChange({ identificadorUnicoDocumentoOrigem: e.target.value })
          }
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Data documento origem</Label>
        <Input
          type='date'
          className={inputClass}
          value={state.dataDocumentoOrigem}
          readOnly={readOnly}
          onChange={(e) => onChange({ dataDocumentoOrigem: e.target.value })}
        />
      </div>
      <p className='md:col-span-2 text-xs text-muted-foreground'>
        Obrigatório para notas de crédito e documentos de rectificação (NC, DV, RG),
        como no legado <code>IdentUnDocOrig</code> / <code>DataDocOriginal</code>.
      </p>
    </div>
  )
}
