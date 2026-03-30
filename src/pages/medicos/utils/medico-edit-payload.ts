import type {
  CreateMedicoRequest,
  MedicoDTO,
  UpdateMedicoRequest,
} from '@/types/dtos/saude/medicos.dtos'

import { ENTIDADE_TIPO, getTipoEntidadeIdForPayload } from '@/lib/entidade-tipo'

import type { MedicoEditFormValues } from '../medico-edit-form-types'

/** Converte string de data para formato YYYY-MM-DD (DateOnly) ou undefined se vazia/inválida. Evita JsonException no backend. */
export function toDateOnly(value?: string | null): string | undefined {
  if (!value || typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const d = new Date(trimmed)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString().slice(0, 10)
}

export function buildUpdatePayload(
  medico: MedicoDTO,
  values: MedicoEditFormValues,
): UpdateMedicoRequest {
  const emailVal = values.email?.trim() ?? ''
  const telefoneVal = values.telefone?.trim() ?? values.telemovel?.trim() ?? ''
  const contactosExistentes =
    (medico.entidadeContactos ?? [])
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
  const outros = contactosExistentes.filter(
    (c) => c.entidadeContactoTipoId !== 3 && c.entidadeContactoTipoId !== 1,
  )
  const safeContactos =
    contactos.length > 0 ? [...contactos, ...outros] : contactosExistentes

  return {
    nome: values.nome,
    tipoEntidadeId: getTipoEntidadeIdForPayload(
      medico.tipoEntidadeId,
      ENTIDADE_TIPO.Medico,
    ),
    email: values.email || undefined,
    numeroContribuinte: values.numeroContribuinte,
    ruaId: values.ruaId ?? medico.ruaId ?? undefined,
    codigoPostalId: values.codigoPostalId ?? medico.codigoPostalId ?? undefined,
    freguesiaId: values.freguesiaId ?? medico.freguesiaId ?? undefined,
    concelhoId: values.concelhoId ?? medico.concelhoId ?? undefined,
    distritoId: values.distritoId ?? medico.distritoId ?? undefined,
    paisId: values.paisId ?? medico.paisId ?? undefined,
    numeroPorta: values.numeroPorta ?? medico.numeroPorta ?? undefined,
    andarRua: values.andarRua ?? medico.andarRua ?? undefined,
    observacoes: values.observacoes ?? medico.observacoes ?? undefined,
    status:
      values.status === 0 ? undefined : values.status ?? medico.status ?? undefined,
    urlFoto:
      values.urlFoto !== undefined ? values.urlFoto : medico.urlFoto ?? undefined,
    entidadeContactos: safeContactos,
    dataNascimento:
      toDateOnly(values.dataNascimento) ??
      toDateOnly(medico.dataNascimento) ??
      undefined,
    sexoId: values.sexoId ?? medico.sexoId ?? undefined,
    estadoCivilId: values.estadoCivilId ?? medico.estadoCivilId ?? undefined,
    nacionalidade: values.nacionalidade ?? medico.nacionalidade ?? undefined,
    naturalidade: values.naturalidade ?? medico.naturalidade ?? undefined,
    numeroCartaoIdentificacao:
      values.numeroCartaoIdentificacao ?? medico.numeroCartaoIdentificacao ?? undefined,
    dataEmissaoCartaoIdentificacao:
      toDateOnly(values.dataEmissaoCartaoIdentificacao) ??
      toDateOnly(medico.dataEmissaoCartaoIdentificacao) ??
      undefined,
    dataValidadeCartaoIdentificacao:
      toDateOnly(values.dataValidadeCartaoIdentificacao) ??
      toDateOnly(medico.dataValidadeCartaoIdentificacao) ??
      undefined,
    arquivo: values.arquivo ?? medico.arquivo ?? undefined,
    carteira: values.carteira ?? medico.carteira ?? undefined,
    nomeUtilizador: values.nomeUtilizador ?? medico.nomeUtilizador ?? undefined,
    urlFotoAssinatura:
      values.urlFotoAssinatura !== undefined
        ? values.urlFotoAssinatura
        : medico.urlFotoAssinatura ?? undefined,
    numeroIdentificacaoBancaria:
      values.numeroIdentificacaoBancaria ??
      medico.numeroIdentificacaoBancaria ??
      undefined,
    director: values.director ?? medico.director ?? false,
    especialidadeId: values.especialidadeId ?? medico.especialidadeId ?? undefined,
    margem: values.margem ?? medico.margem ?? undefined,
    loginPRVR: values.loginPRVR ?? medico.loginPRVR ?? undefined,
    comunicacaoNif: values.comunicacaoNif ?? medico.comunicacaoNif ?? false,
    comunicacaoNifAdse:
      values.comunicacaoNifAdse ?? medico.comunicacaoNifAdse ?? undefined,
    grupoFuncional: values.grupoFuncional ?? medico.grupoFuncional ?? undefined,
    letra: values.letra ?? medico.letra ?? undefined,
    cartaoCidadaoMedico:
      values.cartaoCidadaoMedico ?? medico.cartaoCidadaoMedico ?? 0,
    idUtilizador: values.idUtilizador ?? medico.idUtilizador ?? undefined,
    globalbooking: values.globalbooking ?? medico.globalbooking ?? false,
  }
}

export function buildCreatePayload(
  values: MedicoEditFormValues,
): CreateMedicoRequest {
  const emailVal = values.email?.trim() ?? ''
  const telefoneVal = values.telefone?.trim() ?? values.telemovel?.trim() ?? ''
  const contactos: CreateMedicoRequest['entidadeContactos'] = []
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

  return {
    nome: values.nome,
    tipoEntidadeId: ENTIDADE_TIPO.Medico,
    email: values.email || undefined,
    numeroContribuinte: values.numeroContribuinte,
    ruaId: values.ruaId ?? undefined,
    codigoPostalId: values.codigoPostalId ?? undefined,
    freguesiaId: values.freguesiaId ?? undefined,
    concelhoId: values.concelhoId ?? undefined,
    distritoId: values.distritoId ?? undefined,
    paisId: values.paisId ?? undefined,
    numeroPorta: values.numeroPorta ?? undefined,
    andarRua: values.andarRua ?? undefined,
    observacoes: values.observacoes ?? undefined,
    status: values.status === 0 ? undefined : values.status ?? undefined,
    entidadeContactos: contactos.length > 0 ? contactos : undefined,
    dataNascimento: toDateOnly(values.dataNascimento) ?? undefined,
    sexoId: values.sexoId ?? undefined,
    estadoCivilId: values.estadoCivilId ?? undefined,
    nacionalidade: values.nacionalidade || undefined,
    naturalidade: values.naturalidade || undefined,
    numeroCartaoIdentificacao: values.numeroCartaoIdentificacao || undefined,
    dataEmissaoCartaoIdentificacao:
      toDateOnly(values.dataEmissaoCartaoIdentificacao) ?? undefined,
    dataValidadeCartaoIdentificacao:
      toDateOnly(values.dataValidadeCartaoIdentificacao) ?? undefined,
    arquivo: values.arquivo || undefined,
    carteira: values.carteira || undefined,
    nomeUtilizador: values.nomeUtilizador || undefined,
    urlFoto: values.urlFoto ?? null,
    urlFotoAssinatura: values.urlFotoAssinatura ?? null,
    numeroIdentificacaoBancaria: values.numeroIdentificacaoBancaria || undefined,
    director: values.director ?? false,
    especialidadeId: values.especialidadeId ?? undefined,
    margem: values.margem ?? undefined,
    loginPRVR: values.loginPRVR || undefined,
    comunicacaoNif: values.comunicacaoNif ?? false,
    comunicacaoNifAdse: values.comunicacaoNifAdse ?? undefined,
    grupoFuncional: values.grupoFuncional || undefined,
    letra: values.letra || undefined,
    cartaoCidadaoMedico: values.cartaoCidadaoMedico ?? 0,
    idUtilizador: values.idUtilizador ?? undefined,
    globalbooking: values.globalbooking ?? false,
  }
}

