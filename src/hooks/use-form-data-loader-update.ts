import { useEffect, useRef } from 'react'
import { UseFormReturn, FieldValues } from 'react-hook-form'

interface ArraySortConfig {
  /** Name of the array field to sort (e.g., 'items') */
  fieldName: string
  /** Field to sort by (defaults to 'createdOn') */
  sortByField?: string
}

interface UseFormDataLoaderUpdateOptions<T extends FieldValues> {
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
  /** The API data to use as fallback when no saved data exists */
  apiData?: any
  /** Array fields to sort by a specific field (e.g., createdOn date - oldest first) */
  arraySortConfigs?: ArraySortConfig[]
  /** Optional callback to transform saved form data before loading into form (e.g., convert date strings to Date objects) */
  transformFormData?: (formData: any) => Partial<T>
  /** Optional callback to transform API data before loading into form */
  transformApiData?: (apiData: any) => Partial<T>
  /** Optional callback to synchronize local state after form data is loaded */
  onDataLoaded?: (data: any) => void
  /** Optional callback to execute after API data is loaded (e.g., auto-calculations) */
  onApiDataLoaded?: () => void
}

/**
 * Custom hook to load saved form data for update forms.
 * This hook handles the common pattern of:
 * 1. Loading saved form data if available after initialization
 * 2. Loading API data as fallback when no saved data exists
 * 3. Sorting array fields by a specific field (e.g., createdOn date)
 * 4. Transforming API data before loading into form
 * 5. Synchronizing local state variables after data is loaded
 * 6. Running post-load operations (e.g., calculations)
 *
 * @example
 * ```tsx
 * useFormDataLoaderUpdate({
 *   form,
 *   formData,
 *   isInitialized,
 *   formId,
 *   hasFormData,
 *   apiData: userData?.info?.data,
 *   arraySortConfigs: [{ fieldName: 'contacts' }],
 *   transformApiData: (apiData) => ({
 *     nome: apiData.nome,
 *     email: apiData.email,
 *     contacts: apiData.contacts.map(c => ({ ...c, date: new Date(c.date) }))
 *   }),
 *   onDataLoaded: (data) => {
 *     if (data.paisId) setSelectedPaisId(data.paisId)
 *   },
 *   onApiDataLoaded: () => {
 *     calculateTotals()
 *   }
 * })
 * ```
 */
export function useFormDataLoaderUpdate<T extends FieldValues>({
  form,
  formData,
  isInitialized,
  formId,
  hasFormData,
  apiData,
  arraySortConfigs = [],
  transformFormData,
  transformApiData,
  onDataLoaded,
  onApiDataLoaded,
}: UseFormDataLoaderUpdateOptions<T>) {
  // Use refs to store callbacks and configs to avoid infinite loops
  const onDataLoadedRef = useRef(onDataLoaded)
  const onApiDataLoadedRef = useRef(onApiDataLoaded)
  const arraySortConfigsRef = useRef(arraySortConfigs)
  const transformFormDataRef = useRef(transformFormData)
  const transformApiDataRef = useRef(transformApiData)
  const hasFormDataRef = useRef(hasFormData)

  // CRITICAL: Store initial apiData in a ref and NEVER update it
  // This ensures we only load data once, preventing flash of old data
  // When component remounts, refs reset automatically, so we capture new data
  const initialApiDataRef = useRef<any>(null)
  const initialFormDataRef = useRef<any>(null)
  const hasLoadedDataRef = useRef(false)
  const formIdRef = useRef<string>(formId)

  // CRITICAL: If formId changes, component remounted - reset everything
  if (formIdRef.current !== formId) {
    formIdRef.current = formId
    hasLoadedDataRef.current = false
    initialApiDataRef.current = null
    initialFormDataRef.current = null
  }

  // Capture initial apiData only once when it becomes available
  // When component remounts, refs reset, so we capture new data naturally
  if (initialApiDataRef.current === null && apiData !== undefined) {
    initialApiDataRef.current = apiData
  }

  // Capture initial formData only once when it becomes available
  if (initialFormDataRef.current === null && formData !== undefined) {
    initialFormDataRef.current = formData
  }

  // Update refs when values change
  useEffect(() => {
    onDataLoadedRef.current = onDataLoaded
    onApiDataLoadedRef.current = onApiDataLoaded
    arraySortConfigsRef.current = arraySortConfigs
    transformFormDataRef.current = transformFormData
    transformApiDataRef.current = transformApiData
    hasFormDataRef.current = hasFormData
  })

  // CRITICAL: This effect should ONLY run once when form is initialized
  // It should NOT re-run when apiData or formData changes
  useEffect(() => {
    // Only proceed if form is initialized and we haven't loaded data yet
    if (!isInitialized) {
      return
    }

    if (hasLoadedDataRef.current) {
      return
    }

    // Use refs to check for saved form data - this prevents re-running when props change
    const hasSavedData = hasFormDataRef.current(formId)
    const savedFormData = initialFormDataRef.current

    if (hasSavedData && savedFormData) {
      // Transform saved form data if transformer is provided (e.g., convert date strings to Date objects)
      let dataToLoad: any = savedFormData
      if (transformFormDataRef.current) {
        dataToLoad = transformFormDataRef.current(savedFormData)
      }

      // Load saved form data from store
      form.reset(dataToLoad as T)
      hasLoadedDataRef.current = true

      // Call the callback to synchronize local state if provided
      if (onDataLoadedRef.current) {
        onDataLoadedRef.current(dataToLoad)
      }
    } else if (initialApiDataRef.current) {
      // Use ref instead of prop - NEVER use apiData prop directly
      // No saved data, use initial API data as fallback
      let dataToLoad: any = initialApiDataRef.current

      // Transform API data if transformer is provided
      if (transformApiDataRef.current) {
        dataToLoad = transformApiDataRef.current(initialApiDataRef.current)
      } else {
        // Default: create a copy to avoid mutating original
        dataToLoad = { ...initialApiDataRef.current }
      }

      // Sort array fields by specified field if configured
      arraySortConfigsRef.current.forEach(
        ({ fieldName, sortByField = 'createdOn' }) => {
          if (dataToLoad && Array.isArray(dataToLoad[fieldName])) {
            dataToLoad[fieldName] = dataToLoad[fieldName]
              .slice()
              .sort((a, b) => {
                const valueA = a[sortByField]
                const valueB = b[sortByField]

                // Handle date comparison
                if (valueA && valueB) {
                  const timeA = new Date(valueA).getTime()
                  const timeB = new Date(valueB).getTime()
                  if (!isNaN(timeA) && !isNaN(timeB)) {
                    return timeA - timeB
                  }
                }
                return 0
              })
          }
        }
      )

      form.reset(dataToLoad as T)
      hasLoadedDataRef.current = true

      // Call the post-API-load callback if provided
      if (onApiDataLoadedRef.current) {
        // Use setTimeout to ensure the form is fully reset before running calculations
        setTimeout(() => onApiDataLoadedRef.current!(), 0)
      }
    }
    // CRITICAL: Include formId to detect remounting
    // When formId changes, component remounted and we should load new data
    // DO NOT include apiData or formData in dependencies to prevent unnecessary re-runs
  }, [isInitialized, formId, form])
}
