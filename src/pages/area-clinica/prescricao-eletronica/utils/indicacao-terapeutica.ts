/** Paridade PrescricaoRSPEdtNova.js / GS.Lang.PrescricaoRSPEdtMotivo5…11 */
export const INDICACOES_TERAPEUTICAS = [
  {
    value: 1,
    label:
      'Espasticidade associada à esclerose múltipla ou lesões da espinal medula.',
  },
  {
    value: 2,
    label:
      'Náuseas, vómitos (resultante da quimioterapia, radioterapia e terapia combinada de HIV e medicação para hepatite C).',
  },
  {
    value: 3,
    label:
      'Estimulação do apetite nos cuidados paliativos de doentes sujeitos a tratamentos oncológicos ou com SIDA.',
  },
  {
    value: 4,
    label:
      'Dor crónica (associada a doenças oncológicas ou ao sistema nervoso, como por exemplo na dor neuropática causada por lesão de um nervo, dor do membro fantasma, nevralgia do trigémio ou após herpes zoster).',
  },
  { value: 5, label: 'Síndrome de Gilles de la Tourette.' },
  {
    value: 6,
    label:
      'Epilepsia e tratamento de transtornos convulsivos graves na infância, tais como as síndromes de Dravet e Lennox Gastaut.',
  },
  { value: 7, label: 'Glaucoma resistente à terapêutica.' },
] as const

export const MSG_INDICACAO = {
  obrigatoria:
    'O Preenchimento da indicação terapêutica é de caracter obrigatório',
} as const

export type LinhaIndicacaoInput = {
  tipoLinha?: number | null
  codIndicacaoTerapeutica?: number | null
}

/** Legado: tipoReceitaLinha == 2 (RE/LE). */
export function linhaExigeIndicacao(linha: LinhaIndicacaoInput): boolean {
  return (linha.tipoLinha ?? 1) === 2
}

export function linhaIndicacaoInvalida(linha: LinhaIndicacaoInput): boolean {
  if (!linhaExigeIndicacao(linha)) return false
  const c = linha.codIndicacaoTerapeutica ?? 0
  return c < 1 || c > 7
}
