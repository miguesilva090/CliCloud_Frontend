/** Linha da listagem `HistoricoConsultasAdministrativo` (backend). */
export type HistoricoConsultaAdministrativoRowDTO = {
  id: string
  utenteId?: string | null
  data?: string | null
  horaInic?: string | null
  utenteNumero?: string | null
  utenteNome?: string | null
  medicoNome?: string | null
  organismoNome?: string | null
  especialidadeDesignacao?: string | null
  statusConsulta?: number | null
  statusConsultaLabel?: string | null
  pago?: boolean | null
  faturado?: boolean | null
}
