import type { MedicamentoPrescricaoOpcaoDto } from '@/types/dtos/prescricao/medicamentos-infarmed.dtos'

/** Paridade PrescricaoRSPEdtNova.js (mostrarModalGenerico). */
export function shouldShowGenericosModal(
  cnpemEscolhido: string | null | undefined,
  opcoes: MedicamentoPrescricaoOpcaoDto[] | null | undefined
): boolean {
  if (!opcoes?.length) return false
  if (opcoes.length <= 1) return false
  if (
    opcoes.length === 2 &&
    opcoes[0]?.cnpem &&
    opcoes[0].cnpem === opcoes[1]?.cnpem
  ) {
    return false
  }
  if (!cnpemEscolhido) return opcoes.length > 1
  return opcoes.some((o) => o.cnpem && o.cnpem !== cnpemEscolhido)
}

export function listEquivalentesParaModal(
  cnpemEscolhido: string | null | undefined,
  opcoes: MedicamentoPrescricaoOpcaoDto[]
): MedicamentoPrescricaoOpcaoDto[] {
  return opcoes.filter(
    (o) => o.cnpem && (!cnpemEscolhido || o.cnpem !== cnpemEscolhido)
  )
}

export function formatEuroOpcao(
  value: number | null | undefined
): string {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}
