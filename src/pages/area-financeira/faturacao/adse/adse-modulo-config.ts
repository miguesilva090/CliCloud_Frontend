import type { AdseComunicacaoModulo } from '@/types/dtos/faturacao/adse-comunicacao.dtos'

export const ADSE_TIPO_PRE_FATURA: Record<AdseComunicacaoModulo, string> = {
  tratamentos: 'TA',
  consultas: 'CA',
  exames: 'EX',
}

export function adseComunicacaoPageTitle(modulo: AdseComunicacaoModulo): string {
  switch (modulo) {
    case 'tratamentos':
      return 'Faturação ADSE - Tratamentos'
    case 'consultas':
      return 'Faturação ADSE - Consultas'
    case 'exames':
      return 'Faturação ADSE - Exames'
    default:
      return 'Faturação ADSE'
  }
}
