import { AntecedentesCirurgicosClient } from './antecedentes-cirurgicos-client'

export const AntecedentesCirurgicosService = (idFuncionalidade = '') =>
  new AntecedentesCirurgicosClient(idFuncionalidade)

