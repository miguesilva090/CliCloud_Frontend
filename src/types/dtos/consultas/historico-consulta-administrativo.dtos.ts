/** Linha da listagem `HistoricoConsultasAdministrativo` (backend). */
export type HistoricoConsultaAdministrativoRowDTO = {
  id: string
  utenteId?: string | null
  data?: string | null
  horaInic?: string | null
  horaFim?: string | null
  utenteNumero?: string | null
  utenteNome?: string | null
  medicoNome?: string | null
  organismoNome?: string | null
  especialidadeDesignacao?: string | null
  tipoConsultaDesignacao?: string | null
  motivoConsultaDesignacao?: string | null
  diagnostico?: string | null
  obs?: string | null
  credencial?: string | null
  statusConsulta?: number | null
  statusConsultaLabel?: string | null
  confirmado?: boolean | null
  efetuado?: boolean | null
  faltou?: boolean | null
  pago?: boolean | null
  faturado?: boolean | null
}
