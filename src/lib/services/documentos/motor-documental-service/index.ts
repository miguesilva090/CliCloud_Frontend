import { MotorDocumentalClient } from './motor-documental-client'

export const MotorDocumentalService = (idFuncionalidade = '') =>
  new MotorDocumentalClient(idFuncionalidade)
