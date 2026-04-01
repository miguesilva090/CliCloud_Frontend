import { ChamadaVozClient } from './chamada-voz-client'

export const ChamadaVozService = (idFuncionalidade = '') => new ChamadaVozClient(idFuncionalidade)
