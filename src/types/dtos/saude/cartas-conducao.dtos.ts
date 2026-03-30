/**
 * DTOs para Cartas de Condução e Restrições (atestado carta condução).
 * Endpoints: GET /client/cartasconducao/CartaConducao/light, GET /client/cartasconducao/CartaConducaoRestricoes/light
 */

export interface CartaConducaoLightDTO {
  id: string
  codigoCarta?: string | null
  descricao?: string | null
  grupo?: number
}

export interface CartaConducaoRestricoesLightDTO {
  id: string
  codigoRestricao: number
  descricao?: string | null
}
