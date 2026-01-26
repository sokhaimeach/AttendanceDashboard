# Attendance Dashboard Management System

A web-based attendance dashboard for schools/training centers to **manage students, classes, subjects**, and **record attendance** efficiently.  
The system supports **role-based access** for **Admin** and **Teacher**, with features like **Student CRUD**, **Import/Export Excel**, and **weekly/daily attendance tracking**.

---

## Features

### ✅ Student Management
- Create, view, update, delete students (CRUD)
- Search / filter students by class, name, gender, etc.
- Import students from **Excel** (bulk upload)
- Export student list to **Excel**

### ✅ Attendance Recording
- Record attendance by class and date (Present/Absent/Late/Permission)
- Weekly/day view attendance table
- Update attendance records (edit or re-check)
- Attendance summary (optional: total present/absent)

### ✅ Class Management
- Create, view, update, delete classes
- Prevent duplicate class names (recommended)
- Assign students to classes

### ✅ Subject Management
- Create, view, update, delete subjects
- Assign subjects to classes/teachers (optional, based on your design)

### ✅ User & Role Management
- **Admin**
  - Full access to all modules
  - Manage teachers/admin accounts (optional)
- **Teacher**
  - Record attendance
  - View assigned classes/students/subjects (recommended)

---

## User Roles

### Admin
- Manage Students (CRUD + Import/Export)
- Manage Classes
- Manage Subjects
- Manage Users (Teacher/Admin) *(if implemented)*
- View and edit attendance records

### Teacher
- Record attendance
- View student lists for assigned classes
- View attendance history *(if allowed)*

---

## Modules Overview

- **Dashboard**
  - Stats summary (students, classes, attendance rate, etc.)
- **Students**
  - CRUD + Import Excel + Export Excel
- **Attendance**
  - Record / update attendance by date
- **Classes**
  - CRUD
- **Subjects**
  - CRUD
- **Users**
  - Login/logout, role-based access (Admin/Teacher)

---

## Tech Stack (edit as needed)
**Frontend:** Angular + Bootstrap  
**Backend:** Node.js + Express  
**Database:** MySQL (Sequelize ORM)  
**File Import:** Excel/CSV parser (e.g., xlsx, csvtojson)

---

## Screens / Pages (Suggested)
- Login
- Dashboard (overview)
- Student Management
- Attendance Record Page
- Class Management
- Subject Management
- User Management (Admin only)

---

## Import Excel Format (Example)

| studentname_en | studentname_kh | gender | class |
|---|---|---|---|
| Sok Dara | សុខ ដារ៉ា | M | Class A |
| Srey Mom | ស្រី ម៉ម | F | Class B |

**Notes**
- `class` can auto-create new class if not found *(recommended)*
- Headers should match your backend mapping

---

## Export Excel
Export student list as `.xlsx` with selected columns such as:
- ID, English Name, Khmer Name, Gender, Class, Created Date

---

## Installation (Example)

### 1) Clone
```bash
git clone https://github.com/sokhaimeach/AttendanceDashboard
cd attendance-dashboard
