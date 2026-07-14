import { AntecedentesCirurgicosClient } from './antecedentes-cirurgicos-client'

export const AntecedentesCirurgicosService = (idFuncionalidade = '') =>
  new AntecedentesCirurgicosClient(idFuncionalidade)
export * from './antecedentes-cirurgicos-errors'
export * from './antecedentes-cirurgicos-client'
