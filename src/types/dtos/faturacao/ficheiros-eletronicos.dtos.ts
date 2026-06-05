export type FicheiroEletronicoRegistoTableDTO = {
    id: string
    documentoId: string
    numeroExibicaoDocumento?: string | null
    sigla: string
    dataGeracao: string 
    dataDocumento?: string | null
}

export type GerarFicheiroEletronicoRequest = {
    documentoId: string
    sigla: string
}

export type GerarFicheiroEletronicoResponse = {
    ficheiroBase64: string
    nome: string
    numeroExibicaoDocumento?: string | null
    dataDocumento?: string | null
    erros: string[]
}

export type FicheiroEletronicoAnexoDTO = {
    nome: string
    conteudoBase64: string
}

export type JuntarFicheirosEletronicosRequest = {
    documentoId: string
    sigla: string
    ficheiros: FicheiroEletronicoAnexoDTO[]
}