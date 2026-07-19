# 🏥 AI-Powered Hospital Management System

## 📌 Project Overview

This project is an AI-Powered Hospital Management System developed using the MERN architecture (React + Node.js + PostgreSQL).

The purpose of this project is to digitize hospital workflows by replacing traditional paper folders with secure digital patient records.

The system supports:

- User Authentication
- Patient Management
- AI Generated Clinical Outputs
- Shared Clinical Notes
- Ward & Bed Management
- Notifications
- Admin Panel

---

# 👨‍💻 Developer

**Name:** Shashank Makwana

**Project Type:** Major Project

---

# 🛠 Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS (To be installed)
- React Router
- Axios
- Lucide Icons

---

## Backend

- Node.js
- Express.js
- PostgreSQL (Supabase)
- JWT Authentication
- bcrypt.js

---

## Database

Supabase PostgreSQL

---

## AI

Google Gemini API (Later)

---

# 📂 Folder Structure

```
HOSPITAL-MANAGEMENT
│
├── client/
│
└── server/
```

---

# 📁 CLIENT

Contains the complete frontend application.

```
client
│
├── public
│
├── src
│
├── package.json
│
└── vite.config.js
```

---

## src/

Contains all React code.

---

### assets/

Stores

- Images
- Logos
- Icons
- Fonts

---

### components/

Reusable components.

Examples

```
Button
Input
Navbar
Sidebar
Modal
```

---

### pages/

Complete webpages.

Examples

```
Login
Register
Dashboard
Patients
Admin
```

---

### services/

Contains all API calls.

Example

```
authService.js

patientService.js
```

Never call backend APIs directly from pages.

Always use services.

---

### styles/

Contains CSS files if required.

---

### App.jsx

Main application component.

All routes start here.

---

### main.jsx

Application Entry Point.

React starts from here.

---

# 📁 SERVER

Contains Backend APIs.

```
server
│
├── config
├── controllers
├── middleware
├── routes
├── utils
└── index.js
```

---

## config/

Contains configuration files.

Current:

```
db.js
```

Purpose

Connect Express to Supabase PostgreSQL.

---

## controllers/

Contains Business Logic.

Example

```
authController.js
```

Controller responsibilities

- Register User

- Login User

- Validate Inputs

- Database Queries

Controllers should NEVER define routes.

---

## middleware/

Contains middleware functions.

Current

```
authMiddleware.js
```

Purpose

Protect APIs using JWT.

---

## routes/

Contains API Endpoints.

Example

```
authRoutes.js
```

Routes call Controllers.

Example

```
POST /register

↓

authController.registerUser()
```

---

## utils/

Utility functions.

Examples

```
Generate OTP

Date Formatter

AI Prompt Builder
```

---

## index.js

Main Backend Entry Point.

Responsibilities

- Start Server

- Register Routes

- Register Middleware

- Protected Routes

---

# 📦 Installed Packages

## CLIENT

### react

Purpose

Build User Interface.

---

### react-dom

Render React Application.

---

### vite

Development Server.

---

### react-router-dom (To Install)

Purpose

Navigation between pages.

Example

```
Login

↓

Dashboard

↓

Patients
```

---

### axios (To Install)

Purpose

Connect Frontend with Backend APIs.

Example

```
POST

/api/auth/login
```

---

### tailwindcss (To Install)

Purpose

Fast UI Design.

Instead of writing CSS files.

---

### lucide-react (To Install)

Purpose

Modern SVG Icons.

---

# SERVER

---

### express

Backend Framework.

---

### pg

Connect Node.js with PostgreSQL.

---

### cors

Allow React to communicate with Backend.

---

### dotenv

Read .env variables.

---

### bcryptjs

Encrypt Passwords and MPIN.

---

### jsonwebtoken

Generate Login Tokens.

---

# 🔐 Authentication Flow

```
Register User

↓

Password Hash

↓

Store in Database

↓

Login

↓

Verify Password

↓

Generate JWT

↓

Protected API

↓

Dashboard
```

---

# 📋 Modules

## Module 1

Authentication

Status

✅ Completed

Features

- Registration

- Login

- JWT

- Protected Routes

---

## Module 2

Frontend Authentication

Status

🟡 In Progress

Features

- Login UI

- Register UI

- Connect Backend

- Store JWT

- Redirect Dashboard

---

## Module 3

Dashboard

Status

🔲 Pending

---

## Module 4

Patient Management

Status

🔲 Pending

---

## Module 5

Clinical Notes

Status

🔲 Pending

---

## Module 6

AI Assistant

Status

🔲 Pending

---

## Module 7

Notifications

Status

🔲 Pending

---

## Module 8

Admin Panel

Status

🔲 Pending

---

# 📝 Coding Rules

Every file should follow this format.

```javascript
/***********************************************************************
 * File Name :
 * Purpose :
 * Author :
 * Last Updated :
 *
 * Description :
 ***********************************************************************/
```

---

# 🚀 Future Features

- AI Clinical Summary

- AI Referral Letter

- AI Discharge Summary

- Patient Timeline

- Ward Management

- Bed Availability

- Notifications

- Mobile Responsive

- Dark Mode

---

# 📅 Development Progress

✅ Database Connected

✅ Registration API

✅ Login API

✅ JWT Authentication

✅ Protected Routes

⬜ React Login

⬜ Dashboard

⬜ Patient Module

⬜ AI Module

⬜ Admin Panel

---

Last Updated

10 July 2026