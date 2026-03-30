export type ConfiguracaoSmsDTO = {
    id: string 
    clinicaId: string
    ativo: boolean
    usenditArpoone: number
    arpooneUrl?: string | null
    arpooneSender?: string | null
    arpooneApiKey?: string | null
    arpooneOrganizationID?: string | null
}

export type AtualizarConfiguracaoSmsRequest = {
    ativo: boolean
    usenditArpoone: number
    arpooneUrl?: string | null
    arpooneSender?: string | null
    arpooneApiKey?: string | null
    arpooneOrganizationID?: string | null
}

export type EnviarSmsTesteRequest = {
    numeroDestinatario: string
    textoMensagem: string
    modulo?: string | null
}