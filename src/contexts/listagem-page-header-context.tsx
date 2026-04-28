import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'

export type ListagemPageHeaderContextValue = {
  title: ReactNode
  showBackButton: boolean
  onBack?: () => void
  /** Raro: ações extra entre título e toolbar (ex. filtros compactos). */
  headerTrailing?: ReactNode
}

const ListagemPageHeaderContext =
  createContext<ListagemPageHeaderContextValue | null>(null)

export function ListagemPageHeaderProvider({
  title,
  showBackButton = true,
  onBack,
  headerTrailing,
  children,
}: {
  title: ReactNode
  showBackButton?: boolean
  onBack?: () => void
  headerTrailing?: ReactNode
  children: ReactNode
}) {
  const value = useMemo(
    () => ({ title, showBackButton, onBack, headerTrailing }),
    [title, showBackButton, onBack, headerTrailing],
  )
  return (
    <ListagemPageHeaderContext.Provider value={value}>
      {children}
    </ListagemPageHeaderContext.Provider>
  )
}

export function useListagemPageHeader(): ListagemPageHeaderContextValue | null {
  return useContext(ListagemPageHeaderContext)
}
