# Guide: Item & Inventory Management

This guide covers all operations related to managing items in your StorIA-LITE inventory. Items are the core entities representing the products, materials, or assets you want to track.

All endpoints in this guide require authentication. You must include a valid JWT in the `Authorization` header.

## 1. The Item Data Model

An `Item` in StorIA-LITE has the following properties:

| Field           | Type     | Description                                                                 |
|-----------------|----------|-----------------------------------------------------------------------------|
| `id`            | Guid     | The unique identifier for the item.                                         |
| `name`          | string   | The name of the item (e.g., "V-Gard Safety Helmet").                        |
| `sku`           | string   | The Stock Keeping Unit. Must be unique across all items.                    |
| `description`   | string   | A detailed description of the item.                                         |
| `category`      | string   | The category the item belongs to (e.g., "PPE", "Hand Tool").                |
| `stockQuantity` | integer  | The current quantity of the item in stock. This is read-only in most DTOs.  |
| `expiryDate`    | DateTime | The expiration date of the item. Can be null for non-perishable goods.      |
| `createdAt`     | DateTime | The timestamp when the item was created.                                    |
| `updatedAt`     | DateTime | The timestamp of the last update.                                           |

---

## 2. Creating a New Item

To add a new item to the inventory, you send a request to the `POST /api/Items` endpoint.

*   **Authorization**: Requires `Almoxarife` or `RH` role.

### Request Body

| Field           | Type    | Description                                       | Required |
|-----------------|---------|---------------------------------------------------|----------|
| `name`          | string  | The name of the item.                             | Yes      |
| `sku`           | string  | The unique SKU for the item.                      | Yes      |
| `description`   | string  | A description for the item.                       | Yes      |
| `category`      | string  | The item's category.                              | Yes      |
| `initialQuantity`| integer | The starting quantity for the item.               | Yes      |
| `expiryDate`    | DateTime| The expiration date, if applicable.               | No       |

### Example Request

```http
POST /api/Items
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "name": "3M N95 Respirator Mask",
  "sku": "3M-N95-8210",
  "description": "Standard N95 respirator for dust and particles.",
  "category": "PPE",
  "initialQuantity": 500,
  "expiryDate": "2025-12-31T00:00:00Z"
}
```

### Response

A successful creation returns a `201 Created` status with the full `ItemDto` of the newly created item.

---

## 3. Retrieving Items

You can retrieve a single item by its ID or a paginated list of all items.

### Get Item by ID

*   **Endpoint**: `GET /api/Items/{id}`
*   **Description**: Retrieves a single item by its unique identifier.
*   **Response**: An `ItemDto` object.

### Get All Items (Paginated)

*   **Endpoint**: `GET /api/Items`
*   **Description**: Retrieves a list of items with support for pagination, searching, and sorting.
*   **Query Parameters**:
    *   `pageNumber` (integer, default: 1): The page number to retrieve.
    *   `pageSize` (integer, default: 10): The number of items per page.
    *   `searchTerm` (string): A search term to filter items by name, SKU, or category.
    *   `sortBy` (string, e.g., "name"): The field to sort by.
    *   `sortOrder` (string, "asc" or "desc"): The sort order.

### Example Request (Get All)

`GET /api/Items?pageNumber=1&pageSize=20&searchTerm=Respirator&sortBy=name&sortOrder=asc`

### Response (Get All)

The response is a `PagedResult` object containing the list of items and pagination metadata.

```json
{
  "items": [
    {
      "id": "...",
      "name": "3M N95 Respirator Mask",
      "sku": "3M-N95-8210",
      ...
    }
  ],
  "totalCount": 1,
  "pageNumber": 1,
  "pageSize": 20,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

---

## 4. Updating an Item

To update an existing item's details, send a `PUT` request to ` /api/Items/{id}`.

*   **Authorization**: Requires `Almoxarife` or `RH` role.

### Request Body

You only need to include the fields you want to update.

| Field         | Type    | Description                   | Required |
|---------------|---------|-------------------------------|----------|
| `name`        | string  | The new name for the item.    | No       |
| `description` | string  | The new description.          | No       |
| `category`    | string  | The new category.             | No       |
| `expiryDate`  | DateTime| The new expiration date.      | No       |

**Note**: You cannot update the `sku` or `stockQuantity` directly via this endpoint. Stock quantity is managed through the [Movement Tracking](./03-movement-tracking.md) system.

### Example Request

```http
PUT /api/Items/a1b2c3d4-e5f6...
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "description": "Standard N95 respirator for dust and airborne particles. Pack of 20.",
  "category": "Safety Equipment"
}
```

### Response

A successful update returns a `204 No Content` status code.

---

## 5. Deleting an Item

To delete an item, send a `DELETE` request to `/api/Items/{id}`.

*   **Authorization**: Requires `RH` role.

### Business Rule

An item **cannot be deleted** if it has any movement history associated with it. This is a critical business rule to maintain data integrity and a complete audit trail. If you attempt to delete an item that has been checked in or out, the API will return a `409 Conflict` error.

### Response

*   **`204 No Content`**: If the deletion was successful.
*   **`404 Not Found`**: If the item with the specified ID does not exist.
*   **`409 Conflict`**: If the item cannot be deleted due to its movement history.
