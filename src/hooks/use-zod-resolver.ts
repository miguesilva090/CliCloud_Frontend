import { ZodSchema } from 'zod'
import { Resolver } from 'react-hook-form'

// ============================================================================
// FORM VALIDATION HOOK - Reusable form validation logic
// ============================================================================

/**
 * Custom hook that creates a Zod-based resolver for react-hook-form.
 * This hook extracts the repetitive validation resolver logic that was duplicated
 * across all create and update forms.
 *
 * The pattern handles:
 * - Zod schema validation using safeParse
 * - Converting Zod validation errors to react-hook-form error format
 * - Proper error structure with type and message
 * - Type-safe validation with generic support
 *
 * @param schema The Zod schema to use for validation
 * @returns A resolver function compatible with react-hook-form
 */
export const useZodResolver = <T extends Record<string, any>>(
  schema: ZodSchema<T>
): Resolver<T> => {
  return async (values) => {
    // Validate the form values against the Zod schema
    const result = schema.safeParse(values)

    if (result.success) {
      // If validation passes, return the validated values with no errors
      return { values: result.data, errors: {} }
    }

    // If validation fails, convert Zod errors to react-hook-form format
    const errors: Record<string, any> = {}

    for (const issue of result.error.issues) {
      const field = String(issue.path[0] || '')
      if (!field) continue

      if (!errors[field]) {
        errors[field] = {
          type: issue.code || 'validation',
          message: issue.message,
        }
      }
    }

    return { values: {}, errors }
  }
}
