# Response Status Mapping

## API Response Format

The API returns numeric status codes:

```json
{
  "data": "08baf059-f301-4af1-5aaf-08de108d47ea",
  "status": 0,
  "messages": {}
}
```

## Status Code Mapping

- **0 = Success** → Green success toast
- **1 = PartialSuccess** → Orange warning toast
- **2 = Failure** → Red error toast

## Example Responses

### Success Response

```json
{
  "data": "entity-id",
  "status": 0,
  "messages": {},
  "succeeded": true
}
```

**Result**: Green toast "Operation successful"

### Partial Success Response

```json
{
  "data": "entity-id",
  "status": 1,
  "messages": {
    "$": ["Some items could not be processed"],
    "item_123": ["This item has dependencies"]
  },
  "succeeded": true
}
```

**Result**: Orange warning toast with specific messages

### Failure Response

```json
{
  "data": null,
  "status": 2,
  "messages": {
    "$": ["Operation failed completely"]
  },
  "succeeded": false
}
```

**Result**: Red error toast with error details

## Testing

Your example response `{"data":"08baf059-f301-4af1-5aaf-08de108d47ea","status":0,"messages":{}}` should now show a **green success toast** instead of a red error message.
