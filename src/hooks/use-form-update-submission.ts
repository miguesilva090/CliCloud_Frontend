import { FieldValues } from 'react-hook-form'
import { UseMutationResult } from '@tanstack/react-query'
import { handleApiError } from '@/utils/error-handlers'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'

// ============================================================================
// FORM UPDATE SUBMISSION HOOK - Reusable form update submission logic
// ============================================================================

interface UseFormUpdateSubmissionProps<TFormValues extends FieldValues> {
  formId: string
  entityId: string
  mutation: UseMutationResult<any, unknown, any, unknown>
  successMessage: string
  errorMessage: string
  warningMessage: string
  modalClose: () => void
  updateFormState: (formId: string, updater: (state: any) => any) => void
  removeWindow: (windowId: string) => void
  windowId?: string
  prepareUpdateData?: (values: TFormValues) => any
}

/**
 * Custom hook that handles the common form update submission pattern.
 * This hook extracts the repetitive update submission logic that was duplicated
 * across all update forms.
 *
 * The pattern handles:
 * - Setting form submitting state
 * - Calling the update mutation with proper data structure
 * - Handling API response and showing appropriate messages
 * - Closing window and modal on success
 * - Error handling with toast notifications
 *
 * @param config Configuration object containing all necessary parameters
 */
export const useFormUpdateSubmission = <TFormValues extends FieldValues>({
  formId,
  entityId,
  mutation,
  successMessage,
  errorMessage,
  warningMessage,
  modalClose,
  updateFormState,
  removeWindow,
  windowId,
  prepareUpdateData,
}: UseFormUpdateSubmissionProps<TFormValues>) => {
  const onSubmit = async (values: TFormValues) => {
    try {
      // Update form state to show submitting status
      updateFormState(formId, (state) => ({
        ...state,
        isSubmitting: true,
      }))

      // Prepare the update data - either use custom preparer or default structure
      const updateData = prepareUpdateData
        ? prepareUpdateData(values)
        : {
            id: entityId,
            data: values,
          }

      // Call the API to update the entity
      const response = await mutation.mutateAsync(updateData)

      // Handle the API response and show appropriate messages
      const result = handleApiResponse(
        response,
        successMessage,
        errorMessage,
        warningMessage
      )

      if (result.success) {
        // Close the window if windowId is provided
        if (windowId) {
          removeWindow(windowId)
        }
        // Always call modalClose to close the modal
        modalClose()
      }
    } catch (error) {
      // Handle any errors that occur during submission
      toast.error(handleApiError(error, errorMessage))
    } finally {
      // Always reset the submitting state, regardless of success or failure
      updateFormState(formId, (state) => ({
        ...state,
        isSubmitting: false,
      }))
    }
  }

  return {
    onSubmit,
    isSubmitting: mutation.isPending,
  }
}
