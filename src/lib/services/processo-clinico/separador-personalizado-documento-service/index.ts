import { SeparadorPersonalizadoDocumentoClient } from './separador-personalizado-documento-client'

export const SeparadorPersonalizadoDocumentoService = (idFuncionalidade?: string) =>
  new SeparadorPersonalizadoDocumentoClient(idFuncionalidade ?? '969d2a48-ae2f-46f8-b68d-7162714f72a8')

export * from './separador-personalizado-documento-client'
