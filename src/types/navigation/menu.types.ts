import { IconKey } from '@/components/ui/icons'

export interface MenuItem {
  label: string
  href: string
  title?: string
  items?: MenuItem[]
  description?: string
  icon?: IconKey
  color?: string
  dropdown?: MenuItem[]
  secondaryMenu?: MenuItem[]
  funcionalidadeId?: string
  moduloId?: string
  openInNewTab?: boolean
  underDevelopment?: boolean
}

export interface HeaderMenu {
  [key: string]: MenuItem[]
}

export interface RoleHeaderMenus {
  [role: string]: {
    [menu: string]: MenuItem[]
  }
}
