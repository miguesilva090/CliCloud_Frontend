import type {
  AllFilterRequest,
  PaginationFilterRequest,
  TableFilter,
  TableFilterRequest,
  TanstackSorting,
} from '@/types/dtos/common/table-filters.dtos'

export type { AllFilterRequest, PaginationFilterRequest, TableFilter, TableFilterRequest, TanstackSorting }

export interface UtenteTableFilterRequest extends TableFilterRequest {}

export interface UtenteAllFilterRequest extends AllFilterRequest {}

export interface UtenteDTO {
  id: string
  nome: string
  tipoEntidadeId: number
  email?: string | null
  numeroContribuinte?: string | null

  // Morada / entidade (para edição)
  ruaId?: string | null
  rua?: { id?: string; nome?: string } | null
  codigoPostalId?: string | null
  freguesiaId?: string | null
  freguesia?: { id: string; nome?: string | null } | null
  concelhoId?: string | null
  concelho?: { id: string; nome?: string | null } | null
  distritoId?: string | null
  distrito?: { id: string; nome?: string | null } | null
  paisId?: string | null
  numeroPorta?: string | null
  andarRua?: string | null
  observacoes?: string | null
  urlFoto?: string | null

  // Contactos
  entidadeContactos?: EntidadeContactoDTO[] | null

  // EntidadePessoa (opcional)
  dataNascimento?: string | null
  sexoId?: string | null
  sexo?: { id: string; codigo: string; descricao: string } | null
  estadoCivilId?: string | null
  estadoCivil?: { id: string; codigo: string; descricao: string } | null
  habilitacaoId?: string | null
  habilitacao?: { id: string; codigo: string; descricao: string } | null
  nacionalidade?: string | null
  naturalidade?: string | null
  numeroCartaoIdentificacao?: string | null
  dataEmissaoCartaoIdentificacao?: string | null
  dataValidadeCartaoIdentificacao?: string | null
  arquivo?: string | null
  carteira?: string | null
  nomeUtilizador?: string | null
  urlFotoAssinatura?: string | null
  numeroIdentificacaoBancaria?: string | null

  // Campos úteis do utente
  numeroUtente?: string | null
  numeroSegurancaSocial?: string | null
  createdOn?: string
  status?: number | null

  // Utente (opcional)
  nomePai?: string | null
  nomeMae?: string | null
  profissaoId?: string | null
  profissao?: { id: string; codigo: string; descricao: string } | null
  grupoSanguineoId?: string | null
  grupoSanguineo?: { id: string; codigo: string; descricao: string } | null
  provenienciaUtenteId?: string | null
  provenienciaUtente?: { id: string; codigo?: string | null; descricao?: string | null } | null
  organismoId?: string | null
  organismo?: { id: string; nome?: string | null; abreviatura?: string | null } | null
  seguradoraId?: string | null
  seguradora?: { id: string; nome?: string | null; abreviatura?: string | null } | null
  empresaId?: string | null
  empresa?: { id: string; nome?: string | null } | null
  centroSaudeId?: string | null
  centroSaude?: { id: string; nome?: string | null; codigoLocalCS?: string | null } | null
  medicoExternoId?: string | null
  medicoExterno?: { id: string; nome?: string | null } | null
  medicoId?: string | null
  medico?: { id: string; nome?: string | null } | null
  /** Linhas do subsistema de saúde (tabela na tab Subsistema de Saúde). */
  subsistemaLinhas?: UtenteSubsistemaLinhaDTO[] | null
  aviso?: string | null

  // Flags e consentimentos (necessários no update para não "resetar" valores)
  desistencia?: boolean
  cronico?: boolean
  tipoConsulta?: number
  migrante?: boolean
  condicaoSns?: number | null
  entidadeFinanceiraResponsavelId?: string | null
  numeroBeneficiarioEfr?: string | null
  dataValidadeEfr?: string | null
  migranteTipoCartao?: string | null
  markConsentimento?: number
  rgpdConsentimento?: number
  dataConsentimentoRgpd?: string | null
  dataRevogacaoRgpd?: string | null
  dataConsentimentoMark?: string | null
  dataRevogacaoMark?: string | null
  markTratamentoDados?: boolean
  ccValidado?: number | null
  ccDataValidacao?: string | null
  dataValidadeCU?: string | null
  nDocMigrante?: string | null
  dataRegisto?: string | null
  tipoTaxaModeradora?: number | null
  /** Conta na plataforma (notificações, portal do utente). */
  idUtilizador?: string | null
}

export interface UtenteSubsistemaLinhaDTO {
  id: string
  organismoId?: string | null
  organismo?: { id: string; nome?: string | null; abreviatura?: string | null } | null
  designacao?: string | null
  numeroBeneficiario?: string | null
  sigla?: string | null
  nomeBeneficiario?: string | null
  dataCartao?: string | null
  numeroApolice?: string | null
  empresaId?: string | null
  empresa?: { id: string; nome?: string | null } | null
}

export interface EntidadeContactoDTO {
  id: string
  entidadeContactoTipoId: number
  entidadeId?: string
  valor?: string | null
  principal: boolean
  createdOn?: string
}

export interface UtenteLightDTO {
  id: string
  nome: string
  numeroContribuinte?: string | null
  numeroUtente?: string | null
  dataNascimento?: string | null
  status?: number | null
  /** Conta na plataforma — para seleção como destinatário de notificações. */
  idUtilizador?: string | null
}

export interface UtenteTableRuaDTO {
  id: string
  nome?: string | null
  freguesiaId?: string
  freguesia?: { id: string; nome?: string | null; concelho?: { id: string; nome?: string | null } } | null
}

