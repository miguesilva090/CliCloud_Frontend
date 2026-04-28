export interface ConsultaTableDTO {
  id: string
  data?: string | null
  horaInic?: string | null
  horaFim?: string | null
  sala?: string | null
  utenteId?: string | null
  /** Número de utente (clínico); preferir em listagens em vez do GUID `utenteId`. */
  utenteNumero?: string | null
  utenteNome?: string | null
  organismoId?: string | null
  organismoNome?: string | null
  medicoId?: string | null
  especialidadeId?: string | null
  tecnicoId?: string | null
  confirmado?: boolean | null
  efectuado?: boolean | null
  faltou?: boolean | null
  createdOn: string
  tipoConsultaId?: string | null
  tipoConsultaDesignacao?: string | null
}
