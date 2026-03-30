/**
 * Tipo Taxa Moderadora – alinhado ao backend CliCloud.Domain.Enums.TipoTaxaModeradora
 * (Isento=1, NaoIsento=2, E1111=3, H=4, SessentaCinco=5)
 */
export enum TipoTaxaModeradora {
  ISENTO = 1,
  NAO_ISENTO = 2,
  E1111 = 3,
  H = 4,
  SESSENTA_CINCO = 5,
}

export const TipoTaxaModeradoraLabel: Record<TipoTaxaModeradora, string> = {
  [TipoTaxaModeradora.ISENTO]: 'Isento',
  [TipoTaxaModeradora.NAO_ISENTO]: 'Não Isento',
  [TipoTaxaModeradora.E1111]: 'E1111',
  [TipoTaxaModeradora.H]: 'H',
  [TipoTaxaModeradora.SESSENTA_CINCO]: '65',
}
