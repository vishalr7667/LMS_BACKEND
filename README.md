# 🎬 Terra Byte — LMS Backend

> REST API for Terra Byte, a modern Learning Management System (LMS) optimized for tech and creative learning. Built with Node.js, Express, MongoDB, and Agenda.

---

## 📌 About

This is the backend service for Terra Byte LMS. It manages authentication, user profiles, site configuration, course/module content organization, lesson reviews, resource downloads, and student progress tracking. It also features background-queued tasks (via Agenda) to manage user notifications such as email announcements when site maintenance is completed.

**Frontend Repository:** [LMS_FRONTEND](https://github.com/vishalr7667/LMS_FRONTEND)

---

## ✨ Features

- 🔐 **Secure Authentication**: JWT-based sign-in using cookies, including robust Access/Refresh Token rotation.
- 👥 **Role-Based Access Control**: Strict route guarding for administrators (`admin`) vs students (`user`).
- 📚 **Course, Module & Lesson APIs**: Dynamic creation, editing, and publishing controls for learning paths.
- 🔒 **Gated Content**: Automated access control—premium lessons are only accessible to enrolled students or active subscribers, while free preview lessons are open to all.
- 📈 **Progress & Video Tracking**: Records student course completion percentages, marked lessons, and last-watched video timestamps to resume where they left off.
- 💬 **Discussion & Comments**: Threaded lesson comments to support Student-Instructor Q&A.
- 📦 **Resource Center**: Support for searchable and downloadable attachments (e.g. project templates, PBR assets, cheatsheets).
- ⚙️ **Site Settings Panel**: Custom administrative dashboard allowing dynamically toggled maintenance modes, copyright labels, social links, and site names.
- 👷 **Background Job Worker**: Agenda-powered processing to handle asynchronous email distribution (Nodemailer integrations) when maintenance ends.
- 🛡️ **Centralized Error Handling**: Unified response wrappers, multer file validation filters, and secure database error handlers.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Runtime** | Node.js | Fast, non-blocking asynchronous environment |
| **Framework** | Express.js | Minimalist, robust web application framework |
| **Database** | MongoDB | Flexible document database |
| **ODM** | Mongoose | Schema-based modeling for MongoDB |
| **Auth** | JWT | Cookie-based Access & Refresh tokens |
| **Scheduling** | Agenda | MongoDB-backed background job scheduling engine |
| **Mailing** | Nodemailer | Standard email dispatch handler |
| **Uploads** | Multer | Local disk-based file uploading utility |
| **Deployment** | Vercel / Render / Railway | Serverless / Cloud Hosting targets (`vercel.json` included) |

---

## 📁 Project Structure

The project has a flat folder structure containing standard MVC components:

```
LMS_BACKEND/
│
├── config/         → MongoDB database connection setup
├── controllers/    → Business logic & Request handler functions
├── middleware/     → Authentication, role verification, and error handler middlewares
├── models/         → Mongoose database schemas (User, Course, Module, Lesson, Progress, etc.)
├── routes/         → API router mount files (auth, courses, progress, admin, upload, etc.)
├── uploads/        → Local directory containing uploaded course assets, covers, and zip resources
├── utils/          → Nodemailer email configurations & Agenda task queue processor
│
├── .env.example    → Template for required environment variables
├── package.json    → Scripts and project dependencies configuration
├── seed.js         → Primary Database seeder (Admin, Users, Courses, Modules, Lessons, Resources)
├── seed-features.js→ Secondary seeder to populate default highlights/features list in courses
├── server.js       → Server entry file (initializes middleware, routing, and background workers)
└── vercel.json     → Settings for Vercel deployment support
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local server running or Atlas Cloud URI)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vishalr7667/LMS_BACKEND.git
   cd LMS_BACKEND
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   # Open the .env file and fill in your connection secrets and SMTP settings
   ```

4. **Seed the database:**
   To populate initial users, course lessons, modules, and downloadable resource items:
   ```bash
   # Run main database seeder
   npm run seed
   
   # Run course features seeder
   node seed-features.js
   ```

5. **Start development server (with hot reloading):**
   ```bash
   npm run dev
   ```

---

## 🔑 Environment Variables

Make sure the following variables are specified in your `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_uri

# Authentication Secrets
JWT_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Allowed Cors Clients
CLIENT_URL=http://localhost:3000

# Email Integration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
FROM_EMAIL=your_email@gmail.com
FROM_NAME=Terra Byte
```

---

## 👥 Seed Credentials (Local Development)

After seeding the database with `npm run seed`, you can authenticate using the following built-in users:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@vfxvault.com` | `password123` |
| **Subscriber** | `alex@email.com` | `password123` |
| **Regular User / Student** | `sarah@email.com` | `password123` |

---

## 👨‍💻 Author

**Vishal Kumar** — Full Stack Developer
- LinkedIn: [vishal-rajput-60502b384](https://linkedin.com/in/vishal-rajput-60502b384)
- GitHub: [@vishalr7667](https://github.com/vishalr7667)
- Portfolio: [portfolio-vishal-kumars-projects.vercel.app](https://portfolio-vishal-kumars-projects.vercel.app)
