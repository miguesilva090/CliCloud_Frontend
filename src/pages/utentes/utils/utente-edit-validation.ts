import type { UtenteEditFormValues } from '../utente-edit-form-types'

/** Ordem dos campos OBRIGATÓRIOS (alinhado ao backend UpdateUtenteValidator). Aviso, NISS e Data Nascimento são opcionais. */
export const UTENTE_FORM_FIELD_ORDER: (keyof UtenteEditFormValues)[] = [
  'nome',
  'numeroContribuinte',
  'observacoes',
  'paisId',
  'distritoId',
  'concelhoId',
  'freguesiaId',
  'codigoPostalId',
  'rua',
  'ruaId',
  'numeroPorta',
  'andarRua',
]

/** Tab onde cada campo se encontra (para navegar ao primeiro erro). */
export const UTENTE_FIELD_TO_TAB: Record<string, string> = {
  nome: 'dados-pessoais',
  numeroContribuinte: 'dados-pessoais',
  observacoes: 'avisos',
  paisId: 'contactos',
  distritoId: 'contactos',
  concelhoId: 'contactos',
  freguesiaId: 'contactos',
  codigoPostalId: 'contactos',
  ruaId: 'contactos',
  numeroPorta: 'contactos',
  andarRua: 'contactos',
  dataNascimento: 'dados-pessoais',
  numeroSegurancaSocial: 'informacao-sns',
  tipoTaxaModeradora: 'informacao-sns',
  condicaoSns: 'informacao-sns',
  entidadeFinanceiraResponsavelId: 'informacao-sns',
  numeroBeneficiarioEfr: 'informacao-sns',
  dataValidadeEfr: 'informacao-sns',
  centroSaudeId: 'informacao-sns',
  medicoExternoId: 'informacao-sns',
  migrante: 'informacao-sns',
  nDocMigrante: 'informacao-sns',
  migranteTipoCartao: 'informacao-sns',
  aviso: 'avisos',
}

/** Nomes amigáveis para mostrar ao utilizador quais campos estão em falta. */
export const UTENTE_FIELD_LABELS: Record<string, string> = {
  nome: 'Nome',
  email: 'E-mail',
  numeroContribuinte: 'N.º Contribuinte',
  observacoes: 'Observações',
  paisId: 'País',
  distritoId: 'Distrito',
  concelhoId: 'Concelho',
  freguesiaId: 'Freguesia',
  codigoPostalId: 'Código Postal',
  rua: 'Rua',
  ruaId: 'Rua',
  numeroPorta: 'N.º Porta',
  andarRua: 'Andar',
  dataNascimento: 'Data Nascimento',
  numeroSegurancaSocial: 'N.º Segurança Social',
  aviso: 'Avisos',
  provenienciaUtenteId: 'Proveniência do Utente',
  condicaoSns: 'Condição SNS',
  entidadeFinanceiraResponsavelId: 'Entidade Financeira Responsável',
}

