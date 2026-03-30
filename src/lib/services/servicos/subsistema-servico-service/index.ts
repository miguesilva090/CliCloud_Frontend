import { SubsistemaServicoClient } from './subsistema-servico-client'

export const SubsistemaServicoService = (idFuncionalidade = 'PClinico_Tratamentos') =>
  new SubsistemaServicoClient(idFuncionalidade)
