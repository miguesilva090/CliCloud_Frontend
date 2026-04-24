import { Fragment } from 'react'
import { Slash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWindowsStore } from '@/stores/use-windows-store'
import { navigateManagedWindow } from '@/utils/window-utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

type BreadcrumbItemProps = {
  title: string
  link: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItemProps[] }) {
  const navigate = useNavigate()
  const { windows, activeWindow } = useWindowsStore()

  const handleBackClick = () => {
    // Find the last active window that's not the current one
    const lastActiveWindow = windows.find((w) => w.id !== activeWindow)
    if (lastActiveWindow) {
      // Add instanceId to the URL if it exists
      const searchParams = new URLSearchParams()
      if (lastActiveWindow.searchParams) {
        Object.entries(lastActiveWindow.searchParams).forEach(
          ([key, value]) => {
            searchParams.set(key, value)
          }
        )
      }
      searchParams.set('instanceId', lastActiveWindow.instanceId)
      navigate(`${lastActiveWindow.path}?${searchParams.toString()}`)
    } else {
      // If no other window is open, go to the previous breadcrumb
      const previousItem = items[items.length - 2]
      if (previousItem) {
        navigateManagedWindow(navigate, previousItem.link)
      }
    }
  }

  const handleBreadcrumbClick = (link: string) => {
    navigateManagedWindow(navigate, link)
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className='text-xs'>
        {items.map((item, index) => (
          <Fragment key={item.title}>
            {index !== items.length - 1 && (
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={item.link}
                  className='text-muted-foreground hover:text-foreground'
                  onClick={(e) => {
                    e.preventDefault()
                    handleBreadcrumbClick(item.link)
                  }}
                >
                  {item.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            {index < items.length - 1 && (
              <BreadcrumbSeparator>
                <Slash
                  className='h-3 w-3'
                  onClick={handleBackClick}
                  style={{ cursor: 'pointer' }}
                />
              </BreadcrumbSeparator>
            )}
            {index === items.length - 1 && (
              <BreadcrumbPage className='font-medium'>
                {item.title}
              </BreadcrumbPage>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
