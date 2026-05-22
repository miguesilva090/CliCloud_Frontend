import { PedidosConsultaAdministrativoClient } from './pedidos-consulta-administrativo-client'

export const PedidosConsultaAdministrativoService = (idFuncionalidade = '') =>
  new PedidosConsultaAdministrativoClient(idFuncionalidade)
