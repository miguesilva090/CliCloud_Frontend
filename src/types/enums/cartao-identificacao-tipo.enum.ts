export enum CartaoIdentificacaoTipo {
  CC = 1,
  PASSAPORTE = 2,
}

export const CartaoIdentificacaoTipoLabel: Record<
  CartaoIdentificacaoTipo,
  string
> = {
  [CartaoIdentificacaoTipo.CC]: 'Cartão de Cidadão',
  [CartaoIdentificacaoTipo.PASSAPORTE]: 'Passaporte',
}
