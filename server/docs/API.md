# CivicFix REST API Documentation

Base URL: `http://localhost:5000/api/v1`

---

## 1. Authentication (`/api/v1/auth`)

### 1.1 Register User
- **POST** `/auth/register`
- **Access**: Public
- **Body** (JSON):
  ```json
  {
    "name": "Jane Citizen",
    "email": "jane@example.com",
    "password": "Password@123",
    "role": "citizen", // "citizen" or "staff" (admin must be seeded)
    "phone": "+91 9876543210"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Account registered successfully",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "673...",
        "name": "Jane Citizen",
        "email": "jane@example.com",
        "role": "citizen",
        "phone": "+91 9876543210",
        "avatar": ""
      }
    }
  }
  ```

### 1.2 Login User
- **POST** `/auth/login`
- **Access**: Public
- **Body** (JSON):
  ```json
  {
    "email": "citizen@civicfix.com",
    "password": "Citizen@123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "673...",
        "name": "Aarav Mehta",
        "email": "citizen@civicfix.com",
        "role": "citizen"
      }
    }
  }
  ```

### 1.3 Get Current User Profile
- **GET** `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`): Current user object

### 1.4 Logout
- **POST** `/auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`): `{ "success": true, "message": "Logged out successfully" }`

---

## 2. Issues (`/api/v1/issues`)

### 2.1 Report an Issue
- **POST** `/issues`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Fields**:
  - `title` (string, 4-120 chars)
  - `category` (`Pothole`, `Garbage`, `Streetlight`, `Water Leakage`, `Other`)
  - `description` (string, 10-2000 chars)
  - `lat` (float, e.g. `19.0596`)
  - `lng` (float, e.g. `72.8295`)
  - `address` (string)
  - `images` (file upload, max 5 images, up to 5MB each)
- **Response** (`201 Created`): Returns created issue object with GeoJSON point and initial `Reported` status history.

### 2.2 List Issues with Filters & Pagination
- **GET** `/issues`
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `category` (optional: `Pothole`, `Garbage`, `Streetlight`, `Water Leakage`, `Other`)
  - `status` (optional: `Reported`, `Assigned`, `In Progress`, `Resolved`)
  - `search` (search text in title, description, address)
  - `myIssues` (`true` to filter current user's reported tickets)
  - `sortBy` (`newest`, `oldest`, `upvotes`, `status`)
  - `nearLat`, `nearLng`, `maxDistance` (geospatial query in meters)
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "count": 10,
    "total": 15,
    "page": 1,
    "totalPages": 2,
    "data": [...]
  }
  ```

### 2.3 Get Issue Details
- **GET** `/issues/:id`
- **Response** (`200 OK`): Issue object with populated `reportedBy`, `assignedTo`, `statusHistory.changedBy`, and array of `comments`.

### 2.4 Upvote / Toggle Upvote
- **POST** `/issues/:id/upvote`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Issue upvoted",
    "data": {
      "upvotesCount": 3,
      "userHasUpvoted": true
    }
  }
  ```

### 2.5 Add Comment
- **POST** `/issues/:id/comments`
- **Headers**: `Authorization: Bearer <token>`
- **Body** (JSON): `{ "content": "Road roller arrived at 10 AM." }`
- **Response** (`201 Created`): New populated comment object.

### 2.6 Delete Issue
- **DELETE** `/issues/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Access**: Citizen owner (only if status is `Reported`) or Admin.

---

## 3. Staff Portal (`/api/v1/staff`)

### 3.1 Get Assigned Issues
- **GET** `/staff/issues`
- **Headers**: `Authorization: Bearer <token>` (Staff or Admin)
- **Query Parameters**: `status`, `category`, `search`, `page`, `limit`

### 3.2 Update Status & Upload Proof
- **PATCH** `/staff/issues/:id/status`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Fields**:
  - `status` (`In Progress` or `Resolved`)
  - `note` (optional comment about work done)
  - `proofImage` (optional image showing resolved work)
- **Response** (`200 OK`): Updated issue with updated timeline and citizen notification dispatched.

---

## 4. Admin Management (`/api/v1/admin`)

### 4.1 Dashboard Analytics
- **GET** `/admin/stats`
- **Headers**: `Authorization: Bearer <token>` (Admin only)
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "totalIssues": 15,
        "reportedCount": 4,
        "assignedCount": 3,
        "inProgressCount": 4,
        "resolvedCount": 4,
        "totalUsers": 5,
        "avgResolutionHours": 24.5,
        "resolutionRate": 27
      },
      "charts": {
        "issuesByStatus": [...],
        "issuesByCategory": [...]
      },
      "recentActivity": [...]
    }
  }
  ```

### 4.2 Assign Issue to Staff
- **PATCH** `/admin/issues/:id/assign`
- **Body** (JSON): `{ "assignedTo": "<staffUserId>", "note": "Priority road patch" }`

### 4.3 Change User Role / Status
- **PATCH** `/admin/users/:id/role`: `{ "role": "staff" }`
- **PATCH** `/admin/users/:id/status`: `{ "isActive": false }`
- **GET** `/admin/staff-list`: returns active staff dropdown options

---

## 5. Notifications (`/api/v1/notifications`)

- **GET** `/notifications`: lists notifications with `unreadCount`
- **PATCH** `/notifications/:id/read`: mark one notification read
- **PATCH** `/notifications/mark-all-read`: mark all notifications read

---

## 6. Real-Time WebSocket Events (Socket.IO)

- **Connection**: `ws://localhost:5000` with `auth: { token: "<jwt>" }`
- **Channels / Rooms**:
  - `user:<userId>`: receives personal notifications (`notification:new`)
  - `role:admin`: receives `issue:new_admin_alert`
  - `role:staff`: receives assignment alerts
  - `issue:<issueId>`: receives `issue:updated`, `comment:new`, `issue:upvoted`
  - Global: receives `issue:list_update`
