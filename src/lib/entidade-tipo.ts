/**
 * Valores de TipoEntidade alinhados ao backend (CliCloud.Domain.Enums.EntidadeTipo).
 * Usar no payload de create/update: o frontend não edita este campo; envia o tipo da entidade em causa.
 */
export const ENTIDADE_TIPO = {
  Utente: 1,
  Medico: 2,
  MedicoExterno: 3,
  Tecnico: 4,
  Funcionario: 5,
  Organismo: 6,
  CentroSaude: 7,
  Fornecedor: 8,
  Empresa: 9,
  EntidadeFinanceira: 10,
  Banco: 11,
  Clinica: 12,
  Seguradora: 13,
} as const

export type EntidadeTipoId = (typeof ENTIDADE_TIPO)[keyof typeof ENTIDADE_TIPO]

const VALID_RANGE_MIN = 1
const VALID_RANGE_MAX = 13

/**
 * Devolve o tipoEntidadeId a enviar no payload.
 * Se a entidade carregada tiver um valor válido (1–13), usa-o; senão usa o default do tipo em causa.
 * Usar em todas as páginas de edição (utente, médico, técnico, funcionário, etc.).
 */
export function getTipoEntidadeIdForPayload(
  current: number | undefined | null,
  defaultTipo: EntidadeTipoId
): number {
  if (
    typeof current === 'number' &&
    current >= VALID_RANGE_MIN &&
    current <= VALID_RANGE_MAX
  ) {
    return current
  }
  return defaultTipo
}
