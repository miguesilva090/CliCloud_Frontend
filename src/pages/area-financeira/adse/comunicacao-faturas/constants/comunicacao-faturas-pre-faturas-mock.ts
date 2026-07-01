import type {
  ComunicacaoFaturasTipoPreFatura,
  PreFaturaTableDTO,
} from '@/types/dtos/faturacao/comunicacao-faturas.dtos'

const MOCK_PRE_FATURAS: Record<
  ComunicacaoFaturasTipoPreFatura,
  PreFaturaTableDTO[]
> = {
  CA: [],
  TA: [
    {
      id: 'ta2',
      numeroPreFatura: 'TA2',
      dataAbertura: '17/12/2018',
      estado: 'Aberta',
      numeroDocsIncluidos: 17,
      valorTotal: 1739.56,
      dataFecho: null,
      numeroSerieFatura: 'FA3/76',
      dataFatura: '30/07/2024',
      temPdf: false,
      temComprovativo: false,
    },
  ],
  EX: [],
}

export function getMockPreFaturas(
  tipoPreFatura: ComunicacaoFaturasTipoPreFatura
): PreFaturaTableDTO[] {
  return MOCK_PRE_FATURAS[tipoPreFatura].map((row) => ({ ...row }))
}
