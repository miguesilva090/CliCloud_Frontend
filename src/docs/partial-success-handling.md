# Partial Success Response Handling

This document explains how to handle the new `PartialSuccess` response status in your forms.

## Overview

The API now supports three response statuses:

- `Success` - Full success, show green success message
- `PartialSuccess` - Partial success with warnings, show orange warning message
- `Failure` - Complete failure, show red error message

## Usage in Forms

### Before (Old Way)

```typescript
const response = await createEntityMutation.mutateAsync(values)

if (response.info.succeeded) {
  toast.success('Entity created successfully')
  // Handle success...
} else {
  toast.error(getErrorMessage(response, 'Error creating entity'))
}
```

### After (New Way)

```typescript
import { handleApiResponse } from '@/utils/response-handlers'

const response = await createEntityMutation.mutateAsync(values)

const result = handleApiResponse(
  response,
  'Entity created successfully', // Success message
  'Error creating entity', // Error message
  'Entity created with warnings' // Partial success message
)

if (result.success) {
  // Handle success (works for both full success and partial success)
  // result.isPartialSuccess will be true if it was a partial success
  // result.data contains the response data
}
```

## Response Structure

The new API response structure:

```typescript
{
  data: T,
  messages: Record<string, string[]>,  // Field-specific messages
  status: ResponseStatus,              // Success | PartialSuccess | Failure
  succeeded: boolean                   // Backward compatibility
}
```

## Toast Messages

- **Success**: Green toast with success icon
- **Partial Success**: Orange toast with warning icon
- **Error**: Red toast with error icon

## Utility Functions

- `handleApiResponse()` - Main function to handle all response types
- `isPartialSuccess()` - Check if response is partial success
- `isFullSuccess()` - Check if response is full success
- `isFailure()` - Check if response is failure
- `getPartialSuccessMessage()` - Extract partial success messages
