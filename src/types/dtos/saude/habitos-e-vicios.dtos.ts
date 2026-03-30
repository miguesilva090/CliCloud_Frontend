import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface HabitosEViciosTableFilterRequest extends TableFilterRequest {}

export interface HabitosEViciosTableDTO 
{
    id: string 
    utenteId: string 
    consumoBebidasAlcoolicas: boolean 
    fuma: boolean 
    consumoDrogas: boolean 
    praticaExercicioFisico: boolean 
    createdOn: string
}

export interface HabitosEViciosDTO extends HabitosEViciosTableDTO 
{
    consumoDeFrutas: boolean
    consumoAgua: boolean
    quantidadeAgua: string | null
    consumoPeixe: boolean
    consumoCarne: boolean
    tipoCarne?: number | null
    consumoVegetais: boolean 
    ingestaoLeite: boolean 
    consumoSalgados: boolean 
    consumoAcucarados: boolean 

    bebidasAlcoolicas: string | null
    quantidadeAlcool?: string | null 
    alcoolDesdeQuando?: string | null 

    quantosFumaDia?: string | null
    tabacoDesdeQuando?: string | null 

    drogas?: string | null 
    drogasDesdeQuando?: string | null 

    outrosVicios?: string | null 
    outrosViciosDesdeQuando?: string | null 

    tomaFarmacosPrescritos: boolean 
    tomaFarmacosSemReceita: boolean 
    farmacosSemReceita?: string | null 

    praticaExercicioFisico: boolean
    tipoExercicioFisico?: string | null
    frequenciaExFisico?: string | null

    observacoesHabitosAlimentaresEVicios?: string | null 
    observacoesHabitosMedicamentosExercicioFisico?: string | null 

}

export interface HabitosEViciosRequest 
  extends Omit<HabitosEViciosDTO, 'id' | 'createdOn'> {}

export interface CreateHabitosEViciosRequest extends HabitosEViciosRequest {}

export interface UpdateHabitosEViciosRequest
  extends Omit<HabitosEViciosRequest, 'utenteId'> {}

export interface HabitosEViciosLightDTO 
    extends Omit<HabitosEViciosTableDTO, 'createdOn'> {}
