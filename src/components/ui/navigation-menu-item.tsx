import * as React from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/ui/icons'

interface ListItemProps extends React.ComponentPropsWithoutRef<'a'> {
  title: string
  to: string
  /** Mantido na API por compatibilidade; não é mostrado no menu. */
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
      children: _children,
      to,
      icon: _icon,
      dropdownItems,
      keepMenuOpen: _keepMenuOpen,
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
    }

    const handleDropdownItemClick = (
      e: React.MouseEvent<HTMLAnchorElement>,
      href: string,
      openInNewTab?: boolean
    ) => {
      if (openInNewTab) {
        e.preventDefault()
        window.open(`${window.location.origin}${href}`, '_blank', 'noopener,noreferrer')
      }
    }

    const titleRow = (
      <div className='flex w-full items-center justify-between gap-2 text-sm font-medium leading-snug tracking-tight'>
        <span className='min-w-0 truncate'>{title}</span>
        {hasMoreOptions ? (
          <ChevronRight
            className='h-4 w-4 shrink-0 text-muted-foreground/80 transition-transform duration-150 group-hover:translate-x-0.5'
            aria-hidden
          />
        ) : null}
      </div>
    )

    // Item com submenu em dropdown (Radix)
    if (dropdownItems && dropdownItems.length > 0) {
      return (
        <div className='min-w-0'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type='button'
                className={cn(
                  'group block w-full select-none rounded-lg px-3 py-2 text-left leading-none outline-none transition-colors duration-150 hover:bg-accent/90 hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
                  className
                )}
              >
                {titleRow}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='start'
              sideOffset={6}
              className={cn(
                'min-w-[200px] rounded-xl border border-border bg-popover p-1.5',
                'animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-1',
                'shadow-lg shadow-black/[0.08] dark:shadow-black/30'
              )}
            >
              {dropdownItems.map((item, index) => {
                const href = item.href
                return (
                  <DropdownMenuItem key={index} asChild>
                    <Link
                      to={href}
                      className={cn(
                        'flex w-full items-center rounded-md px-3 py-2 text-sm',
                        'transition-colors duration-150 hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-1 focus-visible:ring-offset-popover'
                      )}
                      onClick={(e) => handleDropdownItemClick(e, href, item.openInNewTab)}
                    >
                      <span className='truncate'>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }

    const linkClassName = cn(
      'group block select-none rounded-lg px-3 py-2 leading-none no-underline outline-none transition-colors duration-150',
      'hover:bg-accent/90 hover:text-accent-foreground',
      'focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-1 focus-visible:ring-offset-popover',
      className
    )

    const linkEl = (
      <Link ref={ref} to={to} className={linkClassName} onClick={handleClick} {...props}>
        {titleRow}
      </Link>
    )

    return <div className='min-w-0'>{linkEl}</div>
  }
)
ListItem.displayName = 'ListItem'

export { ListItem }
