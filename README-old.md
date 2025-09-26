# Multi-Tenant SaaS Notes Application

## Project Overview
This is a MERN (MongoDB, Express, React, Node.js) multi-tenant SaaS Notes Application. If MongoDB is not available, Supabase will be used as the backend database. The application supports strict tenant isolation, JWT authentication, role-based access (Admin/Member), subscription feature gating (Free/Pro), CRUD for notes, health endpoint, CORS enabled, and a minimal frontend for login, notes management, and upgrade flow. The app is designed for deployment on Vercel.

## Multi-Tenancy Approach
**Chosen Approach:** Shared schema with a tenant ID column.
- All data models include a `tenantId` field.
- Strict isolation is enforced at the API and database query level.
- Data belonging to one tenant is never accessible to another.

## Authentication & Authorization
- JWT-based login.
- Roles:
  - **Admin:** Can invite users and upgrade subscriptions.
  - **Member:** Can create, view, edit, and delete notes.
- Mandatory test accounts (password: `password`):
  - `admin@acme.test` (Admin, tenant: Acme)
  - `user@acme.test` (Member, tenant: Acme)
  - `admin@globex.test` (Admin, tenant: Globex)
  - `user@globex.test` (Member, tenant: Globex)

## Subscription Feature Gating
- **Free Plan:** Tenant limited to a maximum of 3 notes.
- **Pro Plan:** Unlimited notes.
- Upgrade endpoint: `POST /tenants/:slug/upgrade` (Admin only).

## Notes API (CRUD)
- Endpoints enforce tenant isolation and role-based access:
  - `POST /notes` – Create a note
  - `GET /notes` – List all notes for the current tenant
  - `GET /notes/:id` – Retrieve a specific note
  - `PUT /notes/:id` – Update a note
  - `DELETE /notes/:id` – Delete a note

## Deployment
- Backend and frontend hosted on Vercel.
- CORS enabled for API access.
- Health endpoint: `GET /health` → `{ "status": "ok" }`

## Frontend
- Minimal UI for login, notes management, and upgrade flow.
- Shows “Upgrade to Pro” when Free tenant reaches note limit.

## Getting Started
1. Install dependencies for both backend and frontend.
2. Configure environment variables (MongoDB/Supabase connection, JWT secret, etc.).
3. Deploy to Vercel.

---

**For more details, see the codebase and comments in each module.**
