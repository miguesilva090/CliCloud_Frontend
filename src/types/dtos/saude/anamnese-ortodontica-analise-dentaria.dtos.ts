export interface AnamneseOrtodonticaAnaliseDentariaDTO {
  id: string
  utenteId: string

  tipoDentadura: number | null
  anomalia: string | null
  relacaoMolar: number | null
  subDivisaoMolar: number | null
  relacaoCanino: number | null
  subDivisaoCanino: number | null
  relacaoMolar2: number | null
  linhaMedianaSuperior: string | null
  linhaMedianaInferior: string | null
  linhaMedianaDente: string | null
  mordidaCruzada: string | null
  mordidaAberta: string | null
  trespasseVertical: string | null
  trespasseHorizontal: string | null
  curvaSpee: string | null
  caracArcoDentarioMaxila: number | null
  caracArcoDentarioMandibula: number | null
  caracPalato: number | null
  obs: string | null
}

export interface CreateAnamneseOrtodonticaAnaliseDentariaRequest {
  utenteId: string

  tipoDentadura: number | null
  anomalia: string | null
  relacaoMolar: number | null
  subDivisaoMolar: number | null
  relacaoCanino: number | null
  subDivisaoCanino: number | null
  relacaoMolar2: number | null
  linhaMedianaSuperior: string | null
  linhaMedianaInferior: string | null
  linhaMedianaDente: string | null
  mordidaCruzada: string | null
  mordidaAberta: string | null
  trespasseVertical: string | null
  trespasseHorizontal: string | null
  curvaSpee: string | null
  caracArcoDentarioMaxila: number | null
  caracArcoDentarioMandibula: number | null
  caracPalato: number | null
  obs: string | null
}

export interface UpdateAnamneseOrtodonticaAnaliseDentariaRequest {
  utenteId: string

  tipoDentadura: number | null
  anomalia: string | null
  relacaoMolar: number | null
  subDivisaoMolar: number | null
  relacaoCanino: number | null
  subDivisaoCanino: number | null
  relacaoMolar2: number | null
  linhaMedianaSuperior: string | null
  linhaMedianaInferior: string | null
  linhaMedianaDente: string | null
  mordidaCruzada: string | null
  mordidaAberta: string | null
  trespasseVertical: string | null
  trespasseHorizontal: string | null
  curvaSpee: string | null
  caracArcoDentarioMaxila: number | null
  caracArcoDentarioMandibula: number | null
  caracPalato: number | null
  obs: string | null
}

