/**
 * Sub-DTOs usados nos DTOs "table" de entidades no backend
 * (ex.: `EntidadeTableRuaDTO`, `EntidadeTablePaisDTO`, ...).
 */

export interface EntidadeTableCodigoPostalDTO {
  id: string
  codigo?: string | null
  localidade?: string | null
}

export interface EntidadeTablePaisDTO {
  id: string
  nome?: string | null
  codigo?: string | null
}

export interface EntidadeTableDistritoDTO {
  id: string
  nome?: string | null
  paisId: string
  pais?: EntidadeTablePaisDTO | null
}

export interface EntidadeTableConcelhoDTO {
  id: string
  nome?: string | null
  distritoId: string
  distrito?: EntidadeTableDistritoDTO | null
}

export interface EntidadeTableFreguesiaDTO {
  id: string
  nome?: string | null
  concelhoId: string
  concelho?: EntidadeTableConcelhoDTO | null
}

export interface EntidadeTableRuaDTO {
  id: string
  nome?: string | null
  freguesiaId: string
  freguesia?: EntidadeTableFreguesiaDTO | null
}

