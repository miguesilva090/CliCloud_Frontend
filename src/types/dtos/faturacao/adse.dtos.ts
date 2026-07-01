export type WebserviceAdseDTO = {
  id: string
  clinicaId: string
  organismoId: string
  clinicaFisioterapiaId: string
  urlAdse: string
  dominioUserAdse: string
  userAdse: string
  passwordAdse?: string | null
  passlocalAdse?: string | null
  numlocalAdse: number
  nomelocalAdse?: string | null
  pastaPdfAdse: string
}

export type AtualizarWebserviceAdseRequest = {
  organismoId: string
  clinicaFisioterapiaId: string
  urlAdse: string
  dominioUserAdse: string
  userAdse: string
  passwordAdse: string
  passlocalAdse: string
  numlocalAdse: number
  pastaPdfAdse: string
}

export type AdseOrganismoLookupDTO = {
  id: string
  nome: string
}
