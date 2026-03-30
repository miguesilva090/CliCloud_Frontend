export interface ConfiguracaoTratamentosDTO {
  id: string
  clinicaId: string

  tipoSrvTratamentos?: string | null
  areaPrestacaoDefeitoAreaZ?: string | null
  controlarAparelhos?: boolean | null

  segundos?: number | null
  faltasMax?: number | null
  faltasConsecutivasMax?: number | null
  taxamoderadora?: number | null
  credencialExternaAdse?: boolean | null

  tipoPagamento?: number | null
  avisoInqueritoSessoesDiarias?: boolean | null
}

export interface AtualizarConfiguracaoTratamentosRequest {
  tipoSrvTratamentos?: string | null
  areaPrestacaoDefeitoAreaZ?: string | null
  controlarAparelhos?: boolean | null

  segundos?: number | null
  faltasMax?: number | null
  faltasConsecutivasMax?: number | null
  taxamoderadora?: number | null
  credencialExternaAdse?: boolean | null

  tipoPagamento?: number | null
  avisoInqueritoSessoesDiarias?: boolean | null
}

