import React, { createContext, useContext, useState, useCallback } from 'react'

const SIDEBAR_STORAGE_KEY = 'clicloud-sidebar-minimized'

function getStoredSidebarMinimized(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

const SidebarContext = createContext<{
  isMinimized: boolean
  toggle: () => void
}>({
  isMinimized: false,
  toggle: () => {}
})

export const useSidebar = () => useContext(SidebarContext)

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [isMinimized, setIsMinimized] = useState(getStoredSidebarMinimized)

  const toggle = useCallback(() => {
    setIsMinimized((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return (
    <SidebarContext.Provider value={{ isMinimized, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}
