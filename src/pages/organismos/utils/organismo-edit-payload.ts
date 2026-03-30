import type {
  CreateOrganismoRequest,
  OrganismoDTO,
  UpdateOrganismoRequest,
} from '@/types/dtos/saude/organismos.dtos'

import { ENTIDADE_TIPO, getTipoEntidadeIdForPayload } from '@/lib/entidade-tipo'

import type { OrganismoEditFormValues } from '../organismo-edit-form-types'

export function buildEntidadeContactos(values: OrganismoEditFormValues) {
  const contactos: Array<{
    entidadeContactoTipoId: number
    valor: string
    principal: boolean
  }> = []
  const emailVal = values.email?.trim() ?? ''
  const telefoneVal = values.telefone?.trim() ?? ''
  const faxVal = values.fax?.trim() ?? ''
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
  if (faxVal) {
    contactos.push({
      entidadeContactoTipoId: 2,
      valor: faxVal,
      principal: false,
    })
  }
  if (contactos.length === 0) {
    contactos.push({
      entidadeContactoTipoId: 3,
      valor: emailVal || '',
      principal: true,
    })
  }
  return contactos
}

export function parseNum(s: string | undefined): number | null {
  return s != null && s.trim() !== '' ? parseInt(s.trim(), 10) : null
}

export function parseFloatSafe(s: string | undefined): number | null {
  return s != null && s.trim() !== ''
    ? parseFloat(String(s).replace(',', '.'))
    : null
}

export function buildCreatePayload(
  values: OrganismoEditFormValues,
): CreateOrganismoRequest {
  return {
    nome: values.nome,
    tipoEntidadeId: ENTIDADE_TIPO.Organismo,
    email: values.email ?? '',
    numeroContribuinte: values.numeroContribuinte,
    ruaId: values.ruaId!,
    codigoPostalId: values.codigoPostalId,
    freguesiaId: values.freguesiaId,
    concelhoId: values.concelhoId,
    distritoId: values.distritoId,
    paisId: values.paisId,
    numeroPorta: values.numeroPorta,
    andarRua: values.andarRua,
    observacoes: values.observacoes ?? '',
    status: values.status ?? 1,
    entidadeContactos: buildEntidadeContactos(values),
    nomeComercial: values.nomeComercial?.trim() || null,
    abreviatura: values.abreviatura?.trim() || null,
    prazoPagamento: parseNum(values.prazoPagamento),
    desconto: parseFloatSafe(values.desconto),
    descontoUtente: parseFloatSafe(values.descontoUtente),
    globalbooking: values.globalbooking ?? false,
    contacto: values.contacto?.trim() || null,
    codigoClinica: values.codigoClinica?.trim() || null,
    apolice: values.apolice?.trim() || null,
    avenca: parseFloatSafe(values.avenca) ?? null,
    dataInicioContrato: values.dataInicioContrato?.trim() || null,
    dataFimContrato: values.dataFimContrato?.trim() || null,
    numeroPagamentos: parseNum(values.numeroPagamentos),
    bancoId: values.bancoId?.trim() || null,
    numeroIdentificacaoBancaria: values.nib?.trim() || null,
    categoria: values.categoria?.trim() || null,
    assinarPagaDocumento: values.assinarPagaDocumento ? 1 : 0,
    admissaoCC: values.admissaoCC ? 1 : 0,
    faturaCredencial: values.faturaCredencial ?? 0,
    discriminaServicos: values.discriminaServicos ?? false,
    designaTratamentos: values.designaTratamentos?.trim() || null,
    apresentarCredenciaisPrimeiraSessaoTratamento:
      (values.apresentarCredenciaisPrimeiraSessao ?? 0) === 1,
    apresentarCredenciaisPrimeiraConsulta:
      (values.apresentarCredenciaisTipoConsulta ?? 0) > 0,
    codigoFaturacao:
      values.entidadeNatureza?.[0]?.codigoEntidade?.trim() ||
      values.codigoFaturacao?.trim() ||
      null,
    cServicoFaturaResumo: values.cServicoFaturaResumo?.trim() || null,
    faturarPorDatas: values.faturarPorDatas ? 1 : 0,
    trust: values.trust ?? false,
    adm: values.adm ?? false,
    sadgnr: values.sadgnr ?? false,
    sadpsp: values.sadpsp ?? false,
    contabContaFA: values.contabContaFA?.trim() || null,
    contabContaFR: values.contabContaFR?.trim() || null,
    contabTipoContaFA: values.contabTipoContaFA?.trim() || null,
    contabTipoContaFR: values.contabTipoContaFR?.trim() || null,
    codigoULSNova: parseNum(values.codigoULSNova),
    codigoRegiaoAtestadoCC: parseNum(values.codigoRegiao),
    ars: values.ars?.trim() || null,
    nacional: values.nacional ? 1 : 0,
    limitarConsultas: values.limitarConsultas ?? false,
    numeroConsultas: parseNum(values.numeroConsultas),
    contabilizarFaltas: values.contabilizarFaltas ?? false,
    condicaoPagamento: parseNum(values.condicaoPagamento),
    tipoModoPagamento: parseNum(values.tipoModoPagamento),
    bloqueio: values.inactivo ? 1 : 0,
  }
}

export function buildUpdatePayload(
  organismo: OrganismoDTO,
  values: OrganismoEditFormValues,
): UpdateOrganismoRequest {
  return {
    ...buildCreatePayload(values),
    nome: values.nome,
    tipoEntidadeId: getTipoEntidadeIdForPayload(
      organismo.tipoEntidadeId,
      ENTIDADE_TIPO.Organismo,
    ),
    ruaId: values.ruaId ?? organismo.ruaId ?? '',
    codigoPostalId: values.codigoPostalId ?? organismo.codigoPostalId ?? '',
    freguesiaId: values.freguesiaId ?? organismo.freguesiaId ?? '',
    concelhoId: values.concelhoId ?? organismo.concelhoId ?? '',
    distritoId: values.distritoId ?? organismo.distritoId ?? '',
    paisId: values.paisId ?? organismo.paisId ?? '',
    numeroPorta: values.numeroPorta ?? organismo.numeroPorta ?? '-',
    andarRua: values.andarRua ?? organismo.andarRua ?? '-',
  }
}

