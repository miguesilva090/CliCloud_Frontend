import { AntecedentesPessoaisClient } from './antecedentes-pessoais-client'

export const AntecedentesPessoaisService = (idFuncionalidade = '') =>
  new AntecedentesPessoaisClient(idFuncionalidade)
export * from './antecedentes-pessoais-errors'
export * from './antecedentes-pessoais-client'
