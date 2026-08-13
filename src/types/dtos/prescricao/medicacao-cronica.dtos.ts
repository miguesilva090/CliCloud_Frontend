export interface MedicacaoCronicaDTO {
  id: string
  utenteId: string
  cnpem: string
  embId?: string | null
  designacao: string
  dosagem?: string | null
  descricaoEmbalagem?: string | null
  formaFarmaceutica?: string | null
  principioAtivo?: string | null
  posologia?: string | null
  tipoLinha: number
  dataInicio: string
  dataFim?: string | null
}

export interface CreateMedicacaoCronicaRequest {
  utenteId: string
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
