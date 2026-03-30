import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface HistoriaClinicaTableFilterRequest extends TableFilterRequest {}

export interface HistoriaClinicaTableDTO 
{
  id: string 
  utenteId: string
  utenteNome: string
  medicoId: string 
  medicoNome: string
  especialidadeId?: string | null
  especialidadeNome?: string | null
  data: string 
  hora?: string | null
  obs: string
  createdOn: string 
}

export interface HistoriaClinicaDTO 
{
  id: string 
  utenteId: string
  utenteNome: string
  medicoId: string
  medicoNome: string
  especialidadeId?: string | null
  especialidadeNome?: string | null
  data: string
  hora?: string | null
  obs: string
  createdOn: string
}

export interface CreateHistoriaClinicaRequest
{
  utenteId: string
  medicoId: string 
  especialidadeId?: string | null 
  data: string 
  hora: string 
  obs: string
}

export interface UpdateHistoriaClinicaRequest
{
  id: string 
  utenteId: string 
  medicoId: string 
  especialidadeId?: string | null 
  data: string 
  hora: string 
  obs: string
}