export interface AnamneseOrtodonticaAnaliseFuncionalDTO {
    id: string 
    utenteId: string

    labioSuperior: string | null
    labioSuperiorTonicidade: string | null
    labioInferior: string | null
    labioInferiorTonicidade: string | null
    aspetoLabioSuperiorInferior: string | null
    linguaAspeto: string | null
    linguaTonicidade: string | null
    linguaPosicionamento: string | null
    musculaturaFacial: string | null
    musculaturaMentoniana: string | null
    tipoRespiracao: string | null
    forracao: string | null
    mastigacao: string | null
    musculosMastigatorios: string | null
    comentariosAdicionais: string | null
}

export interface CreateAnamneseOrtodonticaAnaliseFuncionalRequest {
    utenteId: string

    labioSuperior: string | null
    labioSuperiorTonicidade: string | null
    labioInferior: string | null
    labioInferiorTonicidade: string | null
    aspetoLabioSuperiorInferior: string | null
    linguaAspeto: string | null
    linguaTonicidade: string | null
    linguaPosicionamento: string | null
    musculaturaFacial: string | null
    musculaturaMentoniana: string | null
    tipoRespiracao: string | null
    forracao: string | null
    mastigacao: string | null
    musculosMastigatorios: string | null
    comentariosAdicionais: string | null
}

export interface UpdateAnamneseOrtodonticaAnaliseFuncionalRequest {
    utenteId: string

    labioSuperior: string | null
    labioSuperiorTonicidade: string | null
    labioInferior: string | null
    labioInferiorTonicidade: string | null
    aspetoLabioSuperiorInferior: string | null
    linguaAspeto: string | null
    linguaTonicidade: string | null
    linguaPosicionamento: string | null
    musculaturaFacial: string | null
    musculaturaMentoniana: string | null
    tipoRespiracao: string | null
    forracao: string | null
    mastigacao: string | null
    musculosMastigatorios: string | null
    comentariosAdicionais: string | null
}