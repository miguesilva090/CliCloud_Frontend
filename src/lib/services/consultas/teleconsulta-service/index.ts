import { TeleconsultaClient } from './teleconsulta-client'

const ID_FUNCIONALIDADE = 'teleconsulta-service'

export const TeleconsultaService = () => new TeleconsultaClient(ID_FUNCIONALIDADE)

export * from './teleconsulta-client'
