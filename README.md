# HealthOS — Unified Healthcare ERP Monorepo

A unified healthcare ERP platform built with a modern React frontend and Express backend, fully compatible with Windows.

## Workspace Architecture

This codebase is organized as a **pnpm monorepo workspace**:

```
Health-Hub-Manager/
├── frontend/             # Vite + React 19 + Tailwind v4 Single Page Application
├── backend/              # Node + Express 5 + TSX Backend Server
├── supabase/             # Supabase DB Schema migrations & storage policies
└── package.json          # Root workspace configuration
```

## Tech Stack

### Frontend
- **Framework**: React 19, TypeScript
- **Bundler**: Vite 7
- **Routing**: Wouter
- **State Management**: Tanstack React Query v5
- **Styling**: Tailwind CSS v4, Radix UI Primitives, Lucide Icons
- **Database Client**: Supabase JS Client (for Auth session token & Storage uploads)

### Backend
- **Framework**: Express 5, TSX (TypeScript Execute)
- **Database Integration**: Supabase Service-Role Admin Client (RLS bypass)
- **Utilities**: Zod (validation), Pino (structured logging)

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (version 20.19+ or 22.12+ for Vite 7 compatibility)
- pnpm (package manager)

### 2. Configure Environment Variables

Create `.env` files in both workspace projects:

#### Frontend Environment (`frontend/.env`)
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:5000
```

#### Backend Environment (`backend/.env`)
```env
PORT=5000
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Database & Storage Setup
Apply the migrations in the `supabase/migrations/` directory to your Supabase project in the following order:
1. `001_initial_schema.sql` — Setup tables, indexes, and full-text search.
2. `002_rls_policies.sql` — Row level security safety rules.
3. `003_storage_buckets.sql` — Create buckets (`reports`, `documents`, `avatars`) and configure RLS.

### 4. Installation & Local Development

Run the following commands from the root directory:

```bash
# Install all dependencies across workspaces
pnpm install

# Start both frontend and backend development servers concurrently
pnpm dev
```
- Frontend will run on `http://localhost:5173`
- Backend API will run on `http://localhost:5000` (proxied by Vite)

### 5. Validate and Build

```bash
# Check TypeScript compile validity across all projects
pnpm typecheck

# Build both frontend static assets and backend TypeScript files
pnpm build
```

---

## Role-Based Access Control (RBAC)

HealthOS supports a strict 5-tier role hierarchy:
1. **Patient**: Manage personal health profile, book appointments, upload documents, check prescriptions and lab reports.
2. **Doctor**: Manage queue, consultations, diagnoses, issue prescriptions, check patient EHR histories.
3. **Hospital Admin**: Allocate wards/beds, admit and discharge patients, register medical staff.
4. **Lab Admin**: Search patients by Health ID, publish lab report findings, and flag critical observations.
5. **Platform Admin**: Verification queues for applications (approve/reject doctor, lab, and hospital registrations), monitor platform metrics and notifications.
