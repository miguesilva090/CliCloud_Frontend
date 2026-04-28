import type {
  PaginationFilterRequest,
  TableFilter,
} from '@/types/dtos/common/table-filters.dtos'
import type {
  EntidadeContactoDTO,
  CreateEntidadeContactoItemRequest,
  UpsertEntidadeContactoItemRequest,
} from '@/types/dtos/utility/entidade-contactos.dtos'
import type {
  RuaDTO,
  CodigoPostalDTO,
  FreguesiaDTO,
  ConcelhoDTO,
  DistritoDTO,
  PaisDTO,
} from '@/types/dtos/utility/endereco.dtos'

// Reaproveitar enums de horário dos médicos (backend usa mesmo DiaSemana/Periodo)
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type Periodo = 0 | 1

export interface TecnicoTableDTO {
  // Entidade
  id: string
  nome?: string | null
  tipoEntidadeId: number
  email?: string | null
  numeroContribuinte?: string | null
  ruaId?: string | null
  rua?: { nome?: string | null } | null
  codigoPostalId?: string | null
  codigoPostal?: { codigo?: string | null; localidade?: string | null } | null
  freguesiaId?: string | null
  freguesia?: { nome?: string | null } | null
  concelhoId?: string | null
  concelho?: { nome?: string | null } | null
  distritoId?: string | null
  distrito?: { nome?: string | null } | null
  paisId?: string | null
  pais?: { nome?: string | null; codigo?: string | null } | null
  numeroPorta?: string | null
  andarRua?: string | null
  status?: number | null
  createdOn: string
  contactoCount?: number
  /** Telefone ou telemóvel (herdado de entidade/contactos) */
  contacto?: string | null

  // Dados pessoais mínimos para tabela (opcionais)
  dataNascimento?: string | null
  numeroCartaoIdentificacao?: string | null

  // Técnico
  especialidadeId?: string | null
  especialidadeNome?: string | null
  margem?: number | null
}

export interface TecnicoLightDTO {
  id: string
  nome?: string | null
  /** GUID da conta na plataforma — necessário para notificações a utilizadores. */
  idUtilizador?: string | null
}

export interface TecnicoDTO {
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
  sexoId?: string | null
  sexo?: { id: string; codigo?: string; descricao?: string } | null
  estadoCivilId?: string | null
  estadoCivil?: { id: string; codigo?: string; descricao?: string } | null
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

  // Técnico
  especialidadeId?: string | null
  especialidadeNome?: string | null
  margem?: number | null
  idUtilizador?: string | null
}

export interface CreateTecnicoRequest {
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
  sexoId?: string | null
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

  // Técnico
  especialidadeId?: string | null
  margem?: number | null
  idUtilizador?: string | null
}

export interface UpdateTecnicoRequest {
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
  entidadeContactos?: UpsertEntidadeContactoItemRequest[] | null

  // EntidadePessoa
  dataNascimento?: string | null
  sexoId?: string | null
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

  // Técnico
  especialidadeId?: string | null
  margem?: number | null
  idUtilizador?: string | null
}

export interface TecnicoTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
}

// Horário Fixo Técnico (HorarioTecnico + HorarioTecnicoDia)

export interface HorarioTecnicoDTO {
  id: string
  tecnicoId: string
  tipoHorario?: number | null
  minMarcacao?: string | null
  horaComp?: number | null
  createdOn?: string
  lastModifiedOn?: string | null
}

export interface HorarioTecnicoDiaDTO {
  id: string
  horarioTecnicoId: string
  diaSemana: DiaSemana
  periodo: Periodo
  inicio?: string | null
  fim?: string | null
  sala?: string | null
  numMarcacoesPeriodo?: number | null
  numMarcacoesOutro?: number | null
  createdOn?: string
  lastModifiedOn?: string | null
}

export interface CreateHorarioTecnicoRequest {
  tecnicoId: string
  tipoHorario?: number | null
  minMarcacao?: string | null
  horaComp?: number | null
}

export interface UpdateHorarioTecnicoRequest {
  tecnicoId: string
  tipoHorario?: number | null
  minMarcacao?: string | null
  horaComp?: number | null
}

export interface CreateHorarioTecnicoDiaRequest {
  horarioTecnicoId: string
  diaSemana: DiaSemana
  periodo: Periodo
  inicio?: string | null
  fim?: string | null
  sala?: string | null
  numMarcacoesPeriodo?: number | null
  numMarcacoesOutro?: number | null
}

export interface UpdateHorarioTecnicoDiaRequest {
  horarioTecnicoId: string
  diaSemana: DiaSemana
  periodo: Periodo
  inicio?: string | null
  fim?: string | null
  sala?: string | null
  numMarcacoesPeriodo?: number | null
  numMarcacoesOutro?: number | null
}

// Horário Variável Técnico

export interface HorarioTecnicoVariavelDTO {
  id: string
  tecnicoId: string
  data: string
  manhaInicio?: string | null
  manhaFim?: string | null
  tardeInicio?: string | null
  tardeFim?: string | null
  createdOn?: string
  lastModifiedOn?: string | null
}

export interface CreateHorarioTecnicoVariavelRequest {
  tecnicoId: string
  data: string
  manhaInicio?: string | null
  manhaFim?: string | null
  tardeInicio?: string | null
  tardeFim?: string | null
}

export interface UpdateHorarioTecnicoVariavelRequest {
  tecnicoId: string
  data: string
  manhaInicio?: string | null
  manhaFim?: string | null
  tardeInicio?: string | null
  tardeFim?: string | null
}

// Férias / Folgas Técnico

export interface FolgasTecnicoDTO {
  id: string
  tecnicoId: string
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

export interface CreateFolgasTecnicoRequest {
  tecnicoId: string
  dataDe: string
  dataAte: string
  todoDia: boolean
  mesInteiro: boolean
  manhaInicio?: string | null
  manhaFim?: string | null
  tardeInicio?: string | null
  tardeFim?: string | null
}

export interface UpdateFolgasTecnicoRequest {
  tecnicoId: string
  dataDe: string
  dataAte: string
  todoDia: boolean
  mesInteiro: boolean
  manhaInicio?: string | null
  manhaFim?: string | null
  tardeInicio?: string | null
  tardeFim?: string | null
}

