# API Reference: ItemsController

**Controller Route**: `/api/Items`

This controller manages all CRUD (Create, Read, Update, Delete) operations for inventory items. All endpoints under this controller require authentication.

---

## 1. Create Item

Creates a new inventory item.

*   **Endpoint**: `POST /`
*   **Permissions**: Requires `Almoxarife` or `RH` role.

### Request Body (`CreateItemRequestDto`)

```json
{
  "name": "string",
  "sku": "string",
  "description": "string",
  "category": "string",
  "initialQuantity": 0,
  "expiryDate": "date-time"
}
```

### Responses

*   **`201 Created`**: The item was created successfully. The response body contains the newly created `ItemDto`.
*   **`400 Bad Request`**: The request is invalid (e.g., missing required fields, invalid data types).
*   **`409 Conflict`**: An item with the same `sku` already exists.
*   **`401 Unauthorized`**: The user is not authenticated.
*   **`403 Forbidden`**: The authenticated user does not have the required role.

---

## 2. Get Item by ID

Retrieves a single item by its unique identifier.

*   **Endpoint**: `GET /{id}`
*   **Permissions**: Requires authentication.

### Path Parameters

| Parameter | Type | Description               |
|-----------|------|---------------------------|
| `id`      | Guid | The unique ID of the item. |

### Responses

*   **`200 OK`**: The item was found. The response body contains the `ItemDto`.
*   **`404 Not Found`**: An item with the specified `id` was not found.
*   **`401 Unauthorized`**: The user is not authenticated.

---

## 3. Get All Items

Retrieves a paginated list of all inventory items.

*   **Endpoint**: `GET /`
*   **Permissions**: Requires authentication.

### Query Parameters

| Parameter      | Type    | Description                                                 |
|----------------|---------|-------------------------------------------------------------|
| `pageNumber`   | integer | The page number to retrieve (default: 1).                   |
| `pageSize`     | integer | The number of items per page (default: 10).                 |
| `searchTerm`   | string  | A term to filter items by name, SKU, or category.           |
| `sortBy`       | string  | The field to sort by (e.g., "name", "sku", "createdAt").    |
| `sortOrder`    | string  | The sort direction ("asc" or "desc").                       |

### Responses

*   **`200 OK`**: Returns a `PagedResult<ItemDto>` object containing the items and pagination metadata.
*   **`401 Unauthorized`**: The user is not authenticated.

---

## 4. Update Item

Updates the details of an existing item.

*   **Endpoint**: `PUT /{id}`
*   **Permissions**: Requires `Almoxarife` or `RH` role.

### Path Parameters

| Parameter | Type | Description               |
|-----------|------|---------------------------|
| `id`      | Guid | The unique ID of the item to update. |

### Request Body (`UpdateItemRequestDto`)

```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "expiryDate": "date-time"
}
```
**Note**: Only include the fields you wish to update. The `sku` and `stockQuantity` cannot be updated via this endpoint.

### Responses

*   **`204 No Content`**: The update was successful.
*   **`404 Not Found`**: An item with the specified `id` was not found.
*   **`400 Bad Request`**: The request body is invalid.
*   **`401 Unauthorized`**: The user is not authenticated.
*   **`403 Forbidden`**: The authenticated user does not have the required role.

---

## 5. Delete Item

Deletes an item from the inventory.

*   **Endpoint**: `DELETE /{id}`
*   **Permissions**: Requires `RH` role.

### Path Parameters

| Parameter | Type | Description               |
|-----------|------|---------------------------|
| `id`      | Guid | The unique ID of the item to delete. |

### Responses

*   **`204 No Content`**: The item was deleted successfully.
*   **`404 Not Found`**: An item with the specified `id` was not found.
*   **`409 Conflict`**: The item cannot be deleted because it has an associated movement history.
*   **`401 Unauthorized`**: The user is not authenticated.
*   **`403 Forbidden`**: The authenticated user does not have the required role.
