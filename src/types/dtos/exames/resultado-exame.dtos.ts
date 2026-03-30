export interface ResultadoExameTableDTO {
  id: string
  exameId: string
  tipoExameId: string

  nomeExame?: string | null
  quantidade: number

  valor?: string | null
  unidadeMedida?: string | null
  referencia?: string | null
  obs?: string | null
}

