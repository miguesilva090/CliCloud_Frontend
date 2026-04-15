import { ConsentimentoClient } from './consentimento-client'

const ID_FUNCIONALIDADE = "documentos"

export function ConsentimentoService()
{
    return new ConsentimentoClient(ID_FUNCIONALIDADE)
}