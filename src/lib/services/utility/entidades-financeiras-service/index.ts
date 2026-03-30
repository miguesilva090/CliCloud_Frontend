import { EntidadesFinanceirasClient } from './entidades-financeiras-client'

const EntidadesFinanceirasService = (idFuncionalidade: string) =>
  new EntidadesFinanceirasClient(idFuncionalidade)

export { EntidadesFinanceirasService }
export * from './entidades-financeiras-client'

