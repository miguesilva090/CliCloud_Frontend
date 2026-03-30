import { Module } from '../types'

export const areaClinica: Module = {
  id: '00000003-0000-0000-0000-000000000002',
  name: 'Área Clinica',
  permissions: {
    processoClinico: {
      id: '00000003-0000-0000-0001-000000000002',
      name: 'Processo Clinico',
    },
    prescricaoEletronica: {
      id: '00000003-0000-0000-0002-000000000002',
      name: 'Prescrição Eletronica',
    },
    prescricaoMcdts: {
      id: '00000003-0000-0000-0003-000000000002',
      name: 'Prescrição MCDTs',
    },
    enfermagem: {
      id: '00000003-0000-0000-0004-000000000002',
      name: 'Enfermagem',
    },
  },
}
