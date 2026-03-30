export interface EstadosDentariosDTO {
  id: string
  codigo: string | null
  descricao: string | null
  estadoPadrao: boolean
  ativo: boolean
  createdOn: string
}

export interface TiposTratamentoDentarioDTO {
  id: string
  codigo: string | null
  descricao: string | null
  faturavel: boolean
  codigoServicoAssociado: string | null
  nomeServicoAssociado: string | null
  ativo: boolean
  createdOn: string
}

export interface OdontogramaDefinitivoDTO {
  id: string
  utenteId: string
  consultaId: string
  numeroDente: number
  numeroDenteAte: number | null
  codigoSuperficie: string | null
  codigoEstadoPadrao: string | null
  codigoTratamentoPadrao: string | null
  codigoEstadoPersonalizado: string | null
  codigoTratamentoPersonalizado: string | null
  descricao: string
  observacoes: string | null
  faturar: boolean
  quantidade: number
  valorServico: number | null
  valorUtente: number | null
  valorEntidade: number | null
  linhaFaturacaoId: string | null
  estadoPadrao: EstadosDentariosDTO | null
  tiposTratamentoPadrao: TiposTratamentoDentarioDTO | null
  createdOn: string
}

export interface CreateOdontogramaDefinitivoRequest {
  utenteId: string
  consultaId: string
  numeroDente: number
  numeroDenteAte: number | null
  codigoSuperficie: string | null
  codigoEstadoPadrao: string | null
  codigoTratamentoPadrao: string | null
  codigoEstadoPersonalizado: string | null
  codigoTratamentoPersonalizado: string | null
  descricao: string
  observacoes: string | null
  faturar: boolean
  quantidade: number
  valorServico: number | null
  valorUtente: number | null
  valorEntidade: number | null
  linhaFaturacaoId: string | null
}

export interface UpdateOdontogramaDefinitivoRequest {
  utenteId: string
  consultaId: string
  numeroDente: number
  numeroDenteAte: number | null
  codigoSuperficie: string | null
  codigoEstadoPadrao: string | null
  codigoTratamentoPadrao: string | null
  codigoEstadoPersonalizado: string | null
  codigoTratamentoPersonalizado: string | null
  descricao: string
  observacoes: string | null
  faturar: boolean
  quantidade: number
  valorServico: number | null
  valorUtente: number | null
  valorEntidade: number | null
  linhaFaturacaoId: string | null
}