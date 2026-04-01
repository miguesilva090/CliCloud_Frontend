export type ConfiguracaoChamadaVozDTO = {
  id: string
  clinicaId: string
  ativo: boolean
  url?: string | null
  language?: string | null
  tld?: string | null
}

export type AtualizarConfiguracaoChamadaVozRequest = {
  ativo: boolean
  url?: string | null
  language?: string | null
  tld?: string | null
}

export type ConfiguracaoChamadaVozOpcaoDTO = {
  tipo: string
  codigo: string
  descricao: string
  ordem: number
}

export type ConfiguracaoChamadaVozOpcoesDTO = {
  idiomas: ConfiguracaoChamadaVozOpcaoDTO[]
  variacoes: ConfiguracaoChamadaVozOpcaoDTO[]
}
