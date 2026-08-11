import type {
  MedicamentoComparticipacaoDto,
  MedicamentoPrescricaoLinhaDto,
} from '@/types/dtos/prescricao/medicamentos-infarmed.dtos'

function textoDiploma(
  c?: MedicamentoComparticipacaoDto | null
): string | null {
  const norma = c?.normaRegimeExcecional?.trim()
  if (norma) return norma
  const regime = c?.regimeExcecional?.trim()
  if (regime) return regime
  return null
}

/** Extrai texto de diploma/despacho a partir da ficha Infarmed de prescritção. */
export function extrairDiplomaDePrescricao(
  linha: MedicamentoPrescricaoLinhaDto | null | undefined,
  porDci: boolean
): string | null {
  if (porDci || !linha) return null

  return (
    textoDiploma(linha.comparticipacaoEfectiva) ??
    textoDiploma(linha.comparticipacoesEspeciais?.[0]) ??
    null
  )
}
