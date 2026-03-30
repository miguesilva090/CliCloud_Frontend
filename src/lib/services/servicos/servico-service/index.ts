import { ServicoClient } from './servico-client'

export const ServicoService = (idFuncionalidade = '') => new ServicoClient(idFuncionalidade)

