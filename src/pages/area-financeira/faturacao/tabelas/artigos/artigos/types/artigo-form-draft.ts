import type { TipoArtigoStocks } from '@/types/dtos/stocks/artigo.dtos'

export type ArtigoFormValues = {
  codigo: string
  numeroArtigo: string
  descricao: string
  ean: string
  codigoBarras: string
  unidadeMedidaId: string
  familiaArtigoId: string
  armazemId: string
  taxaIvaId: string
  motivoIsencaoId: string
  tipoArtigo: TipoArtigoStocks
  inativo: boolean
  descontinuado: boolean
  precoUnitarioSemIva1: string
  precoUnitarioSemIva2: string
  precoUnitarioSemIva3: string
  precoVendaComIva1: string
  precoVendaComIva2: string
  precoVendaComIva3: string
  precoCusto: string
  stockMinimo: string
  stockMaximo: string
  stockReposicao: string
  permitirDescontos: boolean
  permitirAlterarPreco: boolean
  actHotel: boolean
  actPOS: boolean
  numSerieUCentral: string
  desconto: string
  capacidade: string
  temGarantia: boolean
  mesesGarantia: string
  ampliacaoGarantia: string
  visualizarNaNet: boolean
  tipoMedida: 'peso' | 'quantidade'
}

export type ArtigoFormPageDraft = {
  artigoId: string | null
  mode: 'view' | 'create' | 'edit'
  values: ArtigoFormValues
  urlFoto: string | null
  stockReal: number | null
  precosAgregados: {
    ultimoPrecoFinal: number | null
    precoMedioFinal: number | null
    ultimoPrecoVenda: number | null
    precoMedioVenda: number | null
  }
}
