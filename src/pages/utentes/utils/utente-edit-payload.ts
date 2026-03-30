import type {
  CreateUtenteRequest,
  UpdateUtenteRequest,
  UtenteDTO,
} from '@/types/dtos/saude/utentes.dtos'

import { ENTIDADE_TIPO } from '@/lib/entidade-tipo'

import type { UtenteEditFormValues } from '../utente-edit-form-types'

/**
 * Converte string vazia em null para campos DateTime?/DateOnly? do backend.
 * O backend usa System.Text.Json e NÃO aceita "" para nullable date types (dá JsonException).
 */
export function normalizeDateTime(
  value: string | null | undefined,
): string | null {
  if (value == null) return null
  const trimmed =
    typeof value === 'string' ? value.trim() : String(value).trim()
  return trimmed === '' ? null : trimmed
}

/** Valor final para envio: form ou existente, nunca string vazia. */
export function toDatePayload(
  formVal: string | null | undefined,
  existingVal: string | null | undefined,
): string | null {
  const fromForm = normalizeDateTime(formVal)
  if (fromForm != null) return fromForm
  return normalizeDateTime(existingVal) ?? null
}

/** Considera vazio: string vazia, "-", ou só espaços (para indicar "sem telefone/telemóvel"). */
export function toContactValue(v: string | undefined): string {
  const t = (v ?? '').trim()
  return t === '-' || t === '' ? '' : t
}

