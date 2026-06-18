import { ZonaFiscal } from '@/types/dtos/core/clinica.dtos'
import type { ZonaFiscalTableDTO } from '@/types/dtos/faturacao/zona-fiscal.dtos'

/** Valores fixos de Faturacao.ZonaFiscal (seed legado). */
export const ZONAS_FISCAIS_ROWS: ZonaFiscalTableDTO[] = [
  { codigo: ZonaFiscal.Continente, descricao: 'Continente' },
  { codigo: ZonaFiscal.Madeira, descricao: 'Madeira' },
  { codigo: ZonaFiscal.Acores, descricao: 'Açores' },
]
