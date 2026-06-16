import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Icons } from '@/components/ui/icons'
import { ResponseStatus } from '@/types/api/responses'
import { inputClass, labelClass } from '@/lib/form-styles'
import type { EmitirDocumentoLinhaRequest } from '@/types/dtos/faturacao/documento-emissao.dtos'
import { novaLinhaDocumento } from '../hooks/use-documento-editor'
import type { DocumentoEditorState } from '../types/documento-editor.types'
import type { DocumentoEditorProfile } from '../utils/documento-tipo-editor-profile'
import {
  calcularSubtotalLinha,
  type OpcoesCalculoDocumento,
} from '../utils/documento-editor-calculos'
import { formatMoneyPt } from '../utils/faturacao-documento-display'
import { findSubsistemaPreco } from '../utils/documento-linha-mappers'
import {
  useSubsistemasOrganismoDocumento,
} from '../queries/documento-editor-queries'
import {
  DocumentoLinhaModal,
  type TipoInsercaoLinha,
} from './documento-linha-modal'

export function DocumentoTabLinhasSection({
  state,
  perfil,
  opcoesCalculo,
  descontosBloqueados = false,
  onChange,
}: {
  state: DocumentoEditorState
  perfil: DocumentoEditorProfile
  opcoesCalculo: OpcoesCalculoDocumento
  descontosBloqueados?: boolean
  onChange: (p: Partial<DocumentoEditorState>) => void
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [tipoInsercao, setTipoInsercao] = useState<TipoInsercaoLinha>('servico')

  const organismoId = state.organismoId
  const subsistemasQ = useSubsistemasOrganismoDocumento(organismoId)
  const subsistemaRows = subsistemasQ.data ?? []

  useEffect(() => {
    if (!state.isentoIva) return
    const needsZero = state.linhas.some((l) => l.taxaIvaPercentagem !== 0)
    if (!needsZero) return
    onChange({
      linhas: state.linhas.map((l) => ({
        ...l,
        taxaIvaPercentagem: 0,
      })),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sincronizar IVA ao marcar isento
  }, [state.isentoIva])

  const linhaEmEdicao =
    editIndex != null ? state.linhas[editIndex] : novaLinhaDocumento()

  const subsistemaLabel = (linha: EmitirDocumentoLinhaRequest) => {
    if (!linha.servicoId || !organismoId) return '—'
    const sub = findSubsistemaPreco(subsistemaRows, linha.servicoId, organismoId)
    return sub ? 'Tab.' : '—'
  }

  const toggleSelect = (index: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(index)
      else next.delete(index)
      return next
    })
  }

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      setSelected(new Set())
      return
    }
    setSelected(new Set(state.linhas.map((_, i) => i)))
  }

  const abrirModal = (index: number | null, tipo: TipoInsercaoLinha) => {
    setTipoInsercao(tipo)
    setEditIndex(index)
    setModalOpen(true)
  }

  const inserirLinha = (tipo: TipoInsercaoLinha) => {
    const linha = novaLinhaDocumento()
    if (tipo === 'texto') {
      linha.servicoId = null
      linha.precoUnitario = 0
    }
    if (tipo === 'artigo') {
      linha.servicoId = null
    }
    const linhas = [...state.linhas, linha]
    onChange({ linhas })
    abrirModal(linhas.length - 1, tipo)
  }

  const guardarLinhaModal = (linha: EmitirDocumentoLinhaRequest) => {
    if (editIndex == null) return
    const linhas = [...state.linhas]
    linhas[editIndex] = linha
    onChange({ linhas })
    setEditIndex(null)
  }

  const removerSeleccionadas = () => {
    if (!selected.size) return
    const linhas = state.linhas.filter((_, i) => !selected.has(i))
    onChange({ linhas })
    setSelected(new Set())
  }

  const todasSeleccionadas =
    state.linhas.length > 0 && selected.size === state.linhas.length

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <Label className='text-base'>Linhas de Faturação</Label>
        <div className='flex flex-wrap gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type='button' variant='outline' size='sm'>
                Inserir
                <Icons.chevronRight className='ml-1 h-3 w-3 rotate-90' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => inserirLinha('servico')}>
                Serviços
              </DropdownMenuItem>
              {perfil.mostraColunaArtigo ? (
                <DropdownMenuItem onClick={() => inserirLinha('artigo')}>
                  Artigos
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={() => inserirLinha('texto')}>
                Linha de texto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={!selected.size}
            onClick={removerSeleccionadas}
          >
            Remover
          </Button>
        </div>
      </div>

      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-10'>
                <Checkbox
                  checked={todasSeleccionadas}
                  onCheckedChange={(v) => toggleAll(v === true)}
                  aria-label='Seleccionar todas'
                />
              </TableHead>
              <TableHead className='w-8'>#</TableHead>
              <TableHead>Designação</TableHead>
              {perfil.mostraColunaArtigo ? (
                <TableHead className='w-20'>Ref.</TableHead>
              ) : null}
              <TableHead className='w-16'>Qtd</TableHead>
              <TableHead className='w-24'>Preço</TableHead>
              <TableHead className='w-16'>IVA%</TableHead>
              {perfil.mostraPrecosSubsistema && organismoId ? (
                <TableHead className='w-20'>Subsist.</TableHead>
              ) : null}
              <TableHead className='w-28 text-right'>Subtotal</TableHead>
              <TableHead className='w-20' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.linhas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    8 +
                    (perfil.mostraColunaArtigo ? 1 : 0) +
                    (perfil.mostraPrecosSubsistema && organismoId ? 1 : 0)
                  }
                  className='py-8 text-center text-muted-foreground'
                >
                  Sem linhas. Use Inserir para adicionar serviços, artigos ou linha de
                  texto.
                </TableCell>
              </TableRow>
            ) : null}
            {state.linhas.map((linha, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(index)}
                    onCheckedChange={(v) => toggleSelect(index, v === true)}
                    aria-label={`Linha ${index + 1}`}
                  />
                </TableCell>
                <TableCell className='text-muted-foreground text-xs'>
                  {index + 1}
                </TableCell>
                <TableCell className='max-w-[200px] truncate'>
                  {linha.descricao || '—'}
                </TableCell>
                {perfil.mostraColunaArtigo ? (
                  <TableCell className='text-xs'>
                    {linha.codigoArtigo ?? '—'}
                  </TableCell>
                ) : null}
                <TableCell className='tabular-nums'>{linha.quantidade}</TableCell>
                <TableCell className='tabular-nums'>
                  {formatMoneyPt(linha.precoUnitario)}
                </TableCell>
                <TableCell className='tabular-nums'>
                  {opcoesCalculo.isentoIva ? 0 : linha.taxaIvaPercentagem}%
                </TableCell>
                {perfil.mostraPrecosSubsistema && organismoId ? (
                  <TableCell className='text-xs'>
                    {subsistemaLabel(linha)}
                  </TableCell>
                ) : null}
                <TableCell className='text-right tabular-nums'>
                  {formatMoneyPt(calcularSubtotalLinha(linha, opcoesCalculo))}
                </TableCell>
                <TableCell>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      abrirModal(
                        index,
                        linha.servicoId
                          ? 'servico'
                          : linha.codigoArtigo
                            ? 'artigo'
                            : 'texto',
                      )
                    }
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='flex justify-end'>
        <div className='w-48 space-y-1'>
          <Label className={labelClass}>Desconto total %</Label>
          <Input
            type='number'
            className={inputClass}
            disabled={descontosBloqueados}
            title={
              descontosBloqueados
                ? 'Este organismo não pode ter descontos'
                : undefined
            }
            value={state.percentagemDescontoGlobal}
            onChange={(e) =>
              onChange({ percentagemDescontoGlobal: Number(e.target.value) })
            }
          />
        </div>
      </div>

      <DocumentoLinhaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        linha={linhaEmEdicao}
        tipoInsercao={tipoInsercao}
        perfil={perfil}
        opcoesCalculo={opcoesCalculo}
        organismoId={organismoId}
        descontosBloqueados={descontosBloqueados}
        motivoIsencaoDocumentoId={
          state.isentoIva ? state.motivoIsencaoId : null
        }
        onSave={guardarLinhaModal}
      />
    </div>
  )
}
