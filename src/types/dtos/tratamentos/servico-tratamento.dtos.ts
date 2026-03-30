export interface ServicoTratamentoTableDTO {
  id: string
  tratamentoId: string
  servicoId?: string | null
  ordem?: number | null
  preco?: number | null
  valorUt?: number | null
  createdOn: string
}

export interface CreateServicoTratamentoRequest {
  tratamentoId: string
  servicoId?: string | null
  duracao?: string | null
  iDuraca?: number | null
  ordem?: number | null
  usaFisioter?: number | null
  usaAuxiliar?: number | null
  usaOutro?: number | null
  preco?: number | null
  descInst?: number | null
  valorDesc?: number | null
  valorUt?: number | null
  obs?: string | null
  sessaoTratamentoId?: string | null
}

