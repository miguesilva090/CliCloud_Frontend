import { PedidosConsultaAdministrativoClient } from './pedidos-consulta-administrativo-client'

export const PedidosConsultaAdministrativoService = (idFuncionalidade = '') =>
  new PedidosConsultaAdministrativoClient(idFuncionalidade)
export * from './pedidos-consulta-administrativo-errors'
export * from './pedidos-consulta-administrativo-client'
