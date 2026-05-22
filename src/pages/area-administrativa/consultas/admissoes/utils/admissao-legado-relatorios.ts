import { toast } from '@/utils/toast-utils'

/** Relatórios ainda sem motor no novo cliente — mensagem alinhada ao legado (AdmissoesLst.js). */
export function emitirRelatorioAdmissaoLegado(
  titulo: string,
  caminhoLegado?: string
) {
  const detalhe = caminhoLegado ? ` (${caminhoLegado})` : ''
  toast.info(`${titulo} — disponível em breve no motor de relatórios${detalhe}.`)
}

export function relatorioDeclaracaoPresenca(utenteId: string, admissaoId: string) {
  emitirRelatorioAdmissaoLegado(
    'Declaração de presença',
    `Utente ${utenteId}, admissão ${admissaoId}`
  )
}

export function relatorioLevantamentoExames(admissaoId: string) {
  emitirRelatorioAdmissaoLegado('Levantamento de exames', `Admissão ${admissaoId}`)
}

export function relatorioProcessoOrganismo(admissaoId: string) {
  emitirRelatorioAdmissaoLegado('Processo organismo', `Admissão ${admissaoId}`)
}

export function relatorioEtiquetaUtente(utenteId: string) {
  emitirRelatorioAdmissaoLegado('Etiqueta 1', `Utente ${utenteId}`)
}

export function relatorioEtiquetaAdmissao(utenteId: string, admissaoId: string) {
  emitirRelatorioAdmissaoLegado(
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
