# User Management System

A full-stack MERN application delivering a robust user management solution. It features secure authentication, role-based access control (Admin/User), and a modern, responsive user interface.

## 🚀 Project Overview

The **User Management System** is designed to streamline user administration and authentication verification processes. It serves as a foundational template for complex web applications requiring:
*   **Secure Authentication**: JWT-based login, signup, and logout with cookie persistence.
*   **Role-Based Access**: Distinct capabilities for Admins (manage all users) vs. Standard Users (manage own profile).
*   **Modern UX**: A seamless, single-page-application feel using Next.js App Router and dynamic client-side state updates.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: Next.js 16 (React 19, App Router)
*   **State Management**: Redux Toolkit (RTK Query + Persistence)
*   **Styling**: Tailwind CSS v4
*   **UI Components**: shadcn/ui (Radix Primitives), Lucide Icons
*   **Animations**: Framer Motion
*   **Forms & Validation**: React Hook Form, Zod
*   **Notifications**: Sonner

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (via Mongoose)
*   **Authentication**: JSON Web Tokens (JWT), bcryptjs
*   **Validation**: express-validator
*   **Testing**: Jest, Supertest, MongoDB Memory Server

## ⚙️ Setup Instructions

Follow these steps to run the project locally.

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local instance or Atlas URI)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd user-management-system
```

### 2. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory (see [Environment Variables](#-environment-variables)).
4.  Start the server:
    ```bash
    npm start
    ```
    *Server will run on `http://localhost:5000`*

### 3. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file (optional, see [Environment Variables](#-environment-variables)).
4.  Start the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Environment Variables

Create the following files (.env) in their respective directories.

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/user_management_db  # Or your Atlas URI
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚀 Deployment Instructions

### Backend (e.g., Render/Heroku)
1.  Push code to GitHub.
2.  Create a new Web Service on Render connected to your repo.
3.  Set **Root Directory** to `backend`.
4.  Set **Build Command** to `npm install`.
5.  Set **Start Command** to `npm start`.
6.  Add Environment Variables (`MONGO_URI`, `JWT_SECRET`, etc.) in the dashboard.

### Frontend (Vercel)
1.  Import the repository into Vercel.
2.  Set **Root Directory** to `frontend`.
3.  Framework Preset will auto-detect Next.js.
4.  Add Environment Variables:
    *   `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://my-api onrender.com/api`).
5.  Deploy.

## 📡 API Documentation

Base URL: `http://localhost:5000/api`

### Authentication
*   **POST** `/auth/signup`
    *   Body: `{ "fullName": "John Doe", "email": "john@example.com", "password": "Password123!" }`
*   **POST** `/auth/login`
    *   Body: `{ "email": "john@example.com", "password": "Password123!" }`
*   **POST** `/auth/logout`
    *   Requires Auth (Cookie).
*   **GET** `/auth/me`
    *   Returns current user profile. Requires Auth.

### User Management
*   **PUT** `/users/me`
    *   Update Profile. Body: `{ "fullName": "New Name" }`
*   **PUT** `/users/me/password`
    *   Change Password. Body: `{ "oldPassword": "...", "newPassword": "..." }`
*   **GET** `/users` (Admin Only)
    *   Get paginated list of users.
*   **PATCH** `/users/:id/status` (Admin Only)
    *   Toggle user status (active/inactive).