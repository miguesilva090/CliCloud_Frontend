import { UtentesService } from '@/lib/services/saude/utentes-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'
import { TipoConsultaService } from '@/lib/services/tipos-consulta/tipo-consulta-service'
import { ResponseStatus } from '@/types/api/responses'
import type { MarcacaoAdministrativoFormState } from '../modals/marcacao-administrativo-form-utils'
import {
  isGuid,
  type MarcacoesAgendaResolvedPrefill,
  type MarcacoesAgendaUrlRawParams,
} from './marcacoes-agenda-url-prefill'

export async function resolveMarcacoesAgendaUrlPrefill(
  raw: MarcacoesAgendaUrlRawParams,
  listPermId: string
): Promise<MarcacoesAgendaResolvedPrefill> {
  const criteriaPatch: MarcacoesAgendaResolvedPrefill['criteriaPatch'] = {}
  const createFormPatch: Partial<MarcacaoAdministrativoFormState> = {}

  if (raw.especialidadeId && isGuid(raw.especialidadeId)) {
    criteriaPatch.especialidadeId = raw.especialidadeId
    createFormPatch.especialidadeId = raw.especialidadeId
  } else if (raw.especialidadeNome) {
    const espRes = await EspecialidadeService(listPermId).getEspecialidadesLight(
      raw.especialidadeNome
    )
    const match =
      espRes.info?.data?.find(
        (e) => e.nome?.toLowerCase() === raw.especialidadeNome.toLowerCase()
      ) ?? espRes.info?.data?.[0]
    if (match) {
      criteriaPatch.especialidadeId = match.id
      criteriaPatch.especialidadeLabel = match.nome
      createFormPatch.especialidadeId = match.id
      createFormPatch.especialidadeLabel = match.nome
    }
  }

  if (raw.medicoId && isGuid(raw.medicoId)) {
    criteriaPatch.medicoId = raw.medicoId
    createFormPatch.medicoId = raw.medicoId
    const medRes = await MedicosService(listPermId).getMedicosLight('')
    const med = (medRes.info?.data ?? []).find((m) => m.id === raw.medicoId) as
      | { id: string; nome: string; especialidadeId?: string | null }
      | undefined
    if (med) {
      criteriaPatch.medicoLabel = med.nome
      createFormPatch.medicoLabel = med.nome
      if (!createFormPatch.especialidadeId && med.especialidadeId) {
        createFormPatch.especialidadeId = med.especialidadeId
        criteriaPatch.especialidadeId = med.especialidadeId
      }
    }
  } else if (raw.legacyMedicoKey) {
    try {
      const legadoRes = await MarcacoesAdministrativoService(listPermId).resolveMedicoLegado(
        raw.legacyMedicoKey
      )
      if (legadoRes.info?.status === ResponseStatus.Success && legadoRes.info.data) {
        const m = legadoRes.info.data
        criteriaPatch.medicoId = m.medicoId
        criteriaPatch.medicoLabel = m.medicoNome ?? ''
        createFormPatch.medicoId = m.medicoId
        createFormPatch.medicoLabel = m.medicoNome ?? ''
      }
    } catch {
      /* mantém unresolvedLegacyMedicoKey */
    }
  }

  if (raw.utenteId && isGuid(raw.utenteId)) {
    createFormPatch.utenteId = raw.utenteId
    createFormPatch.utenteLabel = raw.nomeUtente
  } else if (raw.numeroUtente) {
    try {
      const utRes = await UtentesService(listPermId).getUtenteByNumeroUtente(
        raw.numeroUtente
      )
      if (utRes.info?.status === ResponseStatus.Success && utRes.info.data) {
        createFormPatch.utenteId = utRes.info.data.id
        createFormPatch.utenteLabel =
          raw.nomeUtente || utRes.info.data.nome || raw.numeroUtente
        if (utRes.info.data.organismoId && !createFormPatch.organismoId) {
          createFormPatch.organismoId = utRes.info.data.organismoId
        }
      }
    } catch {
      /* utente não encontrado */
    }
  }

  if (raw.tipoConsultaCodigo) {
    const cod = Number(raw.tipoConsultaCodigo)
    if (!Number.isNaN(cod)) {
      const tiposRes = await TipoConsultaService().getAllTiposConsulta()
      const tipo = (tiposRes.info?.data ?? []).find(
        (t) => (t as { codigoLegado?: number }).codigoLegado === cod
      )
      if (tipo) {
        createFormPatch.tipoConsultaId = tipo.id
      }
    }
  }

  if (raw.credencial) {
    createFormPatch.credencial = raw.credencial
  }
  if (raw.numReq) {
    createFormPatch.credencial = raw.numReq
  }

  if (raw.organismoId && isGuid(raw.organismoId)) {
    createFormPatch.organismoId = raw.organismoId
  }

  return {
    criteriaPatch,
    createFormPatch,
    openCreateModal: raw.abrirMarcacao,
    unresolvedLegacyMedicoKey:
      raw.legacyMedicoKey && !criteriaPatch.medicoId ? raw.legacyMedicoKey : undefined,
  }
}
