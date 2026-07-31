import type { CredenciaisSnsModulo } from '@/types/dtos/faturacao/credenciais-sns.dtos'

export const CREDENCIAIS_SNS_LIST_MODULOS: CredenciaisSnsModulo[] = [
  'fisioterapia',
  'especialidades',
  'exames',
]

export function isCredenciaisSnsListModulo(
  value: string | undefined
): value is CredenciaisSnsModulo {
  return CREDENCIAIS_SNS_LIST_MODULOS.includes(value as CredenciaisSnsModulo)
}

export function credenciaisSnsModuloLabel(modulo: CredenciaisSnsModulo): string {
  const map: Record<CredenciaisSnsModulo, string> = {
    fisioterapia: 'Fisioterapia',
    especialidades: 'Especialidades',
    exames: 'Exames',
  }
  return map[modulo]
}

export function credenciaisSnsPageTitle(modulo: CredenciaisSnsModulo): string {
  return `Credenciais S.N.S. — ${credenciaisSnsModuloLabel(modulo)}`
}

/** Legado: especialidades (LOTESP/EF) e fisioterapia (dbo.LOTESPFISIO). */
export function credenciaisSnsModuloHasBackendList(modulo: CredenciaisSnsModulo): boolean {
  return modulo === 'especialidades' || modulo === 'fisioterapia'
}

export function credenciaisSnsModuloHasBackendDelete(modulo: CredenciaisSnsModulo): boolean {
  return modulo === 'especialidades' || modulo === 'fisioterapia'
}
