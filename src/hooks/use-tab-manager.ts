import { useEffect, useState } from 'react'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useCurrentWindowId } from '@/utils/window-utils'

interface UseTabManagerProps {
  defaultTab?: string
  tabKey?: string // Optional key to identify different tab groups in the same window
}

export const useTabManager = ({
  defaultTab = '',
  tabKey: _tabKey,
}: UseTabManagerProps = {}) => {
  const windowId = useCurrentWindowId()
  const { updateWindowState } = useWindowsStore()
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Get the current window to check for saved tab state
  const currentWindow = useWindowsStore
    .getState()
    .windows.find((w) => w.id === windowId)

  // Initialize active tab from saved state or default
  useEffect(() => {
    if (currentWindow?.activeTab) {
      setActiveTab(currentWindow.activeTab)
    } else if (defaultTab) {
      setActiveTab(defaultTab)
    }
  }, [currentWindow?.activeTab, defaultTab])

  // Save tab state when it changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)

    if (windowId) {
      updateWindowState(windowId, {
        activeTab: newTab,
      })
    }
  }

  return {
    activeTab,
    setActiveTab: handleTabChange,
  }
}
