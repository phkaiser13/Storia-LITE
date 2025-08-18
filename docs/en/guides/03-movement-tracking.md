# Guide: Movement Tracking & Stock Control

Movement tracking is at the heart of StorIA-LITE's inventory control system. Every change in the stock quantity of an item is recorded as a "Movement." This creates a complete and auditable history of all items, showing who moved them, when, and why.

All endpoints in this guide require authentication.

## 1. Understanding Movements

There are two fundamental types of movements:

*   **`Entrada` (Entry)**: Represents an increase in stock. This occurs when new items are received, returned to the warehouse, or an initial stock count is registered. An `Entrada` movement **increases** the `stockQuantity` of the associated item.
*   **`Saida` (Exit)**: Represents a decrease in stock. This occurs when items are issued to a person or project, sold, or disposed of. A `Saida` movement **decreases** the `stockQuantity` of the associated item.

A `Movement` record links an `Item`, a `User`, and a `quantity` at a specific point in time.

## 2. Registering a New Movement

To register a stock movement, you send a request to the `POST /api/Movements` endpoint. The application service will then automatically update the `stockQuantity` of the corresponding item.

*   **Authorization**: Requires `Almoxarife` or `RH` role.

### Request Body

| Field         | Type    | Description                                                     | Required |
|---------------|---------|-----------------------------------------------------------------|----------|
| `itemId`      | Guid    | The unique identifier of the item being moved.                  | Yes      |
| `userId`      | Guid    | The ID of the user responsible for the movement.                | Yes      |
| `quantity`    | integer | The number of items being moved. Must be a positive integer.    | Yes      |
| `type`        | string  | The type of movement. Must be either `Entrada` or `Saida`.      | Yes      |
| `reason`      | string  | An optional reason or note for the movement (e.g., "Received from supplier X"). | No       |

### Example Request (Stock Entry)

```http
POST /api/Movements
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "itemId": "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
  "userId": "f0e9d8c7-b6a5-f4e3-d2c1-b0a9f8e7d6c5",
  "quantity": 50,
  "type": "Entrada",
  "reason": "Quarterly stock replenishment"
}
```

### Business Rules & Responses

*   **Successful Movement**: Returns a `201 Created` status with the details of the new `MovementDto`. The `stockQuantity` of the item with ID `a1b2c3d4-...` will be increased by 50.
*   **Insufficient Stock**: If you attempt to register a `Saida` movement for a quantity greater than the item's current `stockQuantity`, the API will return a `400 Bad Request` with an error message like "Insufficient stock to perform the withdrawal."
*   **Invalid Item/User**: If the `itemId` or `userId` does not exist, the API will return a `400 Bad Request`.

---

## 3. Retrieving Movement History

You can retrieve a paginated list of all movements, which can be filtered to see the history for a specific item, user, or time period.

*   **Endpoint**: `GET /api/Movements`
*   **Description**: Retrieves a list of all movements with support for pagination and filtering.
*   **Query Parameters**:
    *   `pageNumber` (integer, default: 1): The page number to retrieve.
    *   `pageSize` (integer, default: 10): The number of items per page.
    *   `itemId` (Guid): Filter the history for a specific item.
    *   `userId` (Guid): Filter the history for a specific user.
    *   `startDate` (DateTime): Filter movements on or after this date.
    *   `endDate` (DateTime): Filter movements on or before this date.

### Example Request

To get the movement history for a specific item during the month of October 2023:
`GET /api/Movements?itemId=a1b2c3d4-...&startDate=2023-10-01&endDate=2023-10-31`

### Response

The response is a `PagedResult` object containing the list of movements and pagination metadata. Each movement in the list provides full details, including the associated item and user information.

```json
{
  "items": [
    {
      "id": "m1v2c3d4-...",
      "quantity": 50,
      "movementDate": "2023-10-15T14:30:00Z",
      "type": "Entrada",
      "reason": "Quarterly stock replenishment",
      "item": {
        "id": "a1b2c3d4-...",
        "name": "3M N95 Respirator Mask",
        "sku": "3M-N95-8210"
      },
      "user": {
        "id": "f0e9d8c7-...",
        "fullName": "Jane Smith"
      }
    }
  ],
  "totalCount": 1,
  "pageNumber": 1,
  "pageSize": 10,
  ...
}
```
