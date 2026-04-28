import type { ReactNode } from 'react'
import { PrintOption } from '@/types/data-table'
import { Filter, ChevronDown } from 'lucide-react'
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
  /** Modo expansível: painel extra (datas, códigos, etc.); combina-se com o campo por nome — seta à direita do input abre/fecha o painel */
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
  /** Conteúdo à direita antes da pesquisa global e dos botões de ação (ex.: data). */
  toolbarEndPrefix?: ReactNode
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
  toolbarEndPrefix,
}: DataTableToolbarProps) {
  return (
    <div className='flex max-w-full flex-nowrap items-center gap-x-3 overflow-x-auto'>
      {/* Esquerda: expansão de pesquisa, filtros clássicos, impressão */}
      <div className='flex min-w-0 shrink-0 items-center gap-2'>
        {!hideToolbarFilters &&
          onGlobalSearchChange == null && (
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
          )}

        {!hideToolbarFilters &&
          expandableSearch &&
          onGlobalSearchChange == null && (
            <Button
              variant='default'
              size='sm'
              className='h-8 bg-primary text-primary-foreground hover:bg-primary/90'
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                onSearchExpandToggle?.()
              }}
              aria-expanded={searchExpanded}
              aria-label={
                searchExpanded
                  ? 'Fechar pesquisa avançada'
                  : 'Abrir pesquisa avançada'
              }
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  searchExpanded && 'rotate-180'
                )}
              />
            </Button>
          )}

        {!hideToolbarFilters && printOptions && (
          <PrintDropdown options={printOptions} />
        )}
      </div>

      {/* Direita: campo «Procurar» + botões — sempre uma linha (scroll horizontal se não couber) */}
      <div className='flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-2 overflow-x-auto'>
        {toolbarEndPrefix ? (
          <div className='flex shrink-0 items-center gap-2'>{toolbarEndPrefix}</div>
        ) : null}
        {!hideToolbarFilters && onGlobalSearchChange != null && (
          expandableSearch ? (
            <div className='relative h-8 w-[10.5rem] shrink-0 sm:w-[13rem]'>
              <Input
                placeholder={globalSearchPlaceholder}
                value={globalSearchValue}
                onChange={(e) => onGlobalSearchChange?.(e.target.value)}
                className='h-8 w-full bg-muted/60 pr-11'
                aria-label={globalSearchPlaceholder}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className={cn(
                  'absolute right-0 top-1/2 z-[1] h-8 w-9 -translate-y-1/2 rounded-l-none border-l border-input',
                  'bg-muted/90 px-0 hover:bg-muted',
                  searchExpanded && 'bg-muted'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onSearchExpandToggle?.()
                }}
                aria-expanded={searchExpanded}
                aria-label={
                  searchExpanded
                    ? 'Fechar pesquisa avançada'
                    : 'Abrir pesquisa avançada'
                }
                title='Pesquisa avançada'
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    searchExpanded && 'rotate-180'
                  )}
                  aria-hidden
                />
              </Button>
            </div>
          ) : (
            <Input
              placeholder={globalSearchPlaceholder}
              value={globalSearchValue}
              onChange={(e) => onGlobalSearchChange?.(e.target.value)}
              className='h-8 w-[10.5rem] shrink-0 bg-muted/60 sm:w-[13rem]'
            />
          )
        )}
        {toolbarActions?.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'default'}
            size='sm'
            disabled={action.disabled}
            className={cn('h-8 shrink-0', action.className)}
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
  )
}
