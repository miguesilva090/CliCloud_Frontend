import { Module } from '../types'

export const reports: Module = {
  id: '00000003-0000-0000-0000-000000000004',
  name: 'Relatórios',
  permissions: {
    reportsList: {
      id: '00000003-0000-0000-0001-000000000004',
      name: 'Lista de Relatórios',
    },
    reportDesigner: {
      id: '00000003-0000-0000-0002-000000000004',
      name: 'Report Designer',
    },
    reportViewer: {
      id: '00000003-0000-0000-0003-000000000004',
      name: 'Visualização de reports',
    },
  },
}
