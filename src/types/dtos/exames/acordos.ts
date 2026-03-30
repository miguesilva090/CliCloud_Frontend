export interface AcordosDTO {
  id: string
  tipoExameId: string
  tipoExameDesignacao?: string | null
  organismoId: string
  organismoNome?: string | null
  codigoSubsistema?: string | null
  valTipoExame?: number | null
  valorOrganismo?: number | null
  margemOrganismo?: number | null
  valorUtente?: number | null
  inactivo: boolean
  createdOn: string
  lastModifiedOn?: string | null
}

export interface AcordosLightDTO {
  id: string
  codigoSubsistema?: string | null
  tipoExameDesignacao?: string | null
  organismoNome?: string | null
}

export interface AcordosTableDTO {
  id: string
  tipoExameId: string
  tipoExameDesignacao?: string | null
  organismoId: string
  organismoNome?: string | null
  codigoSubsistema?: string | null
  valTipoExame?: number | null
  valorOrganismo?: number | null
  margemOrganismo?: number | null
  valorUtente?: number | null
  inactivo: boolean
  createdOn: string
}

export interface CreateAcordosRequest {
  tipoExameId: string
  organismoId: string
  codigoSubsistema?: string | null
  valTipoExame?: number | null
  valorOrganismo?: number | null
  margemOrganismo?: number | null
  valorUtente?: number | null
  inactivo: boolean
}

export interface UpdateAcordosRequest extends CreateAcordosRequest {}