export function buildUpdatePayload(
  utente: UtenteDTO,
  values: UtenteEditFormValues,
): UpdateUtenteRequest {
  const emailVal = values.email?.trim() ?? ''
  const telefoneVal = toContactValue(values.telefone)
  const telemovelVal = toContactValue(values.telemovel)
  const contactosExistentes =
    (utente.entidadeContactos ?? [])
      ?.filter((c) => !!c && !!c.valor)
      ?.map((c) => ({
        id: c.id,
        entidadeContactoTipoId: c.entidadeContactoTipoId,
        valor: c.valor || '',
        principal: !!c.principal,
      })) ?? []

  const contactos: Array<{
    id?: string | null
    entidadeContactoTipoId: number
    valor: string
    principal: boolean
  }> = []
  if (emailVal) {
    const existente = contactosExistentes.find(
      (c) => c.entidadeContactoTipoId === 3,
    )
    contactos.push({
      id: existente?.id,
      entidadeContactoTipoId: 3,
      valor: emailVal,
      principal: true,
    })
  }
  if (telefoneVal) {
    const existente = contactosExistentes.find(
      (c) => c.entidadeContactoTipoId === 1,
    )
    contactos.push({
      id: existente?.id,
      entidadeContactoTipoId: 1,
      valor: telefoneVal,
      principal: false,
    })
  }
  if (telemovelVal) {
    const existente = contactosExistentes.find(
      (c) => c.entidadeContactoTipoId === 2,
    )
    contactos.push({
      id: existente?.id,
      entidadeContactoTipoId: 2,
      valor: telemovelVal,
      principal: false,
    })
  }
  const outros = contactosExistentes.filter(
    (c) =>
      c.entidadeContactoTipoId !== 3 &&
      c.entidadeContactoTipoId !== 1 &&
      c.entidadeContactoTipoId !== 2,
  )
  let safeContactos =
    contactos.length > 0 ? [...contactos, ...outros] : contactosExistentes
  safeContactos = safeContactos.filter(
    (c) => (c.valor ?? '').toString().trim() !== '',
  )
  if (safeContactos.length === 0) {
    const fallbackValor = (values.email ?? utente.email ?? '').trim() || '-'
    safeContactos = [
      {
        entidadeContactoTipoId: 3,
        valor: fallbackValor,
        principal: true,
      },
    ]
  }

  return {
    nome: values.nome,
    // Na edição de utente o tipo é sempre Utente (1); nunca enviar 0
    tipoEntidadeId: ENTIDADE_TIPO.Utente,
    email: values.email ?? '',
    numeroContribuinte: values.numeroContribuinte,
    ruaId: values.ruaId ?? utente.ruaId ?? '',
    codigoPostalId: values.codigoPostalId ?? utente.codigoPostalId ?? '',
    freguesiaId: values.freguesiaId ?? utente.freguesiaId ?? '',
    concelhoId: values.concelhoId ?? utente.concelhoId ?? '',
    distritoId: values.distritoId ?? utente.distritoId ?? '',
    paisId: values.paisId ?? utente.paisId ?? '',
    numeroPorta: values.numeroPorta ?? utente.numeroPorta ?? '',
    andarRua: values.andarRua ?? utente.andarRua ?? '',
    observacoes: values.observacoes,
    status: values.status,
    urlFoto: utente.urlFoto ?? null,
    entidadeContactos: safeContactos,
    dataNascimento: toDatePayload(values.dataNascimento, utente.dataNascimento),
    sexoId: values.sexoId ?? utente.sexoId ?? null,
    estadoCivilId: values.estadoCivilId ?? utente.estadoCivilId ?? null,
    habilitacaoId: values.habilitacaoId ?? utente.habilitacaoId ?? null,
    nacionalidade: values.nacionalidade ?? utente.nacionalidade ?? null,
    naturalidade: values.naturalidade ?? utente.naturalidade ?? null,
    numeroCartaoIdentificacao:
      values.numeroCartaoIdentificacao ?? utente.numeroCartaoIdentificacao ?? null,
    dataEmissaoCartaoIdentificacao: toDatePayload(
      values.dataEmissaoCartaoIdentificacao,
      utente.dataEmissaoCartaoIdentificacao,
    ),
    dataValidadeCartaoIdentificacao: toDatePayload(
      values.dataValidadeCartaoIdentificacao,
      utente.dataValidadeCartaoIdentificacao,
    ),
    arquivo: values.arquivo ?? utente.arquivo ?? null,
    carteira: utente.carteira ?? null,
    nomeUtilizador: utente.nomeUtilizador ?? null,
    urlFotoAssinatura: utente.urlFotoAssinatura ?? null,
    numeroIdentificacaoBancaria: utente.numeroIdentificacaoBancaria ?? null,
    nomePai: values.nomePai ?? utente.nomePai ?? null,
    nomeMae: values.nomeMae ?? utente.nomeMae ?? null,
    numeroSegurancaSocial:
      values.numeroSegurancaSocial ?? utente.numeroSegurancaSocial ?? null,
    profissaoId: values.profissaoId ?? utente.profissaoId ?? null,
    grupoSanguineoId: values.grupoSanguineoId ?? utente.grupoSanguineoId ?? null,
    provenienciaUtenteId:
      values.provenienciaUtenteId ?? utente.provenienciaUtenteId ?? null,
    organismoId: values.organismoId ?? utente.organismoId ?? null,
    seguradoraId: values.seguradoraId ?? utente.seguradoraId ?? null,
    empresaId: values.empresaId ?? utente.empresaId ?? null,
    centroSaudeId: values.centroSaudeId ?? utente.centroSaudeId ?? null,
    medicoExternoId: values.medicoExternoId ?? utente.medicoExternoId ?? null,
    medicoId: values.medicoId ?? utente.medicoId ?? null,
    numeroUtente: values.numeroUtente ?? utente.numeroUtente ?? null,
    subsistemaLinhas: (() => {
      const linhas = (
        Array.isArray(values.subsistemaLinhas) ? values.subsistemaLinhas : []
      ).map((linha) => {
        const eid =
          linha.empresaId != null && String(linha.empresaId).trim() !== ''
            ? String(linha.empresaId).trim()
            : null
        return {
          organismoId: linha.organismoId ?? null,
          designacao: linha.designacao ?? null,
          numeroBeneficiario: linha.numeroBeneficiario ?? null,
          sigla: linha.sigla ?? null,
          nomeBeneficiario: linha.nomeBeneficiario ?? null,
          dataCartao: linha.dataCartao || null,
          numeroApolice: linha.numeroApolice ?? null,
          empresaId: eid,
        }
      })
      return linhas
    })(),
    aviso: values.aviso ?? utente.aviso ?? null,
    desistencia: values.desistencia ?? utente.desistencia ?? false,
    cronico: values.cronico ?? utente.cronico ?? false,
    tipoConsulta: values.tipoConsulta ?? utente.tipoConsulta ?? 0,
    migrante: values.migrante ?? utente.migrante ?? false,
    markConsentimento: utente.markConsentimento ?? 0,
    rgpdConsentimento: utente.rgpdConsentimento ?? 0,
    dataConsentimentoRgpd: normalizeDateTime(utente.dataConsentimentoRgpd) ?? null,
    dataRevogacaoRgpd: normalizeDateTime(utente.dataRevogacaoRgpd) ?? null,
    dataConsentimentoMark: normalizeDateTime(utente.dataConsentimentoMark) ?? null,
    dataRevogacaoMark: normalizeDateTime(utente.dataRevogacaoMark) ?? null,
    markTratamentoDados: utente.markTratamentoDados ?? false,
    ccValidado:
      values.ccValidado != null ? values.ccValidado : utente.ccValidado ?? null,
    ccDataValidacao: toDatePayload(values.ccDataValidacao, utente.ccDataValidacao),
    nDocMigrante: values.nDocMigrante ?? utente.nDocMigrante ?? null,
    dataRegisto: normalizeDateTime(utente.dataRegisto) ?? null,
    tipoTaxaModeradora:
      values.tipoTaxaModeradora != null
        ? values.tipoTaxaModeradora
        : utente.tipoTaxaModeradora ?? null,
    condicaoSns:
      values.condicaoSns != null ? values.condicaoSns : utente.condicaoSns ?? null,
    entidadeFinanceiraResponsavelId:
      values.entidadeFinanceiraResponsavelId ??
      utente.entidadeFinanceiraResponsavelId?.toString() ??
      null,
    numeroBeneficiarioEfr:
      values.numeroBeneficiarioEfr ?? utente.numeroBeneficiarioEfr ?? null,
    dataValidadeEfr: toDatePayload(values.dataValidadeEfr, utente.dataValidadeEfr),
    migranteTipoCartao:
      values.migranteTipoCartao ?? utente.migranteTipoCartao ?? null,
  }
}

