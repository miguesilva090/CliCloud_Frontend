export type ConfigWebServiceDTO = {
  id: string
  clinicaId: string
  urlRnu?: string | null
  urlAcss?: string | null
  loginAcss?: string | null
  passwordAcss?: string | null
  usarProxy: boolean
  userProxy?: string | null
  passwordProxy?: string | null
  dominioProxy?: string | null
  urlAcssRsp?: string | null
  loginAcssRsp?: string | null
  passwordAcssRsp?: string | null
  usarProxyRsp: boolean
  userProxyRsp?: string | null
  passwordProxyRsp?: string | null
  dominioProxyRsp?: string | null
  proxyAutenticacao?: string | null
  tokenAutenticacao?: string | null
  loginAutenticacao?: string | null
  passwordAutenticacao?: string | null
  versaoPrescricao: number
}

export type AtualizarConfigWebServiceRequest = {
  urlRnu?: string | null
  urlAcss?: string | null
  loginAcss?: string | null
  passwordAcss?: string | null
  usarProxy: boolean
  userProxy?: string | null
  passwordProxy?: string | null
  dominioProxy?: string | null
  urlAcssRsp?: string | null
  loginAcssRsp?: string | null
  passwordAcssRsp?: string | null
  usarProxyRsp: boolean
  userProxyRsp?: string | null
  passwordProxyRsp?: string | null
  dominioProxyRsp?: string | null
  proxyAutenticacao?: string | null
  tokenAutenticacao?: string | null
  loginAutenticacao?: string | null
  passwordAutenticacao?: string | null
  versaoPrescricao: number
}

export type ObterTokenCredRequest = {
  medicoId: string
  passwordPrvr: string
}

export type ObterTokenAssinadoRequest = {
  medicoId: string
  digestValue: string
  signatureValue: string
  assinatura: string
  assinaturaSubCa: string
}

export type ProxyTokenResultDTO = {
  codigo?: string | null
  descricao?: string | null
  token?: string | null
}

export type ConsultaUtenteRequest = {
  codigoOperacao: string
  enviadoEmUtc?: string | null
  ativadoEmUtc?: string | null
  chavePedido?: string | null
  chavePedidoRelacionado?: string | null
  corpoXml: string
}

export type RegistoPrescricaoRequest = {
  codigoOperacao: string
  enviadoEmUtc?: string | null
  ativadoEmUtc?: string | null
  chavePedido?: string | null
  chavePedidoRelacionado?: string | null
  corpoXml: string
}

export type RegistoPrescricaoRspRequest = {
  codigoOperacao: string
  enviadoEmUtc?: string | null
  ativadoEmUtc?: string | null
  chavePedido?: string | null
  chavePedidoRelacionado?: string | null
  corpoXml: string
}

export type SpmsSoapOperationResultDTO = {
  codigo?: string | null
  descricao?: string | null
  token?: string | null
  rawXml: string
}
