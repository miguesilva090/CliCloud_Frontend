import type { MedicoEditFormValues } from '../medico-edit-form-types'

/** Ordem dos campos obrigatórios (alinhado ao backend: Nome, TipoEntidadeId). */
export const MEDICO_FORM_FIELD_ORDER: (keyof MedicoEditFormValues)[] = [
  'nome',
  'numeroContribuinte',
]

/** Mapa campo (camelCase) → label amigável para mostrar no toast de validação */
export const MEDICO_FIELD_LABELS: Partial<Record<keyof MedicoEditFormValues, string>> =
  {
    nome: 'Nome',
    numeroContribuinte: 'N.º de Contribuinte',
    numeroCartaoIdentificacao: 'N.º Cartão de Identificação',
    arquivo: 'Arquivo',
    nomeUtilizador: 'Nome Utilizador',
    sexoId: 'Sexo',
    estadoCivilId: 'Estado Civil',
    dataNascimento: 'Data Nascimento',
    dataEmissaoCartaoIdentificacao: 'Data Emissão',
    dataValidadeCartaoIdentificacao: 'Data Validade',
    naturalidade: 'Naturalidade',
    nacionalidade: 'Nacionalidade',
    email: 'Email',
    telefone: 'Telefone',
    telemovel: 'Telemóvel',
    especialidadeId: 'Especialidade',
  }

export const MEDICO_FIELD_TO_TAB: Record<string, string> = {
  nome: 'dados-pessoais',
  email: 'contactos',
  numeroContribuinte: 'dados-pessoais',
  arquivo: 'dados-pessoais',
  nomeUtilizador: 'dados-pessoais',
  sexoId: 'dados-pessoais',
  estadoCivilId: 'dados-pessoais',
  dataNascimento: 'dados-pessoais',
  dataEmissaoCartaoIdentificacao: 'dados-pessoais',
  dataValidadeCartaoIdentificacao: 'dados-pessoais',
  especialidadeId: 'dados-profissionais',
  status: 'dados-pessoais',
  paisId: 'contactos',
  distritoId: 'contactos',
  concelhoId: 'contactos',
  freguesiaId: 'contactos',
  codigoPostalId: 'contactos',
  ruaId: 'contactos',
  numeroPorta: 'contactos',
  andarRua: 'contactos',
  entidadeContactos: 'contactos',
}

