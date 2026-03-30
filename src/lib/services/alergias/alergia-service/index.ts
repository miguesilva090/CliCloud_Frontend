import { AlergiaClient } from './alergia-client'

export const AlergiaService = (idFuncionalidade = '') =>
  new AlergiaClient(idFuncionalidade)
