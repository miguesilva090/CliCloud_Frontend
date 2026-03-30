import { useMemo } from 'react'

interface UseSelectValuePreservationProps {
  value: string | undefined
  options: Array<{ id: string } | { value: string }>
  isLoading: boolean
  onChange: (value: string | undefined) => void
}

type SelectValueChangeHandler = (value: string) => void

/**
 * Custom hook to preserve Select component values during loading states.
 *
 * Why this is needed:
 * - Radix UI's Select component validates that the value exists in the rendered SelectItem children
 * - During loading, the options array is empty, causing Select to clear the value
 * - This hook prevents accidental clearing by checking if value exists in options
 *
 * Why Autocomplete doesn't need this:
 * - Autocomplete stores value separately from displayed text (inputValue state)
 * - It uses useEffect to sync inputValue with selectedOption.label when options load
 * - The value persists even when options are empty during loading
 * - No validation against options array - it just displays the label if found
 *
 * @example
 * ```tsx
 * const { selectValue, handleValueChange } = useSelectValuePreservation({
 *   value: field.value,
 *   options: sortedEpocas,
 *   isLoading: isLoadingEpocas,
 *   onChange: field.onChange,
 * })
 *
 * <Select
 *   value={selectValue}
 *   onValueChange={handleValueChange}
 *   disabled={isLoadingEpocas}
 * >
 * ```
 */
export function useSelectValuePreservation({
  value,
  options,
  isLoading,
  onChange,
}: UseSelectValuePreservationProps) {
  const valueExistsInOptions = useMemo(
    () =>
      value &&
      options.some(
        (option) => ('id' in option ? option.id : option.value) === value
      ),
    [value, options]
  )

  const selectValue = value || undefined

  const handleValueChange: SelectValueChangeHandler = (newValue: string) => {
    // Don't clear if options are still loading
    if (!newValue && isLoading && value) {
      return
    }
    // Don't clear if value doesn't exist in options yet (might load later)
    if (!newValue && !isLoading && !valueExistsInOptions && value) {
      return
    }
    // Allow the change (convert empty string to undefined for form state)
    onChange(newValue || undefined)
  }

  return {
    selectValue,
    handleValueChange,
  }
}
