import { useEffect } from 'react'
import { UseFormReturn, FieldValues } from 'react-hook-form'

// ============================================================================
// FORM CHANGE TRACKING HOOK - Reusable form change tracking logic
// ============================================================================

interface FormChangeTrackingConfig<T extends FieldValues> {
  // Form identification and state
  formId: string
  effectiveWindowId: string

  // Form instance
  form: UseFormReturn<T>

  // Form state management
  setFormState: (formId: string, state: any) => void

  // Change detection
  defaultValues: T

  // Window management
  setWindowHasFormData: (windowId: string, hasData: boolean) => void
  updateCreateFormData: (
    windowId: string,
    value: T,
    setWindowHasFormData: (windowId: string, hasData: boolean) => void,
    defaultValues: T
  ) => void
  updateCreateWindowTitle: (
    windowId: string,
    nome: string,
    updateWindowState: (windowId: string, updates: any) => void
  ) => void
  updateWindowState: (windowId: string, updates: any) => void

  // Change detection utility
  detectFormChanges: (value: any, defaultValues: T) => boolean

  // Optional identifier field (defaults to 'nome')
  identifierField?: string

  // Optional callback to get display name for window title
  // If provided, this will be used instead of value[identifierField]
  getDisplayName?: (value: T) => string

  // Optional flag to enable/disable the hook (defaults to true)
  enabled?: boolean
}

/**
 * Custom hook that handles the common form change tracking pattern.
 * This hook extracts the repetitive change tracking logic that was duplicated
 * across all create and update forms.
 *
 * The pattern handles:
 * - Watching form changes using form.watch()
 * - Detecting changes by comparing with default values
 * - Updating form state (isDirty, isValid, isSubmitting, hasBeenModified)
 * - Updating window state (hasFormData flag, window title)
 * - Proper cleanup of subscriptions
 *
 * @param config Configuration object containing all necessary parameters
 */
export const useFormChangeTracking = <T extends FieldValues>({
  formId,
  effectiveWindowId,
  form,
  setFormState,
  defaultValues,
  setWindowHasFormData,
  updateCreateFormData,
  updateCreateWindowTitle,
  updateWindowState,
  detectFormChanges,
  identifierField = 'nome',
  getDisplayName,
  enabled = true,
}: FormChangeTrackingConfig<T>) => {
  // Save form data when it changes - this is the core of form persistence
  useEffect(() => {
    if (!enabled) return // Skip if disabled

    const subscription = form.watch((value) => {
      // Use proper change detection by comparing with default values
      // This determines if the form has been modified from its initial state
      const hasChanges = detectFormChanges(value, defaultValues)

      // Update the form store with current form state
      setFormState(formId, {
        formData: value as T,
        isDirty: hasChanges, // Whether form has unsaved changes
        isValid: form.formState.isValid, // Whether form passes validation
        isSubmitting: form.formState.isSubmitting, // Whether form is currently submitting
        hasBeenModified: hasChanges, // Whether form has been modified
      })

      // Update window hasFormData flag using the utility function
      // This tells the window manager that this window has form data
      if (effectiveWindowId) {
        updateCreateFormData(
          effectiveWindowId,
          value as T,
          setWindowHasFormData,
          defaultValues
        )
        // Update window title based on identifier field or display name callback
        // If getDisplayName is provided, use it to look up the display name
        // Otherwise, use the value of identifierField directly
        const displayName = getDisplayName
          ? getDisplayName(value as T)
          : value[identifierField]
        updateCreateWindowTitle(
          effectiveWindowId,
          displayName,
          updateWindowState
        )
      }
    })

    return () => subscription.unsubscribe() // Cleanup subscription on unmount
  }, [
    formId,
    effectiveWindowId,
    defaultValues,
    detectFormChanges,
    getDisplayName,
    enabled,
    // Note: We intentionally exclude 'form' and function references from dependencies
    // to prevent infinite loops. The form.watch subscription will handle updates.
  ])
}
