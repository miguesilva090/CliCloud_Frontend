import { AvaliacaoAntropometricaClient } from './avaliacao-antropometrica-client'

export const AvaliacaoAntropometricaService = (idFuncionalidade = 'PClinico_SinaisVitais') =>
  new AvaliacaoAntropometricaClient(idFuncionalidade)
