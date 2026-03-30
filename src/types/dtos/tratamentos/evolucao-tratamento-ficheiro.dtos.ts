export interface EvolucaoTratamentoFicheiroDTO {
  id: string
  evolucaoTratamentoId: string
  titulo: string
  fileName: string
  storagePath: string
  contentType?: string | null
  tamanhoBytes?: number | null
  createdOn: string
  lastModifiedOn?: string | null
}

export interface CreateEvolucaoTratamentoFicheiroRequest {
  evolucaoTratamentoId: string
  titulo: string
  fileName: string
  storagePath: string
  contentType?: string | null
  tamanhoBytes?: number | null
}

