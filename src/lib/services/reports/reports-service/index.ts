import { ReportsClient } from './reports-client'

const ReportsService = (idFuncionalidade: string) =>
  new ReportsClient(idFuncionalidade)

export { ReportsService }

export * from './reports-client'
export * from './reports-errors'
