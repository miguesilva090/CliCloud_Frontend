import { ExamesSemPapelClient } from './exames-sem-papel-client'

const ID_FUNCIONALIDADE = 'exames-sem-papel-service'

export const ExamesSemPapelService = () => new ExamesSemPapelClient(ID_FUNCIONALIDADE)

export * from './exames-sem-papel-client'
