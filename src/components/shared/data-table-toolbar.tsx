import { PrintOption } from '@/types/data-table'
import { Filter, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableAction } from '@/components/shared/data-table-types'
import { PrintDropdown } from './print-dropdown'

interface DataTableToolbarProps {
  onFilterClick: () => void
  activeFiltersCount: number
  printOptions?: PrintOption[]
  toolbarActions?: DataTableAction[]
  /** Modo expansível: botão "Pesquisa" que ao clicar mostra painel por datas/código; o campo de nome fica sempre visível ao lado */
  expandableSearch?: boolean
  searchExpanded?: boolean
  onSearchExpandToggle?: () => void
  /** Valor do campo "Procurar por nome" (sempre visível quando expandableSearch); pesquisa ao digitar */
  globalSearchValue?: string
  onGlobalSearchChange?: (value: string) => void
  /** Placeholder do campo de pesquisa por nome (ex.: "Procurar por nome utente...") */
  globalSearchPlaceholder?: string
  /** Esconder Filtros/Pesquisa (ex.: Consultas Marcadas – filtro só por calendário) */
  hideToolbarFilters?: boolean
}

export function DataTableToolbar({
  onFilterClick,
  activeFiltersCount,
  printOptions,
  toolbarActions,
  expandableSearch = false,
  searchExpanded = false,
  onSearchExpandToggle,
  globalSearchValue = '',
  onGlobalSearchChange,
  globalSearchPlaceholder = 'Procurar por nome utente...',
  hideToolbarFilters = false,
}: DataTableToolbarProps) {
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between gap-4'>
        {/* Left side – omitir quando hideToolbarFilters (ex.: calendário à parte) */}
        <div className='flex items-center gap-2 flex-wrap'>
          {!hideToolbarFilters && (onGlobalSearchChange != null ? (
            <>
              {expandableSearch && (
                <Button
                  variant='default'
                  size='sm'
                  className='h-8 bg-primary text-primary-foreground hover:bg-primary/90'
                  onClick={(e) => {
                    e.stopPropagation()
                    onSearchExpandToggle?.()
                  }}
                >
                  <Search className='h-4 w-4 sm:mr-2' />
                  <span className='hidden sm:inline-block'>Pesquisa</span>
                  {searchExpanded ? (
                    <ChevronUp className='h-4 w-4 ml-1' />
                  ) : (
                    <ChevronDown className='h-4 w-4 ml-1' />
                  )}
                </Button>
              )}
              {/* Caixa de pesquisa por nome */}
              <Input
                placeholder={globalSearchPlaceholder}
                value={globalSearchValue}
                onChange={(e) => onGlobalSearchChange?.(e.target.value)}
                className='h-8 w-[180px] sm:w-[240px] bg-muted/60'
              />
            </>
          ) : (
            <Button
              variant='outline'
              size='sm'
              className='h-8 border-dashed'
              onClick={(e) => {
                e.stopPropagation()
                onFilterClick()
              }}
            >
              <Filter className='h-4 w-4 sm:mr-2' />
              <span className='hidden sm:inline-block'>
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge
                    variant='secondary'
                    className='ml-2 bg-primary/20 text-primary'
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </span>
              {activeFiltersCount > 0 && (
                <Badge
                  variant='secondary'
                  className='ml-1 bg-primary/20 text-primary sm:hidden'
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          ))}

          {!hideToolbarFilters && printOptions && <PrintDropdown options={printOptions} />}
        </div>

      {/* Right side */}
      <div className='flex items-center gap-2'>
        {toolbarActions?.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'default'}
            size='sm'
            disabled={action.disabled}
            className={cn('h-8', action.className)}
            onClick={(e) => {
              e.stopPropagation()
              action.onClick()
            }}
          >
            {action.icon && (
              <span
                className={cn('h-4 w-4', action.showOnlyIcon ? '' : 'sm:mr-2')}
              >
                {action.icon}
              </span>
            )}
            {!action.showOnlyIcon && (
              <span className='hidden sm:inline-block'>{action.label}</span>
            )}
          </Button>
        ))}
      </div>
      </div>
    </div>
  )
}
