import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { ResponseStatus } from '@/types/api/responses'
import { fieldGap, formBlockGap, inputClass, labelClass } from '@/lib/form-styles'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import type { EmitirDocumentoLinhaRequest } from '@/types/dtos/faturacao/documento-emissao.dtos'
import type { DocumentoEditorProfile } from '../utils/documento-tipo-editor-profile'
import type { OpcoesCalculoDocumento } from '../utils/documento-editor-calculos'
import {
  calcularPercentagemDescontoEfectiva,
  calcularSubtotalLinha,
} from '../utils/documento-editor-calculos'
import { formatMoneyPt } from '../utils/faturacao-documento-display'
import {
  findSubsistemaPreco,
  mapServicoToLinhaPatch,
  taxaPercentagemFromId,
} from '../utils/documento-linha-mappers'
import {
  useServicosLightDocumento,
  useSubsistemasOrganismoDocumento,
  useTaxasIvaDocumento,
} from '../queries/documento-editor-queries'

const ID = 'documentos'

export type TipoInsercaoLinha = 'servico' | 'artigo' | 'texto'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  linha: EmitirDocumentoLinhaRequest
  tipoInsercao?: TipoInsercaoLinha
  perfil: DocumentoEditorProfile
  opcoesCalculo: OpcoesCalculoDocumento
  organismoId: string | null
  onSave: (linha: EmitirDocumentoLinhaRequest) => void
}

