# Vishal Fitness — Web Platform & Admin Portal

Modern React and Vite web application for the Vishal Fitness gym, featuring both a public member-facing site and a full-featured Admin Management Dashboard.

---

## 🌐 Project Overview

**Vishal Fitness Web** is the digital hub for Vishal Fitness Gym, providing:
- **Public & Member Portal:**
  - Modern hero section, program discovery, and interactive class schedule
  - Trainer showcase and client transformation stories
  - Interactive BMI and caloric/workout calculators
  - Direct WhatsApp quick-booking and class reservation modal
  - Member account registration, login, and authenticated booking
- **Admin Management Portal:**
  - Comprehensive dashboard with operational metrics
  - Members management (view, edit status, delete)
  - Trainers management (create, update, manage profiles)
  - Classes & schedule management (create, edit, cancel schedules)
  - Bookings administration (confirm, cancel, view status)
  - Attendance tracking and verification
  - Member workout routine assignments and progress logs

---

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS with PostCSS & custom dark glassmorphism
- **Routing:** React Router v6
- **Icons:** Lucide React
- **State & Context:** React Context API (`AuthContext`, `ThemeContext`)
- **HTTP Client:** Axios with JWT Bearer authentication interceptor

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the backend API URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Development Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server at `http://localhost:5173` |
| `npm run build` | Build production bundle into `dist/` |
| `npm run preview` | Locally preview production build |
| `npm run lint` | Run code linter |

---

## 📄 License

ISC License. All rights reserved.
