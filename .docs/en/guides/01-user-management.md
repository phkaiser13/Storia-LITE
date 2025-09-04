# Guide: User Management

This guide provides a comprehensive overview of the user management features in StorIA-LITE. It covers user registration, authentication, roles, and profile management.

## 1. User Registration

Creating a user account is the first step to interacting with the StorIA-LITE system. Registration is handled by the `POST /api/Auth/register` endpoint.

### Request Body

| Field      | Type   | Description                                     | Required |
|------------|--------|-------------------------------------------------|----------|
| `fullName` | string | The full name of the user.                      | Yes      |
| `email`    | string | The user's email address. Must be unique.       | Yes      |
| `password` | string | The user's password. Must meet complexity rules.| Yes      |
| `role`     | string | The role assigned to the user. See roles below. | Yes      |

**Password Complexity:**
The default password policy requires:
* At least 8 characters
* At least one uppercase letter
* At least one lowercase letter
* At least one number
* At least one special character (e.g., `!@#$%^&*`)

### Example Request

```http
POST /api/Auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "role": "Almoxarife"
}
```

### Response

If the registration is successful, the API will return a `201 Created` status code with the details of the newly created user (excluding the password).

```json
{
  "id": "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "role": "Almoxarife",
  "createdAt": "2023-10-27T10:00:00Z"
}
```

---

## 2. User Roles and Permissions

StorIA-LITE uses a Role-Based Access Control (RBAC) system to manage permissions. When a user is created, they are assigned a single role that determines what actions they can perform.

The available roles are:

| Role         | Description                                                                 | Key Permissions                                                              |
|--------------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------|
| **Almoxarife** | (Warehouse Manager) The standard user role for day-to-day inventory tasks.  | Create Items, Read Items, Update Items, Register Movements.                  |
| **Gestor**   | (Manager) A role with broader permissions, including reporting and viewing. | All `Almoxarife` permissions, plus access to dashboards and reports.         |
| **RH**       | (Human Resources) An administrative role with user management capabilities.   | All `Gestor` permissions, plus Create Users, Update Users, and Delete Items. |

Permissions are enforced at the API endpoint level using `[Authorize(Roles = "...")]` attributes. For example, deleting an item requires the `RH` role.

---

## 3. Authentication (Login)

Once a user is registered, they can authenticate by sending their credentials to the `POST /api/Auth/login` endpoint.

### Request Body

| Field      | Type   | Description                | Required |
|------------|--------|----------------------------|----------|
| `email`    | string | The user's email address.  | Yes      |
| `password` | string | The user's password.       | Yes      |

### Example Request

```http
POST /api/Auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

### Response

A successful login will return a `200 OK` status code and a response body containing a **JSON Web Token (JWT)**.

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI...",
  "expires": "2023-10-27T11:00:00Z",
  "user": {
    "id": "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "role": "Almoxarife"
  }
}
```

This `token` must be included in the `Authorization` header for all subsequent requests to protected endpoints.

**Header Format:** `Authorization: Bearer <your_jwt_token>`

---

## 4. Profile Management

Authenticated users can manage their own profiles.

### View Profile

*   **Endpoint**: `GET /api/Users/profile`
*   **Description**: Retrieves the profile information for the currently authenticated user.
*   **Response**: A `UserDto` object containing the user's details.

### Update Profile

*   **Endpoint**: `PUT /api/Users/profile`
*   **Description**: Updates the profile information for the currently authenticated user.
*   **Request Body**:
    ```json
    {
      "fullName": "John A. Doe",
      "email": "john.doe.new@example.com"
    }
    ```
*   **Response**: `204 No Content` on success.

### Change Password

*   **Endpoint**: `POST /api/Users/change-password`
*   **Description**: Allows an authenticated user to change their own password.
*   **Request Body**:
    ```json
    {
      "currentPassword": "Password123!",
      "newPassword": "NewPassword456!"
    }
    ```
*   **Response**: `204 No Content` on success.
