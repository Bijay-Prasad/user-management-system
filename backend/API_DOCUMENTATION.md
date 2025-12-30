# Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ],
  "statusCode": 400
}
```

## Authentication
All protected endpoints require authentication via:
- **Authorization Header**: `Authorization: Bearer <token>`
- **Cookie**: `token=<jwt_token>`

## Endpoints

### Authentication

#### POST /auth/signup
Register a new user account.

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Validation Rules**:
- `fullName`: Required, minimum 2 characters
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters, must contain uppercase, lowercase, number, and special character
- `confirmPassword`: Required, must match password

**Success Response** (201):
```json
{
  "success": true,
  "message": "Signup successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active"
  }
}
```

**Error Responses**:
- `400`: Validation failed
- `409`: Email already registered

---

#### POST /auth/login
Login to an existing account.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active"
  }
}
```

**Error Responses**:
- `400`: Validation failed
- `401`: Invalid email or password
- `403`: Account is inactive

---

#### POST /auth/logout
Logout current user.

**Success Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET /auth/me
Get current user information.

**Headers**: `Authorization: Bearer <token>`

**Success Response** (200):
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active",
    "lastLogin": "2025-12-30T07:20:00.000Z",
    "createdAt": "2025-12-29T10:00:00.000Z",
    "updatedAt": "2025-12-30T07:20:00.000Z"
  }
}
```

**Error Responses**:
- `401`: No token provided / Invalid token
- `404`: User not found

---

### User Management

#### GET /users
Get all users with pagination (Admin only).

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**:
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 10

**Example**: `/api/users?page=2&limit=10`

**Success Response** (200):
```json
{
  "success": true,
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "lastLogin": "2025-12-30T07:20:00.000Z",
      "createdAt": "2025-12-29T10:00:00.000Z",
      "updatedAt": "2025-12-30T07:20:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 2,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

**Error Responses**:
- `401`: No token provided / Invalid token
- `403`: Admin role required

---

#### PATCH /users/:id/status
Toggle user account status (Admin only).

**Headers**: `Authorization: Bearer <admin_token>`

**URL Parameters**:
- `id`: User ID to toggle

**Success Response** (200):
```json
{
  "success": true,
  "message": "User activated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active"
  }
}
```

**Error Responses**:
- `400`: Cannot change your own account status
- `401`: No token provided / Invalid token
- `403`: Admin role required
- `404`: User not found

---

#### PUT /users/me
Update own profile information.

**Headers**: `Authorization: Bearer <token>`

**Request Body** (all fields optional):
```json
{
  "fullName": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Validation Rules**:
- `fullName`: Optional, minimum 2 characters
- `email`: Optional, valid email format, must be unique
- Cannot modify: `role`, `status`, `password`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Smith",
    "email": "johnsmith@example.com",
    "role": "user",
    "status": "active"
  }
}
```

**Error Responses**:
- `400`: Validation failed
- `401`: No token provided / Invalid token
- `404`: User not found
- `409`: Email already in use

---

#### PUT /users/me/password
Change account password.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "oldPassword": "OldSecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Validation Rules**:
- `oldPassword`: Required
- `newPassword`: Required, minimum 8 characters, must contain uppercase, lowercase, number, and special character
- `confirmPassword`: Required, must match newPassword
- New password must be different from old password

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses**:
- `400`: Validation failed
- `401`: Current password is incorrect / No token provided / Invalid token
- `404`: User not found

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Validation failed or invalid input |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

## Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

## Token Information
- **Expiry**: 7 days
- **Storage**: Can be stored in localStorage (use Authorization header) or cookies
- **Format**: JWT (JSON Web Token)
- **Payload**: `{ id: userId, role: userRole }`
