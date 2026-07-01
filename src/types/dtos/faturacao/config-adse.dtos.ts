export type ConfigAdseDTO = {
  id?: string | null
  empresaId?: string | null
  urlADSE?: string | null
  dominio?: string | null
  utilizador?: string | null
  password?: string | null
  organismoId?: string | null
  numeroLocal?: number | null
  passwordLocal?: string | null
  urlPasta?: string | null
}

export type GuardarConfigAdseRequest = {
  empresaId: string
  urlADSE: string
  dominio: string
  utilizador: string
  password: string
  organismoId?: string | null
  numeroLocal?: number | null
  passwordLocal?: string | null
  urlPasta?: string | null
}
