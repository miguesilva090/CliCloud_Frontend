export interface PatologiaServicoDTO {
  id?: string
  subsistemaServicoId: string
  codigoServico?: string | null
  descricaoServico?: string | null
  subSistema?: string | null
  duracao?: string | null
  ordem: number
  fisioterapia: boolean
  auxiliar: boolean
  valorUtente: number
  valorOrganismo: number
  percentagemInstituicao?: number | null
  precoEur?: number | null
  observacoes?: string | null
}

export interface PatologiaTableDTO {
  id: string
  designacao: string
  organismoNome?: string | null
  inativo: boolean
}

export interface PatologiaLightDTO {
  id: string
  designacao: string
}

export interface PatologiaDTO {
  id: string
  designacao: string
  localTratamentoId?: string | null
  localTratamentoDesignacao?: string | null
  organismoId?: string | null
  organismoNome?: string | null
  especificacaoTecnica?: string | null
  doencas?: string | null
  inativo: boolean
  patologiaServicos?: PatologiaServicoDTO[] | null
  doencaIds?: string[] | null
}

export interface CreatePatologiaServicoRequest {
  subsistemaServicoId: string
  duracao?: string | null
  ordem: number
  fisioterapia: boolean
  auxiliar: boolean
  valorUtente: number
  valorOrganismo: number
  percentagemInstituicao?: number | null
  precoEur?: number | null
  observacoes?: string | null
}

export interface CreatePatologiaRequest {
  designacao: string
  localTratamentoId?: string | null
  organismoId?: string | null
  especificacaoTecnica?: string | null
  doencas?: string | null
  inativo: boolean
  patologiaServicos?: CreatePatologiaServicoRequest[] | null
  doencaIds?: string[] | null
}

export interface UpdatePatologiaRequest extends CreatePatologiaRequest {}
