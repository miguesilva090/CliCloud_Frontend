import type { CreateExameLinhaRequest, ExameLinhaDTO, UpdateExameLinhaRequest } from './exame-linha'

export interface ExameDTO {
  id: string
  utenteId: string
  medicoId: string
  dataPrescricao: string
  prioridadeId?: string | null
  numeroPrescricao?: string | null
  organismoId?: string | null
  observacoes?: string | null
  createdOn: string
  lastModifiedOn?: string | null
  linhas?: ExameLinhaDTO[] | null
}

export interface ExameLightDTO {
  id: string
  dataPrescricao: string
  numeroPrescricao?: string | null
  utenteId: string
  medicoId: string
}

export interface ExameTableDTO {
  id: string
  dataPrescricao: string
  numeroPrescricao?: string | null
  prioridadeId?: string | null
  organismoId?: string | null
  observacoes?: string | null
  utenteId: string
  medicoId: string
  createdOn: string
}

export interface CreateExameRequest {
  utenteId: string
  medicoId: string
  dataPrescricao: string
  prioridadeId?: string | null
  numeroPrescricao?: string | null
  organismoId?: string | null
  observacoes?: string | null
  linhas: CreateExameLinhaRequest[]
}

export interface UpdateExameRequest {
  utenteId: string
  medicoId: string
  dataPrescricao: string
  prioridadeId?: string | null
  numeroPrescricao?: string | null
  organismoId?: string | null
  observacoes?: string | null
  linhas: UpdateExameLinhaRequest[]
}

export interface ExamePrescricaoReportLinhaDTO {
  codigo?: string | null
  designacao: string
  quantidade: number
}

export interface ExamePrescricaoReportDTO {
  id: string
  numeroPrescricao?: string | null 
  dataPrescricao: string
  utenteNome: string
  utenteNumero?: string | null
  organismoNome?: string | null
  medicoNome?: string | null
  linhas: ExamePrescricaoReportLinhaDTO[]
}
