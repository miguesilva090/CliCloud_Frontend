import { useCallback } from 'react'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TableCell, TableRow } from '@/components/ui/table'
import { ResponseStatus } from '@/types/api/responses'
import { inputClass } from '@/lib/form-styles'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import type { EmitirDocumentoLinhaRequest } from '@/types/dtos/faturacao/documento-emissao.dtos'
import type { SubsistemaServicoDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import type { TaxaIvaLightDTO } from '@/types/dtos/taxas-iva/taxa-iva.dtos'
import type { DocumentoEditorProfile } from '../utils/documento-tipo-editor-profile'
import {
  findSubsistemaPreco,
  mapServicoToLinhaPatch,
  taxaPercentagemFromId,
} from '../utils/documento-linha-mappers'
import {
  calcularSubtotalLinha,
  type OpcoesCalculoDocumento,
} from '../utils/documento-editor-calculos'
import { formatMoneyPt } from '../utils/faturacao-documento-display'

const ID = 'documentos'

type Props = {
  linha: EmitirDocumentoLinhaRequest
  opcoesCalculo: OpcoesCalculoDocumento
  organismoId: string | null
  perfil: DocumentoEditorProfile
  subsistemaRows: SubsistemaServicoDTO[]
  taxas: TaxaIvaLightDTO[]
  servicoItems: { value: string; label: string }[]
  servicoSearch: string
  onServicoSearch: (v: string) => void
  servicosLoading: boolean
  taxaItems: { value: string; label: string; secondary?: string }[]
  taxaSearch: string
  onTaxaSearch: (v: string) => void
  taxasLoading: boolean
  onPatch: (patch: Partial<EmitirDocumentoLinhaRequest>) => void
  onRemove: () => void
  showRemove?: boolean
}

export function DocumentoLinhaRow({
  linha,
  opcoesCalculo,
  organismoId,
  perfil,
  subsistemaRows,
  taxas,
  servicoItems,
  servicoSearch,
  onServicoSearch,
  servicosLoading,
  taxaItems,
  taxaSearch,
  onTaxaSearch,
  taxasLoading,
  onPatch,
  onRemove,
  showRemove = true,
}: Props) {
  const aplicarServico = useCallback(
    async (servicoId: string, precoOverride?: number) => {
      if (!servicoId) {
        onPatch({ servicoId: null })
        return
      }
      const res = await ServicoService(ID).getServico(servicoId)
      const s = res.info?.data
      if (!res.info || res.info.status !== ResponseStatus.Success || !s) return
      let preco = precoOverride
      if (preco == null && organismoId && perfil.mostraPrecosSubsistema) {
        const sub = findSubsistemaPreco(subsistemaRows, servicoId, organismoId)
        preco = sub?.valorServico ?? s.preco ?? 0
      }
      onPatch(mapServicoToLinhaPatch(s, taxas, { precoUnitario: preco }))
    },
    [onPatch, organismoId, perfil.mostraPrecosSubsistema, subsistemaRows, taxas],
  )

  const aplicarPrecoSubsistema = (tipo: 'tabela' | 'utente' | 'organismo') => {
    if (!linha.servicoId) return
    if (tipo === 'tabela') {
      void aplicarServico(linha.servicoId)
      return
    }
    if (!organismoId) return
    const sub = findSubsistemaPreco(subsistemaRows, linha.servicoId, organismoId)
    if (!sub) return
    const preco =
      tipo === 'utente' ? sub.valorUtente : sub.valorOrganismo
    onPatch({ precoUnitario: preco })
  }

  const subPreco =
    linha.servicoId && organismoId
      ? findSubsistemaPreco(subsistemaRows, linha.servicoId, organismoId)
      : undefined

  return (
    <TableRow>
      <TableCell className='min-w-[160px]'>
        <AsyncCombobox
          value={linha.servicoId ?? ''}
          onChange={(id) => void aplicarServico(id)}
          items={servicoItems}
          isLoading={servicosLoading}
          placeholder='Serviço…'
          searchValue={servicoSearch}
          onSearchValueChange={onServicoSearch}
          className='h-8 text-xs'
        />
      </TableCell>
      {perfil.mostraColunaArtigo ? (
        <TableCell className='w-24'>
          <Input
            className={inputClass}
            placeholder='Ref.'
            value={linha.codigoArtigo ?? ''}
            onChange={(e) => onPatch({ codigoArtigo: e.target.value || null })}
          />
        </TableCell>
      ) : null}
      <TableCell className='min-w-[180px]'>
        <Input
          className={inputClass}
          value={linha.descricao}
          onChange={(e) => onPatch({ descricao: e.target.value })}
        />
      </TableCell>
      <TableCell className='w-20'>
        <Input
          type='number'
          className={inputClass}
          value={linha.quantidade}
          onChange={(e) => onPatch({ quantidade: Number(e.target.value) })}
        />
      </TableCell>
      <TableCell className='w-28'>
        <Input
          type='number'
          className={inputClass}
          value={linha.precoUnitario}
          onChange={(e) => onPatch({ precoUnitario: Number(e.target.value) })}
        />
        {perfil.mostraPrecosSubsistema && organismoId && subPreco ? (
          <div className='mt-1 flex flex-wrap gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-6 px-1 text-[10px]'
              onClick={() => aplicarPrecoSubsistema('utente')}
            >
              Ut.
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-6 px-1 text-[10px]'
              onClick={() => aplicarPrecoSubsistema('organismo')}
            >
              Org.
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-6 px-1 text-[10px]'
              onClick={() => aplicarPrecoSubsistema('tabela')}
            >
              Tab.
            </Button>
          </div>
        ) : null}
      </TableCell>
      <TableCell className='w-20'>
        <Input
          type='number'
          className={inputClass}
          value={linha.percentagemDesconto ?? 0}
          onChange={(e) =>
            onPatch({ percentagemDesconto: Number(e.target.value) })
          }
        />
      </TableCell>
      {perfil.mostraDescontosAvancados ? (
        <>
          <TableCell className='w-16'>
            <Input
              type='number'
              className={inputClass}
              title='Desconto tipo 1 (%)'
              value={linha.descontoTipo1 ?? ''}
              onChange={(e) =>
                onPatch({
                  descontoTipo1: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
          </TableCell>
          <TableCell className='w-16'>
            <Input
              type='number'
              className={inputClass}
              title='Desconto tipo 2 (%)'
              value={linha.descontoTipo2 ?? ''}
              onChange={(e) =>
                onPatch({
                  descontoTipo2: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
          </TableCell>
          <TableCell className='w-16'>
            <Input
              type='number'
              className={inputClass}
              title='Desconto tipo 3 (%)'
              value={linha.descontoTipo3 ?? ''}
              onChange={(e) =>
                onPatch({
                  descontoTipo3: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
          </TableCell>
        </>
      ) : null}
      <TableCell className='min-w-[120px]'>
        <AsyncCombobox
          value={linha.taxaIvaId ?? ''}
          onChange={(id) => {
            const pct = opcoesCalculo.isentoIva
              ? 0
              : taxaPercentagemFromId(id, taxas)
            onPatch({ taxaIvaId: id || null, taxaIvaPercentagem: pct })
          }}
          items={taxaItems}
          isLoading={taxasLoading}
          placeholder='IVA…'
          searchValue={taxaSearch}
          onSearchValueChange={onTaxaSearch}
          disabled={opcoesCalculo.isentoIva}
          className='h-8 text-xs'
        />
        <span className='text-[10px] text-muted-foreground'>
          {opcoesCalculo.isentoIva ? 'Isento' : `${linha.taxaIvaPercentagem}%`}
        </span>
      </TableCell>
      <TableCell className='w-28 text-right tabular-nums'>
        {formatMoneyPt(calcularSubtotalLinha(linha, opcoesCalculo))}
      </TableCell>
      {showRemove ? (
        <TableCell>
          <Button type='button' variant='ghost' size='sm' onClick={onRemove}>
            ×
          </Button>
        </TableCell>
      ) : null}
    </TableRow>
  )
}
