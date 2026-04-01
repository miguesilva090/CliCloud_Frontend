import { ChamadaUtentesClient } from './chamada-utentes-client'

export const ChamadaUtentesService = (idFuncionalidade = '') =>
  new ChamadaUtentesClient(idFuncionalidade)
