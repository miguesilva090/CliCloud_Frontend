import { FieldErrors } from 'react-hook-form'

type TabName = string

interface UseSubmitErrorTabOptions<TFieldValues extends Record<string, any>> {
  fieldToTabMap: Record<keyof TFieldValues | string, TabName>
  setActiveTab: (tab: TabName) => void
  tabOrder?: TabName[] // Optional: explicitly defines the order of tabs to check
}

/**
 * Automatically infers tab order from fieldToTabMap based on first occurrence order.
 * If 'default' exists, it's placed first, then other tabs in the order they first appear.
 */
function inferTabOrder(fieldToTabMap: Record<string, TabName>): TabName[] {
  const tabOrder: TabName[] = []
  const seenTabs = new Set<TabName>()

  // If 'default' exists, add it first
  if (fieldToTabMap['default']) {
    tabOrder.push(fieldToTabMap['default'])
    seenTabs.add(fieldToTabMap['default'])
  }

  // Add other tabs in the order they first appear in the map
  for (const tab of Object.values(fieldToTabMap)) {
    if (tab && !seenTabs.has(tab)) {
      tabOrder.push(tab)
      seenTabs.add(tab)
    }
  }

  return tabOrder
}

export function useSubmitErrorTab<TFieldValues extends Record<string, any>>({
  fieldToTabMap,
  setActiveTab,
  tabOrder,
}: UseSubmitErrorTabOptions<TFieldValues>) {
  function handleError(errors: FieldErrors<TFieldValues>) {
    if (!errors || Object.keys(errors).length === 0) return

    // Use provided tabOrder or infer it automatically from fieldToTabMap
    const effectiveTabOrder = tabOrder || inferTabOrder(fieldToTabMap)

    // Get all tabs that have errors
    const errorFields = Object.keys(errors)
    const tabsWithErrors = new Set<TabName>()

    errorFields.forEach((field) => {
      const tab = fieldToTabMap[field] || fieldToTabMap['default']
      if (tab) tabsWithErrors.add(tab)
    })

    // Find the first tab in effectiveTabOrder that has errors
    for (const tab of effectiveTabOrder) {
      if (tabsWithErrors.has(tab)) {
        setActiveTab(tab)
        return
      }
    }

    // Fallback: if no tab in tabOrder has errors, use default
    const defaultTab = fieldToTabMap['default']
    if (defaultTab) setActiveTab(defaultTab)
  }

  return { handleError }
}
