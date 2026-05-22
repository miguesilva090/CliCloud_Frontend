import type {
  PaginationFilterRequest,
  TableFilter,
  TableFilterRequest,
  TanstackSorting,
} from '@/types/dtos/common/table-filters.dtos'

export type { TableFilter, TableFilterRequest, TanstackSorting }

export interface PedidoConsultaPaginatedRequest extends TableFilterRequest {
  agendadoSim?: boolean
  agendadoNao?: boolean
  recusadoSim?: boolean
  recusadoNao?: boolean
  emailPedidoSim?: boolean
  emailPedidoNao?: boolean
  smsPedidoSim?: boolean
  smsPedidoNao?: boolean
  emailAgendadoSim?: boolean
  emailAgendadoNao?: boolean
  smsAgendadoSim?: boolean
  smsAgendadoNao?: boolean
  dataDe?: string
  dataAte?: string
}

export interface PedidoConsultaTableDTO {
  codigo: number
  codigoPedidosConsultaUtente: number
  codigoEspecialidade: number
  nome?: string | null
  telemovel?: string | null
  email?: string | null
  especialidade?: string | null
  data: string
  hora: string
  codigoMedico?: string | null
  medico?: string | null
  agendado: boolean
  emailPedido: boolean
  smsPedido: boolean
  emailAgendado: boolean
  smsAgendado: boolean
  recusado: boolean
  temFicheiro: boolean
}

export interface PedidoConsultaDTO {
  codigo: number
  codigoPedidosConsultaUtente: number
  codigoEspecialidade: number
  nome?: string | null
  email?: string | null
  telemovel?: string | null
  nif?: string | null
  codinst: number
  organismo?: string | null
  especialidade?: string | null
  medico?: string | null
  codigoMedico?: string | null
  data: string
  hora: string
  agendado: boolean
  emailPedido: boolean
  smsPedido: boolean
  emailAgendado: boolean
  smsAgendado: boolean
  recusado: boolean
  codigoAdmissao?: number | null
  temFicheiro: boolean
}

export interface PedidoConsultaUtenteCandidatoDTO {
  id: string
  nome?: string | null
  numeroUtente?: string | null
  numeroContribuinte?: string | null
  email?: string | null
}

export interface PedidoConsultaUtentesCandidatosDTO {
  existeNif: boolean
  existeNome: boolean
  existeEmail: boolean
  existeTelemovel: boolean
  utentes: PedidoConsultaUtenteCandidatoDTO[]
}

export interface GuardarPedidoConsultaMarcacaoRequest {
  utenteId?: string
  forcarNovoUtente?: boolean
  medicoId: string
  especialidadeId: string
  organismoId: string
  tipoConsultaId?: string
  tipoAdmissaoId?: string
  motivoConsultaId?: string
  data: string
  hora: string
  obs?: string
  enviarEmail?: boolean
  enviarSms?: boolean
}

export interface GuardarPedidoConsultaMarcacaoResultDTO {
  marcacaoId: string
  admissaoId?: string | null
  avisos: string[]
}

export interface PedidoConsultaFicheiroDTO {
  nome: string
  conteudoBase64: string
}
