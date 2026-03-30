import { RuasClient } from './ruas-client'

const RuasService = (idFuncionalidade: string) =>
  new RuasClient(idFuncionalidade)

export { RuasService }

export * from './ruas-client'
export * from './ruas-errors'
