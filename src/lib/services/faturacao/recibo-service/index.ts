import { ReciboClient } from '@/lib/services/faturacao/recibo-service/recibo-client'

export const ReciboService = (idFuncionalidade = '') => 
    new ReciboClient(idFuncionalidade)