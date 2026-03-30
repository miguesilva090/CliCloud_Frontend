import type { AllFilterRequest, TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface ServicoConsultaDTO {
  id: string
  createdOn: string
  lastModifiedOn?: string | null

  consultaId: string
  servicoId?: string | null
  exameId?: string | null

  valorServico?: number | null

  codigoArtigo?: string | null
  nomeArtigo?: string | null
  valorArtigo?: number | null
  quantidade?: number | null

  margemMed?: number | null
  margemIns?: number | null
  recMed?: number | null
  recInst?: number | null

  descInst?: number | null
  descCli?: number | null
  valorDesc?: number | null

  ordem?: number | null
  dente?: string | null
  linha: number
  nCheque?: string | null
  electrocardiograma?: number | null
  valorUt?: number | null
}

export interface ServicoConsultaTableDTO {
  id: string
  consultaId: string
  servicoId?: string | null
  codigoArtigo?: string | null
  nomeArtigo?: string | null
  quantidade?: number | null
  valorArtigo?: number | null
  valorServico?: number | null
  valorUt?: number | null
  ordem?: number | null
  createdOn: string
}

export interface ServicoConsultaTableFilterRequest extends TableFilterRequest {}
export interface ServicoConsultaAllFilterRequest extends AllFilterRequest {}

