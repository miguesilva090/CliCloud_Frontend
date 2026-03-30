import { IconKey } from '@/components/ui/icons'

export interface NavItem {
  title?: string
  label: string
  href: string
  icon?: IconKey
  items?: NavItem[]
  description?: string
  disabled?: boolean
  external?: boolean
  openInNewTab?: boolean
  underDevelopment?: boolean
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[]
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[]
}

export type MainNavItem = NavItemWithOptionalChildren
export type SidebarNavItem = NavItemWithChildren
