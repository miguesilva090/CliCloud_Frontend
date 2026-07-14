import { UnidadeMedidaClient } from './unidade-medida-client'

export const UnidadeMedidaService = (idFuncionalidade = '') =>
    new UnidadeMedidaClient(idFuncionalidade)
export * from './unidade-medida-errors'
export * from './unidade-medida-client'
