/**
 * Estado Civil – alinhado ao backend CliCloud.Domain.Enums.EstadoCivil
 * (Solteiro=0, Casado=1, Divorciado=2, Viuvo=3, Separado=4)
 */
export enum EstadoCivil {
  SOLTEIRO = 0,
  CASADO = 1,
  DIVORCIADO = 2,
  VIUVO = 3,
  SEPARADO = 4,
}

export const EstadoCivilLabel: Record<EstadoCivil, string> = {
  [EstadoCivil.SOLTEIRO]: 'Solteiro(a)',
  [EstadoCivil.CASADO]: 'Casado(a)',
  [EstadoCivil.DIVORCIADO]: 'Divorciado(a)',
  [EstadoCivil.VIUVO]: 'Viúvo(a)',
  [EstadoCivil.SEPARADO]: 'Separado(a)',
}
