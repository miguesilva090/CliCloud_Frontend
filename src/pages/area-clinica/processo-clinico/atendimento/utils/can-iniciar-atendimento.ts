/** Alinhado com `StatusConsulta` (Backend/CliCloud.Domain/Enums/StatusConsulta.cs). */
export const StatusConsultaCodigo = {
  Agendada: 0,
  Pendente: 1,
  Desmarcada: 2,
  Suspensa: 4,
  EmAtendimento: 5,
  Concluida: 6,
  Faltou: 7,
  FaltouJustificada: 8,
} as const

const ESTADOS_BLOQUEADOS = [
  StatusConsultaCodigo.Desmarcada,
  StatusConsultaCodigo.Suspensa,
  StatusConsultaCodigo.Concluida,
  StatusConsultaCodigo.Faltou,
  StatusConsultaCodigo.FaltouJustificada,
]

export function canIniciarAtendimentoConsulta(
  statusConsulta: number | null | undefined,
  options?: {
    mostrarDesmarcadas?: boolean
    podeIniciarAtendimento?: boolean | null
    efetuado?: boolean | null
    faltou?: boolean | null
  }
): boolean {
  if (options?.mostrarDesmarcadas) return false
  if (options?.podeIniciarAtendimento === false) return false
  if (options?.podeIniciarAtendimento === true) return true
  if (options?.efetuado || options?.faltou) return false

  const codigo = statusConsulta ?? -1
  return !ESTADOS_BLOQUEADOS.includes(codigo)
}
