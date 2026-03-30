import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface QuestionarioUtenteTableFilterRequest extends TableFilterRequest {}

export interface QuestionarioUtenteTableDTO {
  id: string
  utenteId: string
  dataCriacao: string
}

export interface QuestionarioUtenteDTO extends QuestionarioUtenteTableDTO {
  estaFazerTratamento: boolean
  duracaoTratamento?: string | null
  descTratamento?: string | null

  problemasNeurologicos: boolean
  problemasNeuromusculares: boolean
  problemasRespiratorios: boolean
  problemasArticularesOuReumatismo: boolean
  tonturasEZumbidosNosOuvidos: boolean
  problemasComportamento: boolean
  problemasRenais: boolean
  tonturasCardiovasculares: boolean
  problemasDigestivos: boolean
  problemasGastricos: boolean
  febreReumatica: boolean
  problemasIntestinais: boolean
  problemasUrinarios: boolean
  problemasComAnestesia: boolean
  problemasDeHomorragia: boolean
  problemasFormigueiroDormencia: boolean
  problemasCicratizacao: boolean
  hepatiteSida: boolean
  gravidez: boolean
  sedeEBocaSeca: boolean
  usaPacemaker: boolean

  doencaAutoImune?: boolean | null
  doencaCronica?: boolean | null
  doencaGenetica?: boolean | null

  problemasDiabetes: boolean
  tipoDiabetes?: number | null

  tensaoArterial: boolean
  tipoTensaoArterial?: number | null

  colestrol: boolean
  tipoColestrol?: number | null

  observacoes?: string | null
}

export interface CreateQuestionarioUtenteRequest {
  utenteId: string

  estaFazerTratamento: boolean
  duracaoTratamento?: string | null
  descTratamento?: string | null

  problemasNeurologicos: boolean
  problemasNeuromusculares: boolean
  problemasRespiratorios: boolean
  problemasArticularesOuReumatismo: boolean
  tonturasEZumbidosNosOuvidos: boolean
  problemasComportamento: boolean
  problemasRenais: boolean
  tonturasCardiovasculares: boolean
  problemasDigestivos: boolean
  problemasGastricos: boolean
  febreReumatica: boolean
  problemasIntestinais: boolean
  problemasUrinarios: boolean
  problemasComAnestesia: boolean
  problemasDeHomorragia: boolean
  problemasFormigueiroDormencia: boolean
  problemasCicratizacao: boolean
  hepatiteSida: boolean
  gravidez: boolean
  sedeEBocaSeca: boolean
  usaPacemaker: boolean

  doencaAutoImune?: boolean | null
  doencaCronica?: boolean | null
  doencaGenetica?: boolean | null

  problemasDiabetes: boolean
  tipoDiabetes?: number | null

  tensaoArterial: boolean
  tipoTensaoArterial?: number | null

  colestrol: boolean
  tipoColestrol?: number | null

  observacoes?: string | null
}

export interface UpdateQuestionarioUtenteRequest
  extends Omit<CreateQuestionarioUtenteRequest, 'utenteId'> {}

