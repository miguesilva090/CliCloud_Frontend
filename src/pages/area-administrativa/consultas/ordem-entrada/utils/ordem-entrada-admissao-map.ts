import { OrigemAdmissao, type AdmissaoTableDTO } from '@/types/dtos/consultas/admissao.dtos'
import type { OrdemEntradaTableDTO } from '@/types/dtos/consultas/ordem-entrada.dtos'

export function ordemEntradaToAdmissaoTable(row: OrdemEntradaTableDTO): AdmissaoTableDTO {
  return {
    id: row.id,
    data: row.data ?? null,
    horaInicio: row.horaInicio ?? null,
    utenteId: row.utenteId,
    utenteNumero: row.utenteNumero ?? null,
    utenteNome: row.utenteNome ?? null,
    medicoNome: row.medicoNome ?? null,
    especialidadeDesignacao: row.especialidadeDesignacao ?? null,
    tipoConsultaDesignacao: row.tipoConsultaDesignacao ?? null,
    statusConsulta: row.statusConsulta ?? null,
    confirmado: row.confirmado ?? null,
    ordem: row.ordem ?? null,
    origem: OrigemAdmissao.Marcacao,
  }
}
