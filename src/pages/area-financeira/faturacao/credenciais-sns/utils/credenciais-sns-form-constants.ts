export const CREDENCIAIS_SNS_MESES = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
] as const

export type CredenciaisSnsOpcaoFatura = 'visualizar' | 'gerar'

export type CredenciaisSnsFaturaFormValues = {
  organismoId: string
  organismoLabel: string
  codigoOrganismo: number | null
  ano: string
  tipoServicoId: string
  mes: string
  naturezaPrestacoes: string
  numVias: string
  opcaoFatura: CredenciaisSnsOpcaoFatura
  tipoDocumentoId: string
  modoPagamentoId: string
  contaBancariaId: string
  numeroCheque: string
  preDatado: boolean
  dataVencimento: string
}

export function createCredenciaisSnsFaturaFormDefaults(): CredenciaisSnsFaturaFormValues {
  const now = new Date()
  return {
    organismoId: '',
    organismoLabel: '',
    codigoOrganismo: null,
    ano: String(now.getFullYear()),
    tipoServicoId: '',
    mes: String(now.getMonth() + 1),
    naturezaPrestacoes: '',
    numVias: '1',
    opcaoFatura: 'visualizar',
    tipoDocumentoId: '',
    modoPagamentoId: '',
    contaBancariaId: '',
    numeroCheque: '',
    preDatado: false,
    dataVencimento: '',
  }
}
