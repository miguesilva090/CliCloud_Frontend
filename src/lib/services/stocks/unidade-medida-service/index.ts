import { UnidadeMedidaClient } from './unidade-medida-client'

export const UnidadeMedidaService = (idFuncionalidade = '') =>
    new UnidadeMedidaClient(idFuncionalidade)
