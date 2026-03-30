import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface AvaliacaoPosturalTableFilterRequest extends TableFilterRequest {}

export interface AvaliacaoPosturalTableDTO {
  id: string
  utenteId: string
  data: string
  hora: string
  endoforiaPresente?: string | null
  endoforiaValores?: string | null
  exoforiaPresente?: string | null
  exoforiaValores?: string | null
  hiperforiaPresente?: string | null
  hiperforiaValores?: string | null
  desvioPresente?: string | null
  desvioValores?: string | null
  aberturaPresente?: string | null
  aberturaValores?: string | null
  fechoPresente?: string | null
  fechoValores?: string | null
  supinadoPresente?: string | null
  supinadoValores?: string | null
  pronadoPresente?: string | null
  pronadoValores?: string | null
  neutroPresente?: string | null
  neutroValores?: string | null
  escoliosePresente?: string | null
  escolioseValores?: string | null
  hipercifosePresente?: string | null
  hipercifoseValores?: string | null
  hiperlordosePresente?: string | null
  hiperlordoseValores?: string | null
  curtaPresente?: string | null
  curtaValores?: string | null
  valgoPresente?: string | null
  valgoValores?: string | null
  varoPresente?: string | null
  varoValores?: string | null
  iliacoPresente?: string | null
  iliacoValores?: string | null
  sacroPresente?: string | null
  sacroValores?: string | null
  subidoPresente?: string | null
  subidoValores?: string | null
  descidoPresente?: string | null
  descidoValores?: string | null
  anteriorPresente?: string | null
  anteriorValores?: string | null
  posteriorPresente?: string | null
  posteriorValores?: string | null
  rotacaoPresente?: string | null
  rotacaoValores?: string | null
  inclinacaoPresente?: string | null
  inclinacaoValores?: string | null
  outros1Presente?: string | null
  outros1Valores?: string | null
  outros2Presente?: string | null
  outros2Valores?: string | null
  outros3Presente?: string | null
  outros3Valores?: string | null
  createdOn: string
}

export interface AvaliacaoPosturalDTO extends AvaliacaoPosturalTableDTO {}

export interface CreateAvaliacaoPosturalRequest extends Omit<AvaliacaoPosturalDTO, 'id' | 'createdOn'> {}

export interface UpdateAvaliacaoPosturalRequest extends Omit<AvaliacaoPosturalDTO, 'utenteId' | 'createdOn'> {}
