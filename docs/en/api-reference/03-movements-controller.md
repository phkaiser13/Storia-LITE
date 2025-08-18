# API Reference: MovementsController

**Controller Route**: `/api/Movements`

This controller is responsible for creating and retrieving stock movement records. Movements are the foundation of the inventory audit trail.

---

## 1. Register Movement

Creates a new stock movement record, which in turn updates the `stockQuantity` of the associated item.

*   **Endpoint**: `POST /`
*   **Permissions**: Requires `Almoxarife` or `RH` role.

### Request Body (`RegisterMovementRequestDto`)

```json
{
  "itemId": "guid",
  "userId": "guid",
  "quantity": 0,
  "type": "string",
  "reason": "string"
}
```

| Field      | Type    | Constraints | Description                                                  |
|------------|---------|-------------|--------------------------------------------------------------|
| `itemId`   | Guid    | Required    | The unique ID of the item being moved.                       |
| `userId`   | Guid    | Required    | The ID of the user responsible for the movement.             |
| `quantity` | integer | Required, > 0 | The number of items moved. Must be a positive integer.       |
| `type`     | string  | Required    | The type of movement: `Entrada` (Entry) or `Saida` (Exit).   |
| `reason`   | string  | Optional    | An optional note describing the reason for the movement.     |

### Responses

*   **`201 Created`**: The movement was registered successfully. The response body contains the new `MovementDto`.
*   **`400 Bad Request`**: The request is invalid. This can be due to:
    *   Missing or invalid fields.
    *   An invalid `itemId` or `userId`.
    *   Attempting a `Saida` movement with a quantity greater than the available stock (`Insufficient stock...`).
*   **`401 Unauthorized`**: The user is not authenticated.
*   **`403 Forbidden`**: The authenticated user does not have the required role.

---

## 2. Get All Movements

Retrieves a paginated list of all stock movements, with powerful filtering capabilities.

*   **Endpoint**: `GET /`
*   **Permissions**: Requires authentication.

### Query Parameters

| Parameter      | Type     | Description                                               |
|----------------|----------|-----------------------------------------------------------|
| `pageNumber`   | integer  | The page number to retrieve (default: 1).                 |
| `pageSize`     | integer  | The number of movements per page (default: 10).           |
| `itemId`       | Guid     | Filters movements for a single item.                      |
| `userId`       | Guid     | Filters movements performed by a single user.             |
| `startDate`    | DateTime | Filters for movements on or after this date (inclusive).  |
| `endDate`      | DateTime | Filters for movements on or before this date (inclusive). |

### Responses

*   **`200 OK`**: Returns a `PagedResult<MovementDto>` object containing the movement records and pagination metadata.
    ```json
    {
      "items": [
        {
          "id": "guid",
          "quantity": 0,
          "movementDate": "date-time",
          "type": "string",
          "reason": "string",
          "item": {
            "id": "guid",
            "name": "string",
            "sku": "string"
          },
          "user": {
            "id": "guid",
            "fullName": "string"
          }
        }
      ],
      "totalCount": 0,
      "pageNumber": 0,
      "pageSize": 0,
      "totalPages": 0,
      "hasNextPage": true,
      "hasPreviousPage": true
    }
    ```
*   **`401 Unauthorized`**: The user is not authenticated.
