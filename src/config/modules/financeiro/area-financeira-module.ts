import { Module } from '../types'

export const areaFinanceira: Module = {
  id: '00000002-0000-0000-0000-000000000005',
  name: 'Área Financeira',
  permissions: {
    faturacao: {
      id: '00000002-0000-0000-0001-000000000005',
      name: 'Faturação',
    },
    contasCorrentes: {
      id: '00000002-0000-0000-0002-000000000005',
      name: 'Contas Correntes',
    },
    tesouraria: {
      id: '00000002-0000-0000-0003-000000000005',
      name: 'Tesouraria',
    },
    configuracoes: {
      id: '00000002-0000-0000-0004-000000000005',
      name: 'Configurações',
    },
    ficheirosEletronicos: {
      id: '00000002-0000-0000-0005-000000000005',
      name: 'Ficheiros Eletrónicos',
    },
    credenciaisSns: {
      id: '00000002-0000-0000-0006-000000000005',
      name: 'Credenciais S.N.S.',
    },
    adse: {
      id: '00000002-0000-0000-0007-000000000005',
      name: 'ADSE',
    },
    mapas: {
      id: '00000002-0000-0000-0008-000000000005',
      name: 'Mapas',
    },
    entidades: {
      id: '00000002-0000-0000-0009-000000000005',
      name: 'Entidades',
    },
    tabelas: {
      id: '00000002-0000-0000-0010-000000000005',
      name: 'Tabelas',
    },
    emails: {
      id: '00000002-0000-0000-0011-000000000005',
      name: 'Emails',
    },
    referenciasMultibanco: {
      id: '00000002-0000-0000-0012-000000000005',
      name: 'Referências Multibanco',
    },
  },
}
