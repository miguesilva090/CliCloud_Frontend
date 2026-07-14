import { EmailClient } from './email-client'

export const EmailService = (idFuncionalidade = '') => new EmailClient(idFuncionalidade)
export * from './email-errors'
export * from './email-client'