/** Modal «Faturação Linha» — formulário vertical (legado). */
export function DocumentoLinhaModal({
  open,
  onOpenChange,
  linha: linhaProp,
  tipoInsercao,
  perfil,
  opcoesCalculo,
  organismoId,
  onSave,
}: Props) {
  const [linha, setLinha] = useState(linhaProp)
  const [servicoSearch, setServicoSearch] = useState('')
  const [taxaSearch, setTaxaSearch] = useState('')
  const [debServico] = useDebounce(servicoSearch, 300)
  const [debTaxa] = useDebounce(taxaSearch, 300)

  useEffect(() => {
    if (open) setLinha(linhaProp)
  }, [open, linhaProp])

  const servicosQ = useServicosLightDocumento(debServico)
  const taxasQ = useTaxasIvaDocumento(debTaxa)
  const subsistemasQ = useSubsistemasOrganismoDocumento(organismoId)
  const subsistemaRows = subsistemasQ.data ?? []

  const taxas = useMemo(() => {
    const info = taxasQ.data?.info
    if (!info || info.status !== ResponseStatus.Success) return []
    return info.data ?? []
  }, [taxasQ.data])

  const servicoItems = useMemo(() => {
    const info = servicosQ.data?.info
    if (!info || info.status !== ResponseStatus.Success) return []
    return (info.data ?? []).map((s) => ({
      value: s.id,
      label: s.designacao,
    }))
  }, [servicosQ.data])

  const taxaItems = useMemo(
    () =>
      taxas.map((t) => ({
        value: t.id,
        label: t.descricao,
        secondary: `${t.taxa}%`,
      })),
    [taxas],
  )

  const patch = (p: Partial<EmitirDocumentoLinhaRequest>) =>
    setLinha((prev) => ({ ...prev, ...p }))

  const aplicarServico = useCallback(
    async (servicoId: string, precoOverride?: number) => {
      if (!servicoId) {
        patch({ servicoId: null })
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
      patch(mapServicoToLinhaPatch(s, taxas, { precoUnitario: preco }))
    },
    [organismoId, perfil.mostraPrecosSubsistema, subsistemaRows, taxas],
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
    const preco = tipo === 'utente' ? sub.valorUtente : sub.valorOrganismo
    patch({ precoUnitario: preco })
  }

  const subPreco =
    linha.servicoId && organismoId
      ? findSubsistemaPreco(subsistemaRows, linha.servicoId, organismoId)
      : undefined

  const titulo =
    tipoInsercao === 'texto'
      ? 'Linha de texto'
      : tipoInsercao === 'artigo'
        ? 'Artigo / mercadoria'
        : 'Faturação Linha'

  const subtotal = calcularSubtotalLinha(linha, opcoesCalculo)
  const mostraServico = tipoInsercao !== 'texto'

  const handleGuardar = () => {
    if (!linha.descricao.trim()) return
    onSave(linha)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-xl'>
        <DialogHeader className='shrink-0 border-b px-6 py-4'>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-6 py-4'>
          <div className={`grid gap-4 ${formBlockGap}`}>
            {mostraServico && tipoInsercao !== 'artigo' ? (
              <div className={fieldGap}>
                <Label className={labelClass}>Serviço</Label>
                <AsyncCombobox
                  value={linha.servicoId ?? ''}
                  onChange={(id) => void aplicarServico(id)}
                  items={servicoItems}
                  isLoading={servicosQ.isFetching}
                  placeholder='Pesquisar serviço…'
                  searchValue={servicoSearch}
                  onSearchValueChange={setServicoSearch}
                />
              </div>
            ) : null}

            {perfil.mostraColunaArtigo && tipoInsercao !== 'texto' ? (
              <div className={fieldGap}>
                <Label className={labelClass}>Referência / artigo</Label>
                <Input
                  className={inputClass}
                  placeholder='Ref.'
                  value={linha.codigoArtigo ?? ''}
                  onChange={(e) =>
                    patch({ codigoArtigo: e.target.value || null })
                  }
                />
              </div>
            ) : null}

            <div className={fieldGap}>
              <Label className={labelClass}>Designação *</Label>
              <Input
                className={inputClass}
                value={linha.descricao}
                onChange={(e) => patch({ descricao: e.target.value })}
              />
            </div>

            <div className='grid gap-4 sm:grid-cols-3'>
              <div className={fieldGap}>
                <Label className={labelClass}>Quantidade</Label>
                <Input
                  type='number'
                  min={0}
                  step={1}
                  className={inputClass}
                  value={linha.quantidade}
                  onChange={(e) =>
                    patch({ quantidade: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className={fieldGap}>
                <Label className={labelClass}>Preço unitário</Label>
                <Input
                  type='number'
                  min={0}
                  step={0.01}
                  className={`${inputClass} tabular-nums`}
                  value={linha.precoUnitario}
                  onChange={(e) =>
                    patch({ precoUnitario: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className={fieldGap}>
                <Label className={labelClass}>Desconto % (efetivo)</Label>
                <Input
                  type='number'
                  readOnly
                  className={`${inputClass} tabular-nums bg-muted/50`}
                  value={calcularPercentagemDescontoEfectiva(linha, opcoesCalculo)}
                />
              </div>
            </div>

            {perfil.mostraPrecosSubsistema && organismoId && subPreco ? (
              <div className='flex flex-wrap gap-2'>
                <span className='text-xs text-muted-foreground w-full'>
                  Preços subsistema:
                </span>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => aplicarPrecoSubsistema('utente')}
                >
                  Utente
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => aplicarPrecoSubsistema('organismo')}
                >
                  Organismo
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => aplicarPrecoSubsistema('tabela')}
                >
                  Tabela
                </Button>
              </div>
            ) : null}

            {perfil.mostraDescontosAvancados ? (
              <div className='grid gap-4 sm:grid-cols-3'>
                <div className={fieldGap}>
                  <Label className={labelClass}>D1 %</Label>
                  <Input
                    type='number'
                    className={inputClass}
                    value={linha.descontoTipo1 ?? ''}
                    onChange={(e) =>
                      patch({
                        descontoTipo1:
                          e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className={fieldGap}>
                  <Label className={labelClass}>D2 %</Label>
                  <Input
                    type='number'
                    className={inputClass}
                    value={linha.descontoTipo2 ?? ''}
                    onChange={(e) =>
                      patch({
                        descontoTipo2:
                          e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className={fieldGap}>
                  <Label className={labelClass}>D3 %</Label>
                  <Input
                    type='number'
                    className={inputClass}
                    value={linha.descontoTipo3 ?? ''}
                    onChange={(e) =>
                      patch({
                        descontoTipo3:
                          e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            ) : null}

            <div className={fieldGap}>
              <Label className={labelClass}>Taxa IVA</Label>
              <AsyncCombobox
                value={linha.taxaIvaId ?? ''}
                onChange={(id) => {
                  const pct = opcoesCalculo.isentoIva
                    ? 0
                    : taxaPercentagemFromId(id, taxas)
                  patch({ taxaIvaId: id || null, taxaIvaPercentagem: pct })
                }}
                items={taxaItems}
                isLoading={taxasQ.isFetching}
                placeholder='Seleccionar taxa…'
                searchValue={taxaSearch}
                onSearchValueChange={setTaxaSearch}
                disabled={opcoesCalculo.isentoIva}
              />
              <p className='text-xs text-muted-foreground'>
                {opcoesCalculo.isentoIva
                  ? 'Documento isento de IVA'
                  : `Taxa aplicada: ${linha.taxaIvaPercentagem}%`}
              </p>
            </div>

            <div className='rounded-md border bg-muted/40 px-4 py-3'>
              <div className='flex items-center justify-between gap-4'>
                <span className='text-sm font-medium'>Subtotal da linha</span>
                <span className='text-lg font-semibold tabular-nums'>
                  {formatMoneyPt(subtotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='shrink-0 border-t px-6 py-4'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type='button'
            onClick={handleGuardar}
            disabled={!linha.descricao.trim()}
          >
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
