export interface ContaBancariaLightDTO {
  id: string
  numero: string
  iban?: string | null
}

export interface ContaBancariaTableDTO {
  id: string
  numero: string
  tipoConta: string
  bancoId?: string | null
  bancoNome?: string | null
  dataAbertura?: string | null
  nib?: string | null
  iban?: string | null
  saldoActual?: number | null
  createdOn: string
}

export interface ContaBancariaDTO {
  id: string
  numero: string
  tipoConta: string
  bancoId?: string | null
  bancoNome?: string | null
  dataAbertura?: string | null
  nib?: string | null
  saldoActual?: number | null
  gestorConta?: string | null
  alertaSaldo?: number | null
  valorAlertaSaldo?: number | null
  obs?: string | null
  iban?: string | null
  bic?: string | null
  ficheiro?: number | null
  createdOn: string
}

export type ContaBancariaFormDTO = {
  Numero: string
  TipoConta: string
  BancoId?: string | null
  DataAbertura?: string | null
  NIB?: string | null
  SaldoActual?: number | null
  GestorConta?: string | null
  AlertaSaldo?: number | null
  ValorAlertaSaldo?: number | null
  OBS?: string | null
  IBAN?: string | null
  BIC?: string | null
  Ficheiro?: number | null
}
