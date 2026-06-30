import { toast } from '@/utils/toast-utils'

function emitirRelatorioCredenciaisLegado(titulo: string, caminhoLegado?: string) {
  const detalhe = caminhoLegado ? ` (${caminhoLegado})` : ''
  toast.info(`${titulo} — disponível em breve no motor de relatórios${detalhe}.`)
}

export type ListagemLoteDirectReportTipo = '1' | '2' | '3' | '4' | '5' | '6' | '7'

export function emitirListagemLoteDirect(
  tipo: ListagemLoteDirectReportTipo,
  params: Record<string, string | number | undefined>
) {
  const map: Record<ListagemLoteDirectReportTipo, string> = {
    '1': 'ListagemLancamentoCredenciaisConsultasCodigo.rpt',
    '2': 'LancamentoCredenciaisEtiquetasP1Impressora.rpt',
    '3': 'EtiquetasP1ImpressoraNIF.rpt',
    '4': 'ListagemLancamentoCredenciaisConsultasCentroDiscriminado.rpt',
    '5': 'ListagemLancamentoCredenciaisConsultasCentroQuantidade.rpt',
    '6': 'ListagemLancamentoCredenciaisConsultasMedico.rpt',
    '7': 'ListagemLancamentoCredenciaisConsultasMedicoExterno.rpt',
  }
  emitirRelatorioCredenciaisLegado(`Listagem tipo ${tipo}`, map[tipo])
  void params
}

export function relatorioEtiquetaCredencialP1(loteDirectId: string) {
  emitirRelatorioCredenciaisLegado(
    'Etiqueta credencial P1',
    `ListagemLancamentoCredenciaisConsultasEtiquetaP1.rpt · id ${loteDirectId}`
  )
}
