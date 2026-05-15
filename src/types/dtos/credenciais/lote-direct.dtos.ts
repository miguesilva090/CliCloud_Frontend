export interface LoteDirectTableDTO {
  id: string
  utenteId?: string
  utenteNumero?: string
  utenteNome?: string
  credencial?: string
  mesAno?: string
  numeroLote?: number
  codigoOrganismo?: number
  /** Abreviatura / sigla (resolvida pelo código ULS no organismo). */
  organismoSigla?: string
  valorTaxas?: number
  valorTotal?: number
  tipoServico?: number
  tipoLote?: number
  historico: boolean
  createdOn?: string
}

export interface LoteDirectDTO extends LoteDirectTableDTO {
  indiceLote?: number
  mes?: number
  ano?: number
  dataInicio?: string
  dataFim?: string
  valorTotalV2?: number
  valorTotalV3?: number
  subtotal?: number
  valorTaxasLinhas?: number
  centroSaude?: string
  isencao?: number
  proveniencia?: string
  credencialExterna?: boolean
  servicos?: string
  tipoServicoRegistoId?: string
  tipoServicoRegistoDescricao?: string
  servicoConsultaId?: string
  servicoConsultaDesignacao?: string
  medicoId?: string
  medicoNome?: string
  codigoMedico?: string
  especialidade?: string
  medicoExternoId?: string
  medicoExternoNome?: string
  codigoServicoConsulta?: string
  servicoConsulta?: string
  codigoSubsistemaConsulta?: string
  quantidadeConsulta?: number
  valorConsulta?: number
  taxaConsulta?: number
  procedimentosEfetuados?: boolean
}

export interface CorrigirLotesRequest {
  mes: number
  ano: number
}

export interface TipoLoteLightDTO {
  codigo: number
  designa?: string
}

export interface LoteDirectLinhaUpsertRequest {
  servicoId: string
  quantidade: number
  valorUnitario: number
  valorUtenteOriginal: number
  valorInstituicaoOriginal: number
  valorUtente: number
  valorInstituicao: number
}

export interface CreateLoteDirectRequest {
  utenteId?: string
  credencial?: string
  codigoOrganismo?: number
  mes?: number
  ano?: number
  dataInicio?: string
  dataFim?: string
  tipoServico?: number
  tipoServicoRegistoId?: string
  tipoLote?: number
  numeroLote?: number
  indiceLote?: number
  valorTaxas?: number
  valorTotal?: number
  valorTotalV2?: number
  valorTotalV3?: number
  subtotal?: number
  valorTaxasLinhas?: number
  historico?: boolean
  centroSaude?: string
  isencao?: number
  proveniencia?: string
  credencialExterna?: boolean
  servicos?: string
  medicoId?: string
  codigoMedico?: string
  especialidade?: string
  medicoExternoId?: string
  codigoServicoConsulta?: string
  servicoConsulta?: string
  codigoSubsistemaConsulta?: string
  quantidadeConsulta?: number
  valorConsulta?: number
  taxaConsulta?: number
  procedimentosEfetuados?: boolean
  servicoConsultaId?: string
  linhas?: LoteDirectLinhaUpsertRequest[]
  linhas789?: LoteDirectLinhaUpsertRequest[]
}

export interface UpdateLoteDirectRequest extends CreateLoteDirectRequest {}
