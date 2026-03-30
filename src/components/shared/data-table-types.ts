import { ColumnDef } from '@tanstack/react-table'

export type DataTableFilterField<TData> = {
  label: string
  value: keyof TData | string
  order?: number
  type?: 'boolean'
}

export type DataTableColumnDef<TData> = ColumnDef<TData, any> & {
  sortKey?: string
  meta?: {
    align?: 'left' | 'center' | 'right'
    hidden?: boolean
    width?: string
  }
}

export type DataTableAction = {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'emerald'
  disabled?: boolean
  showOnlyIcon?: boolean
  className?: string
}
