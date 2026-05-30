# ArenaGym Management App

Full-stack gym management application with Admin, Coach, and Member portals.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Redux Toolkit |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| Auth | JWT (24h expiry) |
| Charts | Recharts |

---

## Project Structure

```
gym-app/
├── backend/          Node.js + Express API
└── frontend/         Vite + React app
```

---

## Prerequisites

- Node.js v18+
- PostgreSQL 14+

---

## 1. PostgreSQL Setup

### Install PostgreSQL (Windows)
Download from: https://www.postgresql.org/download/windows/

During install, set a password for the `postgres` user. Remember it.

### Create the database and tables

```powershell
# Connect as postgres user
psql -U postgres

# Inside psql shell:
CREATE DATABASE gymapp;
\q

# Run the migration
psql -U postgres -d gymapp -f backend/migrations/001_init.sql
```

---

## 2. Backend Setup

```powershell
cd backend

# Copy and fill environment variables
copy .env.example .env
```

Edit `backend/.env`:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gymapp
JWT_SECRET=some_long_random_secret_change_this
PORT=5000
NODE_ENV=development
```

```powershell
# Seed sample data
npm run seed

# Start development server
npm run dev
```

Backend runs at: `http://localhost:5000`

---

## 3. Frontend Setup

```powershell
cd frontend

# Start development server (proxies /api to localhost:5000)
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Default Credentials

| Role | Login | Password |
|------|-------|----------|
| Admin | admin@gymapp.com | Admin@123 |
| Coach | rahul@gymapp.com | CH-00001 |
| Member | AG-00001 | AG-00001 |
| Member | AG-00002 | AG-00002 |

**Note:** Default password for any new member = their Member ID (e.g. `AG-00003`)

---

## Features (Phase 1)

### Admin Portal (`/admin/`)
- **Dashboard** — Stats: total members, active today, fees, revenue, coaches, new joiners. Attendance trend + revenue charts.
- **Members** (`/admin/members`) — Full CRUD. Auto-generated IDs (AG-00001). Search + filter. Freeze/unfreeze. Multi-section form.
- **Coaches** (`/admin/coaches`) — Full CRUD. Auto-generated IDs (CH-00001). Member count per coach.
- **Attendance** (`/admin/attendance`) — Today's check-in list. Monthly report with progress bars.
- **Fees** (`/admin/fees`) — All payments. Filter by status. Mark paid with payment mode. Overdue tracking.

### Coach Portal (`/coach/`)
- **Dashboard** — Assigned members list, today's attendance count.
- **Attendance** — View assigned members' attendance.

### Member Portal (`/member/`) — Mobile-First
- **Attendance** (`/member/attendance`) — Big button, one-tap daily check-in. Auto-redirects to warm-up after marking.
- **Warm-Up** (`/member/warmup`) — Day-specific exercises with instructions.
- **Workout** (`/member/workout`) — Phase 2 placeholder.
- **Progress** (`/member/progress`) — Phase 2 placeholder.

---

## Member ID Format

```
AG-00001   (AG- prefix + 5-digit auto-increment)
```

Coach IDs follow the same pattern with `CH-` prefix.

---

## API Endpoints

```
POST   /api/auth/login
POST   /api/auth/change-password
POST   /api/auth/reset-password/:memberId

GET    /api/members
POST   /api/members
GET    /api/members/:id
PUT    /api/members/:id
DELETE /api/members/:id
POST   /api/members/:id/freeze
POST   /api/members/:id/renew
GET    /api/members/plans

GET    /api/coaches
POST   /api/coaches
GET    /api/coaches/:id
PUT    /api/coaches/:id
DELETE /api/coaches/:id

POST   /api/attendance/mark
GET    /api/attendance/status
GET    /api/attendance/today
GET    /api/attendance/report
GET    /api/attendance/member/:id

GET    /api/payments
POST   /api/payments
PUT    /api/payments/:id
GET    /api/payments/overdue
GET    /api/payments/member/:id
GET    /api/payments/revenue

GET    /api/dashboard/admin
GET    /api/dashboard/coach
```

---

## Phase 2 Roadmap

- Measurement tracking (weight, chest, waist, biceps) + charts
- Exercise gallery with filter/search
- Day-specific warm-ups from database
- Workout plan builder (coach creates plans)
- Plan assignment to members
- Member workout view + mark completed

## Phase 3 Roadmap

- Progress photo uploads
- Push notifications (fee due, plan assigned)
- Enhanced reports (heatmap, member growth chart)
- PWA manifest (installable on mobile)
