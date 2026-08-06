import { toast } from '@/utils/toast-utils'
import type { CredenciaisSnsLoteTableDTO } from '@/types/dtos/faturacao/credenciais-sns.dtos'

function emitirRelatorioCredenciaisSns(titulo: string, detalhe?: string) {
  const suffix = detalhe ? ` (${detalhe})` : ''
  toast.info(`${titulo} — disponível em breve no motor de relatórios${suffix}.`)
}

export function emitirCredenciaisSnsListagemRelatorio() {
  emitirRelatorioCredenciaisSns('Listagem Credenciais S.N.S.')
}

export function imprimirEtiquetasCredenciaisSns(row: CredenciaisSnsLoteTableDTO) {
  emitirRelatorioCredenciaisSns(
    'Imprimir etiquetas',
    `lote ${row.numeroLote}, ano ${row.ano}, mês ${row.mes}`
  )
}

export function credenciaisSnsOperacaoEmBreve(operacao: string) {
  toast.info(`${operacao} — integração em curso (CredenciaisSns).`)
}
