import type {
  PaginationFilterRequest,
  TableFilter,
} from '@/types/dtos/common/table-filters.dtos'

/** Estrutura de Rua/CodigoPostal usada no FuncionarioTableDTO (backend EntidadeTableRuaDTO, EntidadeTableCodigoPostalDTO) */
export interface FuncionarioTableRuaDTO {
  id?: string
  nome?: string | null
}

export interface FuncionarioTableCodigoPostalDTO {
  id?: string
  codigo?: string | null
  localidade?: string | null
}

export interface FuncionarioTableDTO {
  id: string
  nome?: string | null
  tipoEntidadeId: number
  numeroContribuinte?: string | null
  nomeUtilizador?: string | null
  ruaId?: string | null
  rua?: FuncionarioTableRuaDTO | null
  codigoPostalId?: string | null
  codigoPostal?: FuncionarioTableCodigoPostalDTO | null
  numeroPorta?: string | null
  andarRua?: string | null
  status?: number | null
  createdOn: string
  numeroCartaoIdentificacao?: string | null
  dataEmissaoCartaoIdentificacao?: string | null
  arquivo?: string | null
  /** Telefone extraído de entidadeContactos (tipo 1) - se o backend incluir */
  contacto?: string | null
}

export interface EntidadeContactoItem {
  entidadeContactoTipoId: number
  valor?: string | null
  principal?: boolean
}

export interface FuncionarioDTO {
  id: string
  nome: string
  tipoEntidadeId: number
  numeroContribuinte?: string | null
  nomeUtilizador?: string | null
  ruaId?: string | null
  rua?: { id?: string; nome?: string } | null
  codigoPostalId?: string | null
  codigoPostal?: { id?: string; codigo?: string; localidade?: string } | null
  freguesiaId?: string | null
  concelhoId?: string | null
  distritoId?: string | null
  paisId?: string | null
  numeroPorta?: string | null
  andarRua?: string | null
  email?: string | null
  observacoes?: string | null
  entidadeContactos?: EntidadeContactoItem[] | null
  numeroCartaoIdentificacao?: string | null
  dataEmissaoCartaoIdentificacao?: string | null
  dataValidadeCartaoIdentificacao?: string | null
  arquivo?: string | null
  status?: number | null
  createdOn: string
}

export interface CreateEntidadeContactoItem {
  entidadeContactoTipoId: number
  valor: string
  principal: boolean
}

export interface UpsertEntidadeContactoItem {
  id?: string | null
  entidadeContactoTipoId: number
  valor: string
  principal: boolean
}

export interface CreateFuncionarioRequest {
  nome: string
  tipoEntidadeId: number
  email?: string | null
  numeroContribuinte?: string | null
  nomeUtilizador?: string | null
  ruaId?: string | null
  codigoPostalId?: string | null
  freguesiaId?: string | null
  concelhoId?: string | null
  distritoId?: string | null
  paisId?: string | null
  numeroPorta?: string | null
  andarRua?: string | null
  observacoes?: string | null
  status?: number | null
  entidadeContactos?: CreateEntidadeContactoItem[] | null
  numeroCartaoIdentificacao?: string | null
  dataEmissaoCartaoIdentificacao?: string | null
  dataValidadeCartaoIdentificacao?: string | null
  arquivo?: string | null
}

export interface UpdateFuncionarioRequest extends Omit<CreateFuncionarioRequest, 'entidadeContactos'> {
  entidadeContactos?: UpsertEntidadeContactoItem[] | null
}

export interface FuncionarioTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
}
