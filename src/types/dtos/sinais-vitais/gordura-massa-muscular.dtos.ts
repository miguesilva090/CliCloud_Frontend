import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface GorduraMassaMuscularTableFilterRequest extends TableFilterRequest {}

export interface GorduraMassaMuscularTableDTO {
  id: string
  utenteId: string
  data: string
  hora: string
  percentAguaCorpo?: number | null
  percentGordPernaDir?: number | null
  percentGordPernaEsq?: number | null
  percentGordBracoDir?: number | null
  percentGordBracoEsq?: number | null
  percentGordTronco?: number | null
  gorduraVisceral?: number | null
  massaMuscPernaDir?: number | null
  massaMuscPernaEsq?: number | null
  massaMuscBracoDir?: number | null
  massaMuscBracoEsq?: number | null
  massaMuscTronco?: number | null
  consumoMetabolico?: number | null
  createdOn: string
}

export interface GorduraMassaMuscularDTO extends GorduraMassaMuscularTableDTO {}

export interface CreateGorduraMassaMuscularRequest extends Omit<GorduraMassaMuscularDTO, 'id' | 'createdOn'> {}

export interface UpdateGorduraMassaMuscularRequest extends Omit<GorduraMassaMuscularDTO, 'utenteId' | 'createdOn'> {}
