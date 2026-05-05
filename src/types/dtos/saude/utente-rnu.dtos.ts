export type ConsultarUtenteRnuRequest = {
    numeroSns?: string | null
    numeroCartao?: string | null
    tipoCartao?: string | null
}

export type EntidadeResponsavelRnuDTO = {
    codigo?: string | null 
    descricao?: string | null
}

export type ConsultarUtenteRnuResponse = {
    codigoMensagem?: string | null
    descricaoMensagem?: string | null

    numeroSns?: string | null
    nomeCompleto?: string | null
    nomesProprios?: string | null
    apelidos?: string | null
    dataNascimento?: string | null
    sexo?: string | null
    paisNacionalidade?: string | null
    obito?: boolean | null
    duplicado?: boolean | null

    entidadesResponsaveis?: EntidadeResponsavelRnuDTO[] 
    rawXml?: string
}