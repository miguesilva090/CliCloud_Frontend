import { MotivosDesmarcacaoClient } from './motivo-desmarcacao-client'

export const MotivosDesmarcacaoService = (idFuncionalidade = '') =>
    new MotivosDesmarcacaoClient(idFuncionalidade)
export * from './motivos-desmarcacao-errors'
