import type { CreateReceitaLinhaRequest } from '@/types/dtos/prescricao/receita-medica.dtos'
import type {
  CreateMedicacaoCronicaRequest,
  MedicacaoCronicaDTO,
} from '@/types/dtos/prescricao/medicacao-cronica.dtos'

export const MSG_MED_CRONICA = {
  utenteMissing: 'Seleccione o utente.',
  naoCronico: 'Só é permitido guardar medicação crónica para utentes crónicos.',
  tipoInvalido:
    'Não é permitido adicionar a medicação crónica para este tipo Prescrição',
  semInfarmed: 'Só medicamentos Infarmed (com CNPEM) podem ir para a crónica.',
  adicionada: 'O medicamento foi adicionado à medicação crónica',
  removida: 'Medicação crónica removida.',
  duplicado: 'O medicamento que selecionou, já se encontra guardado.',
  erro: 'Falha na medicação crónica.',
} as const

export function tipoReceitaPermiteCronica(tipoReceita: number): boolean {
  return tipoReceita === 1 || tipoReceita === 3
}

export function linhaPermiteGuardarCronica(linha: {
  tipoLinha?: number | null
  cnpem?: string | null
}): boolean {
  const tipo = linha.tipoLinha ?? 1
  if (tipo !== 1 && tipo !== 3) return false
  return Boolean(linha.cnpem?.trim())
}

export function mapLinhaToCreateCronica(
  utenteId: string,
  linha: CreateReceitaLinhaRequest
): CreateMedicacaoCronicaRequest | { error: string } {
  const cnpem = linha.cnpem?.trim() ?? ''
  if (!cnpem) return { error: MSG_MED_CRONICA.semInfarmed }
  const tipo = linha.tipoLinha ?? 1
  if (tipo !== 1 && tipo !== 3) return { error: MSG_MED_CRONICA.tipoInvalido }
  return {
    utenteId,
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

export function mapCronicaToLinhaDraft(
  item: MedicacaoCronicaDTO
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
