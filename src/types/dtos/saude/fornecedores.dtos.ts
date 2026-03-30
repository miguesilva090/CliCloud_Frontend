import type {
  PaginationFilterRequest,
  TableFilter,
} from '@/types/dtos/common/table-filters.dtos'

export interface FornecedorTableDTO {
  id: string
  nome?: string | null
  tipoEntidadeId: number
  numeroContribuinte?: string | null
  desconto?: number | null
  status?: number | null
  createdOn: string
  contacto?: string | null
  fax?: string | null
  codigoPostal?: { localidade?: string | null } | null
  freguesia?: { nome?: string | null } | null
  rua?: { nome?: string | null } | null
  origem?: number | null
  condicaoPagamento?: number | null
  moeda?: number | null
}

export interface EntidadeContactoItem {
  entidadeContactoTipoId: number
  valor?: string | null
  principal?: boolean
}

export interface FornecedorDTO {
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
  entidadeContactos?: EntidadeContactoItem[] | null
  // Campos Fornecedor
  numeroConta?: string | null
  plafond?: number | null
  condicaoPagamento?: number | null
  desconto?: number | null
  moeda?: number | null
  totalDebito?: number | null
  origem?: number | null
  tipoFornecedor?: number | null
  tipoModoPagamento?: number | null
  numeroNib?: string | null
  aprovado?: number | null
  dataAprovacao?: string | null
  enderecoWeb?: string | null
  diasPrevEntrega?: number | null
  diasEfectiEntrega?: number | null
}

export interface CreateEntidadeContactoItem {
  entidadeContactoTipoId: number
  valor: string
  principal: boolean
}

export interface CreateFornecedorRequest {
  nome: string
  tipoEntidadeId: number
  email?: string | null
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
  numeroConta?: string | null
  plafond?: number | null
  condicaoPagamento?: number | null
  desconto?: number | null
  moeda?: number | null
  totalDebito?: number | null
  origem?: number | null
  tipoFornecedor?: number | null
  tipoModoPagamento?: number | null
  numeroNib?: string | null
  aprovado?: number | null
  dataAprovacao?: string | null
  enderecoWeb?: string | null
  diasPrevEntrega?: number | null
  diasEfectiEntrega?: number | null
}

export interface UpsertEntidadeContactoItem {
  entidadeContactoTipoId: number
  valor: string
  principal: boolean
}

export interface UpdateFornecedorRequest {
  nome: string
  tipoEntidadeId: number
  email?: string | null
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
  entidadeContactos: UpsertEntidadeContactoItem[]
  numeroConta?: string | null
  plafond?: number | null
  condicaoPagamento?: number | null
  desconto?: number | null
  moeda?: number | null
  totalDebito?: number | null
  origem?: number | null
  tipoFornecedor?: number | null
  tipoModoPagamento?: number | null
  numeroNib?: string | null
  aprovado?: number | null
  dataAprovacao?: string | null
  enderecoWeb?: string | null
  diasPrevEntrega?: number | null
  diasEfectiEntrega?: number | null
}

export interface FornecedorTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
}
