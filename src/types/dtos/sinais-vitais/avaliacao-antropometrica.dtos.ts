import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface AvaliacaoAntropometricaTableFilterRequest extends TableFilterRequest {}

export interface AvaliacaoAntropometricaTableDTO {
  id: string
  utenteId: string
  data: string
  hora: string
  quadricepEsq?: number | null
  quadricepDir?: number | null
  quadricepDif?: number | null
  isquiotibialEsq?: number | null
  isquiotibialDir?: number | null
  isquiotibialDif?: number | null
  adutorEsq?: number | null
  adutorDir?: number | null
  adutorDif?: number | null
  abdutorEsq?: number | null
  abdutorDir?: number | null
  abdutorDif?: number | null
  gluteoEsq?: number | null
  gluteoDir?: number | null
  gluteoDif?: number | null
  gemeoEsq?: number | null
  gemeoDir?: number | null
  gemeoDif?: number | null
  abdutorOmbroEsq?: number | null
  abdutorOmbroDir?: number | null
  abdutorOmbroDif?: number | null
  flexorOmbroEsq?: number | null
  flexorOmbroDir?: number | null
  flexorOmbroDif?: number | null
  extensorOmbroEsq?: number | null
  extensorOmbroDir?: number | null
  extensorOmbroDif?: number | null
  rotadorInternoOmbroEsq?: number | null
  rotadorInternoOmbroDir?: number | null
  rotadorInternoOmbroDif?: number | null
  rotadorExternoOmbroEsq?: number | null
  rotadorExternoOmbroDir?: number | null
  rotadorExternoOmbroDif?: number | null
  createdOn: string
}

export interface AvaliacaoAntropometricaDTO extends AvaliacaoAntropometricaTableDTO {}

export interface CreateAvaliacaoAntropometricaRequest extends Omit<AvaliacaoAntropometricaDTO, 'id' | 'createdOn'> {}

export interface UpdateAvaliacaoAntropometricaRequest extends Omit<AvaliacaoAntropometricaDTO, 'utenteId' | 'createdOn'> {}
