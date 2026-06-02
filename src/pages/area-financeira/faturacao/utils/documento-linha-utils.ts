import type { EmitirDocumentoLinhaRequest } from '@/types/dtos/faturacao/documento-emissao.dtos'

/** Linha com dados reais (legado: TFaturaLinha.dados só bloqueia após inserir linha efectiva). */
export function linhaDocumentoTemConteudo(l: EmitirDocumentoLinhaRequest): boolean {
  if (l.servicoId || l.admissaoServicoId) return true
  return l.descricao.trim().length > 0 && l.quantidade > 0
}
