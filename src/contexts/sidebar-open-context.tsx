import React, { createContext, useContext } from 'react'

type SidebarOpenContextType = {
  sidebarOpen: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarOpenContext = createContext<SidebarOpenContextType | undefined>(
  undefined
)

export function useSidebarOpen() {
  const context = useContext(SidebarOpenContext)
  return context
}

export const SidebarOpenProvider: React.FC<{
  children: React.ReactNode
  value: SidebarOpenContextType
}> = ({ children, value }) => {
  return (
    <SidebarOpenContext.Provider value={value}>
      {children}
    </SidebarOpenContext.Provider>
  )
}
