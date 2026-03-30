import type { AllFilterRequest, TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface ConsultaTableFilterRequest extends TableFilterRequest {}

export interface ConsultaAllFilterRequest extends AllFilterRequest {}

export interface ConsultaDTO {
  id: string
  createdOn: string
  lastModifiedOn?: string | null

  // Relacionamentos principais
  utenteId?: string | null
  medicoId?: string | null
  especialidadeId?: string | null
  tecnicoId?: string | null

  // Dados da consulta
  data?: string | null
  horaInic?: string | null
  horaFim?: string | null
  horaChegada?: string | null
  horaGdh?: string | null
  sala?: string | null

  // Status e confirmação
  confirmado?: boolean | null
  efectuado?: boolean | null
  faltou?: boolean | null
  emTratamento: boolean
  confirmaConsulta: boolean

  // Financeiro
  reciboId?: string | null
  dataRecibo?: string | null
  desconto?: number | null
  pago?: number | null
  faturado?: number | null
  numDevolucao?: string | null
  numDestacavel?: string | null

  // Documentos
  documentoId?: string | null
  tipoDocumentoId?: string | null
  estadoU?: number | null
  estadoI?: number | null

  // Organismo e credenciais
  organismoId?: string | null
  credencial?: string | null
  credencialExterna?: number | null
  apolice?: string | null
  numBenif?: string | null

  // Seguradora e sinistro
  seguradoraId?: string | null
  sinistrado?: number | null
  justificacao?: number | null
  descricaoJust?: string | null

  // Outros campos
  isencao?: number | null
  tratamentoId?: string | null
  instituicaoEmpregadoraId?: string | null
  funcionarioId?: string | null
  obs?: string | null
  motivoConsulta?: string | null
  diagnostico?: string | null
  destino?: string | null
  utilizador?: string | null
  ordem?: number | null
  numLinhas?: number | null
  naoDiscriminar?: number | null
  tipoCambio?: number | null
  movimento?: number | null
  prodAplic?: number | null
  pic?: number | null
  tipoAdmiss?: number | null
  tipoConsulta?: string | null
  tipoConsultaId?: string | null
  tipoConsultaDesignacao?: string | null
  cExtramed?: string | null
  acessoKioskSemPag?: number | null
  senha?: string | null
  dataHoraMarcacao?: string | null
  codigoFatura?: string | null
  dataFatura?: string | null
  codigoTipoDocumentoBase?: string | null
  numeroTFatura?: string | null
  codigoFaturaOrganismo?: string | null
  numeroTFaturaOrganismo?: string | null
  especialidadeCodigo?: string | null
  codMotivoConsulta?: string | null
  descMotivoConsulta?: string | null
  icd91?: string | null
  icd92?: string | null
  identificadorQueue?: string | null
}

export interface ConsultaLightDTO {
  id: string
  data?: string | null
  horaInic?: string | null
  horaFim?: string | null
  sala?: string | null
}

export interface ConsultaTableDTO {
  id: string
  data?: string | null
  horaInic?: string | null
  horaFim?: string | null
  sala?: string | null
  utenteId?: string | null
  utenteNome?: string | null
  medicoId?: string | null
  medicoNome?: string | null
  especialidadeId?: string | null
  especialidadeDesignacao?: string | null
  tecnicoId?: string | null
  confirmado?: boolean | null
  efectuado?: boolean | null
  faltou?: boolean | null
  createdOn: string
  tipoConsultaId?: string | null
  tipoConsultaDesignacao?: string | null
}

// ---------------------------------------------------------------------
// Requests (Create/Update/DeleteMultiple)

export interface CreateConsultaRequest
  extends Omit<
    ConsultaDTO,
    | 'id'
    | 'createdOn'
    | 'lastModifiedOn'
  > {}

export interface UpdateConsultaRequest extends CreateConsultaRequest {}

export interface DeleteMultipleConsultaRequest {
  ids: string[]
}

