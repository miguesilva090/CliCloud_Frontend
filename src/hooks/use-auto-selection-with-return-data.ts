import { useEffect } from 'react'
import { useAutoSelection } from './use-auto-selection'

interface UseAutoSelectionWithReturnDataProps {
  windowId: string
  instanceId: string
  data: any[]
  setValue: (value: string) => void
  refetch: () => Promise<any>
  itemName: string
  successMessage: string
  manualSelectionMessage: string
  queryKey: string[]
  returnDataKey: string
}

/**
 * A combined hook that handles both auto-selection and return data processing
 * for update forms that need to auto-select newly created entities from child windows.
 *
 * This hook combines the functionality of useAutoSelection and return data handling
 * to reduce code duplication in update forms.
 *
 * @example
 * ```tsx
 * useAutoSelectionWithReturnData({
 *   windowId,
 *   instanceId,
 *   data: distritosData || [],
 *   setValue: (value: string) => form.setValue('distritoId', value),
 *   refetch: refetchDistritos,
 *   itemName: 'Distrito',
 *   successMessage: 'Distrito selecionado automaticamente',
 *   manualSelectionMessage: 'Distrito criado com sucesso. Por favor, selecione-o manualmente.',
 *   queryKey: ['distritos-select'],
 *   returnDataKey: `return-data-${windowId}-distrito`,
 * })
 * ```
 */
export const useAutoSelectionWithReturnData = ({
  windowId,
  instanceId,
  data,
  setValue,
  refetch,
  itemName,
  successMessage,
  manualSelectionMessage,
  queryKey,
  returnDataKey,
}: UseAutoSelectionWithReturnDataProps) => {
  // Use the auto-selection hook for the main functionality
  useAutoSelection({
    windowId,
    instanceId,
    data,
    setValue,
    refetch,
    itemName,
    successMessage,
    manualSelectionMessage,
    queryKey,
  })

  // Handle return data from child windows
  // Note: This hook doesn't actually use the return data for auto-selection
  // It's just for logging/debugging. The actual auto-selection is handled by useAutoSelection
  useEffect(() => {
    const handleReturnData = () => {
      const returnData = sessionStorage.getItem(returnDataKey)

      if (returnData) {
        try {
          const parsedData = JSON.parse(returnData)
          console.log(
            `[RETURN-DATA-HOOK] Return data received for ${itemName}:`,
            parsedData,
            'key:',
            returnDataKey
          )
          // Don't remove it here - let useAutoSelection handle it
          // The useAutoSelection hook will find and use this data
        } catch (error) {
          console.error(`Error parsing return data for ${itemName}:`, error)
        }
      } else {
        // Check if data exists with different key patterns (parentWindowIdFromStorage, etc.)
        const normalizedItemName = itemName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ')
        const allReturnDataKeys = Object.keys(sessionStorage).filter(
          (key) =>
            key.startsWith('return-data-') && key.includes(normalizedItemName)
        )
        if (allReturnDataKeys.length > 0) {
          console.log(
            `[RETURN-DATA-HOOK] Found return-data keys for ${itemName} (but not with returnDataKey):`,
            allReturnDataKeys
          )
          allReturnDataKeys.forEach((key) => {
            const value = sessionStorage.getItem(key)
            console.log(`[RETURN-DATA-HOOK]   ${key}:`, value)
          })
        }
      }
    }

    // Listen for storage events (when data is set from another window)
    window.addEventListener('storage', handleReturnData)

    // Check for existing data on mount
    handleReturnData()

    return () => {
      window.removeEventListener('storage', handleReturnData)
    }
  }, [returnDataKey, itemName])
}
