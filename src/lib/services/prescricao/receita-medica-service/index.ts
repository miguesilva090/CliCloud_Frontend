import { ReceitaMedicaClient } from './receita-medica-client'

export const ReceitaMedicaService = (idFuncionalidade = '') =>
  new ReceitaMedicaClient(idFuncionalidade)

export * from './receita-medica-client'
