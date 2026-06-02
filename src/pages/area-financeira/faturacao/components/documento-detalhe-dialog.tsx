import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useGetDocumentoById } from '../queries/documento-queries'
import {
  formatDatePt,
  formatMoneyPt,
  getDocumentoEstadoBadge,
  getDocumentoNumeroLabel,
} from '../utils/faturacao-documento-display'

const ID_FUNCIONALIDADE = 'documentos'

export function DocumentoDetalheDialog({
  documentoId,
  onOpenChange,
}: {
  documentoId: string | null
  onOpenChange: (open: boolean) => void
}) {
  const { data, isLoading } = useGetDocumentoById(
    documentoId ?? '',
    ID_FUNCIONALIDADE,
  )
  const documento = data?.info?.data
  const estadoBadge = documento ? getDocumentoEstadoBadge(documento) : null

  return (
    <Dialog open={!!documentoId} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {documento
              ? `Documento ${getDocumentoNumeroLabel(documento)}`
              : 'Detalhes do Documento'}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className='text-sm text-muted-foreground'>A carregar...</div>
        ) : !documento ? (
          <div className='text-sm text-muted-foreground'>
            Sem dados para apresentar
          </div>
        ) : (
          <div className='space-y-4 text-sm'>
            <div className='flex flex-wrap items-center gap-2'>
              {estadoBadge ? (
                <Badge variant={estadoBadge.variant}>{estadoBadge.label}</Badge>
              ) : null}
              {documento.origemLabel ? (
                <Badge variant='outline'>Origem: {documento.origemLabel}</Badge>
              ) : null}
            </div>

            <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
              <div>
                <strong>Data:</strong> {formatDatePt(documento.data)}
              </div>
              <div>
                <strong>Cliente:</strong> {documento.nomeCliente ?? '-'}
              </div>
              <div>
                <strong>NIF:</strong>{' '}
                {documento.numeroContribuinteCliente ?? '-'}
              </div>
              <div>
                <strong>Morada:</strong> {documento.moradaCliente ?? '-'}
              </div>
              <div>
                <strong>Total documento:</strong>{' '}
                {formatMoneyPt(documento.totalDocumento)}
              </div>
              <div>
                <strong>Total desconto:</strong>{' '}
                {formatMoneyPt(documento.totalDesconto)}
              </div>
              <div>
                <strong>Total IVA:</strong> {formatMoneyPt(documento.totalIva)}
              </div>
              <div>
                <strong>Total líquido:</strong>{' '}
                {formatMoneyPt(documento.totalLiquido)}
              </div>
              <div>
                <strong>Liquidado:</strong>{' '}
                {documento.liquidado ? 'Sim' : 'Não'}
              </div>
            </div>

            {documento.anulado ? (
              <div className='rounded-md border border-destructive/40 bg-destructive/5 p-3'>
                <div>
                  <strong>Anulado:</strong> {formatDatePt(documento.dataAnulacao)}
                </div>
                <div>
                  <strong>Motivo:</strong> {documento.motivoAnulacao ?? '-'}
                </div>
              </div>
            ) : null}

            {documento.observacoes ? (
              <div>
                <strong>Observações:</strong> {documento.observacoes}
              </div>
            ) : null}

            <div>
              <strong className='mb-2 block'>Linhas</strong>
              {documento.linhas?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className='text-right'>Qtd.</TableHead>
                      <TableHead className='text-right'>Preço</TableHead>
                      <TableHead className='text-right'>IVA %</TableHead>
                      <TableHead className='text-right'>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documento.linhas.map((linha) => (
                      <TableRow key={linha.id}>
                        <TableCell>{linha.numeroLinha}</TableCell>
                        <TableCell>{linha.descricao}</TableCell>
                        <TableCell className='text-right'>
                          {linha.quantidade}
                        </TableCell>
                        <TableCell className='text-right'>
                          {formatMoneyPt(linha.precoUnitario)}
                        </TableCell>
                        <TableCell className='text-right'>
                          {linha.taxaIvaPercentagem}%
                        </TableCell>
                        <TableCell className='text-right'>
                          {formatMoneyPt(linha.totalLinha)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className='text-muted-foreground'>Sem linhas</div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
