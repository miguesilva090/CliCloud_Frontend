import { ConfigExamesSemPapelClient } from './config-exames-sem-papel-client'

export const ConfigExamesSemPapelService = (idFuncionalidade = '') => 
    new ConfigExamesSemPapelClient(idFuncionalidade)