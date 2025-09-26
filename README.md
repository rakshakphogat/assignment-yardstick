# Multi-Tenant SaaS Notes Application

## Project Overview
A MERN (MongoDB, Express, React, Node.js) multi-tenant SaaS Notes Application with strict tenant isolation, JWT authentication, role-based access (Admin/Member), subscription feature gating (Free/Pro), CRUD for notes, health endpoint, CORS enabled, and a minimal frontend for login, notes management, and upgrade flow. Designed for deployment on Vercel.

## Multi-Tenancy Approach
**Chosen Approach:** Shared schema with a tenant ID column.
- All data models include a `tenantId` field to ensure strict isolation
- Database queries are filtered by tenant ID at the API level
- Data belonging to one tenant is never accessible to another tenant
- This approach provides good performance while maintaining security

## Authentication & Authorization
- **JWT-based authentication** with 24-hour token expiration
- **Role-based access control** with two roles:
  - **Admin:** Can invite users and upgrade subscriptions
  - **Member:** Can create, view, edit, and delete notes
- **Predefined test accounts** (all with password: `password`):
  - `admin@acme.test` (Admin, tenant: Acme)
  - `user@acme.test` (Member, tenant: Acme)
  - `admin@globex.test` (Admin, tenant: Globex)
  - `user@globex.test` (Member, tenant: Globex)

## Subscription Feature Gating
- **Free Plan:** Tenant limited to a maximum of 3 notes
- **Pro Plan:** Unlimited notes
- **Upgrade endpoint:** `POST /tenants/:slug/upgrade` (Admin only)
- Real-time enforcement with immediate effect after upgrade

## API Endpoints

### Authentication
- `POST /auth/login` - Authenticate user and get JWT token

### Notes (CRUD with tenant isolation)
- `POST /notes` – Create a note (respects subscription limits)
- `GET /notes` – List all notes for the current tenant
- `GET /notes/:id` – Retrieve a specific note
- `PUT /notes/:id` – Update a note
- `DELETE /notes/:id` – Delete a note

### Tenant Management
- `POST /tenants/:slug/upgrade` – Upgrade to Pro plan (Admin only)

### System
- `GET /health` → `{ "status": "ok" }` - Health check endpoint

## Frontend Features
- **Login interface** with quick-select buttons for demo accounts
- **Notes dashboard** with create, edit, delete functionality
- **Subscription management** showing current plan status
- **Upgrade banner** for Free plan users approaching/at limits
- **Responsive design** that works on desktop and mobile
- **Real-time feedback** for all operations (success/error messages)

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JSON Web Tokens** (JWT) for authentication
- **CORS** enabled for cross-origin requests

### Frontend
- **React** with functional components and hooks
- **Axios** for HTTP client
- **CSS3** for styling (no external UI libraries for simplicity)

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Local Development Setup

1. **Clone and setup the project:**
   ```bash
   cd assignment
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration:**
   
   Backend (.env file in backend directory):
   ```
   MONGODB_URI=mongodb://localhost:27017/notes-saas
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3001
   ```

   Frontend (.env file in frontend directory):
   ```
   REACT_APP_API_URL=http://localhost:3001
   ```

5. **Start both servers:**
   - **Option 1:** Use VS Code tasks (press `Ctrl+Shift+P`, type "Tasks: Run Task", select "Start Both Servers")
   - **Option 2:** Manual start:
     ```bash
     # Terminal 1 - Backend
     cd backend
     npm run dev

     # Terminal 2 - Frontend  
     cd frontend
     npm start
     ```

6. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/health

### Database Seeding
The application automatically seeds the database with:
- Two tenants: Acme Corporation and Globex Corporation
- Four test user accounts (both admin and member for each tenant)
- Both tenants start with Free plan subscription

## Deployment on Vercel

### Prerequisites
- Vercel account
- MongoDB Atlas database (recommended for production)

### Setup Steps

1. **Prepare for deployment:**
   - Update `MONGODB_URI` to point to MongoDB Atlas
   - Set strong `JWT_SECRET` in production

2. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   vercel
   ```

3. **Environment Variables:**
   Set in Vercel dashboard:
   ```
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-production-jwt-secret
   ```

4. **Domain Configuration:**
   - Update frontend `REACT_APP_API_URL` to your Vercel backend URL
   - Rebuild and redeploy frontend

## Testing the Application

### Demo Flow
1. **Login** using any of the predefined accounts
2. **Create notes** (up to 3 for Free plan users)
3. **Edit and delete notes** to test CRUD functionality
4. **Test subscription limits** by creating 3 notes on Free plan
5. **Upgrade to Pro** (Admin users only) to remove limits
6. **Switch between tenants** to verify isolation

### Key Features to Test
- ✅ Tenant isolation (Acme users can't see Globex notes)
- ✅ Role-based access (only Admins can upgrade)
- ✅ Subscription limits (Free plan blocked at 3 notes)
- ✅ Real-time upgrade (immediate effect after Pro upgrade)
- ✅ JWT authentication with proper token handling
- ✅ CRUD operations with proper error handling

## Architecture Notes

### Security Features
- JWT tokens with expiration
- Tenant-based data filtering at database level
- Role-based endpoint protection
- Input validation and sanitization
- CORS configuration for API access

### Scalability Considerations
- Shared database with indexed tenant fields
- Stateless JWT authentication
- Modular code structure for easy maintenance
- Database connection pooling with Mongoose

## Production Considerations
- **Password Hashing:** Currently uses plain text (demo only) - implement bcrypt in production
- **Rate Limiting:** Add rate limiting middleware for production
- **Logging:** Implement structured logging with tools like Winston
- **Monitoring:** Add application monitoring and error tracking
- **Database Indexing:** Ensure proper indexes on tenantId fields
- **SSL/HTTPS:** Enforce HTTPS in production
- **Environment Variables:** Use secure secret management

---

**Project Status:** ✅ Complete and ready for demonstration
**Deployment Ready:** ✅ Configured for Vercel deployment
**Demo Accounts:** ✅ Four test accounts with different roles and tenants