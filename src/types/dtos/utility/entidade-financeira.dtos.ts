import type {
  EntidadeTableRuaDTO,
  EntidadeTableCodigoPostalDTO,
  EntidadeTableFreguesiaDTO,
  EntidadeTableConcelhoDTO,
  EntidadeTableDistritoDTO,
  EntidadeTablePaisDTO,
} from '@/types/dtos/utility/entidade-table.dtos'
import type { CondicaoSns } from '@/types/enums/condicao-sns.enum'

export interface EntidadeFinanceiraTableDTO {
  id: string
  nome: string
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
  abreviatura: string | null
  paisPrefixo: string | null
  tipoEntidadeFinanceiraId: string
  tipoEntidadeFinanceiraDesignacao: string | null
  condicaoSns: CondicaoSns | null
}

