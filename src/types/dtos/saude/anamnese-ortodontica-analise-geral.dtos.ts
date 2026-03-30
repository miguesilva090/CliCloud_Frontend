export interface AnamneseOrtodonticaAnaliseGeralDTO {
    id: string 
    utenteId: string

    simetriaFacial: string | null
    desenvolvimentoMaxila: string | null
    desenvolvimentoMandibula: string | null
    perfilFacial: string | null
    alturaFacialInferior: string | null
    tipoFacial: number | null
    caracteristicasLabios: string | null
    relacaoLabioDenteSuperior: string | null
    relacaoLabioDenteInferior: string | null
    freioLingual: string | null
    formaNariz: string | null
    tecidosMolesIntrabucais: string | null
    distanciaIntercomissuralNasal: number | null
    distanciaIntercomissuralPupilar: number | null
    adenoides: number | null
    amigdalas: number | null
}

export interface CreateAnamneseOrtodonticaAnaliseGeralRequest {
    utenteId: string

    simetriaFacial: string | null
    desenvolvimentoMaxila: string | null
    desenvolvimentoMandibula: string | null
    perfilFacial: string | null
    alturaFacialInferior: string | null
    tipoFacial: number | null
    caracteristicasLabios: string | null
    relacaoLabioDenteSuperior: string | null
    relacaoLabioDenteInferior: string | null
    freioLingual: string | null
    formaNariz: string | null
    tecidosMolesIntrabucais: string | null
    distanciaIntercomissuralNasal: number | null
    distanciaIntercomissuralPupilar: number | null
    adenoides: number | null
    amigdalas: number | null
}

export interface UpdateAnamneseOrtodonticaAnaliseGeralRequest {
    utenteId: string

    simetriaFacial: string | null
    desenvolvimentoMaxila: string | null
    desenvolvimentoMandibula: string | null
    perfilFacial: string | null
    alturaFacialInferior: string | null
    tipoFacial: number | null
    caracteristicasLabios: string | null
    relacaoLabioDenteSuperior: string | null
    relacaoLabioDenteInferior: string | null
    freioLingual: string | null
    formaNariz: string | null
    tecidosMolesIntrabucais: string | null
    distanciaIntercomissuralNasal: number | null
    distanciaIntercomissuralPupilar: number | null
    adenoides: number | null
    amigdalas: number | null
}