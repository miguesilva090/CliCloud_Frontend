import * as React from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useIconThemeColor } from '@/hooks/use-icon-theme'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/ui/icons'
import { NavigationMenuLink } from '@/components/ui/navigation-menu'
import { isTabelasPath, isProcessoClinicoPath } from '@/utils/window-utils'

interface ListItemProps extends React.ComponentPropsWithoutRef<'a'> {
  title: string
  to: string
  icon?: keyof typeof Icons
  dropdownItems?: {
    label: string
    href: string
    icon?: keyof typeof Icons
    openInNewTab?: boolean
  }[]
  keepMenuOpen?: boolean
  hasMoreOptions?: boolean
}

const ListItem = React.forwardRef<React.ElementRef<'a'>, ListItemProps>(
  (
    {
      className,
      title,
      children,
      to,
      icon,
      dropdownItems,
      keepMenuOpen,
      hasMoreOptions,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (props.onClick) {
        props.onClick(e)
        if (e.defaultPrevented) return
      }
      // Navegação normal via <Link> para listagens.
    }

    const handleDropdownItemClick = (
      e: React.MouseEvent<HTMLAnchorElement>,
      href: string,
      openInNewTab?: boolean,
      _label?: string
    ) => {
      if (openInNewTab) {
        e.preventDefault()
        window.open(`${window.location.origin}${href}`, '_blank', 'noopener,noreferrer')
        return
      }
      // Caso contrário, deixar o <Link> do dropdown navegar normalmente.
    }

    // Case 1: item with inline dropdown submenu
    if (dropdownItems && dropdownItems.length > 0) {
      return (
        <li>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type='button'
                className={cn(
                  'w-full text-left block select-none space-y-1 rounded-md p-3 leading-none outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                  className
                )}
              >
                <div className='flex items-center justify-between w-full text-sm font-medium leading-none'>
                  <div className='flex items-center gap-2'>
                    {icon && Icons[icon] && (
                      <span
                        className={`h-5 w-5 p-0.5 rounded-md flex items-center justify-center ${useIconThemeColor(
                          to
                        )}`}
                      >
                        {React.createElement(
                          Icons[icon] as React.ComponentType<any>,
                          {
                            className: 'h-3 w-3 text-white',
                          }
                        )}
                      </span>
                    )}
                    {title}
                  </div>
                  {hasMoreOptions && (
                    <ChevronRight className='h-4 w-4 text-muted-foreground ml-auto' />
                  )}
                </div>
                <span className='line-clamp-2 text-xs leading-snug text-muted-foreground'>
                  {children}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='start'
              className={cn(
                'min-w-[220px]',
                'p-1',
                'animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-1',
                'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
                'border border-border/50',
                'shadow-lg shadow-black/10'
              )}
            >
              {dropdownItems.map((item, index) => {
                const ItemIcon =
                  item.icon && Icons[item.icon] ? Icons[item.icon] : null

                const href = item.href
                const isTabelas = isTabelasPath(href)
                const itemContent = (
                  <>
                    {ItemIcon && (
                      <span
                        className={`h-4 w-4 p-0.5 rounded-md flex items-center justify-center ${useIconThemeColor(
                          href
                        )}`}
                      >
                        <ItemIcon className='h-2.5 w-2.5 text-white' />
                      </span>
                    )}
                    <span>{item.label}</span>
                  </>
                )
                const itemClassName = cn(
                  'flex items-center gap-2 w-full',
                  'px-3 py-2 text-xs',
                  'transition-all duration-200',
                  'hover:bg-accent/50'
                )
                return (
                  <DropdownMenuItem key={index} asChild>
                    {isTabelas ? (
                      <button
                        type='button'
                        className={itemClassName}
                        onClick={() => {
                          if (item.openInNewTab) {
                            window.open(`${window.location.origin}${href}`, '_blank', 'noopener,noreferrer')
                          } else {
                            window.location.href = window.location.origin + href
                          }
                        }}
                      >
                        {itemContent}
                      </button>
                    ) : (
                      <Link
                        to={href}
                        className={itemClassName}
                        onClick={(e) =>
                          handleDropdownItemClick(e, href, item.openInNewTab, item.label)
                        }
                      >
                        {itemContent}
                      </Link>
                    )}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      )
    }

    // Case 2: regular single-level item
    const linkClassName = cn(
      'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
      className
    )
    const linkContent = (
      <>
        <div className='flex items-center justify-between w-full text-sm font-medium leading-none'>
          <div className='flex items-center gap-2'>
            {icon && Icons[icon] && (
              <span
                className={`h-5 w-5 p-0.5 rounded-md flex items-center justify-center ${useIconThemeColor(to)}`}
              >
                {React.createElement(Icons[icon] as React.ComponentType<any>, {
                  className: 'h-3 w-3 text-white',
                })}
              </span>
            )}
            {title}
          </div>
          {hasMoreOptions && (
            <ChevronRight className='h-4 w-4 text-muted-foreground ml-auto' />
          )}
        </div>
        <span className='line-clamp-2 text-xs leading-snug text-muted-foreground'>
          {children}
        </span>
      </>
    )
    const useHardNav = isTabelasPath(to) || isProcessoClinicoPath(to)
    const linkEl =
      useHardNav ? (
        <button
          type='button'
          ref={ref as React.Ref<HTMLButtonElement>}
          className={linkClassName}
          onClick={(e) => {
            handleClick(e as unknown as React.MouseEvent<HTMLAnchorElement>)
            if (!e.defaultPrevented) {
              window.location.href = window.location.origin + to
            }
          }}
        >
          {linkContent}
        </button>
      ) : (
        <Link
          ref={ref}
          to={to}
          className={linkClassName}
          onClick={handleClick}
          {...props}
        >
          {linkContent}
        </Link>
      )

    return (
      <li>
        {keepMenuOpen ? (
          linkEl
        ) : (
          <NavigationMenuLink asChild>
            {linkEl}
          </NavigationMenuLink>
        )}
      </li>
    )
  }
)
ListItem.displayName = 'ListItem'

export { ListItem }
