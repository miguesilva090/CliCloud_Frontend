import type { AllFilterRequest, TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'
import type { EntidadeContactoDTO, CreateEntidadeContactoItemRequest, UpsertEntidadeContactoItemRequest } from '@/types/dtos/utility/entidade-contactos.dtos'
import type { RuaDTO, CodigoPostalDTO, FreguesiaDTO, ConcelhoDTO, DistritoDTO, PaisDTO } from '@/types/dtos/utility/endereco.dtos'
import type {
  EntidadeTableRuaDTO,
  EntidadeTableCodigoPostalDTO,
  EntidadeTableFreguesiaDTO,
  EntidadeTableConcelhoDTO,
  EntidadeTableDistritoDTO,
  EntidadeTablePaisDTO,
} from '@/types/dtos/utility/entidade-table.dtos'

export interface MedicoTableFilterRequest extends TableFilterRequest {}

export interface MedicoAllFilterRequest extends AllFilterRequest {}

export interface MedicoDTO {
  // Entidade
  id: string
  nome: string
  tipoEntidadeId: number
  email?: string | null
  numeroContribuinte?: string | null
  ruaId?: string | null
  rua?: RuaDTO | null
  codigoPostalId?: string | null
  codigoPostal?: CodigoPostalDTO | null
  freguesiaId?: string | null
  freguesia?: FreguesiaDTO | null
  concelhoId?: string | null
  concelho?: ConcelhoDTO | null
  distritoId?: string | null
  distrito?: DistritoDTO | null
  paisId?: string | null
  pais?: PaisDTO | null
  numeroPorta?: string | null
  andarRua?: string | null
  observacoes?: string | null
  status?: number | null
  urlFoto?: string | null
  createdOn: string
  entidadeContactos?: EntidadeContactoDTO[] | null

  // EntidadePessoa
  dataNascimento?: string | null
  sexo?: { id: string; codigo?: string; descricao?: string } | null
  sexoId?: string | null
  estadoCivil?: { id: string; codigo?: string; descricao?: string } | null
  estadoCivilId?: string | null
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

  // Medico
  director: boolean
  especialidadeId?: string | null
  especialidadeNome?: string | null
  margem?: number | null
  loginPRVR?: string | null
  comunicacaoNif: boolean
  comunicacaoNifAdse?: boolean | null
  grupoFuncional?: string | null
  letra?: string | null
  cartaoCidadaoMedico: number
  idUtilizador?: string | null
  globalbooking: boolean
}

export interface MedicoLightDTO {
  id: string
  nome: string
  letra?: string | null
  numeroContribuinte?: string | null
  ruaId?: string | null
  ruaNome?: string | null
  codigoPostalId?: string | null
  codigoPostalCodigo?: string | null
  codigoPostalLocalidade?: string | null
  freguesiaId?: string | null
  freguesiaNome?: string | null
  concelhoId?: string | null
  concelhoNome?: string | null
  distritoId?: string | null
  distritoNome?: string | null
  paisId?: string | null
  paisNome?: string | null
  numeroPorta?: string | null
  andarRua?: string | null
  status?: number | null
  dataNascimento?: string | null
  sexo?: number | null
  estadoCivil?: number | null
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
  director: boolean
  especialidadeId?: string | null
  especialidadeNome?: string | null
}

export interface MedicoTableDTO {
  // Entidade
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
  contactoCount: number

  // EntidadePessoa
  dataNascimento?: string | null
  sexo?: number | null
  estadoCivil?: number | null
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

  // Medico
  director: boolean
  especialidadeId?: string | null
  especialidadeNome?: string | null
  margem?: number | null
  globalbooking: boolean
}

// ---------------------------------------------------------------------
// Requests (Create/Update/DeleteMultiple)

export interface CreateMedicoRequest {
  // Entidade
  nome: string
  tipoEntidadeId: number
  email?: string | null
  numeroContribuinte?: string | null
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
  urlFoto?: string | null
  entidadeContactos?: CreateEntidadeContactoItemRequest[] | null

  // EntidadePessoa
  dataNascimento?: string | null
  sexo?: number | null
  sexoId?: string | null
  estadoCivil?: number | null
  estadoCivilId?: string | null
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

  // Medico
  director: boolean
  especialidadeId?: string | null
  margem?: number | null
  loginPRVR?: string | null
  comunicacaoNif: boolean
  comunicacaoNifAdse?: boolean | null
  grupoFuncional?: string | null
  letra?: string | null
  cartaoCidadaoMedico: number
  idUtilizador?: string | null
  globalbooking: boolean
}

export interface UpdateMedicoRequest extends Omit<CreateMedicoRequest, 'entidadeContactos'> {
  entidadeContactos?: UpsertEntidadeContactoItemRequest[] | null
}

export interface DeleteMultipleMedicoRequest {
  ids: string[]
}

// Horário Fixo (backend: HorarioMedico + HorarioMedicoDia)
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type Periodo = 0 | 1 // 0 = Manhã, 1 = Tarde

export interface HorarioMedicoDTO {
  id: string
  medicoId: string
  tipoHorario?: number | null
  minMarcacao?: string | null
  horaComp: boolean
  primeiraConsulta?: string | null
  horarioFlexivel: boolean
  createdOn?: string
  lastModifiedOn?: string | null
}

export interface HorarioMedicoDiaDTO {
  id: string
  horarioMedicoId: string
  diaSemana: DiaSemana
  periodo: Periodo
  inicio?: string | null
  fim?: string | null
  sala?: string | null
  vagas?: number | null
  createdOn?: string
  lastModifiedOn?: string | null
}

export interface CreateHorarioMedicoRequest {
  medicoId: string
  tipoHorario?: number | null
  minMarcacao?: string | null
  horaComp: boolean
  primeiraConsulta?: string | null
  horarioFlexivel: boolean
}

export interface UpdateHorarioMedicoRequest {
  medicoId: string
  tipoHorario?: number | null
  minMarcacao?: string | null
  horaComp: boolean
  primeiraConsulta?: string | null
  horarioFlexivel: boolean
}

export interface CreateHorarioMedicoDiaRequest {
  horarioMedicoId: string
  diaSemana: DiaSemana
  periodo: Periodo
  inicio?: string | null
  fim?: string | null
  sala?: string | null
  vagas?: number | null
}

export interface UpdateHorarioMedicoDiaRequest {
  horarioMedicoId: string
  diaSemana: DiaSemana
  periodo: Periodo
  inicio?: string | null
  fim?: string | null
  sala?: string | null
  vagas?: number | null
}

// Horário Variável
export interface HorarioMedicoVariavelDTO {
  id: string
  medicoId: string
  data: string
  manhaInicio?: string | null
  manhaFim?: string | null
  tardeInicio?: string | null
  tardeFim?: string | null
  createdOn?: string
  lastModifiedOn?: string | null
}

export interface CreateHorarioMedicoVariavelRequest {
  medicoId: string
  data: string
  manhaInicio?: string | null
  manhaFim?: string | null
  tardeInicio?: string | null
  tardeFim?: string | null
}

export interface UpdateHorarioMedicoVariavelRequest {
  medicoId: string
  data: string
  manhaInicio?: string | null
  manhaFim?: string | null
  tardeInicio?: string | null
  tardeFim?: string | null
}

// Férias / Folgas
export interface FolgasMedicoDTO {
  id: string
  medicoId: string
  dataDe: string
  dataAte: string
  todoDia: boolean
  mesInteiro: boolean
  manhaInicio?: string | null
  manhaFim?: string | null
  tardeInicio?: string | null
  tardeFim?: string | null
  createdOn?: string
  lastModifiedOn?: string | null
}

export interface CreateFolgasMedicoRequest {
  medicoId: string
  dataDe: string
  dataAte: string
  todoDia: boolean
  mesInteiro: boolean
  manhaInicio?: string | null
  manhaFim?: string | null
  tardeInicio?: string | null
  tardeFim?: string | null
}

export interface UpdateFolgasMedicoRequest {
  medicoId: string
  dataDe: string
  dataAte: string
  todoDia: boolean
  mesInteiro: boolean
  manhaInicio?: string | null
  manhaFim?: string | null
  tardeInicio?: string | null
  tardeFim?: string | null
}

