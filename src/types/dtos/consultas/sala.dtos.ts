export interface SalaTableDTO {
  id: string
  nome: string
  numeroSala: number
  ativa: boolean
  clinicaId: string
  clinicaNome?: string
}

export interface SalaCreateRequest {
  Nome: string
  NumeroSala: number
  ClinicaId: string
  Ativa: boolean
}

export interface SalaUpdateRequest extends SalaCreateRequest {}
