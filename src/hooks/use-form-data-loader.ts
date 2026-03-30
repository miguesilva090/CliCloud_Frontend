import { useEffect, useRef } from 'react'
import { UseFormReturn, FieldValues } from 'react-hook-form'

interface ArraySortConfig {
  /** Name of the array field to sort (e.g., 'items') */
  fieldName: string
  /** Field to sort by (defaults to 'createdOn') */
  sortByField?: string
}

interface UseFormDataLoaderOptions<T extends FieldValues> {
  /** The react-hook-form form instance */
  form: UseFormReturn<T>
  /** The saved form data from the store */
  formData: any
  /** Whether the form has been initialized */
  isInitialized: boolean
  /** The unique form identifier */
  formId: string
  /** Function to check if form data exists */
  hasFormData: (formId: string) => boolean
  /** Array fields to sort by createdOn date (oldest first) */
  arraySortConfigs?: ArraySortConfig[]
  /** Optional fallback values to use when there's no saved data */
  fallbackValues?: Partial<T>
  /** Optional condition to apply fallback values (e.g., preSelectedId exists) */
  shouldApplyFallback?: boolean
  /** Optional callback to synchronize local state after form data is loaded */
  onDataLoaded?: (data: any) => void
}

/**
 * Custom hook to load saved form data for create forms.
 * This hook handles the common pattern of:
 * 1. Loading saved form data if available after initialization
 * 2. Sorting array fields by createdOn date
 * 3. Applying fallback values when no saved data exists
 * 4. Synchronizing local state variables after data is loaded
 *
 * @example
 * ```tsx
 * useFormDataLoader({
 *   form,
 *   formData,
 *   isInitialized,
 *   formId,
 *   hasFormData,
 *   arraySortConfigs: [{ fieldName: 'items' }],
 *   fallbackValues: {
 *     nome: initialNome || '',
 *     talhaoId: '',
 *   },
 *   shouldApplyFallback: !!preSelectedId || !!initialNome,
 *   onDataLoaded: (data) => {
 *     if (data.paisId) setSelectedPaisId(data.paisId)
 *   }
 * })
 * ```
 */
export function useFormDataLoader<T extends FieldValues>({
  form,
  formData,
  isInitialized,
  formId,
  hasFormData,
  arraySortConfigs = [],
  fallbackValues,
  shouldApplyFallback = false,
  onDataLoaded,
}: UseFormDataLoaderOptions<T>) {
  // Use refs to store callbacks and configs to avoid infinite loops
  const onDataLoadedRef = useRef(onDataLoaded)
  const arraySortConfigsRef = useRef(arraySortConfigs)
  const fallbackValuesRef = useRef(fallbackValues)
  const hasLoadedDataRef = useRef(false)
  const formIdRef = useRef<string>(formId)

  // CRITICAL: If formId changes, component remounted - reset everything
  if (formIdRef.current !== formId) {
    formIdRef.current = formId
    hasLoadedDataRef.current = false
  }

  // Update refs when values change
  useEffect(() => {
    onDataLoadedRef.current = onDataLoaded
    arraySortConfigsRef.current = arraySortConfigs
    fallbackValuesRef.current = fallbackValues
  })

  useEffect(() => {
    // Only proceed if form is initialized and we haven't loaded data yet
    if (!isInitialized || hasLoadedDataRef.current) {
      return
    }

    // Use refs to check for saved form data - this prevents re-running when props change
    const hasSavedData = hasFormData(formId)
    const savedFormData = formData

    if (hasSavedData && savedFormData) {
      // Create a copy of formData to avoid mutating the original
      const dataToLoad = { ...savedFormData }

      // Sort array fields by createdOn date (oldest first) if configured
      arraySortConfigsRef.current.forEach(
        ({ fieldName, sortByField = 'createdOn' }) => {
          if (dataToLoad && Array.isArray(dataToLoad[fieldName])) {
            dataToLoad[fieldName] = dataToLoad[fieldName]
              .slice()
              .sort((a, b) => {
                const dateA = new Date(a[sortByField] ?? '').getTime()
                const dateB = new Date(b[sortByField] ?? '').getTime()
                return dateA - dateB
              })
          }
        }
      )

      form.reset(dataToLoad as T)
      hasLoadedDataRef.current = true

      // Call the callback to synchronize local state if provided
      if (onDataLoadedRef.current) {
        // Use setTimeout to ensure form.reset() completes before callback
        setTimeout(() => {
          onDataLoadedRef.current?.(dataToLoad)
        }, 0)
      }
    } else if (
      shouldApplyFallback &&
      fallbackValuesRef.current &&
      !hasSavedData
    ) {
      // If no saved data but we have fallback values and should apply them
      // CRITICAL: Only apply fallback if there's no persisted data
      form.reset(fallbackValuesRef.current as T)
      hasLoadedDataRef.current = true
    }
  }, [formData, isInitialized, formId, hasFormData, shouldApplyFallback, form])
}
