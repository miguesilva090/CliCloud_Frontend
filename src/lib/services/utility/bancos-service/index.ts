import { BancosClient } from './bancos-client'

export function BancosService(idFuncionalidade: string) {
  return new BancosClient(idFuncionalidade)
}
export * from './bancos-errors'
export * from './bancos-client'
