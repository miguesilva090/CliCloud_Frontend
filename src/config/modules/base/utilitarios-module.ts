import { Module } from '../types'

export const utilitarios: Module = {
  id: '00000002-0000-0000-0000-000000000001',
  name: 'Utilitários',
  permissions: {
    paises: {
      id: '00000002-0000-0000-0001-000000000001',
      name: 'Países',
    },
    distritos: {
      id: '00000002-0000-0000-0002-000000000001',
      name: 'Distritos',
    },
    concelhos: {
      id: '00000002-0000-0000-0003-000000000001',
      name: 'Concelhos',
    },
    freguesias: {
      id: '00000002-0000-0000-0004-000000000001',
      name: 'Freguesias',
    },
    codigospostais: {
      id: '00000002-0000-0000-0005-000000000001',
      name: 'Códigos Postais',
    },
    ruas: {
      id: '00000002-0000-0000-0006-000000000001',
      name: 'Ruas',
    },
  },
}
