import { useEffect, useState } from 'react'
import AppProvider from '@/providers'
import AppRouter from '@/routes'
import type { UpdateInfo } from '@/types/api/responses'
import { useAuthStore } from '@/stores/auth-store'
import { updateStorage } from '@/lib/services/update/update.service'
import { isProduction } from '@/utils/env-utils'
import { UpdateDialog } from '@/components/shared/update-dialog'

export default function App() {
  const [pendingUpdate, setPendingUpdate] = useState<UpdateInfo | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    // In development mode, clear any pending updates and skip showing the dialog
    if (!isProduction()) {
      updateStorage.setPendingUpdate(null)
      return
    }

    // Check for pending updates on app load and when authentication state changes
    const checkForPendingUpdate = () => {
      const storedUpdate = updateStorage.getPendingUpdate()
      if (storedUpdate?.hasUpdate) {
        setPendingUpdate(storedUpdate)
        setDialogOpen(true)
      }
    }

    // Initial check on app load
    checkForPendingUpdate()

    // Listen for update notifications while the app is running
    const handlePendingUpdate = (event: Event) => {
      // Skip update handling in development mode
      if (!isProduction()) {
        return
      }

      const customEvent = event as CustomEvent<UpdateInfo>
      const update = customEvent.detail ?? updateStorage.getPendingUpdate()
      if (update?.hasUpdate) {
        setPendingUpdate(update)
        setDialogOpen(true)
      }
    }

    window.addEventListener('pending-update-available', handlePendingUpdate)

    return () => {
      window.removeEventListener(
        'pending-update-available',
        handlePendingUpdate
      )
    }
  }, [])

  // Check for pending updates when user becomes authenticated (e.g., after login)
  useEffect(() => {
    if (!isProduction()) {
      return
    }

    if (isAuthenticated) {
      // Small delay to ensure sessionStorage is updated after login
      const timeoutId = setTimeout(() => {
        const storedUpdate = updateStorage.getPendingUpdate()
        if (storedUpdate?.hasUpdate) {
          setPendingUpdate(storedUpdate)
          setDialogOpen(true)
        }
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isAuthenticated])

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      // If the user dismisses a non-mandatory update, we still keep it in storage
      // so it can be shown again on the next relevant action if desired.
    }
  }

  return (
    <AppProvider>
      <AppRouter />
      {pendingUpdate && (
        <UpdateDialog
          open={dialogOpen}
          update={pendingUpdate}
          onOpenChange={handleDialogOpenChange}
        />
      )}
    </AppProvider>
  )
}
