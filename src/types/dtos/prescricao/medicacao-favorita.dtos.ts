export interface MedicacaoFavoritaDTO {
  id: string
  medicoId: string
  cnpem: string
  embId?: string | null
  designacao: string
  dosagem?: string | null
  descricaoEmbalagem?: string | null
  formaFarmaceutica?: string | null
  principioAtivo?: string | null
  posologia?: string | null
  tipoLinha: number
}

export interface CreateMedicacaoFavoritaRequest {
  medicoId: string
  cnpem: string
  embId?: string | null
  designacao: string
  dosagem?: string | null
  descricaoEmbalagem?: string | null
  formaFarmaceutica?: string | null
  principioAtivo?: string | null
  posologia?: string | null
  tipoLinha: number
}
