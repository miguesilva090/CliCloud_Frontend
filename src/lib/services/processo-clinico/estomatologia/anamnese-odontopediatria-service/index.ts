import { AnamneseOdontopediatriaClient } from './anamnese-odontopediatria-client'

export const AnamneseOdontopediatriaService = (idFuncionalidade = 'PClinico-Estomatologia',) =>
  new AnamneseOdontopediatriaClient(idFuncionalidade)

export * from './anamnese-odontopediatria-client'
export * from './anamnese-odontopediatria-errors'
