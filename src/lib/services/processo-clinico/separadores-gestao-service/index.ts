import { SeparadoresGestaoClient } from './separadores-gestao-client'

export function SeparadoresGestaoService() {
  return new SeparadoresGestaoClient('PClinico_Separadores')
}
export * from './separadores-gestao-errors'
export * from './separadores-gestao-client'
