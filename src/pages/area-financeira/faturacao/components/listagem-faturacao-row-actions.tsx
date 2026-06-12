import {
  Ban,
  CreditCard,
  FileText,
  History,
  List,
  ListChecks,
  Mail,
  Printer,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { DocumentoTableDTO } from '@/types/dtos/faturacao/documento.dtos'
import {
  podeAnularDocumento,
  podeCriarNotaCredito,
  podeEmitirFaturaDocumento,
  podeEnviarEmailDocumento,
  podeImprimirOriginalDocumento,
  podeLiquidarDocumento,
  podeReimprimirDocumento,
  podeValidarTransporteDocumento,
} from '../utils/listagem-faturacao-acoes'

/** Ações de linha alinhadas ao legado TfaturaLst: e-mail visível + menu Tarefas. */
export function ListagemFaturacaoRowActions({
  row,
  onEnviarEmail,
  onHistoricoReimpressao,
  onEmitirFatura,
  onDetalhesAdmissoes,
  onMotivoAnulacao,
  onValidacaoTransporte,
  onImprimirOriginal,
  onReimprimir,
  onLiquidar,
  onAnular,
  onNotaCredito,
}: {
  row: DocumentoTableDTO
  onEnviarEmail: (row: DocumentoTableDTO) => void
  onHistoricoReimpressao: (row: DocumentoTableDTO) => void
  onEmitirFatura: (row: DocumentoTableDTO) => void
  onDetalhesAdmissoes: (row: DocumentoTableDTO) => void
  onMotivoAnulacao: (row: DocumentoTableDTO) => void
  onValidacaoTransporte: (row: DocumentoTableDTO) => void
  onImprimirOriginal: (row: DocumentoTableDTO) => void
  onReimprimir: (row: DocumentoTableDTO) => void
  onLiquidar: (row: DocumentoTableDTO) => void
  onAnular: (row: DocumentoTableDTO) => void
  onNotaCredito: (row: DocumentoTableDTO) => void
}) {
  const canEmail = podeEnviarEmailDocumento(row)
  const canOriginal = podeImprimirOriginalDocumento(row)
  const canReimprimir = podeReimprimirDocumento(row)
  const canLiquidar = podeLiquidarDocumento(row)
  const canValidarTransporte = podeValidarTransporteDocumento(row)
  const canEmitirFatura = podeEmitirFaturaDocumento(row)
  const canAnular = podeAnularDocumento(row)
  const canNc = podeCriarNotaCredito(row)

  const temMenu =
    canOriginal ||
    canReimprimir ||
    canLiquidar ||
    canValidarTransporte ||
    canEmitirFatura ||
    canAnular ||
    canNc ||
    row.anulado

  return (
    <>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        title='Enviar email'
        disabled={!canEmail}
        onClick={() => onEnviarEmail(row)}
      >
        <Mail className='h-4 w-4' />
      </Button>
      {temMenu ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              title='Mais opções'
            >
              <ListChecks className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            {canOriginal ? (
              <DropdownMenuItem onClick={() => onImprimirOriginal(row)}>
                <Printer className='mr-2 h-4 w-4' />
                Imprimir original
              </DropdownMenuItem>
            ) : null}
            {canReimprimir ? (
              <DropdownMenuItem onClick={() => onReimprimir(row)}>
                <Printer className='mr-2 h-4 w-4' />
                Reimprimir
              </DropdownMenuItem>
            ) : null}
            {canOriginal ? (
              <DropdownMenuItem onClick={() => onHistoricoReimpressao(row)}>
                <History className='mr-2 h-4 w-4' />
                Histórico reimpressão original
              </DropdownMenuItem>
            ) : null}
            {canLiquidar ? (
              <DropdownMenuItem onClick={() => onLiquidar(row)}>
                <CreditCard className='mr-2 h-4 w-4' />
                Liquidar / pagamento
              </DropdownMenuItem>
            ) : null}
            {canEmitirFatura ? (
              <DropdownMenuItem onClick={() => onEmitirFatura(row)}>
                <FileText className='mr-2 h-4 w-4' />
                Emitir fatura
              </DropdownMenuItem>
            ) : null}
            {canValidarTransporte ? (
              <DropdownMenuItem onClick={() => onValidacaoTransporte(row)}>
                <Truck className='mr-2 h-4 w-4' />
                Validação de transporte
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={() => onDetalhesAdmissoes(row)}>
              <List className='mr-2 h-4 w-4' />
              Detalhes admissões
            </DropdownMenuItem>
            {(canAnular || canNc || row.anulado) && (
              <DropdownMenuSeparator />
            )}
            {row.anulado ? (
              <DropdownMenuItem onClick={() => onMotivoAnulacao(row)}>
                <FileText className='mr-2 h-4 w-4' />
                Ver motivo de anulação
              </DropdownMenuItem>
            ) : null}
            {canAnular ? (
              <DropdownMenuItem onClick={() => onAnular(row)}>
                <Ban className='mr-2 h-4 w-4' />
                Anular
              </DropdownMenuItem>
            ) : null}
            {canNc ? (
              <DropdownMenuItem onClick={() => onNotaCredito(row)}>
                <FileText className='mr-2 h-4 w-4' />
                Nota de crédito
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </>
  )
}
