import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { useNavigationHistoryStore } from '@/stores/use-navigation-history-store'
import { getWindowMetadata } from '@/utils/window-utils'
import { useIconThemeColor } from '@/hooks/use-icon-theme'
import { Card } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'

interface RecentPagesGridProps {
  className?: string
  maxPages?: number
  title?: string
}

export function RecentPagesGrid({
  className = '',
  maxPages = 12,
  title = 'Páginas Recentes',
}: RecentPagesGridProps) {
  const navigate = useNavigate()
  const { getRecentPages, clearHistory } = useNavigationHistoryStore()

  const recentPages = getRecentPages(maxPages)

  const handlePageClick = (page: (typeof recentPages)[0]) => {
    let url = page.path
    const searchParams = new URLSearchParams()

    if (page.searchParams) {
      Object.entries(page.searchParams).forEach(([key, value]) => {
        searchParams.set(key, value)
      })
    }

    if (page.instanceId) {
      searchParams.set('instanceId', page.instanceId)
    }

    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`
    }

    navigate(url)
  }

  const formatTimestamp = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR,
      })
    } catch {
      return 'Há pouco tempo'
    }
  }

  // Get page-specific colors and icons from menu system
  const getPageConfig = (path: string) => {
    const metadata = getWindowMetadata(path)

    // For create/update pages, get the parent path for color lookup
    let pathForColor = path
    if (path.includes('/create') || path.includes('/update')) {
      const pathSegments = path.split('/').filter(Boolean)
      const parentPathSegments = pathSegments.slice(0, -1)
      pathForColor = '/' + parentPathSegments.join('/')
    }

    const color = useIconThemeColor(pathForColor)
    // Ensure the icon exists in Icons, fallback to fileText if not
    const IconComponent =
      metadata.icon && Icons[metadata.icon]
        ? Icons[metadata.icon]
        : Icons.fileText

    return {
      color,
      icon: IconComponent,
      title: metadata.title,
    }
  }

  if (recentPages.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-primary/10 rounded-md'>
            <Icons.history className='h-5 w-5 text-primary' />
          </div>
          <div>
            <h2 className='text-lg font-semibold'>{title}</h2>
            <p className='text-sm text-muted-foreground'>
              {recentPages.length} páginas
            </p>
          </div>
        </div>

        {/* Clear button */}
        <button
          onClick={clearHistory}
          className='group/btn relative overflow-hidden border border-border/50 bg-muted/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/60 hover:scale-[1.02] hover:bg-card/80 px-4 py-2'
          style={{ borderRadius: 'var(--radius)' }}
          title='Limpar histórico de páginas'
        >
          {/* Glassmorphism background */}
          <div className='absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-primary/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200' />

          <div className='relative flex items-center gap-2 text-xs text-muted-foreground group-hover/btn:text-foreground transition-colors'>
            <Icons.trash className='h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform duration-200' />
            <span className='font-medium'>Limpar</span>
          </div>
        </button>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
        {recentPages.map((page) => {
          const pageConfig = getPageConfig(page.path)
          const PageIcon = pageConfig.icon

          return (
            <Card
              key={page.id}
              className='group relative overflow-hidden rounded-2xl border border-border/50 bg-muted/30 transition-all duration-200 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/60 hover:scale-[1.02] hover:bg-card/80 cursor-pointer p-4'
              onClick={() => handlePageClick(page)}
            >
              {/* Modern glassmorphism background */}
              <div className='absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200' />

              <div className='relative flex items-start gap-3'>
                {/* Page Icon with theme colors */}
                <div
                  className={`relative p-2 ${pageConfig.color} rounded-md group-hover:scale-105 transition-all duration-200 shadow-lg group-hover:shadow-2xl group-hover:shadow-primary/25 flex-shrink-0`}
                >
                  <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md' />
                  <PageIcon className='relative h-4 w-4 text-white' />
                </div>

                {/* Content area */}
                <div className='flex flex-col flex-1 min-w-0'>
                  {/* Page Title */}
                  <h4 className='font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-2'>
                    {page.title}
                  </h4>

                  {/* Time row */}
                  <div className='text-xs text-muted-foreground mb-1'>
                    <span>{formatTimestamp(page.timestamp)}</span>
                  </div>

                  {/* Window ID - show for all cards */}
                  {(page.searchParams?.id ||
                    page.searchParams?.instanceId ||
                    page.instanceId) && (
                    <div className='text-xs'>
                      <span className='text-[9px] text-muted-foreground/70 font-mono bg-muted/40 px-1 py-0.5 rounded'>
                        ID:{' '}
                        {page.searchParams?.id ||
                          page.searchParams?.instanceId ||
                          page.instanceId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