export function buildCreatePayload(
  values: UtenteEditFormValues,
): CreateUtenteRequest {
  const emailVal = values.email?.trim() ?? ''
  const telefoneVal = toContactValue(values.telefone)
  const telemovelVal = toContactValue(values.telemovel)

  const contactos: CreateUtenteRequest['entidadeContactos'] = []
  if (emailVal) {
    contactos.push({
      entidadeContactoTipoId: 3,
      valor: emailVal,
      principal: true,
    })
  }
  if (telefoneVal) {
    contactos.push({
      entidadeContactoTipoId: 1,
      valor: telefoneVal,
      principal: false,
    })
  }
  if (telemovelVal) {
    contactos.push({
      entidadeContactoTipoId: 2,
      valor: telemovelVal,
      principal: false,
    })
  }

  return {
    // Entidade (mínimo necessário)
    nome: values.nome,
    tipoEntidadeId: ENTIDADE_TIPO.Utente,
    email: values.email ?? '',
    numeroContribuinte: values.numeroContribuinte,
    ruaId: values.ruaId ?? '',
    codigoPostalId: values.codigoPostalId ?? '',
    freguesiaId: values.freguesiaId ?? '',
    concelhoId: values.concelhoId ?? '',
    distritoId: values.distritoId ?? '',
    paisId: values.paisId ?? '',
    numeroPorta: values.numeroPorta ?? '',
    andarRua: values.andarRua ?? '',
    observacoes: values.observacoes,
    status: values.status,
    entidadeContactos: contactos,

    // EntidadePessoa (opcionais)
    dataNascimento: normalizeDateTime(values.dataNascimento),
    sexoId: values.sexoId ?? null,
    estadoCivilId: values.estadoCivilId ?? null,
    habilitacaoId: values.habilitacaoId ?? null,
    nacionalidade: values.nacionalidade || null,
    naturalidade: values.naturalidade || null,
    numeroCartaoIdentificacao: values.numeroCartaoIdentificacao || null,
    dataEmissaoCartaoIdentificacao: normalizeDateTime(
      values.dataEmissaoCartaoIdentificacao,
    ),
    dataValidadeCartaoIdentificacao: normalizeDateTime(
      values.dataValidadeCartaoIdentificacao,
    ),
    arquivo: values.arquivo || null,
    carteira: null,
    nomeUtilizador: null,
    urlFotoAssinatura: null,
    numeroIdentificacaoBancaria: null,

    // Utente (opcionais)
    nomePai: values.nomePai || null,
    nomeMae: values.nomeMae || null,
    numeroSegurancaSocial: values.numeroSegurancaSocial || null,
    profissaoId: values.profissaoId ?? null,
    grupoSanguineoId: values.grupoSanguineoId ?? null,
    provenienciaUtenteId: values.provenienciaUtenteId ?? null,
    organismoId: values.organismoId ?? null,
    seguradoraId: values.seguradoraId ?? null,
    empresaId: values.empresaId ?? null,
    centroSaudeId: values.centroSaudeId ?? null,
    medicoExternoId: values.medicoExternoId ?? null,
    medicoId: values.medicoId ?? null,
    numeroUtente: values.numeroUtente || null,
    aviso: values.aviso || null,
    subsistemaLinhas: (() => {
      const linhas = (
        Array.isArray(values.subsistemaLinhas) ? values.subsistemaLinhas : []
      ).map((linha) => {
        const eid =
          linha.empresaId != null && String(linha.empresaId).trim() !== ''
            ? String(linha.empresaId).trim()
            : null
        return {
          organismoId: linha.organismoId ?? null,
          designacao: linha.designacao ?? null,
          numeroBeneficiario: linha.numeroBeneficiario ?? null,
          sigla: linha.sigla ?? null,
          nomeBeneficiario: linha.nomeBeneficiario ?? null,
          dataCartao: linha.dataCartao || null,
          numeroApolice: linha.numeroApolice ?? null,
          empresaId: eid,
        }
      })
      return linhas
    })(),
    desistencia: false,
    cronico: values.cronico ?? false,
    tipoConsulta: 0,
    migrante: values.migrante ?? false,
    markConsentimento: 0,
    rgpdConsentimento: 0,
    dataConsentimentoRgpd: null,
    dataRevogacaoRgpd: null,
    dataConsentimentoMark: null,
    dataRevogacaoMark: null,
    markTratamentoDados: false,
    ccValidado: values.ccValidado ?? null,
    ccDataValidacao: normalizeDateTime(values.ccDataValidacao),
    nDocMigrante: values.nDocMigrante || null,
    dataRegisto: null,
    tipoTaxaModeradora: values.tipoTaxaModeradora ?? null,
    condicaoSns: values.condicaoSns ?? null,
    entidadeFinanceiraResponsavelId: values.entidadeFinanceiraResponsavelId ?? null,
    numeroBeneficiarioEfr: values.numeroBeneficiarioEfr || null,
    dataValidadeEfr: normalizeDateTime(values.dataValidadeEfr),
    migranteTipoCartao: values.migranteTipoCartao || null,
  }
}

