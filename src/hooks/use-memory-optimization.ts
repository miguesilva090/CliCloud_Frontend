import { useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useMemoryManager } from '@/utils/memory-manager'

export const useMemoryOptimization = () => {
  const { performCleanup, getMemoryStats, updateConfig } = useMemoryManager()
  const { isAuthenticated } = useAuthStore()

  // Perform cleanup when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      performCleanup()
    }
  }, [isAuthenticated, performCleanup])

  // Perform cleanup on beforeunload (when user closes the tab/window)
  useEffect(() => {
    const handleBeforeUnload = () => {
      performCleanup()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [performCleanup])

  // NOTE: Removed cleanup on visibilitychange and focus events
  // These were causing navigation issues when users switched tabs
  // The memory-manager already has periodic cleanup (every 5 minutes)
  // which is sufficient for memory management without interfering with navigation

  // Manual cleanup function
  const manualCleanup = useCallback(() => {
    performCleanup()
  }, [performCleanup])

  // Get current memory stats
  const getCurrentStats = useCallback(() => {
    return getMemoryStats()
  }, [getMemoryStats])

  // Update memory configuration
  const updateMemoryConfig = useCallback(
    (config: any) => {
      updateConfig(config)
    },
    [updateConfig]
  )

  return {
    manualCleanup,
    getCurrentStats,
    updateMemoryConfig,
  }
}
