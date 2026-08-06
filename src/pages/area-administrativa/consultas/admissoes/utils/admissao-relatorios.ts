import { toast } from '@/utils/toast-utils'

/** Relatórios ainda sem motor no novo cliente. */
export function emitirRelatorioAdmissao(
  titulo: string,
  origemRelatorio?: string
) {
  const detalhe = origemRelatorio ? ` (${origemRelatorio})` : ''
  toast.info(`${titulo} — disponível em breve no motor de relatórios${detalhe}.`)
}

export function relatorioDeclaracaoPresenca(utenteId: string, admissaoId: string) {
  emitirRelatorioAdmissao(
    'Declaração de presença',
    `Utente ${utenteId}, admissão ${admissaoId}`
  )
}

export function relatorioLevantamentoExames(admissaoId: string) {
  emitirRelatorioAdmissao('Levantamento de exames', `Admissão ${admissaoId}`)
}

export function relatorioProcessoOrganismo(admissaoId: string) {
  emitirRelatorioAdmissao('Processo organismo', `Admissão ${admissaoId}`)
}

export function relatorioEtiquetaUtente(utenteId: string) {
  emitirRelatorioAdmissao('Etiqueta 1', `Utente ${utenteId}`)
}

export function relatorioEtiquetaAdmissao(utenteId: string, admissaoId: string) {
  emitirRelatorioAdmissao(
    'Etiqueta admissão',
    `Utente ${utenteId}, admissão ${admissaoId}`
  )
}

export function acaoEnviarSms(utenteId: string) {
  toast.info(`Enviar SMS (utente ${utenteId}) — integração em curso.`)
}

export function acaoKiosk(utenteId: string, bloqueado: boolean) {
  toast.info(
    bloqueado
      ? `Desbloquear acesso kiosk (utente ${utenteId}) — integração em curso.`
      : `Bloquear acesso kiosk (utente ${utenteId}) — integração em curso.`
  )
}
