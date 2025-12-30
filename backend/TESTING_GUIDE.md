# Backend Testing Guide

## Method 1: Using Postman (Recommended)

### Setup
1. Download and install [Postman](https://www.postman.com/downloads/)
2. Start your backend server:
   ```bash
   cd backend
   npm start
   ```
3. Server should be running on `http://localhost:5000`

### Test Sequence

#### 1. Health Check
**GET** `http://localhost:5000/`

Expected Response:
```json
{
  "success": true,
  "message": "User Management System API",
  "status": "running",
  "version": "1.0.0"
}
```

---

#### 2. Signup (Create User)
**POST** `http://localhost:5000/api/auth/signup`

Headers:
```
Content-Type: application/json
```

Body (JSON):
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

Expected Response (201):
```json
{
  "success": true,
  "message": "Signup successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active"
  }
}
```

**Copy the token from the response!**

---

#### 3. Test Validation (Weak Password)
**POST** `http://localhost:5000/api/auth/signup`

Body (JSON):
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "weak",
  "confirmPassword": "weak"
}
```

Expected Response (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

---

#### 4. Login
**POST** `http://localhost:5000/api/auth/login`

Body (JSON):
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Expected Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

#### 5. Get Current User (Protected Route)
**GET** `http://localhost:5000/api/auth/me`

Headers:
```
Authorization: Bearer <your_token_here>
```

Expected Response (200):
```json
{
  "success": true,
  "user": {
    "id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active",
    "lastLogin": "2025-12-30T07:20:00.000Z",
    "createdAt": "2025-12-30T07:00:00.000Z",
    "updatedAt": "2025-12-30T07:20:00.000Z"
  }
}
```

---

#### 6. Update Profile
**PUT** `http://localhost:5000/api/users/me`

Headers:
```
Authorization: Bearer <your_token_here>
Content-Type: application/json
```

Body (JSON):
```json
{
  "fullName": "John Smith"
}
```

Expected Response (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "...",
    "fullName": "John Smith",
    "email": "john@example.com",
    "role": "user",
    "status": "active"
  }
}
```

---

#### 7. Change Password
**PUT** `http://localhost:5000/api/users/me/password`

Headers:
```
Authorization: Bearer <your_token_here>
Content-Type: application/json
```

Body (JSON):
```json
{
  "oldPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

Expected Response (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

#### 8. Test Admin Routes (Create Admin First)

You need to manually create an admin user in MongoDB:
1. Connect to MongoDB (MongoDB Compass or CLI)
2. Find your user in the `users` collection
3. Change `role` from `"user"` to `"admin"`

Then test:

**GET** `http://localhost:5000/api/users?page=1&limit=10`

Headers:
```
Authorization: Bearer <admin_token_here>
```

Expected Response (200):
```json
{
  "success": true,
  "users": [ ... ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

#### 9. Toggle User Status (Admin)
**PATCH** `http://localhost:5000/api/users/<user_id>/status`

Headers:
```
Authorization: Bearer <admin_token_here>
```

Expected Response (200):
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "user": { ... }
}
```

---

## Method 2: Using cURL (Command Line)

### 1. Health Check
```bash
curl http://localhost:5000/
```

### 2. Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 4. Get Current User (Replace TOKEN)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Method 3: Using VS Code REST Client Extension

1. Install "REST Client" extension in VS Code
2. Create a file `test.http` in your backend folder
3. Add the following:

```http
### Health Check
GET http://localhost:5000/

### Signup
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

### Get Current User
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE

### Update Profile
PUT http://localhost:5000/api/users/me
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "fullName": "John Smith"
}
```

Click "Send Request" above each request to test.

---

## Method 4: Using Your Frontend

Once your frontend is ready, it will automatically test the backend through:
- Login/Signup forms
- Dashboard user management
- Profile updates
- Password changes

---

## Common Issues & Solutions

### Issue: "Access denied. No token provided"
**Solution**: Make sure you're including the Authorization header with the token

### Issue: "Email already registered"
**Solution**: Use a different email or delete the user from MongoDB

### Issue: "Validation failed"
**Solution**: Check the password meets requirements (8+ chars, uppercase, lowercase, number, special char)

### Issue: "Cannot connect to MongoDB"
**Solution**: 
1. Check `.env` file has correct `MONGO_URI`
2. Ensure MongoDB is running (if local) or accessible (if cloud)
3. Check network connection

### Issue: "CORS error"
**Solution**: Make sure `FRONTEND_URL` in `.env` matches your frontend URL

---

## Testing Checklist

- [ ] Health check endpoint works
- [ ] Signup with valid data creates user
- [ ] Signup with weak password returns validation error
- [ ] Signup with duplicate email returns 409 error
- [ ] Login with valid credentials returns token
- [ ] Login with wrong password returns 401 error
- [ ] Protected routes require token
- [ ] Get current user returns user data
- [ ] Update profile changes user data
- [ ] Update profile with duplicate email returns 409
- [ ] Change password with correct old password works
- [ ] Change password with wrong old password returns 401
- [ ] Admin can view all users with pagination
- [ ] Admin can toggle user status
- [ ] User cannot access admin routes (403 error)
- [ ] Token works in both Authorization header and cookie

---

## Quick Test Script

Save this as `test-backend.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

echo "1. Testing Health Check..."
curl -s $BASE_URL/ | jq

echo -e "\n2. Testing Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!"
  }')
echo $SIGNUP_RESPONSE | jq

TOKEN=$(echo $SIGNUP_RESPONSE | jq -r '.token')

echo -e "\n3. Testing Get Current User..."
curl -s $BASE_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n4. Testing Profile Update..."
curl -s -X PUT $BASE_URL/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Updated Name"}' | jq

echo -e "\nAll tests completed!"
```

Run with: `bash test-backend.sh`

(Requires `jq` for JSON formatting: `npm install -g jq` or use without `| jq`)
