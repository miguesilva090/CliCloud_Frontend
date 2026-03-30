import { AntecedentesPessoaisClient } from './antecedentes-pessoais-client'

export const AntecedentesPessoaisService = (idFuncionalidade = '') =>
  new AntecedentesPessoaisClient(idFuncionalidade)

