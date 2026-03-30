import { Module } from '../types'

export const areaComum: Module = {
  id: '00000003-0000-0000-0000-000000000003',
  name: 'Área Comum',
  permissions: {
    tabelas: {
      id: '00000003-0000-0000-0001-000000000003',
      name: 'Tabelas',
    },
    utilitarios: {
      id: '00000003-0000-0000-0002-000000000003',
      name: 'Utilitários',
    },
    appSaude: {
      id: '00000003-0000-0000-0003-000000000003',
      name: 'App de Saúde',
    },
    ajuda: {
      id: '00000003-0000-0000-0004-000000000003',
      name: 'Ajuda',
    },
  },
}
