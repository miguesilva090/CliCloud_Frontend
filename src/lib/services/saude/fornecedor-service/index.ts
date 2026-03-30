import { FornecedorClient } from './fornecedor-client'

let _instance: FornecedorClient | null = null

export function FornecedorService(idFuncionalidade = 'fornecedores'): FornecedorClient {
  if (!_instance) {
    _instance = new FornecedorClient(idFuncionalidade)
  }
  return _instance
}

export { FornecedorClient }
