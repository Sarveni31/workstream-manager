# Team Task Manager

Production-ready full-stack task management platform with role-based access and dashboard analytics.

## Tech Stack

- Frontend: React + Tailwind CSS + React Router
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT with bcrypt password hashing
- Deployment: Railway

## Folder Structure

- `client/` React web app
- `server/` Express API

## Local Setup

1. Install backend dependencies:
   - `cd server && npm install`
2. Install frontend dependencies:
   - `cd ../client && npm install`
3. Configure environment files:
   - Copy `server/.env.example` to `server/.env`
   - Copy `client/.env.example` to `client/.env`
4. Run backend:
   - `cd server && npm run dev`
5. Run frontend:
   - `cd client && npm run dev`

## Security and Demo Credentials

This repository intentionally does **not** contain real credentials, secrets, or private admin passwords.
Use only environment variables for sensitive values.

### Safe demo credentials (for evaluation only)

These are non-sensitive sample accounts you can create in your own database for placement demos:

- Admin (demo):
  - Email: `admin.demo@workstream.local`
  - Password: `AdminDemo@123`
- Member (demo):
  - Email: `member.demo@workstream.local`
  - Password: `MemberDemo@123`

Important:
- Do not reuse these in real production.
- Rotate demo accounts after interviews if hosted publicly.

### Environment variables setup

Backend variables (`server/.env`):

- `PORT=5000`
- `MONGO_URI=<your_mongodb_connection_string>`
- `JWT_SECRET=<strong_random_secret>`
- `JWT_EXPIRES_IN=1d`
- `JWT_ISSUER=team-task-manager-api`
- `JWT_AUDIENCE=team-task-manager-client`
- `CLIENT_URL=http://localhost:5173`
- `ADMIN_INVITE_CODE=<optional_admin_signup_code>`
- `NODE_ENV=development`

Frontend variables (`client/.env`):

- `VITE_API_URL=http://localhost:5000/api/v1`

### Assigning admin role without exposing passwords

You have two secure options:

1. Admin invite code flow (frontend enabled):
   - Set `ADMIN_INVITE_CODE` in backend env.
   - During signup, enable "Signup as admin" and provide the invite code.
2. Manual DB role update:
   - Update a user document's `role` to `admin` in MongoDB.

Never store admin credentials or raw secrets in the codebase/README.

## Authentication and RBAC Review

- Passwords are hashed using `bcrypt` before save (`User` model hook).
- JWT-based auth is used for session tokens.
- JWT includes expiration, issuer, audience, and algorithm constraints.
- Backend middleware enforces authorization:
  - Admin-only actions: project creation/member management/task creation
  - Scoped member access for project/task operations
- Frontend role checks are for UX only; backend remains the security boundary.

## API Base URL

- `http://localhost:5000/api/v1`

## Core API Endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `POST /projects` (admin)
- `GET /projects`
- `PATCH /projects/:projectId/team` (admin)
- `POST /tasks`
- `GET /tasks`
- `PATCH /tasks/:taskId/status`
- `GET /dashboard`

## Railway Deployment Notes

Create two Railway services:

1. Backend service (`server/`)
   - Start command: `npm start`
   - Required env vars: `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `NODE_ENV=production`
2. Frontend service (`client/`)
   - Build command: `npm run build`
   - Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`
   - Env var: `VITE_API_URL=<your-backend-public-url>/api/v1`

## Production-Readiness Improvements (Recruiter-Friendly)

- Add refresh token rotation with secure httpOnly cookies.
- Add audit logs for role changes and membership updates.
- Add API tests (Jest + Supertest) and frontend tests (RTL).
- Add request tracing/correlation IDs and structured logs.
- Add CI workflow (lint + build + tests) on pull requests.
- Add rate limits specifically for auth routes and password reset flows.
