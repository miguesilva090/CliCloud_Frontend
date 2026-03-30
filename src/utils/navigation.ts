import { create } from 'zustand'

type NavigateFunction = (path: string) => void

interface NavigationStore {
  navigate: NavigateFunction
  setNavigate: (navigate: NavigateFunction) => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  navigate: () => {},
  setNavigate: (navigate) => set({ navigate }),
}))
