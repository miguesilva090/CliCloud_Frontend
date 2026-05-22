/**
 * Deep-link da agenda (legado MarcacoesLst.aspx).
 *
 * No projeto novo NÃO existem c_medico / c_utente — são aliases de URL legados
 * mapeados para numeroUtente, medicoId (Guid), especialidadeId, etc.
 */

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isGuid(value: string | null | undefined): value is string {
  return !!value && GUID_RE.test(value.trim())
}

/** Parâmetros crus da query string (canónicos + aliases legados). */
export type MarcacoesAgendaUrlRawParams = {
  /** Guid do médico (canónico). */
  medicoId: string
  /** c_medico legado quando não é Guid (não mapeável directamente). */
  legacyMedicoKey: string
  /** Guid do utente (canónico). */
  utenteId: string
  /** Número de utente — canónico ou alias legado c_utente. */
  numeroUtente: string
  nomeUtente: string
  /** Guid da especialidade (canónico). */
  especialidadeId: string
  /** Nome da especialidade (legado ?especialidade=). */
  especialidadeNome: string
  /** Código legado 1–4 (t_consulta). */
  tipoConsultaCodigo: string
  credencial: string
  /** Legado c_instit — código numérico de organismo, se aplicável. */
  organismoCodigo: string
  organismoId: string
  numReq: string
  /** Abrir modal de nova marcação ao carregar (ex.: vindo de Marcados). */
  abrirMarcacao: boolean
}

export function parseMarcacoesAgendaSearchParams(
  params: URLSearchParams
): MarcacoesAgendaUrlRawParams {
  const legacyMedicoKey = params.get('c_medico')?.trim() ?? ''
  const legacyUtente = params.get('c_utente')?.trim() ?? ''
  const medicoId =
    params.get('medicoId')?.trim() ||
    (isGuid(legacyMedicoKey) ? legacyMedicoKey : '')

  return {
    medicoId,
    /** Código legado do médico (não-UUID); só informativo / aviso. */
    legacyMedicoKey: legacyMedicoKey && !isGuid(legacyMedicoKey) ? legacyMedicoKey : '',
    utenteId: params.get('utenteId')?.trim() ?? '',
    numeroUtente:
      params.get('numeroUtente')?.trim() ||
      (!isGuid(legacyUtente) ? legacyUtente : ''),
    nomeUtente: params.get('nomeUtente')?.trim() ?? '',
    especialidadeId: params.get('especialidadeId')?.trim() ?? '',
    especialidadeNome: decodeURIComponent(
      (params.get('especialidade') ?? '').replace(/\+/g, ' ')
    ).trim(),
    tipoConsultaCodigo:
      params.get('tipoConsulta')?.trim() ||
      params.get('t_consulta')?.trim() ||
      '',
    credencial: params.get('credencial')?.trim() ?? '',
    organismoCodigo: params.get('c_instit')?.trim() ?? '',
    organismoId: params.get('organismoId')?.trim() ?? '',
    numReq: params.get('numReq')?.trim() ?? '',
    abrirMarcacao:
      params.get('abrirMarcacao') === '1' ||
      params.get('abrirMarcacao') === 'true' ||
      !!legacyUtente ||
      !!params.get('numReq')?.trim(),
  }
}

export function hasMarcacoesAgendaUrlPrefill(raw: MarcacoesAgendaUrlRawParams): boolean {
  return !!(
    raw.medicoId ||
    raw.legacyMedicoKey ||
    raw.utenteId ||
    raw.numeroUtente ||
    raw.especialidadeId ||
    raw.especialidadeNome ||
    raw.abrirMarcacao ||
    raw.numReq
  )
}

export type MarcacoesAgendaResolvedPrefill = {
  criteriaPatch: {
    medicoId?: string
    medicoLabel?: string
    especialidadeId?: string
    especialidadeLabel?: string
  }
  createFormPatch: {
    utenteId?: string
    utenteLabel?: string
    medicoId?: string
    medicoLabel?: string
    especialidadeId?: string
    especialidadeLabel?: string
    tipoConsultaId?: string
    organismoId?: string
    organismoLabel?: string
    credencial?: string
  }
  openCreateModal: boolean
  /** c_medico legado não-UUID — não resolvível sem código legado na entidade Médico. */
  unresolvedLegacyMedicoKey?: string
}
