export interface UtentePatologiaComparticipacaoDTO {
  id: string
  utenteId: string
  codigoComparticipacao: number
  designacao?: string | null
  createdOn?: string
}

export interface CreateUtentePatologiaComparticipacaoRequest {
  utenteId: string
  codigoComparticipacao: number
  designacao?: string | null
}

export interface ReplaceUtentePatologiaItemRequest {
  codigoComparticipacao: number
  designacao?: string | null
}

export interface ReplaceUtentePatologiasComparticipacaoRequest {
  utenteId: string
  items: ReplaceUtentePatologiaItemRequest[]
}

export interface RegimeExcepcionalDto {
  regimeExcepcionalId: number
  descr?: string | null
  indAtivo?: string | null
}
