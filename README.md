# CivicFix – Local Civic Issue Reporting & Resolution System

[![CI/CD Pipeline](https://github.com/CivicFix/civicfix/actions/workflows/ci.yml/badge.svg)](https://github.com/CivicFix/civicfix/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-184E3A?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-0284C7?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6.0-059669?logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com/)

**CivicFix** is a production-quality, full-stack MERN application that modernizes municipal governance and infrastructure maintenance across city wards. It enables citizens to report civic defects (potholes, garbage, streetlights, water leakage) with photos and precise GPS map pins in seconds, allows municipal administrators to dispatch field crews, and empowers field workers to track work orders and submit photographic proof of resolution.

---

## 🌟 Key Capabilities by Role

### 1. Citizen Portal
- **Rapid Reporting**: Submit civic hazards with photo evidence, detailed severity notes, and precise coordinates using an interactive Leaflet map picker.
- **My Reported Issues**: Track ticket status progression (`Reported` → `Assigned` → `In Progress` → `Resolved`).
- **Community Engagement**: Upvote community reports (toggle 1 per user) and participate in live discussion threads on active issues.
- **Policy Rights**: Citizens retain policy rights to delete their own reports while still in `Reported` status.

### 2. Staff / Field Worker Station
- **Assigned Tasks Queue**: Real-time list of work orders assigned to the logged-in field officer.
- **Status Lifecycle Control**: Advance tickets from `Assigned` to `In Progress` and `Resolved`.
- **Proof-of-Resolution**: Upload photographic completion proof and log detailed on-site repair notes.
- **Instant Citizen Broadcast**: Automatically alerts the citizen upon task completion without page reload.

### 3. Administrator Console
- **Platform Analytics**: Executive KPI cards, Recharts status bar charts, category donut charts, and average resolution time metrics.
- **Manage Issues**: Table view across all 24 municipal wards, staff assignment dropdown with real-time dispatch, and status override controls.
- **Manage Users**: Review citizen and staff accounts, edit user roles (`citizen`, `staff`, `admin`), and toggle account activation status.

### 4. Real-Time WebSocket Infrastructure (Socket.IO)
- **JWT-Authenticated Handshakes**: Secure socket connections authenticating user claims.
- **Targeted Rooms**: Dedicated socket channels for `user:<id>`, `role:admin`, `role:staff`, and `issue:<id>`.
- **Live Notifications & Toasts**: Real-time floating toast alerts and animated navbar bell counter.
- **Zero-Reload Feeds**: Issue lists and timeline states update live across all connected clients.

---

## 🎨 Design System

Designed around a restrained, editorial aesthetic:
- **Light Mode Palette**: Editorial warm off-white background (`#FAF7F2`), deep civic forest emerald (`#184E3A`), warm terracotta accent (`#D96B43`), and crisp slate borders.
- **Dark Mode Palette**: Deep warm charcoal background (`#121316`), elevated card surfaces (`#1B1D22`), and high-contrast text (`#FAF7F2`). Persisted in `localStorage`.
- **Typography**: Editorial serif (`Fraunces`) for headlines paired with modern sans-serif (`Inter`) for body and data grids.
- **Signature Hero Visual**: Floating UI composition combining an interactive map card, an issue status timeline card, and an animated live-notification toast badge.
- **Full Responsiveness**: Adaptive layouts tested at **375px (Mobile)**, **768px (Tablet)**, and **1280px (Desktop)**.

---

## 🏛️ System Architecture

```
                               ┌────────────────────────────────┐
                               │   CivicFix React Frontend      │
                               │  (Vite + Tailwind + Leaflet)   │
                               └──────────────┬─────────────────┘
                                              │
                      REST API (Axios)        │       WebSockets (Socket.IO)
                      /api/v1                 │       Bi-directional events
                                              ▼
                               ┌────────────────────────────────┐
                               │   Node.js + Express Backend    │
                               │  (Helmet, CORS, Morgan, RBAC)  │
                               └──────────────┬─────────────────┘
                                              │
                       Mongoose ODM           │       File Streaming
                       2dsphere Geospatial    │       Multer + Cloudinary
                                              ▼
                               ┌────────────────────────────────┐
                               │   MongoDB (v6.0 / Embedded)    │
                               │  GeoJSON Points, Wards Data    │
                               └────────────────────────────────┘
```

---

## 🔑 Demo & Test Credentials

The platform includes seed data featuring 15 realistic civic issues mapped across Mumbai (Bandra, Marine Drive, Andheri, Powai, Dadar, Kurla, Juhu, Colaba). 

The login screen features **1-Click Demo Fill buttons**:

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@civicfix.com` | `Admin@123` | Platform analytics, staff assignment, user management |
| **Field Staff** | `staff@civicfix.com` | `Staff@123` | Assigned tickets, status update, proof of resolution |
| **Citizen** | `citizen@civicfix.com` | `Citizen@123` | Report issues, map picker, upvotes, comments |

---

## 📂 Project Structure

```
C:\CivicFix\
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI workflow (Build & Test)
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/                   # Central Axios client with auth interceptors
│   │   ├── components/
│   │   │   ├── common/            # Navbar, Footer, StatusBadge, ToastContainer, Modals
│   │   │   ├── issues/            # InteractiveMap, LocationPicker, Timeline, IssueCard
│   │   │   └── routing/           # ProtectedRoute (Role-Based Guards)
│   │   ├── context/               # AuthContext, ThemeContext, NotificationContext, SocketContext
│   │   ├── hooks/                 # Custom reusable useFetch and useDebounce hooks
│   │   ├── pages/                 # All 12 application pages
│   │   ├── App.jsx                # Router & Provider Tree
│   │   ├── index.css              # Tailwind directives & Leaflet styling
│   │   └── main.jsx               # React entry point
│   ├── Dockerfile                 # Multi-stage production Nginx container
│   ├── nginx.conf                 # Nginx SPA router & API reverse proxy
│   ├── tailwind.config.js         # Theme tokens (sand, brand, terracotta, charcoal)
│   ├── vite.config.js             # Vite configuration & proxy
│   └── package.json
├── server/
│   ├── config/                    # Database connection & Cloudinary configuration
│   ├── controllers/               # Auth, Issue, Staff, Admin, Notification controllers
│   ├── docs/                      # API documentation (API.md & Postman Collection)
│   ├── middleware/                # JWT auth, RBAC authorization, Multer upload, errorHandler
│   ├── models/                    # Mongoose schemas (User, Issue, Comment, Notification)
│   ├── routes/                    # RESTful route definitions (/api/v1)
│   ├── seeds/                     # Database seeder (15 Mumbai issues & accounts)
│   ├── services/                  # Socket.IO service & room broadcast utilities
│   ├── uploads/                   # Local media storage directory
│   ├── Dockerfile                 # Lightweight production Alpine container
│   ├── package.json
│   ├── server.js                  # Express HTTP & WebSocket entry point
│   ├── test-api.js                # Functional integration test suite
│   ├── test-negative-and-rbac.js  # Security & RBAC test suite
│   └── test-browser-e2e.js        # Full Puppeteer browser test suite
├── docker-compose.yml             # Single-command multi-container orchestration
├── .env.example                   # Root environment configuration
└── README.md
```

---

## 🚀 Quickstart & Installation

### Option A: Running with Docker Compose (Recommended)

Run the entire stack (MongoDB, Backend API, Frontend Client) with one command:

```bash
# 1. Clone repository
git clone https://github.com/CivicFix/civicfix.git
cd civicfix

# 2. Launch all services
docker compose up --build
```
- Frontend application will be live at: `http://localhost:5173`
- Backend API will be live at: `http://localhost:5000/api/v1`

---

### Option B: Running Locally with Node.js

#### 1. Backend Setup
```bash
cd server
npm install

# Setup environment
cp .env.example .env

# Run database seeder
npm run seed

# Start backend server
npm start
```
*Note: If no local MongoDB service is running, the server automatically boots an embedded in-memory database fallback.*

#### 2. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing & Verification

The project includes 3 levels of automated verification suites:

1. **Standard Functional API Suite** (15 Tests):
   ```bash
   cd server && node test-api.js
   ```
2. **Extended Security, RBAC & Validation Suite** (19 Tests):
   ```bash
   cd server && node test-negative-and-rbac.js
   ```
3. **Full Browser E2E Automation Suite** (Real Chrome):
   ```bash
   cd server && node test-browser-e2e.js
   ```

All **34 API and Security tests + Browser E2E flows** pass with 100% success rate.

---

## 📖 API Documentation & Postman

- Complete REST documentation: [`server/docs/API.md`](file:///C:/CivicFix/server/docs/API.md)
- Exported Postman Collection: [`server/docs/civicfix_postman_collection.json`](file:///C:/CivicFix/server/docs/civicfix_postman_collection.json)

---

## ⚙️ Environment Variables Reference

### Backend (`server/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/civicfix` |
| `JWT_SECRET` | Signing secret for JSON Web Tokens | Required |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `CLIENT_URL` | Frontend origin for CORS and WebSockets | `http://localhost:5173` |
| `CLOUDINARY_*` | Cloud storage credentials | Optional (local storage fallback active) |

### Frontend (`client/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for REST API endpoints | `http://localhost:5000/api/v1` |
| `VITE_SOCKET_URL` | Base URL for Socket.IO hub | `http://localhost:5000` |

---

## 🌐 Production Deployment

- **Containerized**: `docker compose up -d` deploys client, server, and mongo containers with health checks and volume persistence.
- **PaaS (Render / Railway)**: Deploy `/server` as a Node web service and set `MONGO_URI` to MongoDB Atlas.
- **Frontend (Vercel / Netlify)**: Deploy `/client` with build command `npm run build` and output directory `dist`.

---

## 📜 License & Acknowledgements
Built for the CivicFix Municipal Public Works Initiative. Open source under the ISC License.
