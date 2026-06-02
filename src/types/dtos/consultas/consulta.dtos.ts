export interface ConsultaTableDTO {
  id: string
  data?: string | null
  horaInic?: string | null
  horaFim?: string | null
  horaChegada?: string | null
  sala?: string | null
  utenteId?: string | null
  /** Número de utente (clínico); preferir em listagens em vez do GUID `utenteId`. */
  utenteNumero?: string | null
  utenteNome?: string | null
  organismoId?: string | null
  organismoNome?: string | null
  medicoId?: string | null
  medicoNome?: string | null
  especialidadeId?: string | null
  especialidadeDesignacao?: string | null
  tecnicoId?: string | null
  confirmado?: boolean | null
  efectuado?: boolean | null
  efetuado?: boolean | null
  faltou?: boolean | null
  statusConsulta?: number | null
  statusConsultaLabel?: string | null
  diagnostico?: string | null
  obs?: string | null
  credencial?: string | null
  createdOn: string
  tipoConsultaId?: string | null
  tipoConsultaDesignacao?: string | null
  motivoConsultaId?: string | null
  motivoConsultaDesignacao?: string | null
}

export interface ConsultaDoDiaDTO {
  id: string
  consultaId?: string | null
  consultaMarcacaoId?: string | null
  admissaoId?: string | null
  origem?: string | null
  utenteId?: string | null
  utenteNumero?: string | null
  utenteNome?: string | null
  medicoId?: string | null
  medicoNome?: string | null
  especialidadeId?: string | null
  especialidadeDesignacao?: string | null
  organismoId?: string | null
  organismoNome?: string | null
  data?: string | null
  dataLabel?: string | null
  horaInicio?: string | null
  horaFim?: string | null
  horaChegada?: string | null
  tipoConsultaId?: string | null
  tipoConsultaDesignacao?: string | null
  tipoAdmissaoId?: string | null
  tipoAdmissaoDesignacao?: string | null
  diagnostico?: string | null
  statusConsulta?: number | null
  statusConsultaLabel?: string | null
  confirmado?: boolean | null
  efetuado?: boolean | null
  faltou?: boolean | null
  podeIniciarAtendimento?: boolean | null
}

export interface IniciarAtendimentoConsultaRequest {
  consultaId?: string | null
  consultaMarcacaoId?: string | null
  admissaoId?: string | null
}

export interface IniciarAtendimentoConsultaDTO {
  consultaId: string
  consultaMarcacaoId?: string | null
  admissaoId?: string | null
  utenteId: string
  medicoId?: string | null
  utenteNome?: string | null
  origem: string
  consultaCriada: boolean
}
