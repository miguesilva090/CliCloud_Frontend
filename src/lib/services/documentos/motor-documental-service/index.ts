import { MotorDocumentalClient } from './motor-documental-client'

export const MotorDocumentalService = (idFuncionalidade = '') =>
  new MotorDocumentalClient(idFuncionalidade)
export * from './motor-documental-errors'
export * from './motor-documental-client'
