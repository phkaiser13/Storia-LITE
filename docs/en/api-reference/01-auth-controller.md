# API Reference: AuthController

**Controller Route**: `/api/Auth`

This controller handles user authentication and registration.

---

## 1. Register User

Creates a new user account.

*   **Endpoint**: `POST /register`
*   **Description**: Registers a new user with a specified role. The email address must be unique.
*   **Permissions**: Public (No authentication required).

### Request Body

```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "role": "string"
}
```

| Field      | Type   | Constraints | Description                                     |
|------------|--------|-------------|-------------------------------------------------|
| `fullName` | string | Required    | The full name of the user.                      |
| `email`    | string | Required, Unique | The user's email address.                     |
| `password` | string | Required, Complex | The user's password.                            |
| `role`     | string | Required    | The user's role (e.g., `Almoxarife`, `RH`).     |

### Responses

*   **`201 Created`**: The user was created successfully. The response body contains the `UserDto`.
    ```json
    {
      "id": "guid",
      "fullName": "string",
      "email": "string",
      "role": "string",
      "createdAt": "date-time"
    }
    ```
*   **`400 Bad Request`**: The request is invalid (e.g., missing fields, password too weak). The response body contains validation errors.
*   **`409 Conflict`**: An account with the provided email already exists.

---

## 2. Login User

Authenticates a user and returns a JSON Web Token (JWT).

*   **Endpoint**: `POST /login`
*   **Description**: Validates user credentials and issues a JWT for accessing protected resources.
*   **Permissions**: Public (No authentication required).

### Request Body

```json
{
  "email": "string",
  "password": "string"
}
```

| Field      | Type   | Constraints | Description             |
|------------|--------|-------------|-------------------------|
| `email`    | string | Required    | The user's email address. |
| `password` | string | Required    | The user's password.    |

### Responses

*   **`200 OK`**: Login was successful. The response body contains the `AuthResultDto`.
    ```json
    {
      "token": "string",
      "expires": "date-time",
      "user": {
        "id": "guid",
        "fullName": "string",
        "email": "string",
        "role": "string"
      }
    }
    ```
*   **`401 Unauthorized`**: Invalid credentials (email or password are incorrect).
*   **`400 Bad Request`**: The request is invalid.

---

## 3. Refresh Token (Future Implementation)

*   **Endpoint**: `POST /refresh-token`
*   **Description**: This endpoint is reserved for a future enhancement to allow clients to refresh an expired JWT using a refresh token, improving security and user experience.
*   **Status**: Not yet implemented.
