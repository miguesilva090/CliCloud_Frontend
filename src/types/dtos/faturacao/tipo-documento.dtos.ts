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