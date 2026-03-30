import type {
  PaginationFilterRequest,
  TableFilter,
} from '@/types/dtos/common/table-filters.dtos'

export interface EmpresaTableDTO {
  id: string
  nome?: string | null
  tipoEntidadeId: number
  numeroContribuinte?: string | null
  status?: number | null
  createdOn: string
  contacto?: string | null
  fax?: string | null
  codigoPostal?: { localidade?: string | null } | null
  freguesia?: { nome?: string | null } | null
  rua?: { nome?: string | null } | null
  desconto?: number | null
  descontoUtente?: number | null
  categoria?: string | null
  numeroTrabalhadores?: number | null
  valorTrabalhador?: number | null
  rescindindo?: number | null
}

export interface EmpresaEntidadeContactoItem {
  entidadeContactoTipoId: number
  valor?: string | null
  principal?: boolean
}

export interface EmpresaDTO {
  id: string
  nome: string
  tipoEntidadeId: number
  numeroContribuinte?: string | null
  email?: string | null
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
  entidadeContactos?: EmpresaEntidadeContactoItem[] | null
  // Campos específicos de Empresa
  prazoPagamento?: number | null
  desconto?: number | null
  descontoUtente?: number | null
  condicaoPagamento?: number | null
  tipoModoPagamento?: number | null
  bancoId?: string | null
  numeroIdentificacaoBancaria?: string | null
  apolice?: string | null
  avenca?: number | null
  dataInicioContrato?: string | null
  dataFimContrato?: string | null
  numeroPagamentos?: number | null
  organismoId?: string | null
  categoria?: string | null
  actividade?: string | null
  cae?: number | null
  codigoClinica?: string | null
  numeroTrabalhadores?: number | null
  valorTrabalhador?: number | null
  rescindindo?: number | null
  contacto?: string | null
}

export interface CreateEmpresaEntidadeContactoItem {
  entidadeContactoTipoId: number
  valor: string
  principal: boolean
}

export interface CreateEmpresaRequest {
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
  entidadeContactos: CreateEmpresaEntidadeContactoItem[]
  prazoPagamento?: number | null
  desconto?: number | null
  descontoUtente?: number | null
  condicaoPagamento?: number | null
  tipoModoPagamento?: number | null
  bancoId?: string | null
  numeroIdentificacaoBancaria?: string | null
  apolice?: string | null
  avenca?: number | null
  dataInicioContrato?: string | null
  dataFimContrato?: string | null
  numeroPagamentos?: number | null
  organismoId?: string | null
  categoria?: string | null
  actividade?: string | null
  cae?: number | null
  codigoClinica?: string | null
  numeroTrabalhadores?: number | null
  valorTrabalhador?: number | null
  rescindindo?: number | null
  contacto?: string | null
}

export interface UpsertEmpresaEntidadeContactoItem {
  entidadeContactoTipoId: number
  valor: string
  principal: boolean
}

export interface UpdateEmpresaRequest {
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
  entidadeContactos: UpsertEmpresaEntidadeContactoItem[]
  prazoPagamento?: number | null
  desconto?: number | null
  descontoUtente?: number | null
  condicaoPagamento?: number | null
  tipoModoPagamento?: number | null
  bancoId?: string | null
  numeroIdentificacaoBancaria?: string | null
  apolice?: string | null
  avenca?: number | null
  dataInicioContrato?: string | null
  dataFimContrato?: string | null
  numeroPagamentos?: number | null
  organismoId?: string | null
  categoria?: string | null
  actividade?: string | null
  cae?: number | null
  codigoClinica?: string | null
  numeroTrabalhadores?: number | null
  valorTrabalhador?: number | null
  rescindindo?: number | null
  contacto?: string | null
}

export interface EmpresaTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
}

