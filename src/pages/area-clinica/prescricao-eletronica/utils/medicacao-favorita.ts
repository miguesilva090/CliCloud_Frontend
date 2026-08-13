import type { CreateReceitaLinhaRequest } from '@/types/dtos/prescricao/receita-medica.dtos'
import type {
  CreateMedicacaoFavoritaRequest,
  MedicacaoFavoritaDTO,
} from '@/types/dtos/prescricao/medicacao-favorita.dtos'

export const MSG_MED_FAVORITA = {
  medicoMissing: 'Seleccione o médico.',
  tipoInvalido:
    'Não é permitido adicionar aos favoritos para este tipo Prescrição',
  semInfarmed:
    'Só medicamentos Infarmed (com CNPEM) podem ir para os favoritos.',
  adicionada: 'O medicamento foi adicionado à medicação favorita',
  removida: 'Favorito removido.',
  duplicado: 'O medicamento que selecionou, já se encontra nos favoritos.',
  erro: 'Falha nos favoritos.',
} as const

export function tipoReceitaPermiteFavorito(tipoReceita: number): boolean {
  return tipoReceita === 1 || tipoReceita === 3
}

export function linhaPermiteGuardarFavorito(linha: {
  tipoLinha?: number | null
  cnpem?: string | null
}): boolean {
  const tipo = linha.tipoLinha ?? 1
  if (tipo !== 1 && tipo !== 3) return false
  return Boolean(linha.cnpem?.trim())
}

export function mapLinhaToCreateFavorito(
  medicoId: string,
  linha: CreateReceitaLinhaRequest
): CreateMedicacaoFavoritaRequest | { error: string } {
  const cnpem = linha.cnpem?.trim() ?? ''
  if (!cnpem) return { error: MSG_MED_FAVORITA.semInfarmed }
  const tipo = linha.tipoLinha ?? 1
  if (tipo !== 1 && tipo !== 3) return { error: MSG_MED_FAVORITA.tipoInvalido }
  return {
    medicoId,
    cnpem,
    embId: linha.embId ?? null,
    designacao: linha.designacao.trim(),
    dosagem: null,
    descricaoEmbalagem: linha.descricaoEmbalagem ?? null,
    formaFarmaceutica: null,
    principioAtivo: null,
    posologia: linha.posologia ?? null,
    tipoLinha: tipo,
  }
}

export function mapFavoritoToLinhaDraft(
  item: MedicacaoFavoritaDTO
): CreateReceitaLinhaRequest {
  return {
    ordem: 0,
    tipoLinha: item.tipoLinha || 1,
    embId: item.embId ?? null,
    cnpem: item.cnpem,
    designacao: item.designacao,
    descricaoEmbalagem: item.descricaoEmbalagem ?? null,
    quantidade: 1,
    pvp: null,
    comparticipacao: null,
    valorUtente: null,
    posologia: item.posologia ?? null,
    codTipoPrescricao: 1,
    codMotivo: null,
    codIndicacaoTerapeutica: null,
    diploma: null,
    codValidade: 1,
  }
}
