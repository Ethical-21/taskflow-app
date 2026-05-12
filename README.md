# TaskFlow — Corporate Task Management System

> A full-stack task management application built with Next.js, Express.js, and MongoDB.

![TaskFlow](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Express](https://img.shields.io/badge/Express-4.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

---

## 🚀 Features

- **Role-Based Access Control** — Admin, Manager, and Team Member roles
- **Kanban Board** — Drag-and-drop task management with real-time persistence
- **Dashboard Analytics** — Live statistics with task completion rates
- **Team Management** — View and manage all team members
- **Personal To-Do** — Individual task tracking for team members
- **JWT Authentication** — Secure token-based auth with bcrypt password hashing
- **Responsive Design** — Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Radix UI |
| Backend | Express.js 4, Node.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT + bcrypt |
| Drag & Drop | @hello-pangea/dnd |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## 📦 Project Structure

```
taskflow/
├── frontend/          # Next.js 14 app
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   ├── contexts/      # React contexts
│   └── lib/           # Utilities & config
└── backend/           # Express.js API
    ├── models/        # Mongoose models
    ├── routes/        # API routes
    └── middleware/    # Auth middleware
```

---

## ⚡ Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your_strong_secret_here
```

```bash
npm run dev    # starts on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
npm run dev    # starts on http://localhost:3000
```

---

## 🌐 Deployment

### Frontend → Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add env var: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`

### Backend → Render
1. Create Web Service on [render.com](https://render.com)
2. Set **Root Directory** to `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `node server.js`
5. Add env vars: `MONGO_URI`, `JWT_SECRET`, `PORT=10000`

### Database → MongoDB Atlas
1. Create free cluster on [cloud.mongodb.com](https://cloud.mongodb.com)
2. Whitelist `0.0.0.0/0` for Render access
3. Copy connection string to Render env vars

---

## 👥 Roles & Permissions

| Feature | Admin | Manager | Team Member |
|---------|-------|---------|-------------|
| View all tasks | ✅ | ✅ | ❌ (own only) |
| Create tasks | ✅ | ✅ | ❌ |
| Assign tasks | ✅ | ✅ | ❌ |
| Team management | ✅ | ✅ | ❌ |
| Personal to-do | ✅ | ✅ | ✅ |
| View dashboard stats | ✅ | ✅ | ✅ (own) |

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | Login & get JWT |
| POST | `/api/auth/logout` | End session |
| GET | `/api/auth/users` | Get all users |
| GET | `/api/auth/active-sessions` | Get active sessions |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get tasks (role-filtered) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/stats/summary` | Dashboard statistics |

---

## 📄 License

MIT © 2026 — Built for IBM Internship Project
