# CampusConnect 🎓
### College Management & Community Portal with Real-Time BookMyShow-Style Event Booking

CampusConnect is a full-stack, enterprise-grade university portal that unifies academic management, doubt discussion forums, and live auditorium/seat booking for campus events in real time.

---

## 🏗️ Architecture Overview

The project is strictly organized into two independent directories in the root:

```
├── client/          # Modern React Frontend (Vite, React Router v6, Axios, Socket.IO Client, Lucide Icons)
└── server/          # Node.js + Express Backend (Mongoose, JWT, bcryptjs, Multer, Socket.IO, QR Code)
```

### Key Modules:
1. **Authentication & Role-Based Access Control**:
   - Three distinct roles: **Student**, **Faculty**, and **Admin**.
   - Secure JWT token handling, bcrypt password hashing, and role-protected routes on both server and client (`ProtectedRoute`).
   - Split-screen Login and Signup views with responsive illustration panels and demo auto-fill chips.
   - Admin account is protected and seeded via `server/seed.js`.
2. **Student Suite**:
   - Real-time dashboard with aggregate attendance meter, pending assignments, upcoming events, and official circulars.
   - **Attendance Tracking**: subject-wise breakdown with progress bars and an automated **< 75% Critical Warning Banner**.
   - **Assignment Submissions**: digital file uploads with Multer, status tracking, scores, and faculty feedback notes.
   - **Study Notes & Materials**: filter by subject/semester and download with live counter increment.
   - **Peer-to-Peer Doubt Forum**: post questions with tags, vote, receive verified faculty responses, and mark answers as solved.
3. **Faculty Suite**:
   - Create, edit, and delete coursework assignments with deadline timers and problem-set file attachments.
   - Comprehensive student submission review and digital grading drawer (marks + personalized feedback).
   - Multi-subject student attendance recording with date selection and 1-click batch actions.
   - Upload verified notes, lab manuals, and presentation slides.
   - Broadcast priority circulars and answer student questions on the forum.
4. **Admin Suite**:
   - Comprehensive user administration: approve, block, activate, promote/demote roles, or delete accounts.
   - Schedule campus events, configure venue capacity and interactive seat grids.
   - Platform analytics: total student/faculty counts, event ticket revenue, and booking tracking.
5. **BookMyShow-Style Real-Time Event Booking**:
   - Event showcase with posters, category filters (Fest, Workshop, Seminar, Movie Night, Guest Lecture), and live seat counters.
   - Interactive Auditorium Seat Map: curved theater stage screen, rows A–J with center aisle separation.
   - **Real-Time WebSockets Sync (Socket.IO)**: seat status (Available, Selected, Held, Booked) updates instantly across multiple tabs.
   - **5-Minute Server-Side Seat Lock**: prevents conflict while selecting; auto-releases if not booked.
   - **Atomic MongoDB Updates**: guarantees zero double-booking even under concurrent traffic spikes.
   - **Digital Ticket Pass**: generates a scannable, cryptographically signed admission QR code, reference ID, and printable pass.
   - **My Bookings**: view active passes or cancel reservations, immediately freeing seats back to the community.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher recommended; v22 supported)
- **npm** (v9 or higher)
- **MongoDB** running locally on default port `27017`
- **MongoDB Compass** (optional, for visual inspection)

---

### Step 1: Clone & Configure Server

1. Open a terminal in the root directory and navigate to the backend:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   A `.env` file is included in `server/.env`. If creating from scratch:
   ```bash
   cp .env.example .env
   ```
   Ensure the following values are configured:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect
   JWT_SECRET=campusconnect_super_secret_jwt_key_2026_xYz987!
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

4. **Seed Demo Data**:
   Populate 1 Admin, 2 Faculty, 5 Students, assignments, submissions, attendance records, study notes, announcements, events, and bookings:
   ```bash
   npm run seed
   ```

5. Start the backend server in development mode:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:5001` with Socket.IO initialized.*

---

### Step 2: Configure & Start Frontend

1. Open a second terminal window and navigate to the client folder:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will open on `http://localhost:5173`.*

---

## 🔑 Demo Login Credentials

You can use the one-click demo chips on the login page or manually enter any of the pre-seeded credentials:

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | System Administrator | `admin@campusconnect.edu` | `Admin@123` | Full control: user management & platform statistics |
| **Faculty** | Prof. Rajesh Sharma | `prof.sharma@campusconnect.edu` | `Faculty@123` | CSE Department Head; marks attendance & grades labs |
| **Faculty** | Dr. Sunita Patel | `dr.patel@campusconnect.edu` | `Faculty@123` | AI & Database Professor |
| **Student** | Aarav Sharma | `aarav.sharma@student.campusconnect.edu` | `Student@123` | High attendance (88%), submitted assignments |
| **Student** | Priya Verma | `priya.verma@student.campusconnect.edu` | `Student@123` | **Low attendance (68%) — triggers `<75%` alert banner** |
| **Student** | Rohan Mehta | `rohan.mehta@student.campusconnect.edu` | `Student@123` | Student Council Member |
| **Student** | Ananya Iyer | `ananya.iyer@student.campusconnect.edu` | `Student@123` | Robotics Club Lead |
| **Student** | Vikram Singh | `vikram.singh@student.campusconnect.edu` | `Student@123` | Sports Captain |

---

## 🍃 Viewing Data in MongoDB Compass

1. Launch **MongoDB Compass**.
2. In the connection dialog, connect to:
   ```text
   mongodb://127.0.0.1:27017
   ```
3. Click on the **`campusconnect`** database.
4. You will see the 9 collections with proper schemas, references, and timestamps:
   - `users`: student, faculty, and administrator profiles
   - `assignments`: course specifications, attachments, and deadlines
   - `submissions`: student files uploaded with Multer, scores, and faculty feedback
   - `attendance`: class registers with date-wise student presence/absence
   - `materials`: study guides and download counters
   - `announcements`: pinned notices, target audience filters, and priority levels
   - `doubts`: discussion threads, upvotes, and accepted solutions
   - `events`: BookMyShow-style venues, ticket pricing, and seat matrices
   - `bookings`: tickets with seat codes and dynamic QR data URLs

---

## ⚡ Testing Real-Time Seat Synchronization

To verify the real-time BookMyShow-style seat holding and booking sync:
1. Open two browser tabs or an incognito window.
2. In Tab 1: Log in as **Aarav** (`aarav.sharma@student.campusconnect.edu`).
3. In Tab 2: Log in as **Priya** (`priya.verma@student.campusconnect.edu`).
4. Both navigate to **College Events** (`/events`) and select the same event (e.g. *TechPulse 2026*).
5. In Tab 1, click on seat **A1**:
   - Tab 1 immediately displays seat **A1** as **Selected (by You)** with a 5-minute countdown timer.
   - Tab 2 instantly updates in real time to display seat **A1** as **Locked (Held by Other)** with a lock icon.
6. In Tab 1, click **Confirm & Get Ticket**:
   - Confetti celebration launches.
   - Tab 1 transitions to the Ticket Pass with reference ID and admission QR code.
   - Tab 2 immediately updates seat **A1** to **Booked (Unavailable)**.
