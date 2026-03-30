import { QuestionarioUtenteClient } from './questionario-utente-client'

export function QuestionarioUtenteService() {
  return new QuestionarioUtenteClient('PClinico_Questionario')
}

