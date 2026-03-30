import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

// ---- Mapa Body Chart ----

export interface MapaBodyChartTableFilterRequest extends TableFilterRequest {}

export interface MapaBodyChartTableDTO {
  id: string
  nome?: string | null
  caminhoImagem?: string | null
  createdOn: string
}

export interface MarcadorBodyChartDTO {
  id: string
  mapaBodyChartId: string
  titulo: string
  corHex: string
}

export interface MapaBodyChartDTO extends MapaBodyChartTableDTO {
  marcadores: MarcadorBodyChartDTO[]
}

export interface MapaBodyChartLightDTO {
  id: string
  nome?: string | null
  caminhoImagem?: string | null
}

export interface MapaBodyChartAllFilterRequest extends TableFilterRequest {}

export interface CreateMapaBodyChartRequest {
  nome: string
  caminhoImagem: string
}

export interface UpdateMapaBodyChartRequest extends CreateMapaBodyChartRequest {}

export interface DeleteMultipleMapaBodyChartRequest {
  ids: string[]
}

// ---- Notas Body Chart ----

export interface NotasBodyChartTableFilterRequest extends TableFilterRequest {}

export interface NotasBodyChartTableDTO {
  id: string
  nome?: string | null
  descricao?: string | null
  xPercent: number
  yPercent: number
  mapaBodyChartId: string
  marcadorBodyChartId: string
  marcadorBodyChart: MarcadorBodyChartDTO
  createdOn: string
}

export interface NotasBodyChartAllFilterRequest extends TableFilterRequest {}

export interface NotasBodyChartDTO extends NotasBodyChartTableDTO {
  mapaBodyChart: MapaBodyChartDTO
}

export interface NotasBodyChartLightDTO {
  id: string
  nome?: string | null
  descricao?: string | null
}

export interface CreateNotasBodyChartRequest {
  tratamentoId: string
  nome: string
  descricao: string
  xPercent: number
  yPercent: number
  mapaBodyChartId: string
  marcadorBodyChartId: string
}

export interface UpdateNotasBodyChartRequest extends CreateNotasBodyChartRequest {}

export interface DeleteMultipleNotasBodyChartRequest {
  ids: string[]
}

