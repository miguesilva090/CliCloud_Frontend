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

export type ConfiguracaoSmsAutomaticaDTO = {
    id: string
    clinicaId: string
    codigo: string
    descricao: string
    ativo: number
    diasantecedencia: number
    textomensagem: string
    todosMedicos: boolean
}

export type AtualizarConfiguracaoAutomaticaRequest = {
    codigo: string
    ativo: number
    descricao: string
    diasantecedencia: number
    textomensagem: string
}

export type GuardarTodosMedicosSmsRequest = {
    codigoConfiguracao?: string
    todosMedicos: boolean
}

export type GuardarMedicosSmsRequest = {
    codigoConfiguracao?: string
    codigosMedicos: string[]
}

export type HistoricoSmsTabelaDTO = {
    id: string
    clinicaId: string
    idMensagem: string
    textoMensagem: string
    numeroDestinatario: string
    status: string
    mensagemErro?: string | null
    dataHoraCriacao: string
    dataHoraEnvio?: string | null
    modulo: string
    codigoUtente?: number | null
    codigoMedico?: string | null
    codigoFisioterapeuta?: number | null
    codigoConsulta?: number | null
    codigoTratamento?: number | null
    codigoAula?: number | null
}

export type HistoricoSmsTabelaFiltro = {
    pageNumber: number
    pageSize: number
    filters: Array<{ id: string; value: string }>
}