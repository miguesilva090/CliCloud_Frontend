import { EmpresaClient } from './empresa-client'

let _instance: EmpresaClient | null = null

export function EmpresaService(idFuncionalidade = 'empresas'): EmpresaClient {
  if (!_instance) {
    _instance = new EmpresaClient(idFuncionalidade)
  }
  return _instance
}

export { EmpresaClient }

