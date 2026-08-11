/** Paridade PrescricaoRSPEdtNova.js / GS.Lang.PrescricaoRSPEdtMotivo*. */
export const MOTIVOS_PRESCRICAO_NOME = [
  {
    value: 1,
    label: 'Margem ou indice terapêutico estreito (alínea a)',
  },
  { value: 2, label: 'Reação adversa (alínea b)' },
  {
    value: 3,
    label: 'Continuidade de tratamento superior a 28 dias (alínea c)',
  },
  {
    value: 4,
    label: 'Não dispõe de medicamentos genéricos similiares comparticipados',
  },
] as const

export const MSG_MOTIVO = {
  obrigatorio:
    'O Preenchimento do motivo da prescrição por medicamento é de caracter obrigatório',
} as const

export type LinhaMotivoInput = {
  tipoLinha?: number | null
  codTipoPrescricao?: number | null
  codMotivo?: number | null
}

/** DCI / genérico = 2 → não exige motivo. */
export function isPrescricaoPorNome(
  codTipoPrescricao?: number | null
): boolean {
  return codTipoPrescricao !== 2
}

export function linhaExigeMotivo(linha: LinhaMotivoInput): boolean {
  if ((linha.tipoLinha ?? 1) > 3) return false
  return isPrescricaoPorNome(linha.codTipoPrescricao)
}

export function linhaMotivoInvalida(linha: LinhaMotivoInput): boolean {
  if (!linhaExigeMotivo(linha)) return false
  const m = linha.codMotivo ?? 0
  return m < 1 || m > 4
}

export function derivePrescricaoPorNomeHeader(linhas: LinhaMotivoInput[]): {
  prescricaoPorNome: number
  motivoPrescricaoNome: number | null
} {
  const porNome = linhas.filter(linhaExigeMotivo)
  if (porNome.length === 0) {
    return { prescricaoPorNome: 0, motivoPrescricaoNome: null }
  }
  return {
    prescricaoPorNome: 1,
    motivoPrescricaoNome: porNome[0]?.codMotivo ?? null,
  }
}