export interface UtenteTableCodigoPostalDTO {
  id: string
  codigo?: string | null
  localidade?: string | null
}

export interface UtenteTableDTO {
  id: string
  nome?: string | null
  tipoEntidadeId: number
  email?: string | null
  numeroContribuinte?: string | null
  numeroUtente?: string | null
  numeroSegurancaSocial?: string | null
  dataNascimento?: string | null
  status?: number | null
  createdOn: string
  contactoCount?: number
  estadoCivilId?: string | null
  estadoCivil?: { id: string; codigo: string; descricao: string } | null
  habilitacaoId?: string | null
  habilitacao?: { id: string; codigo: string; descricao: string } | null
  grupoSanguineoId?: string | null
  grupoSanguineo?: { id: string; codigo: string; descricao: string } | null
  ruaId?: string | null
  rua?: UtenteTableRuaDTO | null
  codigoPostalId?: string | null
  codigoPostal?: UtenteTableCodigoPostalDTO | null
  freguesiaId?: string | null
  freguesia?: { id: string; nome?: string | null; concelho?: { id: string; nome?: string | null } } | null
  concelhoId?: string | null
  concelho?: { id: string; nome?: string | null } | null
  distritoId?: string | null
  distrito?: { id: string; nome?: string | null } | null
  paisId?: string | null
  pais?: { id: string; nome?: string | null; codigo?: string | null } | null
  numeroPorta?: string | null
  andarRua?: string | null
  entidadeContactos?: Array<{ entidadeContactoTipoId: number; valor?: string | null }> | null
}

// ---------------------------------------------------------------------
// Requests (Create/Update)

export interface UpsertUtenteSubsistemaLinhaItemRequest {
  organismoId?: string | null
  designacao?: string | null
  numeroBeneficiario?: string | null
  sigla?: string | null
  nomeBeneficiario?: string | null
  dataCartao?: string | null
  numeroApolice?: string | null
  empresaId?: string | null
}

export interface CreateEntidadeContactoItemRequest {
  entidadeContactoTipoId: number
  valor: string
  principal: boolean
}

/**
 * UpsertEntidadeContactoItemRequest (Backend: Utility.EntidadeContactoService.DTOs.UpsertEntidadeContactoItemRequest)
 */
export interface UpsertEntidadeContactoItemRequest {
  id?: string | null
  entidadeContactoTipoId: number
  valor: string
  principal: boolean
}

/**
 * CreateUtenteRequest (Backend: CliCloud.Application.Services.Utentes.UtenteService.DTOs.CreateUtenteRequest)
 *
 * Nota: o backend valida GUIDs como string (RuaId, PaisId, etc) e exige EntidadeContactos não vazio.
 */
export interface CreateUtenteRequest {
  // Entidade (obrigatório)
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
  urlFoto?: string | null
  entidadeContactos?: CreateEntidadeContactoItemRequest[]

  // EntidadePessoa (opcional)
  dataNascimento?: string | null // DateOnly => "YYYY-MM-DD"
  sexoId?: string | null
  estadoCivilId?: string | null
  habilitacaoId?: string | null
  nacionalidade?: string | null
  naturalidade?: string | null
  numeroCartaoIdentificacao?: string | null
  dataEmissaoCartaoIdentificacao?: string | null
  dataValidadeCartaoIdentificacao?: string | null
  arquivo?: string | null
  carteira?: string | null
  nomeUtilizador?: string | null
  urlFotoAssinatura?: string | null
  numeroIdentificacaoBancaria?: string | null

  // Utente (opcional)
  nomePai?: string | null
  nomeMae?: string | null
  numeroSegurancaSocial?: string | null
  profissaoId?: string | null
  grupoSanguineoId?: string | null
  provenienciaUtenteId?: string | null
  organismoId?: string | null
  seguradoraId?: string | null
  empresaId?: string | null
  centroSaudeId?: string | null
  medicoExternoId?: string | null
  medicoId?: string | null
  numeroUtente?: string | null
  aviso?: string | null
  desistencia: boolean
  cronico: boolean
  tipoConsulta: number
  migrante: boolean
  condicaoSns?: number | null
  entidadeFinanceiraResponsavelId?: string | null
  numeroBeneficiarioEfr?: string | null
  dataValidadeEfr?: string | null
  migranteTipoCartao?: string | null
  markConsentimento: number
  rgpdConsentimento: number
  dataConsentimentoRgpd?: string | null
  dataRevogacaoRgpd?: string | null
  dataConsentimentoMark?: string | null
  dataRevogacaoMark?: string | null
  markTratamentoDados: boolean
  ccValidado?: number | null
  ccDataValidacao?: string | null
  dataValidadeCU?: string | null // DateOnly
  nDocMigrante?: string | null
  dataRegisto?: string | null
  tipoTaxaModeradora?: number | null
  subsistemaLinhas?: UpsertUtenteSubsistemaLinhaItemRequest[]
  /** Opcional: associar conta da plataforma ao utente. */
  idUtilizador?: string | null
}

/**
 * UpdateUtenteRequest (Backend: CliCloud.Application.Services.Utentes.UtenteService.DTOs.UpdateUtenteRequest)
 *
 * Nota: é praticamente igual ao create, mas os contactos são "upsert" (podem incluir `id`).
 */
export interface UpdateUtenteRequest
  extends Omit<CreateUtenteRequest, 'entidadeContactos'> {
  entidadeContactos?: UpsertEntidadeContactoItemRequest[]
}


