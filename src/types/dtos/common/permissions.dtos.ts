export interface PermissionDTO {
  funcionalidadeId: string
  permissao: number
}

export interface DynamicPermissionDTO {
  [key: string]: number
}

export interface PermissaoFuncionalidadeDTO {
  AuthVer: boolean
  AuthAdd: boolean
  AuthChg: boolean
  AuthDel: boolean
  AuthPrt: boolean
}
