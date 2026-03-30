import { roleHeaderMenus } from '@/config/menu-items'

type IconTheme = 'colorful' | 'theme-color' | 'pastel' | 'vibrant' | 'neon'

export function getMenuColor(path: string): string {
  // Helper function to recursively search menu items for color (including nested items and dropdowns)
  const searchMenuItemsForColor = (
    items: ReadonlyArray<{
      href?: string
      color?: string
      items?: readonly any[]
      dropdown?: readonly any[]
    }>
  ): string | null => {
    for (const item of items) {
      // Check if this item matches and has a color
      if (item.href === path && 'color' in item && item.color) {
        return item.color as string
      }

      // Check dropdown items if they exist
      if (item.dropdown && Array.isArray(item.dropdown)) {
        for (const dropdownItem of item.dropdown) {
          if (
            dropdownItem.href === path &&
            'color' in dropdownItem &&
            dropdownItem.color
          ) {
            return dropdownItem.color as string
          }
        }
      }

      // Check nested items if they exist
      if (item.items && Array.isArray(item.items)) {
        const nestedResult = searchMenuItemsForColor(item.items)
        if (nestedResult) {
          return nestedResult
        }
      }
    }
    return null
  }

  // Check all menu sections dynamically (utilitarios, reports, etc.)
  const allMenus = roleHeaderMenus.client || {}
  for (const menuKey in allMenus) {
    const menuSections = allMenus[menuKey as keyof typeof allMenus] || []
    for (const section of menuSections) {
      const sectionItems = ('items' in section && section.items) || []
      const color = searchMenuItemsForColor(sectionItems)
      if (color) return color
    }
  }

  // Default color if not found
  return 'bg-gray-500'
}

export function getMenuColorByTheme(path: string, theme: IconTheme): string {
  // Helper function to recursively search menu items for theme color (including nested items and dropdowns)
  const searchMenuItemsForThemeColor = (
    items: ReadonlyArray<{
      href?: string
      colors?: Record<string, string>
      color?: string
      items?: readonly any[]
      dropdown?: readonly any[]
    }>
  ): string | null => {
    for (const item of items) {
      // Check if this item matches and has colors
      if (item.href === path && 'colors' in item && item.colors) {
        return item.colors[theme] || item.colors['colorful'] || 'bg-gray-500'
      }
      // Fallback to old color system
      if (item.href === path && 'color' in item && item.color) {
        return item.color as string
      }

      // Check dropdown items if they exist (for items like Geográficas with dropdown arrays)
      if (item.dropdown && Array.isArray(item.dropdown)) {
        for (const dropdownItem of item.dropdown) {
          if (
            dropdownItem.href === path &&
            'colors' in dropdownItem &&
            dropdownItem.colors
          ) {
            return (
              dropdownItem.colors[theme] ||
              dropdownItem.colors['colorful'] ||
              'bg-gray-500'
            )
          }
          // Fallback to old color system
          if (
            dropdownItem.href === path &&
            'color' in dropdownItem &&
            dropdownItem.color
          ) {
            return dropdownItem.color as string
          }
        }
      }

      // Check nested items if they exist
      if (item.items && Array.isArray(item.items)) {
        const nestedResult = searchMenuItemsForThemeColor(item.items)
        if (nestedResult) {
          return nestedResult
        }
      }
    }
    return null
  }

  // Check all menu systems dynamically (utilitarios, reports, etc.)
  const allMenus = roleHeaderMenus.client || {}

  for (const menuKey in allMenus) {
    const menuSections = allMenus[menuKey as keyof typeof allMenus] || []

    for (const section of menuSections) {
      if ('items' in section && section.items && Array.isArray(section.items)) {
        const sectionColor = searchMenuItemsForThemeColor(section.items)
        if (sectionColor) {
          return sectionColor
        }
      }
    }
  }

  // Default color if not found
  return 'bg-gray-500'
}

export function getMenuColorByLabel(label: string): string {
  // Check all menu systems dynamically (utilitarios, reports, etc.)
  const allMenus = roleHeaderMenus.client || {}

  for (const menuKey in allMenus) {
    const menuSections = allMenus[menuKey as keyof typeof allMenus] || []

    for (const section of menuSections) {
      if ('items' in section && section.items && Array.isArray(section.items)) {
        for (const item of section.items) {
          if (item.label === label && 'color' in item && item.color) {
            return item.color as string
          }

          // Check nested items if they exist
          if ('items' in item && item.items && Array.isArray(item.items)) {
            for (const nestedItem of item.items) {
              if (
                nestedItem.label === label &&
                'color' in nestedItem &&
                nestedItem.color
              ) {
                return nestedItem.color as string
              }
            }
          }

          // Check dropdown items if they exist
          if (item.dropdown && Array.isArray(item.dropdown)) {
            for (const dropdownItem of item.dropdown) {
              if (
                dropdownItem.label === label &&
                'color' in dropdownItem &&
                dropdownItem.color
              ) {
                return dropdownItem.color as string
              }
            }
          }
        }
      }
    }
  }

  // Default color if not found
  return 'bg-gray-500'
}
