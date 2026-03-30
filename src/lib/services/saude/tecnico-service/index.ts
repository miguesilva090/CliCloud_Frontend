import { TecnicoClient } from './tecnico-client'

let _instance: TecnicoClient | null = null

export function TecnicoService(idFuncionalidade: string): TecnicoClient {
  if (!_instance) {
    _instance = new TecnicoClient(idFuncionalidade)
  }
  return _instance
}

export { TecnicoClient }

