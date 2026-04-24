import type {
  CreateFornecedorRequest,
  FornecedorDTO,
  UpdateFornecedorRequest,
} from '@/types/dtos/saude/fornecedores.dtos'

import { ENTIDADE_TIPO, getTipoEntidadeIdForPayload } from '@/lib/entidade-tipo'

import type { FornecedorEditFormValues } from '../types/fornecedor-edit-form-types'

export function buildEntidadeContactos(values: FornecedorEditFormValues) {
  const contactos: Array<{
    entidadeContactoTipoId: number
    valor: string
    principal: boolean
  }> = []
  const emailVal = values.email?.trim() ?? ''
  const telefoneVal = values.telefone?.trim() ?? ''
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
  values: FornecedorEditFormValues,
): CreateFornecedorRequest {
  return {
    nome: values.nome,
    tipoEntidadeId: ENTIDADE_TIPO.Fornecedor,
    email: values.email?.trim() ? values.email.trim() : null,
    numeroContribuinte: values.numeroContribuinte,
    ruaId: values.ruaId!,
    codigoPostalId: values.codigoPostalId,
    freguesiaId: values.freguesiaId,
    concelhoId: values.concelhoId,
    distritoId: values.distritoId,
    paisId: values.paisId,
    numeroPorta: values.numeroPorta ?? '-',
    andarRua: values.andarRua ?? '-',
    observacoes: values.observacoes ?? '',
    status: values.status ?? 1,
    entidadeContactos: buildEntidadeContactos(values),
    numeroConta: values.numeroConta?.trim() || null,
    plafond: parseFloatSafe(values.plafond) ?? null,
    desconto: parseFloatSafe(values.desconto) ?? null,
    condicaoPagamento: parseNum(values.condicaoPagamento) ?? null,
    moeda: parseNum(values.moeda) ?? null,
    numeroNib: values.numeroNib?.trim() || null,
    enderecoWeb: values.enderecoWeb?.trim() || null,
    diasPrevEntrega: parseNum(values.diasPrevEntrega) ?? null,
    diasEfectiEntrega: parseNum(values.diasEfectiEntrega) ?? null,
    origem: parseNum(values.origem) ?? null,
  }
}

export function buildUpdatePayload(
  fornecedor: FornecedorDTO,
  values: FornecedorEditFormValues,
): UpdateFornecedorRequest {
  return {
    ...buildCreatePayload(values),
    tipoEntidadeId: getTipoEntidadeIdForPayload(
      fornecedor.tipoEntidadeId,
      ENTIDADE_TIPO.Fornecedor,
    ),
  }
}

