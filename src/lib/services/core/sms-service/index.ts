import { SmsClient } from './sms-client'
export const SmsService = (idFuncionalidade = '') => new SmsClient(idFuncionalidade)
export * from './sms-errors'
export * from './sms-client'
