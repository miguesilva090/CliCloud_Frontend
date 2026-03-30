/**
 * DTOs de lookups (Utility) — usados em formulários (ex.: criação de Utentes).
 *
 * Baseado em `CliCloud.Application.Services.Utility.*.DTOs.*LightDTO`
 * Endpoints típicos: `GET /client/utility/{Entity}/light?keyword=`
 */

export interface PaisLightDTO {
  id: string
  codigo?: string | null
  nome?: string | null
  prefixo?: string | null
}

export interface DistritoLightDTO {
  id: string
  nome?: string | null
  paisId?: string | null
  paisNome?: string | null
}

export interface ConcelhoLightDTO {
  id: string
  nome?: string | null
  distritoId?: string | null
  distritoNome?: string | null
}

export interface FreguesiaLightDTO {
  id: string
  nome?: string | null
  concelhoId?: string | null
  concelhoNome?: string | null
}

export interface CodigoPostalLightDTO {
  id: string
  codigo?: string | null
  localidade?: string | null
}

export interface RuaLightDTO {
  id: string
  nome?: string | null
  freguesiaId?: string | null
  freguesiaNome?: string | null
  codigoPostalId?: string | null
  codigoPostalCodigo?: string | null
  codigoPostalLocalidade?: string | null
}

