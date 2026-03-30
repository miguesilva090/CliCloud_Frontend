export interface ExameLinhaDTO {
  id: string
  tipoExameId: string
  tipoExameDesignacao?: string | null
  quantidade: number
  recomendacoes?: string | null
}

export interface CreateExameLinhaRequest {
  tipoExameId: string
  quantidade?: number
  recomendacoes?: string | null
}

export interface UpdateExameLinhaRequest {
  id?: string | null
  tipoExameId: string 
  quantidade?: number 
  recomendacoes?: string | null 
}

