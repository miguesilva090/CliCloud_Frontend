export interface AlergiaUtenteDTO {
  id: string
  utenteId: string
  alergiaId?: string | null
  alergiaDescricao?: string | null
  grauAlergiaId?: string | null
  dataDesde?: string | null
  dataAte?: string | null
  observacoes?: string | null
  createdOn: string
}

export interface CreateAlergiaUtenteRequest {
  utenteId: string
  alergiaId?: string | null
  grauAlergiaId?: string | null
  dataDesde?: string | null
  dataAte?: string | null
  observacoes?: string | null
}

export interface AlergiaUtenteTableFilterRequest {
  pageNumber: number
  pageSize: number
  filters?: Array<{ id: string; value: string }>
  sorting?: Array<{ id: string; desc: boolean }>
}
