/**
 * Género – alinhado ao backend CliCloud.Domain.Enums.Genero
 * (Masculino=0, Feminino=1, Outro=2)
 */
export enum Genero {
  MASCULINO = 0,
  FEMININO = 1,
  OUTRO = 2,
}

export const GeneroLabel: Record<Genero, string> = {
  [Genero.MASCULINO]: 'Masculino',
  [Genero.FEMININO]: 'Feminino',
  [Genero.OUTRO]: 'Outro',
}
