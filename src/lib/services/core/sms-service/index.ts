import { SmsClient } from './sms-client'
export const SmsService = (idFuncionalidade = '') => new SmsClient(idFuncionalidade)