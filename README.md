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

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with PostCSS & custom dark glassmorphism
- **Routing:** React Router v6
- **Icons:** [Lucide React](https://lucide.dev/)
- **State & Context:** React Context API (`AuthContext`, `ThemeContext`)
- **HTTP Client:** Axios with JWT Bearer authentication interceptor
- **Linting:** Oxlint / ESLint

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm`, `yarn`, or `pnpm`

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/siddhantvani/Vishal-Fitness-web.git
cd Vishal-Fitness-web/webapp
npm install
```

### 3. Environment Setup

Create an environment configuration file:

```bash
cp .env.example .env
```

Configure `VITE_API_BASE_URL` to point to the backend API:

```env
# Point to your local Vishal-Fitness-Backend server:
VITE_API_BASE_URL=http://localhost:5000/api

# Or your production API URL:
# VITE_API_BASE_URL=https://api.yourdomain.com/api
```

> **NOTE:** Never commit `.env` or `.env.local` to source control.

---

## 💻 Development Commands

Navigate to `webapp/` to run commands:

```bash
cd webapp
```

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start local Vite development server with HMR at `http://localhost:5173` |
| `npm run build` | Build optimized production bundles into `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run code linter |

---

## 🏗️ Build Commands

To generate an optimized production build:

```bash
cd webapp
npm run build
```

The output artifacts will be placed in the `webapp/dist/` directory, ready to be served by any static host (Netlify, Vercel, Cloudflare Pages, Nginx, etc.).

---

## 👥 Functionality Overview

### 1. Member & Public Features
- **Hero & Programs:** Explore fitness programs (Strength, HIIT, Yoga, Personal Training, Cardio).
- **Class Schedules:** Interactive filterable schedule showing class times, trainers, and available slots.
- **Fitness Calculators:** BMI Calculator and Workout/Calorie Burn Calculators with immediate feedback.
- **Online Booking:** Authenticated booking flow allowing members to reserve class slots.
- **WhatsApp Integration:** Instant inquiry button connecting members to gym front-desk support.

### 2. Admin & Staff Features
- **Secure Authentication:** Protected `/admin/*` routes with JWT role verification.
- **Admin Dashboard:** High-level metrics for active members, total bookings, revenue estimates, and today's classes.
- **Members Management:** Full CRUD operations on member accounts, active/inactive statuses.
- **Trainers Management:** Assign trainers, manage bios, specialties, and contact details.
- **Classes & Schedules:** Create new class types, schedule recurring and one-off class timeslots.
- **Bookings Management:** Filter bookings by date/status, approve bookings, or mark cancellations.
- **Attendance:** Record member check-ins in real-time.
- **Workouts & Progress:** Assign customized workout routines to members and log body measurements.

---

## 📁 Repository Structure

```
Vishal-Fitness-web/
├── webapp/
│   ├── public/              # Static assets (favicons, SVG icons)
│   ├── src/
│   │   ├── api/             # Axios API client & endpoints
│   │   ├── assets/          # Images, logos, branding assets
│   │   ├── components/      # Reusable UI components & calculators
│   │   │   └── admin/       # Admin sidebar, header, layouts, modals
│   │   ├── context/         # AuthContext & ThemeContext
│   │   ├── data/            # Mock fallback data
│   │   ├── pages/           # Public pages (Home, Classes, Trainers, Login, Register)
│   │   │   └── admin/       # Admin dashboard pages (Members, Bookings, Schedules, etc.)
│   │   ├── App.tsx          # Main React router & layout configuration
│   │   ├── index.css        # Tailwind styles & theme variables
│   │   └── main.tsx         # Application entry point
│   ├── .env.example         # Template for environment variables
│   ├── index.html           # HTML template
│   ├── package.json         # Dependencies & scripts
│   ├── tailwind.config.js   # Tailwind design tokens
│   └── vite.config.ts       # Vite bundler configuration
├── .env.example             # Root environment template
├── .gitignore               # Root git ignore
└── README.md                # Project documentation
```

---

## 📄 License

ISC License. All rights reserved.
