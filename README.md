# Student College Management System

A college administration web application to manage students, department-wise semester curriculum, semester marks, attendance, backlog clearances, and examination results.

---

## Features

- **College Authentication**: College admin registration, login, JWT token authentication, profile management, and password reset.
- **Dashboard**: Summary metrics (Total Students, Current Students, Graduated Students, Pending Backlogs), quick actions, and recently registered students.
- **Student Management**: Student enrollment with unique Roll Numbers, department, degree, gender, admission year, and status tracking (*Current Student*, *Graduated*, *Discontinued*).
- **Academic Records (Semesters 1–8)**: Expandable semester scorecards showing enrolled subjects, marks, grades, attendance, and semester CGPA.
- **Marks Entry**: Automatic detection of branch-specific curriculum per semester (CSE, IT, ECE, EEE, MECH, CIVIL, AI & DS) with internal and external mark validations.
- **Attendance Management**: Auto-populated branch curriculum subjects with conducted and attended class recording and automated attendance percentage calculation.
- **Backlogs & Clearance**: Dedicated backlogs tracker with real-time backlog exam mark recording, automated pass status update, and CGPA recalculation.
- **Semester Results**: Detailed marksheet view per semester with result status (*PASSED*, *NOT CLEARED*, *IN PROGRESS*) and CGPA computation.

---

## Tech Stack

- **Frontend**: React.js, Vite, Plain CSS, React Router DOM, Context API, Fetch API
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs, CORS
- **Database**: MongoDB / Mongoose

---

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
node server.js
```
*Backend runs on `http://localhost:5000`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*
