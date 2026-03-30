import { useTheme } from '@/providers/theme-provider'
import { getMenuColorByTheme } from '@/utils/menu-colors'

export function useIconThemeColor(path: string): string {
  const { iconTheme } = useTheme()

  if (iconTheme === 'theme-color') {
    return 'bg-primary'
  }

  // Get the theme-specific color for this path
  return getMenuColorByTheme(path, iconTheme)
}
