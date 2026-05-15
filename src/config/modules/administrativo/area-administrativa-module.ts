import { Module } from '../types'

export const areaAdministrativa: Module = {
  id: '00000002-0000-0000-0000-000000000004',
  name: 'Área Administrativa',
  permissions: {
    consultas: {
      id: '00000002-0000-0000-0089-000000000004',
      name: 'Consultas',
    },
    tabelas: {
      id: '00000002-0000-0000-0090-000000000004',
      name: 'Tabelas',
    },
    salas: {
      id: '00000002-0000-0000-0091-000000000004',
      name: 'Salas',
    },
    tiposCarta: {
      id: '00000002-0000-0000-0092-000000000004',
      name: 'Tipos de Carta',
    },
    tiposConsulta: {
      id: '00000002-0000-0000-0093-000000000004',
      name: 'Tipos de Consulta',
    },
    motivosConsulta: {
      id: '00000002-0000-0000-0094-000000000004',
      name: 'Motivos de Consulta',
    },
    sinistrados: {
      id: '00000002-0000-0000-0095-000000000004',
      name: 'Sinistrados',
    },
    registoSinistrados: {
      id: '00000002-0000-0000-0096-000000000004',
      name: 'Registo de Sinistrados',
    },
    servicos: {
        id: '00000002-0000-0000-0097-000000000004',
        name: 'Serviços',
    },
    subsistemaServicos: {
        id: '00000002-0000-0000-0098-000000000004',
        name: 'Subsistemas de Serviços',
    },
    doencas: {
        id: '00000002-0000-0000-0099-000000000004',
        name: 'Doenças',
    },
    margemMedicos: {
        id: '00000002-0000-0000-0100-000000000004',
        name: 'Margem de Médicos',
    },
    prioridades: {
        id: '00000002-0000-0000-0101-000000000004',
        name: 'Prioridades',
    },
    entidades: {
        id: '00000002-0000-0000-0102-000000000004',
        name: 'Entidades',
    },
    medicos: {
        id: '00000002-0000-0000-0103-000000000004',
        name: 'Médicos',
    },
    fornecedores: {
        id: '00000002-0000-0000-0104-000000000004',
        name: 'Fornecedores',
    },
    funcionarios: {
        id: '00000002-0000-0000-0105-000000000004',
        name: 'Funcionarios',
    },
    admissoes: {
      id: '00000002-0000-0000-0106-000000000004',
      name: 'Admissões',
    },
    fechoDiario: {
      id: '00000002-0000-0000-0107-000000000004',
      name: 'Fecho Diário',
    },
  },
}
