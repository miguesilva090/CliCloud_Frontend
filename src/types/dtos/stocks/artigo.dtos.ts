export type TipoArtigoStocks = 1 | 2 | 3

export type TipoMedidaArtigo = 0 | 1

export const TIPO_MEDIDA_OPTIONS: { value: TipoMedidaArtigo; label: string }[] = [
  { value: 0, label: 'Peso' },
  { value: 1, label: 'Quantidade' },
]

export const TIPO_ARTIGO_OPTIONS: { value: TipoArtigoStocks; label: string }[] = [
  { value: 1, label: 'Artigo' },
  { value: 2, label: 'Serviço' },
  { value: 3, label: 'Outros' },
]

export interface ArtigoLightDTO {
  id: string
  codigo: number
  numeroArtigo: string
  descricao: string
  autocompleteLabel?: string
}

export interface ArtigoTableDTO {
  id: string
  codigo: number
  numeroArtigo: string
  descricao: string
  armazemNome?: string | null
  precoUnitarioSemIva1: number
  precoVendaComIva1: number
  inativo: boolean
  descontinuado: boolean
  tipoArtigo: TipoArtigoStocks
  createdOn: string
}

export interface ArtigoDTO extends ArtigoTableDTO {
  ean?: string | null
  codigoBarras?: string | null
  urlFoto?: string | null
  unidadeMedidaId: string
  unidadeMedidaDescricao?: string | null
  familiaArtigoId?: string | null
  familiaArtigoDescricao?: string | null
  taxaIvaId: string
  taxaIvaDescricao?: string | null
  taxaIvaPercentagem?: number | null
  motivoIsencaoId?: string | null
  motivoIsencaoDescricao?: string | null
  armazemId: string
  precoUnitarioSemIva2: number
  precoUnitarioSemIva3: number
  precoVendaComIva2: number
  precoVendaComIva3: number
  precoCusto: number
  ultimoPrecoFinal: number
  precoMedioFinal: number
  ultimoPrecoVenda: number
  precoMedioVenda: number
  stockMinimo?: number | null
  stockMaximo?: number | null
  stockReposicao?: number | null
  stockReal: number
  permitirDescontos: boolean
  permitirAlterarPreco: boolean
  actHotel: boolean
  actPOS: boolean
  numSerieUCentral?: string | null
  desconto?: number | null
  capacidade?: number | null
  temGarantia: boolean
  mesesGarantia?: number | null
  ampliacaoGarantia?: number | null
  visualizarNaNet: boolean
  tipoMedida?: TipoMedidaArtigo | null
  lastModifiedOn: string | null
}

export interface ArtigoSaveBody {
  numeroArtigo?: string | null
  descricao: string
  ean?: string | null
  codigoBarras?: string | null
  urlFoto?: string | null
  unidadeMedidaId: string
  familiaArtigoId?: string | null
  taxaIvaId: string
  motivoIsencaoId?: string | null
  armazemId: string
  tipoArtigo: TipoArtigoStocks
  inativo: boolean
  descontinuado: boolean
  precoUnitarioSemIva1: number
  precoUnitarioSemIva2: number
  precoUnitarioSemIva3: number
  precoVendaComIva1: number
  precoVendaComIva2: number
  precoVendaComIva3: number
  precoCusto: number
  stockMinimo?: number | null
  stockMaximo?: number | null
  stockReposicao?: number | null
  permitirDescontos: boolean
  permitirAlterarPreco: boolean
  actHotel: boolean
  actPOS: boolean
  numSerieUCentral?: string | null
  desconto?: number | null
  capacidade?: number | null
  temGarantia: boolean
  mesesGarantia?: number | null
  ampliacaoGarantia?: number | null
  visualizarNaNet: boolean
  tipoMedida?: TipoMedidaArtigo | null
}

export type ArtigoPaginatedRequest = {
  pageNumber: number
  pageSize: number
  filters?: Record<string, string> | Array<{ id: string; value: string }>
  sorting?: Array<{ id: string; desc: boolean }>
  inativo?: boolean
  descontinuado?: boolean
  tipoArtigo?: TipoArtigoStocks
}
