export interface Permission {
  id: string
  name: string
}

export interface Module {
  id: string
  name: string
  permissions: Record<string, Permission>
}

export interface Modules {
  utilitarios: Module
  reports: Module
  areaClinica: Module
  areaComum: Module
}
