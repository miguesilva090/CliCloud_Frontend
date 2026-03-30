/**
 * DTOs para criação rápida de Organismo e Seguradora (backend já existente).
 */

export interface OrganismoLightDTO {
  id: string
  nome?: string | null
  abreviatura?: string | null
  nomeComercial?: string | null
}

export interface SeguradoraLightDTO {
  id: string
  nome?: string | null
  abreviatura?: string | null
}

/** Payload mínimo para POST /client/seguradoras/Seguradora */
export interface CreateSeguradoraRequest {
  nome: string
  abreviatura?: string | null
  apolice?: string | null
  avenca?: number | null
  dataInicioContrato?: string | null
  dataFimContrato?: string | null
  bancoId?: string | null
  numeroIdentificacaoBancaria?: string | null
}

/** Payload para POST /client/organismos/Organismo (quick-create usa morada do formulário utente) */
export interface CreateOrganismoRequest {
  nome: string
  tipoEntidadeId: number
  email: string
  numeroContribuinte: string
  ruaId: string
  codigoPostalId: string
  freguesiaId: string
  concelhoId: string
  distritoId: string
  paisId: string
  numeroPorta: string
  andarRua: string
  observacoes: string
  status: number
  entidadeContactos: Array<{ entidadeContactoTipoId: number; valor: string; principal: boolean }>
  nomeComercial?: string | null
  abreviatura?: string | null
}
