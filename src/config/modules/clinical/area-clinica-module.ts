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
    atendimentoAoUtente: {
      id: '00000002-0000-0000-0005-000000000002',
      name: 'Atendimento ao Utente',
    },
    consultasDoDia: {
      id: '00000002-0000-0000-0006-000000000002',
      name: 'Consultas do Dia',
    },
    fichaClinica: {
      id: '00000002-0000-0000-0007-000000000002',
      name: 'Ficha Clínica',
    },
    agenda: {
      id: '00000002-0000-0000-0008-000000000002',
      name: 'Agenda',
    },
    consultasMarcadas: {
      id: '00000002-0000-0000-0009-000000000002',
      name: 'Consultas Marcadas',
    },
    listagemConsultasMarcadas: {
      id: '00000002-0000-0000-0010-000000000002',
      name: 'Listagem Consultas Marcadas',
    },
    mapaConsultasMarcadas: {
      id: '00000002-0000-0000-0011-000000000002',
      name: 'Mapa Consultas Marcadas',
    },
    examesSemPapel: {
      id: '00000002-0000-0000-0012-000000000002',
      name: 'Exames Sem Papel - Header',
    },
    examesSemPapelSubmenu: {
      id: '00000002-0000-0000-0013-000000000002',
      name: 'Exames Sem Papel - Submenu',
    },
    atestadosCartaConducao: {
      id : '00000002-0000-0000-0014-000000000002',
      name : 'Atestados Carta Condução',
    },
    listagemAtestadosCartaConducao: {
      id : '00000002-0000-0000-0015-000000000002',
      name : 'Listagem Atestados Carta Condução',
    },
    historico: {
      id : '00000002-0000-0000-0016-000000000002',
      name : 'Histórico',
    },
    consultasEfetuadas: {
      id : '00000002-0000-0000-0017-000000000002',
      name : 'Consultas Efetuadas',
    },
    listagemConsultasEfetuadas: {
      id : '00000002-0000-0000-0018-000000000002',
      name : 'Listagem Consultas Efetuadas',
    },
    mapaConsultasEfetuadas: {
      id : '00000002-0000-0000-0019-000000000002',
      name : 'Mapa Consultas Efetuadas',
    },
    tabelas: {
      id : '00000002-0000-0000-0020-000000000002',
      name : 'Tabelas',
    },
    medicamentoseTerapeuticas: {
      id : '00000002-0000-0000-0021-000000000002',
      name : 'Medicamentos e Terapêuticas',
    },
    medicamentos: {
      id : '00000002-0000-0000-0022-000000000002',
      name : 'Medicamentos',
    },
    outrosMedicamentos: {
      id : '00000002-0000-0000-0023-000000000002',
      name : 'Outros Medicamentos',
    },
    alergias: {
      id : '00000002-0000-0000-0024-000000000002',
      name : 'Alergias',
    },
    profissionaiseHistorialClinico: {
      id : '00000002-0000-0000-0025-000000000002',
      name : 'Profissionais e Histórico Clínico',
    },
    medicos: {
      id : '00000002-0000-0000-0026-000000000002',
      name : 'Médicos',
    },
    patologias: {
      id : '00000002-0000-0000-0027-000000000002',
      name : 'Patologias',
    },
    historiaClinica: {
      id : '00000002-0000-0000-0028-000000000002',
      name : 'História Clínica',
    },
    outros: {
      id : '00000002-0000-0000-0029-000000000002',
      name : 'Outros',
    },
    mapasBodyChart: {
      id : '00000002-0000-0000-0030-000000000002',
      name : 'Mapas Body Chart',
    },
    estadosDentarios: {
      id : '00000002-0000-0000-0031-000000000002',
      name : 'Estados Dentários',
    },
    feriados: {
      id : '00000002-0000-0000-0032-000000000002',
      name : 'Feriados',
    },
    novoAtestado: {
      id : '00000002-0000-0000-0033-000000000002',
      name : 'Novo Atestado',
    },
  },
}
