# Testing Partial Success Response Handling

## Overview

This document shows how to test the new partial success response handling in your application.

## Test Scenarios

### 1. Multiple Delete Freguesias Test

The freguesias table now supports partial success responses when deleting multiple items:

**What happens now:**

- **Full Success**: Green toast "Freguesias excluídas com sucesso"
- **Partial Success**: Orange warning toast "Algumas freguesias foram excluídas com avisos" + specific warning messages
- **Failure**: Red error toast "Erro ao excluir freguesias" + error details

### 2. API Response Examples

#### Full Success Response

```json
{
  "data": "success",
  "status": "Success",
  "succeeded": true,
  "messages": {}
}
```

#### Partial Success Response

```json
{
  "data": "partial_success",
  "status": "PartialSuccess",
  "succeeded": true,
  "messages": {
    "$": ["Some freguesias could not be deleted due to dependencies"],
    "freguesia_123": ["This freguesia has associated records"]
  }
}
```

#### Failure Response

```json
{
  "data": null,
  "status": "Failure",
  "succeeded": false,
  "messages": {
    "$": ["No freguesias could be deleted"]
  }
}
```

## How to Test

1. **Navigate to Freguesias page**
2. **Select multiple freguesias** for deletion
3. **Click the delete button**
4. **Observe the toast message**:
   - Green = All deleted successfully
   - Orange = Some deleted with warnings
   - Red = None deleted due to errors

## Expected Behavior

- **Success**: Shows green success toast, closes modal, refreshes table
- **Partial Success**: Shows orange warning toast with specific messages, closes modal, refreshes table
- **Failure**: Shows red error toast with error details, keeps modal open

## Code Changes Made

1. **Updated `useDeleteHandler`** in `table-utils.ts` to use `handleApiResponse()`
2. **Enhanced freguesias table** to support partial success messages
3. **Added backward compatibility** for existing delete operations

The system now automatically handles all three response types and shows appropriate user feedback.
