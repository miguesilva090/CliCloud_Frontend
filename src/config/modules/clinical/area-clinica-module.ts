import { Module } from '../types'

export const areaClinica: Module = {
  id: '00000002-0000-0000-0000-000000000002',
  name: 'Área Clinica',
  permissions: {
    processoClinico: {
      id: '00000002-0000-0000-0001-000000000002',
      name: 'Processo Clinico',
    },
    prescricaoEletronica: {
      id: '00000002-0000-0000-0002-000000000002',
      name: 'Prescrição Eletronica',
    },
    prescricaoMcdts: {
      id: '00000002-0000-0000-0003-000000000002',
      name: 'Prescrição MCDTs',
    },
    enfermagem: {
      id: '00000002-0000-0000-0004-000000000002',
      name: 'Enfermagem',
    },
    /** Secções do processo clínico (controlo fino por licença/perfil; padrão semelhante à Área Comum). */
    processoAtendimento: {
      id: '00000002-0000-0000-0005-000000000002',
      name: 'Processo clínico — Atendimento',
    },
    processoAgenda: {
      id: '00000002-0000-0000-0006-000000000002',
      name: 'Processo clínico — Agenda',
    },
    processoExames: {
      id: '00000002-0000-0000-0007-000000000002',
      name: 'Processo clínico — Exames',
    },
    processoAtestados: {
      id: '00000002-0000-0000-0008-000000000002',
      name: 'Processo clínico — Atestados',
    },
    processoHistorico: {
      id: '00000002-0000-0000-0009-000000000002',
      name: 'Processo clínico — Histórico',
    },
    processoTabelas: {
      id: '00000002-0000-0000-0010-000000000002',
      name: 'Processo clínico — Tabelas',
    },
  },
}
