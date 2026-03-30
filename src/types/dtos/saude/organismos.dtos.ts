import type {
  PaginationFilterRequest,
  TableFilter,
} from '@/types/dtos/common/table-filters.dtos'

export interface OrganismoLightDTO {
  id: string
  nome: string
  nomeComercial?: string | null
  abreviatura?: string | null
  numeroContribuinte?: string | null
}

export interface OrganismoTableDTO {
  id: string
  nome?: string | null
  tipoEntidadeId: number
  numeroContribuinte?: string | null
  nomeComercial?: string | null
  abreviatura?: string | null
  status?: number | null
  createdOn: string
  prazoPagamento?: number | null
  desconto?: number | null
  descontoUtente?: number | null
  globalbooking?: boolean
  contacto?: string | null
  codigoPostal?: { localidade?: string | null } | null
  freguesia?: { nome?: string | null } | null
  rua?: { nome?: string | null } | null
  bancoNome?: string | null
}

export interface EntidadeContactoItem {
  entidadeContactoTipoId: number
  valor?: string | null
  principal?: boolean
}

export interface OrganismoDTO {
  id: string
  nome: string
  tipoEntidadeId: number
  numeroContribuinte?: string | null
  nomeComercial?: string | null
  abreviatura?: string | null
  email?: string | null
  contacto?: string | null
  prazoPagamento?: number | null
  desconto?: number | null
  descontoUtente?: number | null
  globalbooking?: boolean
  status?: number | null
  createdOn: string
  ruaId?: string | null
  rua?: { nome?: string | null } | null
  codigoPostalId?: string | null
  codigoPostal?: { id?: string; codigo?: string; localidade?: string } | null
  freguesiaId?: string | null
  concelhoId?: string | null
  distritoId?: string | null
  paisId?: string | null
  numeroPorta?: string | null
  andarRua?: string | null
  observacoes?: string | null
  entidadeContactos?: EntidadeContactoItem[] | null
  // Campos Organismo
  codigoClinica?: string | null
  apolice?: string | null
  avenca?: number | null
  dataInicioContrato?: string | null
  dataFimContrato?: string | null
  numeroPagamentos?: number | null
  bancoId?: string | null
  banco?: { id: string; nome?: string } | null
  numeroIdentificacaoBancaria?: string | null
  categoria?: string | null
  faltas?: number | null
  assinarPagaDocumento?: number | null
  admissaoCC?: number | null
  faturaCredencial?: number | null
  discriminaServicos?: boolean
  designaTratamentos?: string | null
  apresentarCredenciaisPrimeiraSessaoTratamento?: boolean
  apresentarCredenciaisPrimeiraConsulta?: boolean
  codigoFaturacao?: string | null
  filtroFaturacao?: number | null
  cServicoFaturaResumo?: string | null
  faturarPorDatas?: number
  trust?: boolean
  adm?: boolean
  sadgnr?: boolean
  sadpsp?: boolean
  alterarPrecoTratamento?: boolean
  contabContaFA?: string | null
  contabContaFR?: string | null
  contabTipoContaFA?: string | null
  contabTipoContaFR?: string | null
  codigoULSNova?: number | null
  tratamentoCred?: number | null
  nacional?: number
  codigoRegiaoAtestadoCC?: number | null
  ars?: string | null
  subregiao?: string | null
  regiao?: string | null
  fraseADM?: string | null
  bloqueio?: number | null
  limitarConsultas?: boolean
  numeroConsultas?: number | null
  contabilizarFaltas?: boolean
  condicaoPagamento?: number | null
  tipoModoPagamento?: number | null
}

export interface CreateEntidadeContactoItem {
  entidadeContactoTipoId: number
  valor: string
  principal: boolean
}

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
  entidadeContactos: CreateEntidadeContactoItem[]
  nomeComercial?: string | null
  abreviatura?: string | null
  prazoPagamento?: number | null
  desconto?: number | null
  descontoUtente?: number | null
  globalbooking?: boolean
  contacto?: string | null
  codigoClinica?: string | null
  apolice?: string | null
  avenca?: number | null
  dataInicioContrato?: string | null
  dataFimContrato?: string | null
  numeroPagamentos?: number | null
  bancoId?: string | null
  numeroIdentificacaoBancaria?: string | null
  categoria?: string | null
  faltas?: number | null
  assinarPagaDocumento?: number | null
  admissaoCC?: number | null
  faturaCredencial?: number | null
  discriminaServicos?: boolean
  designaTratamentos?: string | null
  apresentarCredenciaisPrimeiraSessaoTratamento?: boolean
  apresentarCredenciaisPrimeiraConsulta?: boolean
  codigoFaturacao?: string | null
  filtroFaturacao?: number | null
  cServicoFaturaResumo?: string | null
  faturarPorDatas?: number
  trust?: boolean
  adm?: boolean
  sadgnr?: boolean
  sadpsp?: boolean
  alterarPrecoTratamento?: boolean
  contabContaFA?: string | null
  contabContaFR?: string | null
  contabTipoContaFA?: string | null
  contabTipoContaFR?: string | null
  codigoULSNova?: number | null
  tratamentoCred?: number | null
  nacional?: number
  codigoRegiaoAtestadoCC?: number | null
  ars?: string | null
  subregiao?: string | null
  regiao?: string | null
  fraseADM?: string | null
  bloqueio?: number | null
  limitarConsultas?: boolean
  numeroConsultas?: number | null
  contabilizarFaltas?: boolean
  condicaoPagamento?: number | null
  tipoModoPagamento?: number | null
}

export interface UpdateOrganismoRequest extends CreateOrganismoRequest {}

export interface OrganismoTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
}
