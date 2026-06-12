export type TipoDocumentoLightDTO = {
  id: string
  descricao: string
  abreviatura: string
  inactivo: boolean
  mostraFaturacao?: boolean
  codigoTipoDocumentoSaft?: number | null
  tipoSerie?: string | null
  numeroSerie?: string | null
}

export interface TipoDocumentoTableDTO {
  id: string
  descricao?: string | null
  abreviatura?: string | null
  natureza?: string | null
  codigoTipoDocumentoSaft?: number | null
  numeroSerie?: string | null
  tipoSerie?: string | null
  numeroDocumento?: number | null
  numVias?: number | null
  inactivo: boolean
  mostraFaturacao: boolean
  descarregarTesouraria: boolean
  habilitado: boolean
  codigoATCUD?: string | null
  atcudEstado?: string | null
  createdOn: string
}

export interface TipoDocumentoDTO {
  id: string
  descricao: string
  abreviatura: string
  natureza?: string | null
  tipoMovimento?: number | null
  codigoTipoDocumentoSaft?: number | null
  numeroSerie?: string | null
  tipoSerie?: string | null
  numeroDocumento?: number | null
  numVias?: number | null
  inactivo: boolean
  mostraFaturacao: boolean
  descarregarTesouraria: boolean
  habilitado: boolean
  codigoATCUD?: string | null
  atcudEstado?: string | null
}

export type TipoDocumentoFormDTO = {
  descricao: string
  abreviatura: string
  natureza: string
  codigoTipoDocumentoSaft: number | null
  numeroSerie: string
  tipoSerie: string
  numeroDocumento: number
  numVias: number
  inactivo: boolean
  mostraFaturacao: boolean
  descarregarTesouraria: boolean
  habilitado: boolean
  codigoATCUD: string
  atcudEstado: string
}
