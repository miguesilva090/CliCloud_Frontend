import { QueryClient } from '@tanstack/react-query'

// Create a BroadcastChannel for cross-tab communication
// This allows multiple browser tabs to share query invalidation events
const CHANNEL_NAME = 'react-query-sync'
let queryChannel: BroadcastChannel | null = null

// Initialize the broadcast channel (only if browser supports it)
const initChannel = () => {
  if (typeof BroadcastChannel !== 'undefined' && !queryChannel) {
    queryChannel = new BroadcastChannel(CHANNEL_NAME)
  }
}

/**
 * Broadcasts query invalidation to other browser tabs
 * @param queryKeys - Array of query keys to invalidate
 */
export const broadcastQueryInvalidation = (queryKeys: unknown[][]) => {
  initChannel()

  if (queryChannel) {
    const message = {
      type: 'invalidate',
      queryKeys,
      timestamp: Date.now(),
    }

    queryChannel.postMessage(message)
  }
}

/**
 * Sets up listener for query invalidation broadcasts from other tabs
 * @param queryClient - The QueryClient instance to invalidate queries on
 */
export const setupQuerySync = (queryClient: QueryClient) => {
  initChannel()

  if (queryChannel) {
    queryChannel.onmessage = (event) => {
      if (event.data.type === 'invalidate') {
        // Invalidate each query key in this tab's QueryClient
        event.data.queryKeys.forEach((queryKey: unknown[]) => {
          queryClient.invalidateQueries({ queryKey })
        })
      } else if (event.data.type === 'invalidate-all') {
        // Invalidate all queries in this tab's QueryClient
        queryClient.invalidateQueries()
      }
    }
  }

  // Return cleanup function
  return () => {
    if (queryChannel) {
      queryChannel.close()
      queryChannel = null
    }
  }
}

/**
 * Helper to invalidate queries locally and broadcast to other tabs
 * @param queryClient - The QueryClient instance
 * @param queryKeys - Array of query keys to invalidate
 */
export const invalidateQueriesGlobally = (
  queryClient: QueryClient,
  queryKeys: unknown[][]
) => {
  // Invalidate locally first
  queryKeys.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey })
  })

  // Broadcast to other tabs
  broadcastQueryInvalidation(queryKeys)
}

/**
 * Helper to invalidate queries with exact: false locally and broadcast to other tabs
 * @param queryClient - The QueryClient instance
 * @param queryKey - Query key prefix to invalidate (with exact: false)
 */
export const invalidateQueriesGloballyPrefix = (
  queryClient: QueryClient,
  queryKey: unknown[]
) => {
  // Invalidate locally with exact: false
  queryClient.invalidateQueries({
    queryKey,
    exact: false,
  })

  // Broadcast to other tabs
  broadcastQueryInvalidation([queryKey])
}

/**
 * Helper to invalidate all queries locally and broadcast to other tabs
 * Used when context changes (e.g., selected filters or preferences)
 * @param queryClient - The QueryClient instance
 */
export const invalidateAllQueriesGlobally = (queryClient: QueryClient) => {
  // Invalidate all queries locally
  queryClient.invalidateQueries()

  // Broadcast a special message to invalidate all queries in other tabs
  initChannel()
  if (queryChannel) {
    const message = {
      type: 'invalidate-all',
      timestamp: Date.now(),
    }
    queryChannel.postMessage(message)
  }
}
