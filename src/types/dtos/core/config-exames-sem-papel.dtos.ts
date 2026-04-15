export type ConfigExamesSemPapelDTO = {
    id: string
    clinicaId: string
    codigoEntidade?: number | null
    username?: string | null
    password?: string | null 

    pesquisaPrestacao?: string | null 
    agendamento?: string | null 
    efetivacao?: string | null 
    anulacao?: string | null 
    consultaCancelados?: string | null
    efetuadosNaoPrescritos?: string | null
    taxasModeradoras?: string | null 

    relatorioResultados?: string | null 
    usernamePartilhaResultados?: string | null 
    passwordPartilhaResultados?: string | null

    relatorioResultadosSemRequisicao?: string | null
    usernamePartilhaResultadosSemRequisicao?: string | null
    passwordPartilhaResultadosSemRequisicao?: string | null 

    areaPrestacao?: string | null
}

export type AtualizarConfigExamesSemPapelRequest = {
    codigoEntidade?: number | null
    username?: string | null
    password?: string | null

    pesquisaPrestacao?: string | null
    agendamento?: string | null
    efetivacao?: string | null
    anulacao?: string | null 
    consultaCancelados?: string | null
    efetuadosNaoPrescritos?: string | null
    taxasModeradoras?: string | null 

    relatorioResultados?: string | null 
    usernamePartilhaResultados?: string | null
    passwordPartilhaResultados?: string | null 

    relatorioResultadosSemRequisicao?: string | null
    usernamePartilhaResultadosSemRequisicao?: string | null 
    passwordPartilhaResultadosSemRequisicao?: string | null 

    areaPrestacao?: string | null 
}