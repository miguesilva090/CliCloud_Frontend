import type { PaginationFilterRequest, TableFilter } from '@/types/dtos/common/table-filters.dtos'
import type { EntidadeTableRuaDTO, EntidadeTableCodigoPostalDTO } from '@/types/dtos/utility/entidade-table.dtos'
import type { EntidadeTableFreguesiaDTO } from '@/types/dtos/utility/entidade-table.dtos'
import type { EntidadeTableConcelhoDTO } from '@/types/dtos/utility/entidade-table.dtos'
import type { EntidadeTableDistritoDTO } from '@/types/dtos/utility/entidade-table.dtos'
import type { EntidadeTablePaisDTO } from '@/types/dtos/utility/entidade-table.dtos'

export interface CentroSaudeTableDTO {
  id: string
  nome?: string | null
  tipoEntidadeId: number
  email?: string | null
  numeroContribuinte?: string | null
  ruaId?: string | null
  rua?: EntidadeTableRuaDTO | null
  codigoPostalId?: string | null
  codigoPostal?: EntidadeTableCodigoPostalDTO | null
  freguesiaId?: string | null
  freguesia?: EntidadeTableFreguesiaDTO | null
  concelhoId?: string | null
  concelho?: EntidadeTableConcelhoDTO | null
  distritoId?: string | null
  distrito?: EntidadeTableDistritoDTO | null
  paisId?: string | null
  pais?: EntidadeTablePaisDTO | null
  numeroPorta?: string | null
  andarRua?: string | null
  status?: number | null
  createdOn: string
  contactoCount?: number
  codigoLocalCS?: string | null
}

export interface CentroSaudeDTO {
  id: string
  nome: string
  tipoEntidadeId: number
  email?: string | null
  numeroContribuinte?: string | null
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
  status?: number | null
  entidadeContactos?: Array<{
    entidadeContactoTipoId: number
    valor?: string | null
    principal?: boolean
  }> | null
  codigoLocalCS?: string | null
}

export interface CentroSaudeLightDTO {
  id: string
  nome: string
  numeroContribuinte?: string | null
  codigoLocalCS?: string | null
}

export interface CentroSaudeTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
  sorting?: Array<{ id: string; desc: boolean }>
}

export interface CreateCentroSaudeRequest {
  nome: string
  tipoEntidadeId: number
  email?: string | null
  numeroContribuinte?: string | null
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
  entidadeContactos?: Array<{
    entidadeContactoTipoId: number
    valor: string
    principal: boolean
  }>
  codigoLocalCS?: string | null
}

export interface UpdateCentroSaudeRequest extends CreateCentroSaudeRequest {}
