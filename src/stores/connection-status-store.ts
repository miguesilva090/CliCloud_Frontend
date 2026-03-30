import { create } from 'zustand'

interface ConnectionStatus {
  isClientApiDown: boolean
  isLicensesApiDown: boolean
}

interface ConnectionStatusActions {
  setClientApiStatus: (isDown: boolean) => void
  setLicensesApiStatus: (isDown: boolean) => void
  reset: () => void
}

const initialState: ConnectionStatus = {
  isClientApiDown: false,
  isLicensesApiDown: false,
}

export const useConnectionStatusStore = create<
  ConnectionStatus & ConnectionStatusActions
>((set) => ({
  ...initialState,
  setClientApiStatus: (isDown: boolean) => set({ isClientApiDown: isDown }),
  setLicensesApiStatus: (isDown: boolean) => set({ isLicensesApiDown: isDown }),
  reset: () => set(initialState),
}))
