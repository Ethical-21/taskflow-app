<div align="center">

# ✅ TaskFlow

### Corporate Task Management System

*A full-stack, role-based task management platform built for teams that ship.*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_App-f97316?style=for-the-badge)](https://taskflow-app-flame-kappa.vercel.app)
[![Status](https://img.shields.io/badge/Status-Production-brightgreen?style=for-the-badge)](https://taskflow-app-flame-kappa.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>


## 📋 Table of Contents

- [About](#-about)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Roles & Permissions](#-roles--permissions)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

**TaskFlow** is a corporate-grade task management system designed for small-to-mid-sized teams. It provides a clean, intuitive interface for managing tasks across projects with real-time Kanban boards, dashboard analytics, and granular role-based access control.

Built as part of an **IBM Internship Project**, TaskFlow demonstrates enterprise-level full-stack development with modern web technologies — from a responsive Next.js frontend to a secure Express.js REST API backed by MongoDB Atlas.

> **🔗 Live Demo:** [taskflow-app-flame-kappa.vercel.app](https://taskflow-app-flame-kappa.vercel.app)

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication & Security
- JWT-based token authentication
- Bcrypt password hashing
- Protected API routes with middleware
- Active session tracking & management

</td>
<td width="50%">

### 👥 Role-Based Access Control
- **Admin** — Full system control
- **Manager** — Team & task management
- **Team Member** — Personal task visibility

</td>
</tr>
<tr>
<td width="50%">

### 📊 Dashboard & Analytics
- Real-time task completion statistics
- Dynamic progress tracking
- Task distribution by status/priority
- Personalized "My Tasks" view

</td>
<td width="50%">

### 📋 Kanban Board
- Drag-and-drop task management
- Status columns: To Do → In Progress → Done
- Priority labels & due date tracking
- Real-time persistence to database

</td>
</tr>
<tr>
<td width="50%">

### 👤 User & Team Management
- View all team members & their roles
- Invite users to the workspace
- Profile customization with avatar upload
- Role-based user listing

</td>
<td width="50%">

### ✅ Personal To-Do
- Individual task tracking
- Independent from project tasks
- Quick add/complete workflow
- Available for all roles

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<table>
<tr>
<th align="left">Layer</th>
<th align="left">Technology</th>
<th align="left">Purpose</th>
</tr>
<tr>
<td><strong>Frontend</strong></td>
<td>
<img src="https://img.shields.io/badge/Next.js_14-000?logo=next.js&logoColor=white" alt="Next.js"/>
<img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind"/>
</td>
<td>App Router, Server Components, Responsive UI</td>
</tr>
<tr>
<td><strong>UI Library</strong></td>
<td>
<img src="https://img.shields.io/badge/Radix_UI-161618?logo=radixui&logoColor=white" alt="Radix UI"/>
<img src="https://img.shields.io/badge/Lucide_Icons-f97316?logoColor=white" alt="Lucide"/>
<img src="https://img.shields.io/badge/Recharts-22B5BF?logoColor=white" alt="Recharts"/>
</td>
<td>Accessible components, icons, analytics charts</td>
</tr>
<tr>
<td><strong>Drag & Drop</strong></td>
<td>
<img src="https://img.shields.io/badge/@hello--pangea/dnd-4A90D9?logoColor=white" alt="DnD"/>
</td>
<td>Kanban board with drag-and-drop task reordering</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>
<img src="https://img.shields.io/badge/Express.js_4-000?logo=express&logoColor=white" alt="Express"/>
<img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node"/>
</td>
<td>REST API, authentication middleware, file uploads</td>
</tr>
<tr>
<td><strong>Database</strong></td>
<td>
<img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" alt="MongoDB"/>
<img src="https://img.shields.io/badge/Mongoose-880000?logoColor=white" alt="Mongoose"/>
</td>
<td>Document storage, ODM with schema validation</td>
</tr>
<tr>
<td><strong>Auth</strong></td>
<td>
<img src="https://img.shields.io/badge/JWT-000?logo=jsonwebtokens&logoColor=white" alt="JWT"/>
<img src="https://img.shields.io/badge/bcrypt-003A70?logoColor=white" alt="bcrypt"/>
</td>
<td>Token-based auth, secure password hashing</td>
</tr>
<tr>
<td><strong>Deployment</strong></td>
<td>
<img src="https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white" alt="Vercel"/>
<img src="https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white" alt="Render"/>
<img src="https://img.shields.io/badge/MongoDB_Atlas-47A248?logo=mongodb&logoColor=white" alt="Atlas"/>
</td>
<td>Frontend hosting, backend hosting, managed database</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                        │
│                                                                  │
│   Next.js 14 (App Router)  ──  TypeScript  ──  Tailwind CSS      │
│   ┌───────────┬──────────┬──────────┬──────────┬───────────┐     │
│   │ Auth Page │ Dashboard│  Kanban  │   Team   │ Personal  │     │
│   │           │  Stats   │  Board   │ Manage   │   To-Do   │     │
│   └───────────┴──────────┴──────────┴──────────┴───────────┘     │
│                          │ Axios HTTP │                           │
└──────────────────────────┼────────────┼──────────────────────────┘
                           │  REST API  │
┌──────────────────────────┼────────────┼──────────────────────────┐
│                     EXPRESS.JS SERVER                             │
│                                                                  │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│   │ Auth Routes  │  │ Task Routes  │  │  Upload Routes     │     │
│   │  /api/auth   │  │  /api/tasks  │  │  /api/upload       │     │
│   └──────┬───────┘  └──────┬───────┘  └────────┬───────────┘     │
│          │                 │                    │                 │
│   ┌──────▼─────────────────▼────────────────────▼───────────┐    │
│   │              JWT Auth Middleware                         │    │
│   └──────────────────────┬──────────────────────────────────┘    │
│                          │  Mongoose ODM                         │
└──────────────────────────┼──────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │    MongoDB Atlas        │
              │  ┌──────┐ ┌──────────┐  │
              │  │Users │ │  Tasks   │  │
              │  ├──────┤ ├──────────┤  │
              │  │Admin │ │ Sessions │  │
              │  ├──────┤ └──────────┘  │
              │  │Manager│              │
              │  └──────┘               │
              └─────────────────────────┘
```

---

## 📦 Project Structure

```
taskflow-app/
│
├── frontend/                    # Next.js 14 Application
│   ├── app/                     # App Router (pages & layouts)
│   │   ├── dashboard/           # Protected dashboard routes
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Landing / Auth page
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── ui/                  # Reusable UI primitives (shadcn/ui)
│   │   ├── auth-page.tsx        # Login & Registration
│   │   ├── dashboard-layout.tsx # Main app shell & navigation
│   │   ├── dashboard-stats.tsx  # Analytics cards & charts
│   │   ├── kanban-board.tsx     # Drag-and-drop task board
│   │   ├── personal-todo.tsx    # Personal task manager
│   │   ├── user-management.tsx  # Team member listing
│   │   ├── task-modal.tsx       # Task create/edit dialog
│   │   ├── project-modal.tsx    # Project create/edit dialog
│   │   ├── project-overview.tsx # Project listing & overview
│   │   └── profile-settings-modal.tsx  # User profile editor
│   ├── contexts/                # React Context providers
│   │   └── notification-context.tsx
│   ├── hooks/                   # Custom React hooks
│   └── lib/                     # Utilities & configuration
│
├── backend/                     # Express.js REST API
│   ├── server.js                # App entry point & config
│   ├── models/                  # Mongoose schemas
│   │   ├── user.js              # User model
│   │   ├── Admin.js             # Admin model
│   │   ├── Manager.js           # Manager model
│   │   ├── Task.js              # Task model
│   │   └── activeSession.js     # Session tracking
│   ├── routes/                  # API route handlers
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── taskRoutes.js        # Task CRUD endpoints
│   │   ├── uploadRoutes.js      # File upload endpoints
│   │   └── user.js              # User profile endpoints
│   ├── middleware/              # Express middleware
│   │   └── authMiddleware.js    # JWT verification
│   └── scripts/                 # Utility scripts
│
├── .gitignore
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org) | 18+ | Runtime environment |
| [MongoDB](https://www.mongodb.com) | 6+ (or Atlas) | Database |
| [Git](https://git-scm.com) | Latest | Version control |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Ethical-21/taskflow-app.git
cd taskflow-app
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your_strong_secret_key_here
```

Start the development server:

```bash
npm run dev    # Starts on http://localhost:5000
```

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev    # Starts on http://localhost:3000
```

### 4️⃣ Open the App

Navigate to [http://localhost:3000](http://localhost:3000) in your browser. Create an account to get started!

---

## 🌐 Deployment

<details>
<summary><strong>Frontend → Vercel</strong></summary>

1. Import the repository on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Framework Preset will auto-detect as **Next.js**
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.onrender.com
   ```
5. Deploy 🚀

</details>

<details>
<summary><strong>Backend → Render</strong></summary>

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `backend`
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add environment variables:
   ```
   MONGO_URI = your_mongodb_atlas_connection_string
   JWT_SECRET = your_strong_secret_key
   PORT = 10000
   FRONTEND_URL = https://your-app.vercel.app
   ```
6. Deploy 🚀

</details>

<details>
<summary><strong>Database → MongoDB Atlas</strong></summary>

1. Create a free cluster on [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. Whitelist `0.0.0.0/0` to allow Render access
4. Copy the connection string and add it as `MONGO_URI` in Render env vars

</details>

---

## 👥 Roles & Permissions

| Feature | 🔴 Admin | 🟡 Manager | 🟢 Team Member |
|:--------|:--------:|:----------:|:--------------:|
| View all tasks | ✅ | ✅ | ❌ *(own only)* |
| Create tasks | ✅ | ✅ | ❌ |
| Edit / delete tasks | ✅ | ✅ | ❌ |
| Assign tasks to users | ✅ | ✅ | ❌ |
| Kanban drag-and-drop | ✅ | ✅ | ❌ |
| Team management | ✅ | ✅ | ❌ |
| View dashboard analytics | ✅ | ✅ | ✅ *(own stats)* |
| Personal to-do list | ✅ | ✅ | ✅ |
| Profile management | ✅ | ✅ | ✅ |

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|:------:|:---------|:------------|:----:|
| `POST` | `/api/auth/signup` | Register a new user | ❌ |
| `POST` | `/api/auth/signin` | Login & receive JWT | ❌ |
| `POST` | `/api/auth/logout` | End current session | ✅ |
| `GET` | `/api/auth/users` | List all users | ✅ |
| `GET` | `/api/auth/active-sessions` | Get active sessions | ✅ |

### Tasks

| Method | Endpoint | Description | Auth |
|:------:|:---------|:------------|:----:|
| `GET` | `/api/tasks` | Get tasks (role-filtered) | ✅ |
| `POST` | `/api/tasks` | Create a new task | ✅ |
| `PUT` | `/api/tasks/:id` | Update a task | ✅ |
| `DELETE` | `/api/tasks/:id` | Delete a task | ✅ |
| `GET` | `/api/tasks/stats/summary` | Dashboard statistics | ✅ |

### User Profile

| Method | Endpoint | Description | Auth |
|:------:|:---------|:------------|:----:|
| `GET` | `/api/auth/user/profile` | Get user profile | ✅ |
| `PUT` | `/api/auth/user/profile` | Update profile | ✅ |
| `POST` | `/api/upload/avatar` | Upload profile picture | ✅ |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|:---------|:------------|:--------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `my_super_secret_key` |
| `FRONTEND_URL` | Allowed CORS origin *(optional)* | `https://your-app.vercel.app` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|:---------|:------------|:--------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000` |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ for IBM Internship Project © 2026**

[Live Demo](https://taskflow-app-flame-kappa.vercel.app) · [Report Bug](https://github.com/Ethical-21/taskflow-app/issues) · [Request Feature](https://github.com/Ethical-21/taskflow-app/issues)

</div>
