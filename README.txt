================================================================
TEAM TASK MANAGER - Full-Stack Application
Assignment for Ethara.AI Candidate Nomination
================================================================

OVERVIEW
--------
TaskFlow is a full-stack Team Task Manager web application where users can
create projects, assign tasks, track progress, and collaborate with
role-based access control (Admin/Member).

LIVE URL
--------
[Deploy to Railway and add URL here]

GITHUB REPOSITORY
-----------------
[Add GitHub repo URL here after pushing]

TECH STACK
----------
Frontend:
  - React 18 (Create React App)
  - React Router v6 (client-side routing)
  - Axios (HTTP client)
  - React Hot Toast (notifications)
  - date-fns (date formatting)
  - Plain CSS (custom design system)

Backend:
  - Node.js + Express.js (REST API)
  - MongoDB + Mongoose (database & ODM)
  - JSON Web Tokens (JWT authentication)
  - bcryptjs (password hashing)
  - express-validator (input validation)

Deployment:
  - Railway (backend + MongoDB)
  - Vercel or Railway (frontend)

================================================================
KEY FEATURES
================================================================

1. AUTHENTICATION (Signup/Login)
   - JWT-based authentication
   - Secure password hashing with bcryptjs
   - Protected routes (frontend & backend)
   - Auto-login via localStorage token
   - Logout functionality

2. PROJECT & TEAM MANAGEMENT
   - Create, edit, delete projects
   - Color-coded projects
   - Due dates for projects
   - Project status: Active, On Hold, Completed, Archived
   - Add members by email
   - Remove members
   - Change member roles (Admin/Member)
   - Only project owner can delete a project
   - Task progress bar per project

3. TASK CREATION, ASSIGNMENT & STATUS TRACKING
   - Create/edit/delete tasks within projects
   - Task statuses: Todo, In Progress, Review, Done
   - Task priorities: Low, Medium, High, Critical
   - Assign tasks to project members
   - Due date tracking with overdue indicators
   - Kanban Board view (drag-to-status via dropdowns)
   - List view with inline status changes
   - Task filtering by status, priority, and search

4. DASHBOARD (Tasks, Status, Overdue)
   - Overview stats: projects, total tasks, completed, overdue, assigned
   - Completion rate percentage
   - Recent tasks list
   - Tasks by status breakdown with progress bars
   - Greeting based on time of day

5. ROLE-BASED ACCESS CONTROL (Admin/Member)
   - Admin: Full CRUD on project, tasks, members
   - Member: Can create tasks, update tasks assigned to them
   - Only Admins can add/remove members
   - Only project owner can delete the project
   - Backend enforces roles on every API call

================================================================
API ENDPOINTS
================================================================

AUTH
  POST /api/auth/signup      - Register new user
  POST /api/auth/login       - Login user
  GET  /api/auth/me          - Get current user (auth required)
  PUT  /api/auth/profile     - Update profile (auth required)

PROJECTS
  GET    /api/projects             - Get all user's projects
  POST   /api/projects             - Create project
  GET    /api/projects/:id         - Get single project
  PUT    /api/projects/:id         - Update project (Admin only)
  DELETE /api/projects/:id         - Delete project (Owner only)
  POST   /api/projects/:id/members        - Add member (Admin only)
  DELETE /api/projects/:id/members/:uid   - Remove member (Admin only)
  PUT    /api/projects/:id/members/:uid   - Change role (Owner only)

TASKS
  GET    /api/tasks/dashboard         - Dashboard stats
  GET    /api/tasks/my-tasks          - Tasks assigned to me
  GET    /api/tasks/project/:id       - Tasks for a project
  POST   /api/tasks                   - Create task
  PUT    /api/tasks/:id               - Update task
  DELETE /api/tasks/:id               - Delete task

USERS
  GET    /api/users/search?email=...  - Search users by email

================================================================
DATABASE SCHEMA
================================================================

User:
  name (String, required)
  email (String, unique, required)
  password (String, hashed)
  avatar (String, optional)
  timestamps

Project:
  name (String, required)
  description (String)
  status (Active|On Hold|Completed|Archived)
  owner (ref: User)
  members: [{ user: ref User, role: Admin|Member, joinedAt }]
  dueDate (Date)
  color (String)
  timestamps

Task:
  title (String, required)
  description (String)
  status (Todo|In Progress|Review|Done)
  priority (Low|Medium|High|Critical)
  project (ref: Project)
  assignedTo (ref: User)
  createdBy (ref: User)
  dueDate (Date)
  completedAt (Date, auto-set)
  tags ([String])
  timestamps

================================================================
LOCAL SETUP
================================================================

Prerequisites:
  - Node.js 18+
  - MongoDB (local) OR MongoDB Atlas URI
  - npm

Step 1: Clone repository
  git clone <repo-url>
  cd team-task-manager

Step 2: Setup Backend
  cd backend
  cp .env.example .env
  # Edit .env with your MongoDB URI and JWT secret
  npm install
  npm run dev

Step 3: Setup Frontend
  cd frontend
  cp .env.example .env
  # Edit .env: REACT_APP_API_URL=http://localhost:5000/api
  npm install
  npm start

App runs at: http://localhost:3000
API runs at: http://localhost:5000/api

================================================================
RAILWAY DEPLOYMENT
================================================================

Backend Deployment:
  1. Create Railway account at railway.app
  2. New Project → Deploy from GitHub Repo
  3. Select the /backend folder
  4. Add MongoDB plugin in Railway
  5. Set environment variables:
     - MONGODB_URI = (from Railway MongoDB plugin)
     - JWT_SECRET = (random secure string)
     - NODE_ENV = production
     - CLIENT_URL = (your frontend URL)
  6. Deploy - Railway auto-detects Node.js

Frontend Deployment (Railway or Vercel):
  Option A - Railway:
    1. New service → GitHub → /frontend folder
    2. Set: REACT_APP_API_URL = https://your-backend.railway.app/api
    3. Build command: npm run build
    4. Start command: npx serve -s build

  Option B - Vercel (recommended for React):
    1. vercel.com → Import Git repository
    2. Set: REACT_APP_API_URL = https://your-backend.railway.app/api
    3. Deploy automatically

================================================================
PROJECT STRUCTURE
================================================================

team-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js  # Auth logic
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT middleware + role check
│   │   ├── models/
│   │   │   ├── User.js            # User schema
│   │   │   ├── Project.js         # Project + members schema
│   │   │   └── Task.js            # Task schema
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   ├── tasks.js
│   │   │   └── users.js
│   │   └── server.js              # Express app entry point
│   ├── package.json
│   └── railway.json               # Railway deployment config
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       └── Layout.js      # Sidebar + outlet
    │   ├── context/
    │   │   └── AuthContext.js     # Auth state management
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── Dashboard.js       # Stats overview
    │   │   ├── Projects.js        # Projects list
    │   │   ├── ProjectDetail.js   # Kanban + List + Members
    │   │   ├── MyTasks.js
    │   │   └── Profile.js
    │   ├── utils/
    │   │   └── api.js             # Axios API calls
    │   ├── App.js                 # Routes
    │   └── index.css              # Global styles
    └── package.json

================================================================
AUTHOR
================================================================
Submitted as part of the Ethara.AI Full-Stack Assessment
================================================================
