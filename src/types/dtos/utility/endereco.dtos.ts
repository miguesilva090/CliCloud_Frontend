/**
 * DTOs "utility" do backend (moradas/endereços).
 * Nota: datas vêm tipicamente como string ISO do backend.
 */

export interface PaisDTO {
  id: string
  codigo?: string | null
  nome?: string | null
  prefixo?: string | null
  createdOn: string
}

export interface DistritoDTO {
  id: string
  nome?: string | null
  paisId?: string | null
  pais?: PaisDTO | null
  createdOn: string
}

export interface ConcelhoDTO {
  id: string
  nome?: string | null
  distritoId?: string | null
  distrito?: DistritoDTO | null
  createdOn: string
}

export interface FreguesiaDTO {
  id: string
  nome?: string | null
  concelhoId?: string | null
  concelho?: ConcelhoDTO | null
  createdOn: string
}

export interface CodigoPostalDTO {
  id: string
  codigo?: string | null
  localidade?: string | null
  createdOn: string
}

export interface RuaDTO {
  id: string
  nome?: string | null
  freguesiaId?: string | null
  freguesia?: FreguesiaDTO | null
  codigoPostalId?: string | null
  codigoPostal?: CodigoPostalDTO | null
  createdOn: string
}

