import { CartasConducaoClient } from './cartas-conducao-client'

export const CartasConducaoService = (idFuncionalidade: string) =>
  new CartasConducaoClient(idFuncionalidade)

export * from './cartas-conducao-client'
export * from './cartas-conducao-queries'
