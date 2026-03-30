import { useTheme } from '@/providers/theme-provider'
import { getMenuColorByTheme } from '@/utils/menu-colors'
import { getWindowMetadata as getWindowMetadataUtil } from '@/utils/window-utils'
import { Icons } from '@/components/ui/icons'

export function useWindowMetadata(path: string): {
  icon: keyof typeof Icons | null
  color: string
  title: string
} {
  const { iconTheme } = useTheme()
  const metadata = getWindowMetadataUtil(path)

  // For create/update pages, we need to get the color for the parent path
  // The getWindowMetadata function already handles finding the parent route
  // So we need to determine the parent path to get the correct theme color
  let pathForColor = path

  // If this is a create/update page, get the parent path for color lookup
  if (path.includes('/create') || path.includes('/update')) {
    const pathSegments = path.split('/').filter(Boolean)
    const parentPathSegments = pathSegments.slice(0, -1)
    pathForColor = '/' + parentPathSegments.join('/')
  }

  const color = getMenuColorByTheme(pathForColor, iconTheme)

  return {
    ...metadata,
    color,
  }
}
