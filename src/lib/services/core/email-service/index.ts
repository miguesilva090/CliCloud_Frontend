import { EmailClient } from './email-client'

export const EmailService = (idFuncionalidade = '') => new EmailClient(idFuncionalidade)
