import { BancosClient } from './bancos-client'

export function BancosService(idFuncionalidade: string) {
  return new BancosClient(idFuncionalidade)
}

