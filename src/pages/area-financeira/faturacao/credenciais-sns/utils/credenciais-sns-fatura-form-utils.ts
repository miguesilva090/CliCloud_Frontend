import type { CredenciaisSnsFaturaFormValues } from './credenciais-sns-form-constants'
import type { ModoPagamentoLightDTO } from '@/types/dtos/pagamentos/modo-pagamento.dtos'

export type CredenciaisSnsFaturaFieldErrors = Partial<
  Record<keyof CredenciaisSnsFaturaFormValues, string>
>

export function validateCredenciaisSnsFaturaForm(
  values: CredenciaisSnsFaturaFormValues,
  modosPagamento: ModoPagamentoLightDTO[]
): CredenciaisSnsFaturaFieldErrors {
  const errors: CredenciaisSnsFaturaFieldErrors = {}

  if (!values.organismoId.trim()) {
    errors.organismoId = 'Preencha o organismo.'
  }
  if (!values.ano.trim()) {
    errors.ano = 'Preencha o ano.'
  }
  if (!values.tipoServicoId.trim()) {
    errors.tipoServicoId = 'Preencha o tipo de serviço.'
  }
  if (!values.mes.trim()) {
    errors.mes = 'Preencha o mês.'
  }

  const numVias = values.numVias.trim()
  if (numVias && numVias !== '0' && Number.isNaN(Number(numVias))) {
    errors.numVias = 'N.º de vias inválido.'
  }

  if (values.opcaoFatura !== 'gerar') return errors

  if (!values.tipoDocumentoId.trim()) {
    errors.tipoDocumentoId = 'Selecione o tipo de documento.'
  }
  if (!values.modoPagamentoId.trim()) {
    errors.modoPagamentoId = 'Selecione o modo de pagamento.'
  }

  const modo = modosPagamento.find((m) => m.id === values.modoPagamentoId)
  if (modo?.temContaBancaria && !values.contaBancariaId.trim()) {
    errors.contaBancariaId = 'Preencha a conta bancária.'
  }
  if (modo?.temNumAssociado && !values.numeroCheque.trim()) {
    errors.numeroCheque = 'Preencha o número do cheque.'
  }
  if (modo?.temNumAssociado && values.preDatado && !values.dataVencimento.trim()) {
    errors.dataVencimento = 'Preencha a data de vencimento.'
  }

  return errors
}

export function credenciaisSnsFaturaHasErrors(errors: CredenciaisSnsFaturaFieldErrors) {
  return Object.keys(errors).length > 0
}
