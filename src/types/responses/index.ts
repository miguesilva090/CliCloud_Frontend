export interface ResponseApi<T> {
  info: T
  status: number
  statusText: string
}

export interface ResponseLogin {
  token: string
  refreshToken: string
  refreshTokenExpiryTime: string
}

export interface ResponseUser {
  id: string
  imageUrl: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  phoneNumber: string
  roleId: string
  clienteId: string
  perfisUtilizador?: string[]
}
