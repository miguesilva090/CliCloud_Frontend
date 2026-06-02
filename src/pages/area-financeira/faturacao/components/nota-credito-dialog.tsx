import { useEffect, useMemo, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/utils/toast-utils'
import type { DocumentoTableDTO } from '@/types/dtos/faturacao/documento.dtos'
import { useGetTiposDocumentoLight } from '../queries/tipo-documento-queries'
import { useCriarNotaCreditoMutation } from '@/pages/area-financeira/documentos/queries/documento-emissao-queries'
import {
  useGetDocumentoById,
  useInvalidateDocumentosMutation,
} from '../queries/documento-queries'
import {
  getFaturacaoApiErrorMessage,
  isFaturacaoApiSuccess,
} from '../utils/faturacao-api-utils'
import { getDocumentoNumeroLabel } from '../utils/faturacao-documento-display'

const ID_FUNCIONALIDADE = 'documentos'

type SeleccaoLinha = {
  selected: boolean
  quantidade: number
}

export function NotaCreditoDialog({
  documento,
  onOpenChange,
}: {
  documento: DocumentoTableDTO | null
  onOpenChange: (open: boolean) => void
}) {
  const [tipoDocumentoId, setTipoDocumentoId] = useState('')
  const [anoFiscal, setAnoFiscal] = useState(String(new Date().getFullYear()))
  const [motivo, setMotivo] = useState('')
  const [creditoTotal, setCreditoTotal] = useState(true)
  const [linhasSel, setLinhasSel] = useState<Record<string, SeleccaoLinha>>({})

  const { data } = useGetTiposDocumentoLight('', ID_FUNCIONALIDADE)
  const tiposDocumento = useMemo(
    () => (data?.info?.data ?? []).filter((x) => !x.inactivo),
    [data],
  )

  const documentoId = documento?.id ?? ''
  const docQ = useGetDocumentoById(documentoId, ID_FUNCIONALIDADE)
  const linhasDocumento = useMemo(() => {
    const info = docQ.data?.info
    if (!info || !isFaturacaoApiSuccess(info) || !info.data) return []
    return info.data.linhas ?? []
  }, [docQ.data])

  useEffect(() => {
    const next: Record<string, SeleccaoLinha> = {}
    for (const l of linhasDocumento) {
      next[l.id] = { selected: false, quantidade: l.quantidade }
    }
    setLinhasSel(next)
  }, [documentoId, linhasDocumento])

  const ncMutation = useCriarNotaCreditoMutation(ID_FUNCIONALIDADE)
  const invalidateMutation = useInvalidateDocumentosMutation()

  const anyLinhaSelecionada = useMemo(
    () => Object.values(linhasSel).some((x) => x.selected && x.quantidade > 0),
    [linhasSel],
  )

  const toggleLinha = (id: string, checked: boolean) => {
    setLinhasSel((s) => ({
      ...s,
      [id]: {
        selected: checked,
        quantidade: s[id]?.quantidade ?? 0,
      },
    }))
  }

  const changeQuantidade = (id: string, q: number, max: number) => {
    const safe = Number.isFinite(q) ? Math.max(0, Math.min(q, max)) : 0
    setLinhasSel((s) => ({
      ...s,
      [id]: {
        selected: s[id]?.selected ?? false,
        quantidade: safe,
      },
    }))
  }

  const handleCriarNc = async () => {
    if (!documento) return
    if (!tipoDocumentoId) {
      toast.error('Selecione o tipo de documento da nota de crédito.')
      return
    }
    if (!motivo.trim()) {
      toast.error('Motivo da nota de crédito é obrigatório.')
      return
    }
    if (!creditoTotal && !anyLinhaSelecionada) {
      toast.error('Selecione pelo menos uma linha para crédito parcial.')
      return
    }

    const linhasPayload = !creditoTotal
      ? linhasDocumento
          .filter((l) => linhasSel[l.id]?.selected && (linhasSel[l.id]?.quantidade ?? 0) > 0)
          .map((l) => ({
            documentoLinhaOrigemId: l.id,
            quantidade: linhasSel[l.id].quantidade,
          }))
      : undefined

    try {
      const res = await ncMutation.mutateAsync({
        documentoOrigemId: documento.id,
        tipoDocumentoId,
        anoFiscal: Number(anoFiscal),
        motivo: motivo.trim(),
        creditoTotal,
        linhas: linhasPayload,
      })

      if (isFaturacaoApiSuccess(res.info)) {
        toast.success('Nota de crédito criada com sucesso.')
        await invalidateMutation.mutateAsync()
        onOpenChange(false)
        setMotivo('')
      } else {
        toast.error(
          getFaturacaoApiErrorMessage(
            res.info,
            'Não foi possível criar a nota de crédito.',
          ),
        )
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao criar nota de crédito.',
      )
    }
  }

  return (
    <Dialog open={!!documento} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>
            Nota de Crédito — origem{' '}
            {documento ? getDocumentoNumeroLabel(documento) : ''}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Tipo Documento NC *</Label>
              <Select value={tipoDocumentoId} onValueChange={setTipoDocumentoId}>
                <SelectTrigger>
                  <SelectValue placeholder='Selecionar tipo documento' />
                </SelectTrigger>
                <SelectContent>
                  {tiposDocumento.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.abreviatura} - {tipo.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Ano Fiscal</Label>
              <Input
                type='number'
                value={anoFiscal}
                onChange={(e) => setAnoFiscal(e.target.value)}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Motivo *</Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder='Indique o motivo da nota de crédito'
            />
          </div>

          <div className='flex items-center gap-2'>
            <Checkbox
              id='credito-total'
              checked={creditoTotal}
              onCheckedChange={(checked) => setCreditoTotal(!!checked)}
            />
            <Label htmlFor='credito-total'>Crédito total</Label>
          </div>

          {!creditoTotal ? (
            <div className='space-y-2'>
              <Label>Linhas para crédito parcial</Label>
              <div className='max-h-72 overflow-auto rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12' />
                      <TableHead>Descrição</TableHead>
                      <TableHead className='w-28'>Qtd origem</TableHead>
                      <TableHead className='w-32'>Qtd crédito</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linhasDocumento.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className='text-muted-foreground'>
                          Sem linhas no documento origem.
                        </TableCell>
                      </TableRow>
                    ) : (
                      linhasDocumento.map((l) => {
                        const sel = linhasSel[l.id]?.selected ?? false
                        const qtd = linhasSel[l.id]?.quantidade ?? l.quantidade
                        return (
                          <TableRow key={l.id}>
                            <TableCell>
                              <Checkbox
                                checked={sel}
                                onCheckedChange={(v) => toggleLinha(l.id, !!v)}
                              />
                            </TableCell>
                            <TableCell>{l.descricao}</TableCell>
                            <TableCell>{l.quantidade}</TableCell>
                            <TableCell>
                              <Input
                                type='number'
                                min={0}
                                max={l.quantidade}
                                step={0.01}
                                disabled={!sel}
                                value={qtd}
                                onChange={(e) =>
                                  changeQuantidade(
                                    l.id,
                                    Number(e.target.value),
                                    l.quantidade,
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCriarNc} disabled={ncMutation.isPending}>
            Criar NC
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}