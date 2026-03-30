export interface AnamneseOrtodonticaATMDTO {
  id: string
  utenteId: string
  palpacao: string | null
  relacaoCentrica: string | null
  lateralidadeEsquerda: string | null
  lateralidadeDireita: string | null
  protrusao: string | null
  musculosMastigatorios: string | null
  musculosInfra: string | null
  musculosSupra: string | null
  obs: string | null
  apertaOuRangeDentes: boolean | null
  musculosMandibulaDoridosAoAcordar: boolean | null
  dorMandibulaOuvido: boolean | null
  naoPodeAbrirFecharBoca: boolean | null
  dentesSensiveisDesgastados: boolean | null
  sofreuAlgumTraumatismo: boolean | null
  senteBarulhoZumbido: boolean | null
  createdOn: string
}

export interface CreateAnamneseOrtodonticaATMRequest {
  utenteId: string
  palpacao: string | null
  relacaoCentrica: string | null
  lateralidadeEsquerda: string | null
  lateralidadeDireita: string | null
  protrusao: string | null
  musculosMastigatorios: string | null
  musculosInfra: string | null
  musculosSupra: string | null
  obs: string | null
  apertaOuRangeDentes: boolean | null
  musculosMandibulaDoridosAoAcordar: boolean | null
  dorMandibulaOuvido: boolean | null
  naoPodeAbrirFecharBoca: boolean | null
  dentesSensiveisDesgastados: boolean | null
  sofreuAlgumTraumatismo: boolean | null
  senteBarulhoZumbido: boolean | null
}

export interface UpdateAnamneseOrtodonticaATMRequest {
  utenteId: string
  palpacao: string | null
  relacaoCentrica: string | null
  lateralidadeEsquerda: string | null
  lateralidadeDireita: string | null
  protrusao: string | null
  musculosMastigatorios: string | null
  musculosInfra: string | null
  musculosSupra: string | null
  obs: string | null
  apertaOuRangeDentes: boolean | null
  musculosMandibulaDoridosAoAcordar: boolean | null
  dorMandibulaOuvido: boolean | null
  naoPodeAbrirFecharBoca: boolean | null
  dentesSensiveisDesgastados: boolean | null
  sofreuAlgumTraumatismo: boolean | null
  senteBarulhoZumbido: boolean | null
}

