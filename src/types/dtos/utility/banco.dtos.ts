import type {
  EntidadeTableRuaDTO,
  EntidadeTableCodigoPostalDTO,
  EntidadeTableFreguesiaDTO,
  EntidadeTableConcelhoDTO,
  EntidadeTableDistritoDTO,
  EntidadeTablePaisDTO,
} from '@/types/dtos/utility/entidade-table.dtos'

export interface BancoTableDTO {
  id: string
  nome: string | null
  // Campo opcional para futura abreviatura (quando existir no backend)
  abreviatura?: string | null
  tipoEntidadeId: number
  email: string | null
  numeroContribuinte: string | null
  ruaId: string | null
  rua: EntidadeTableRuaDTO | null
  codigoPostalId: string | null
  codigoPostal: EntidadeTableCodigoPostalDTO | null
  freguesiaId: string | null
  freguesia: EntidadeTableFreguesiaDTO | null
  concelhoId: string | null
  concelho: EntidadeTableConcelhoDTO | null
  distritoId: string | null
  distrito: EntidadeTableDistritoDTO | null
  paisId: string | null
  pais: EntidadeTablePaisDTO | null
  numeroPorta: string | null
  andarRua: string | null
  status: number | null
  createdOn: Date
  contactoCount: number
}

