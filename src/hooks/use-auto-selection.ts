import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWindowsStore } from '@/stores/use-windows-store'
import { toast } from '@/utils/toast-utils'
import {
  checkForChildWindowReturnData,
  getAndClearWindowReturnData,
} from '@/utils/window-utils'

interface UseAutoSelectionOptions {
  windowId: string
  instanceId: string
  data: any[]
  setValue: (value: string) => void
  refetch: () => Promise<any>
  itemName: string
  successMessage?: string
  manualSelectionMessage?: string
  queryKey?: string[]
}

/**
 * Hook for automatically selecting newly created items from child windows.
 * Provides multiple fallback mechanisms to ensure reliable auto-selection.
 *
 * Toast Suppression: When a parent window already shows a success toast for creation,
 * the auto-selection toast can be suppressed to prevent stuttering effects.
 * This is controlled by the `suppress-auto-selection-toast-${windowId}` sessionStorage flag.
 */
export function useAutoSelection({
  windowId,
  instanceId,
  data,
  setValue,
  refetch,
  itemName,
  successMessage,
  manualSelectionMessage,
  queryKey,
}: UseAutoSelectionOptions) {
  const latestDataRef = useRef<any[]>([])
  const processedRef = useRef(false) // Track if we've already processed return data
  const isProcessingRef = useRef(false) // Track if we're currently processing
  const lastProcessedReturnDataRef = useRef<any>(null) // Track the last processed return data
  const effectRunCountRef = useRef(0) // Track how many times the effect has run
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Debounce timeout
  const hasExecutedRef = useRef(false) // Track if we've already executed for this window
  const queryClient = useQueryClient()
  const {
    findChildWindows,
    getWindowReturnData,
    clearWindowReturnData,
    windows,
  } = useWindowsStore()

  // Update the ref whenever data changes
  useEffect(() => {
    latestDataRef.current = data
  }, [data])

  // Find the specific windows we care about
  const parentWindow = windows.find((w) => w.id === windowId)
  const childWindows = findChildWindows(windowId)
  const hasChildWithReturnData = childWindows.some((w) => w.returnData)

  useEffect(() => {
    effectRunCountRef.current += 1

    if (!windowId) {
      return
    }

    // Prevent too many runs - if we've run more than 5 times, something is wrong
    if (effectRunCountRef.current > 5) {
      return
    }

    // Debounce mechanism - clear any existing timeout and set a new one
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set a debounce timeout to prevent rapid executions
    debounceTimeoutRef.current = setTimeout(() => {
      // Prevent multiple executions for the same window
      if (hasExecutedRef.current) {
        return
      }

      hasExecutedRef.current = true
      processAutoSelection()
    }, 100) // 100ms debounce

    return // Exit early, let the timeout handle the processing

    // Function to handle the actual auto-selection processing
    function processAutoSelection() {
      // Prevent multiple simultaneous executions
      if (isProcessingRef.current) {
        return
      }

      // Check if we've already processed auto-selection for this window
      const processedKey = `auto-selection-processed-${windowId}`
      const alreadyProcessed = sessionStorage.getItem(processedKey)
      if (alreadyProcessed === 'true') {
        return
      }

      // If we've already successfully processed return data, don't process again
      if (processedRef.current) {
        return
      }

      // Mark as processing to prevent concurrent executions
      isProcessingRef.current = true

      // Get parent window ID from sessionStorage as fallback
      // Note: This is for when THIS window is a child window looking for its parent
      // For parent windows looking for child return data, we should use windowId directly
      const parentWindowIdFromStorage = sessionStorage.getItem(
        `parent-window-${instanceId}`
      )

      // Also check if we can find parent window ID by scanning sessionStorage
      // This helps when the parent window needs to find data stored by child windows
      const allParentWindowKeys = Object.keys(sessionStorage).filter((key) =>
        key.startsWith('parent-window-')
      )
      console.log(
        '[AUTO-SELECTION] All parent-window keys in sessionStorage:',
        allParentWindowKeys
      )
      allParentWindowKeys.forEach((key) => {
        const value = sessionStorage.getItem(key)
        console.log(`[AUTO-SELECTION]   ${key}: ${value}`)
      })

      // Early return if no return data to process
      if (!hasChildWithReturnData && !parentWindow?.returnData) {
        isProcessingRef.current = false
        return
      }

      // Check if we have return data but it's already been processed
      if (parentWindow?.returnData && processedRef.current) {
        isProcessingRef.current = false
        return
      }

      // Check if we have return data that hasn't been processed yet
      if (parentWindow?.returnData && !processedRef.current) {
      } else if (!parentWindow?.returnData && !hasChildWithReturnData) {
        isProcessingRef.current = false
        return
      } else if (parentWindow?.returnData && processedRef.current) {
        isProcessingRef.current = false
        return
      }

      // Early return if no data available yet
      if (!latestDataRef.current || latestDataRef.current.length === 0) {
        isProcessingRef.current = false
        return
      }

      // Final check: if we have no return data to process, exit
      if (!hasChildWithReturnData && !parentWindow?.returnData) {
        isProcessingRef.current = false
        return
      }

      // Additional check: if we have return data but it's already been processed, exit
      if (parentWindow?.returnData && processedRef.current) {
        isProcessingRef.current = false
        return
      }

      // Check if we've already processed this specific return data
      if (parentWindow?.returnData && lastProcessedReturnDataRef.current) {
        const currentReturnData = parentWindow.returnData
        const lastProcessedData = lastProcessedReturnDataRef.current
        if (
          currentReturnData.id === lastProcessedData.id &&
          currentReturnData.nome === lastProcessedData.nome
        ) {
          isProcessingRef.current = false
          return
        }
      }

      // Function to attempt auto-selection
      const attemptAutoSelection = (
        itemId: string,
        itemName: string,
        cleanupCallback?: () => void
      ) => {
        const currentData = latestDataRef.current
        const itemExists = currentData.some((item: any) => item.id === itemId)
        if (itemExists) {
          setValue(itemId)

          // Check if we should suppress the auto-selection toast to prevent stuttering
          // This happens when the parent window already shows a success toast for creation
          const shouldSuppressToast = sessionStorage.getItem(
            `suppress-auto-selection-toast-${windowId}`
          )

          if (!shouldSuppressToast) {
            toast.success(
              successMessage || `${itemName} selecionado automaticamente`
            )
          } else {
            // Clear the suppression flag after using it
            sessionStorage.removeItem(
              `suppress-auto-selection-toast-${windowId}`
            )
          }

          // Mark as processed to prevent duplicate processing
          processedRef.current = true
          // Track the processed return data
          lastProcessedReturnDataRef.current = { id: itemId, nome: itemName }
          // Mark this window as processed to prevent re-processing
          const processedKey = `auto-selection-processed-${windowId}`
          sessionStorage.setItem(processedKey, 'true')
          // Only cleanup after successful selection
          if (cleanupCallback) {
            cleanupCallback()
          }
          return true
        }
        return false
      }

      // Function to handle auto-selection with retries
      const handleAutoSelection = (
        itemId: string,
        itemName: string,
        cleanupCallback?: () => void
      ) => {
        if (!attemptAutoSelection(itemId, itemName, cleanupCallback)) {
          // Force cache invalidation and refetch
          if (queryKey) {
            queryClient.invalidateQueries({ queryKey })
          }

          refetch().then(() => {
            setTimeout(() => {
              if (!attemptAutoSelection(itemId, itemName, cleanupCallback)) {
                setTimeout(() => {
                  if (
                    !attemptAutoSelection(itemId, itemName, cleanupCallback)
                  ) {
                    toast.success(
                      manualSelectionMessage ||
                        `${itemName} criado com sucesso. Por favor, selecione-o manualmente.`
                    )
                    // Cleanup even if selection failed after all retries
                    if (cleanupCallback) {
                      cleanupCallback()
                    }
                  }
                }, 500)
              }
            }, 100)
          })
        }
      }

      // Normalize item name for entity type matching (do this first so we can use it everywhere)
      const normalizedItemName = String(itemName)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')

      console.log('[AUTO-SELECTION] Starting lookup for:', {
        itemName,
        normalizedItemName,
        windowId,
        instanceId,
        parentWindowIdFromStorage,
      })

      // Log all relevant sessionStorage keys for debugging
      const allSessionKeys = Object.keys(sessionStorage).filter(
        (key) => key.includes('return-data') && key.includes(normalizedItemName)
      )
      console.log(
        '[AUTO-SELECTION] All sessionStorage keys matching entity type:',
        allSessionKeys
      )
      allSessionKeys.forEach((key) => {
        console.log(`[AUTO-SELECTION]   ${key}:`, sessionStorage.getItem(key))
      })

      // Check primary mechanism: child windows (but verify entity type first)
      const childWindowData = checkForChildWindowReturnData(
        windowId,
        findChildWindows,
        getWindowReturnData
      )

      if (childWindowData?.returnData) {
        // Verify this return data is for our entity type by checking sessionStorage
        // The child window should have set sessionStorage with entity-specific key
        const childSessionKey = `return-data-${childWindowData.childWindowId}-${normalizedItemName}`
        const hasMatchingSessionKey = sessionStorage.getItem(childSessionKey)

        // Also check if parent window has matching sessionStorage key
        const parentSessionKey = `return-data-${windowId}-${normalizedItemName}`
        const hasParentSessionKey = sessionStorage.getItem(parentSessionKey)

        // Only process if there's a matching sessionStorage key for this entity type
        if (hasMatchingSessionKey || hasParentSessionKey) {
          const { id, nome } = childWindowData.returnData
          handleAutoSelection(id, nome, () => {
            getAndClearWindowReturnData(
              childWindowData.childWindowId,
              getWindowReturnData,
              clearWindowReturnData
            )
            // Clean up sessionStorage keys
            if (hasMatchingSessionKey) {
              sessionStorage.removeItem(childSessionKey)
            }
            if (hasParentSessionKey) {
              sessionStorage.removeItem(parentSessionKey)
            }
          })
          return
        }
        // If no matching sessionStorage key, skip this return data (it's for a different entity type)
      }

      // Check sessionStorage first (entity-specific) - this ensures we only process return data for the correct entity type
      const sessionStorageKey = `return-data-${windowId}-${normalizedItemName}`
      console.log(
        '[AUTO-SELECTION] Looking for sessionStorage key:',
        sessionStorageKey
      )
      const sessionStorageReturnData = sessionStorage.getItem(sessionStorageKey)
      console.log(
        '[AUTO-SELECTION] Found sessionStorage data:',
        sessionStorageReturnData ? 'YES' : 'NO',
        sessionStorageReturnData
      )

      // Also check ALL return-data keys to see what's available
      const allReturnDataKeys = Object.keys(sessionStorage).filter((key) =>
        key.startsWith('return-data-')
      )
      console.log(
        '[AUTO-SELECTION] All return-data keys in sessionStorage:',
        allReturnDataKeys
      )
      allReturnDataKeys.forEach((key) => {
        const value = sessionStorage.getItem(key)
        const matchesEntity = key.includes(normalizedItemName)
        const matchesWindowId = key.includes(`return-data-${windowId}-`)
        console.log(`[AUTO-SELECTION]   Key ${key}:`, {
          value,
          matchesEntity,
          matchesWindowId,
          windowId,
          normalizedItemName,
        })
        // If it matches both entity and windowId, try to use it
        if (matchesEntity && matchesWindowId && value) {
          try {
            const parsedData = JSON.parse(value)
            const { id, nome } = parsedData
            console.log(
              '[AUTO-SELECTION] Found matching data in all keys scan, auto-selecting:',
              { id, nome }
            )
            handleAutoSelection(id, nome, () => {
              sessionStorage.removeItem(key)
            })
            return
          } catch (error) {
            console.error('Error parsing scanned sessionStorage data:', error)
          }
        }
      })

      if (sessionStorageReturnData) {
        try {
          const parsedData = JSON.parse(sessionStorageReturnData)
          const { id, nome } = parsedData
          console.log(
            '[AUTO-SELECTION] Found data in sessionStorage, auto-selecting:',
            { id, nome }
          )
          handleAutoSelection(id, nome, () => {
            sessionStorage.removeItem(sessionStorageKey)
          })
          return
        } catch (error) {
          console.error('Error parsing sessionStorage return data:', error)
        }
      }

      // Check sessionStorage with parent window ID (entity-specific)
      if (parentWindowIdFromStorage) {
        const parentSessionStorageKey = `return-data-${parentWindowIdFromStorage}-${normalizedItemName}`
        console.log(
          '[AUTO-SELECTION] Looking for parent sessionStorage key:',
          parentSessionStorageKey
        )
        const parentSessionStorageReturnData = sessionStorage.getItem(
          parentSessionStorageKey
        )
        console.log(
          '[AUTO-SELECTION] Found parent sessionStorage data:',
          parentSessionStorageReturnData ? 'YES' : 'NO',
          parentSessionStorageReturnData
        )

        if (parentSessionStorageReturnData) {
          try {
            const parsedData = JSON.parse(parentSessionStorageReturnData)
            const { id, nome } = parsedData
            console.log(
              '[AUTO-SELECTION] Found data in parent sessionStorage, auto-selecting:',
              { id, nome }
            )
            handleAutoSelection(id, nome, () => {
              sessionStorage.removeItem(parentSessionStorageKey)
            })
            return
          } catch (error) {
            console.error(
              'Error parsing parent sessionStorage return data:',
              error
            )
          }
        }
      } else {
        console.log(
          '[AUTO-SELECTION] No parentWindowIdFromStorage available for lookup'
        )
      }

      // Check first fallback: instanceId-based return data (only if entity-specific sessionStorage exists)
      const fallbackReturnData = getWindowReturnData(instanceId)

      if (fallbackReturnData) {
        // Verify this return data is for our entity type by checking sessionStorage
        const instanceSessionKey = `return-data-${instanceId}-${normalizedItemName}`
        const hasMatchingSessionKey = sessionStorage.getItem(instanceSessionKey)

        // Only process if there's a matching sessionStorage key for this entity type
        if (hasMatchingSessionKey) {
          const { id, nome } = fallbackReturnData
          handleAutoSelection(id, nome, () => {
            clearWindowReturnData(instanceId)
            sessionStorage.removeItem(instanceSessionKey)
          })
          return
        }
      }

      // Check second fallback: parent window ID from storage (only if entity-specific sessionStorage exists)
      if (parentWindowIdFromStorage) {
        const secondFallbackReturnData = getWindowReturnData(
          parentWindowIdFromStorage
        )

        if (secondFallbackReturnData) {
          // Verify this return data is for our entity type by checking sessionStorage
          const parentSessionKey = `return-data-${parentWindowIdFromStorage}-${normalizedItemName}`
          const hasMatchingSessionKey = sessionStorage.getItem(parentSessionKey)

          // Only process if there's a matching sessionStorage key for this entity type
          if (hasMatchingSessionKey) {
            const { id, nome } = secondFallbackReturnData
            handleAutoSelection(id, nome, () => {
              clearWindowReturnData(parentWindowIdFromStorage)
              sessionStorage.removeItem(parentSessionKey)
            })
            return
          }
        }
      }

      // Check fourth fallback: scan all sessionStorage keys for this entity type
      // This is important when parentWindowIdFromStorage is null but data was stored with windowId
      const allSessionStorageKeys = Object.keys(sessionStorage).filter(
        (key) =>
          key.includes(`return-data-`) && key.includes(`-${normalizedItemName}`)
      )
      console.log(
        '[AUTO-SELECTION] Scanning all sessionStorage keys for entity type:',
        {
          normalizedItemName,
          allSessionStorageKeys,
          windowId,
        }
      )

      for (const key of allSessionStorageKeys) {
        // Check if this key matches our windowId (even if parentWindowIdFromStorage is null)
        const keyMatchesWindowId = key.includes(`return-data-${windowId}-`)
        const data = sessionStorage.getItem(key)
        console.log(
          '[AUTO-SELECTION] Checking key:',
          key,
          'matches windowId:',
          keyMatchesWindowId,
          'has data:',
          !!data,
          'data:',
          data
        )

        if (data && keyMatchesWindowId) {
          try {
            const parsedData = JSON.parse(data)
            const { id, nome } = parsedData
            console.log(
              '[AUTO-SELECTION] Found matching data in scanned keys, auto-selecting:',
              { id, nome }
            )
            handleAutoSelection(id, nome, () => {
              sessionStorage.removeItem(key)
            })
            return
          } catch (error) {
            console.error(
              'Error parsing alternative sessionStorage data:',
              error
            )
          }
        }
      }

      // Additional check: if we didn't find it, try a direct lookup with windowId
      // This handles race conditions where storage happens after initial lookup
      if (windowId && allSessionStorageKeys.length === 0) {
        console.log(
          '[AUTO-SELECTION] No keys found in scan, but checking if data exists with direct windowId lookup'
        )
        const directKey = `return-data-${windowId}-${normalizedItemName}`
        const directData = sessionStorage.getItem(directKey)
        console.log(
          '[AUTO-SELECTION] Direct lookup key:',
          directKey,
          'found:',
          !!directData,
          'data:',
          directData
        )
        if (directData) {
          try {
            const parsedData = JSON.parse(directData)
            const { id, nome } = parsedData
            console.log(
              '[AUTO-SELECTION] Found data in direct lookup, auto-selecting:',
              { id, nome }
            )
            handleAutoSelection(id, nome, () => {
              sessionStorage.removeItem(directKey)
            })
            return
          } catch (error) {
            console.error('Error parsing direct sessionStorage data:', error)
          }
        }
      }

      // Check fifth fallback: scan all windows for return data (with entity type validation)
      for (const window of windows) {
        if (window.returnData) {
          // Check if this window is related to our current window
          const isRelatedWindow =
            window.parentWindowId === windowId || window.id === windowId
          const isCorrectEntityType =
            window.returnData &&
            (window.returnData.nome || window.returnData.name) &&
            window.returnData.id

          if (isRelatedWindow && isCorrectEntityType) {
            // Verify this return data is for our entity type by checking sessionStorage
            const windowSessionKey = `return-data-${window.id}-${normalizedItemName}`
            const parentWindowSessionKey = `return-data-${windowId}-${normalizedItemName}`
            const hasMatchingSessionKey =
              sessionStorage.getItem(windowSessionKey) ||
              sessionStorage.getItem(parentWindowSessionKey)

            // Only process if there's a matching sessionStorage key for this entity type
            if (hasMatchingSessionKey) {
              const { id, nome } = window.returnData
              handleAutoSelection(id, nome, () => {
                // Clear the return data
                clearWindowReturnData(window.id)
                // Clean up sessionStorage keys
                if (sessionStorage.getItem(windowSessionKey)) {
                  sessionStorage.removeItem(windowSessionKey)
                }
                if (sessionStorage.getItem(parentWindowSessionKey)) {
                  sessionStorage.removeItem(parentWindowSessionKey)
                }
              })
              return
            }
          }
        }
      }

      // Check sixth fallback: look for any window with return data (with entity type validation)
      // This is a more aggressive approach, but we still need to verify entity type
      for (const window of windows) {
        if (
          window.returnData &&
          window.returnData.id &&
          window.returnData.nome
        ) {
          // Verify this return data is for our entity type by checking sessionStorage
          const windowSessionKey = `return-data-${window.id}-${normalizedItemName}`
          const parentWindowSessionKey = `return-data-${windowId}-${normalizedItemName}`
          const hasMatchingSessionKey =
            sessionStorage.getItem(windowSessionKey) ||
            sessionStorage.getItem(parentWindowSessionKey)

          // Only process if there's a matching sessionStorage key for this entity type
          if (hasMatchingSessionKey) {
            const { id, nome } = window.returnData
            handleAutoSelection(id, nome, () => {
              // Clear the return data
              clearWindowReturnData(window.id)
              // Clean up sessionStorage keys
              if (sessionStorage.getItem(windowSessionKey)) {
                sessionStorage.removeItem(windowSessionKey)
              }
              if (sessionStorage.getItem(parentWindowSessionKey)) {
                sessionStorage.removeItem(parentWindowSessionKey)
              }
            })
            return
          }
        }
      }

      // Reset processing flag
      isProcessingRef.current = false
    } // End of processAutoSelection function
  }, [
    windowId,
    instanceId,
    // Remove all other dependencies to prevent unnecessary re-runs
    // The effect should only run when the window changes or when there's actual return data
  ])

  // Cleanup processed flag when window changes
  useEffect(() => {
    return () => {
      const processedKey = `auto-selection-processed-${windowId}`
      // Don't remove the suppression flag here - it needs to persist across window changes
      // const suppressKey = `suppress-auto-selection-toast-${windowId}`
      sessionStorage.removeItem(processedKey)
      // sessionStorage.removeItem(suppressKey)
      // Reset processing flag and last processed data
      isProcessingRef.current = false
      lastProcessedReturnDataRef.current = null
      effectRunCountRef.current = 0
      hasExecutedRef.current = false
      // Clear debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = null
      }
    }
  }, [windowId])
}
