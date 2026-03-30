import { CodigoPostalDTO } from './codigospostais.dtos'
import { FreguesiaDTO } from './freguesias.dtos'

export interface CreateRuaDTO {
  nome: string
  freguesiaId: string
  codigoPostalId: string
}

export interface UpdateRuaDTO extends Omit<CreateRuaDTO, 'id'> {
  id?: string
}

export interface RuaDTO {
  id: string
  nome: string
  freguesiaId: string
  freguesia: FreguesiaDTO
  codigoPostalId: string
  codigoPostal: CodigoPostalDTO
  createdOn: Date
}

// Simplified DTOs for table view
export interface RuaTablePaisDTO {
  id: string
  nome: string
  codigo: string
}

export interface RuaTableDistritoDTO {
  id: string
  nome: string
  paisId: string | null
  pais: RuaTablePaisDTO | null
}

export interface RuaTableConcelhoDTO {
  id: string
  nome: string
  distritoId: string | null
  distrito: RuaTableDistritoDTO | null
}

export interface RuaTableFreguesiaDTO {
  id: string
  nome: string
  concelhoId: string | null
  concelho: RuaTableConcelhoDTO | null
}

export interface RuaTableCodigoPostalDTO {
  id: string
  codigo: string
  localidade: string
}

export interface RuaTableDTO {
  id: string
  nome: string
  freguesiaId: string
  freguesia: RuaTableFreguesiaDTO | null
  codigoPostalId: string
  codigoPostal: RuaTableCodigoPostalDTO | null
  createdOn: string // ISO date string
}

export interface RuaLightDTO {
  id: string
  nome: string
  freguesiaId: string
  freguesiaNome: string // Flattened from nested Freguesia
  codigoPostalId: string
  codigoPostalCodigo: string // Flattened from nested CodigoPostal
}
