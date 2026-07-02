# Crowd Anomaly Detection System — React Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite" />
  <img src="https://img.shields.io/badge/Ant%20Design-5-0170FE?logo=antdesign" />
  <img src="https://img.shields.io/badge/Redux%20Toolkit-latest-764ABC?logo=redux" />
</p>

> An AI-powered public safety surveillance frontend. Connects to Spring Boot backend via REST APIs and WebSockets.

---

## 🚀 Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19 | Core UI framework |
| TypeScript | 5 | Type safety |
| Vite | 5 | Build tool |
| Ant Design | 5 | UI component library |
| Redux Toolkit | latest | State management |
| React Router | v7 | Routing |
| Axios | latest | HTTP client with JWT interceptor |
| SockJS + STOMP | latest | WebSocket real-time alerts |
| Apache ECharts | latest | Data visualization charts |
| Day.js | latest | Date formatting |
| React CountUp | latest | Animated statistics |

---

## 📁 Project Structure

```
src/
├── assets/
├── components/
│   ├── charts/          # ECharts wrappers (4 dashboard + 5 analytics)
│   ├── dashboard/       # StatCard, RecentIncidentsTable, RecentAlerts
│   ├── layout/          # MainLayout, Sidebar, Navbar, Footer
│   ├── cameras/         # CameraFormModal
│   ├── incidents/       # IncidentDrawer
│   ├── monitoring/      # CameraCard
│   └── users/           # UserFormModal
├── hooks/               # useAuth, useWebSocket, useTheme, useAppDispatch, useAppSelector
├── pages/
│   ├── auth/            # LoginPage, RegisterPage, ForgotPasswordPage
│   ├── dashboard/       # DashboardPage
│   ├── monitoring/      # LiveMonitoringPage
│   ├── cameras/         # CameraManagementPage
│   ├── incidents/       # IncidentPage
│   ├── analytics/       # AnalyticsPage
│   ├── users/           # UsersPage (Admin only)
│   ├── settings/        # SettingsPage
│   └── errors/          # NotFoundPage, ForbiddenPage, ServerErrorPage
├── routes/              # AppRouter, ProtectedRoute, RoleGuard
├── services/            # api.ts, authService, cameraService, incidentService...
├── store/
│   ├── slices/          # authSlice, dashboardSlice, cameraSlice...
│   └── index.ts
├── styles/              # global.css
├── types/               # index.ts (all TypeScript interfaces)
├── utils/               # helpers.ts, formatters.ts, constants.ts
├── App.tsx
└── main.tsx
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js 18+
- npm 9+
- Spring Boot backend running on `http://localhost:8080`

### 1. Clone & Install

```bash
git clone <repo-url>
cd crowd-anomaly-frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws
VITE_APP_NAME=Crowd Anomaly Detection System
VITE_APP_VERSION=1.0.0
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for Production

```bash
npm run build
npm run preview
```

---

## 🔐 Authentication

| Route | Access |
|-------|--------|
| `/login` | Public |
| `/register` | Public |
| `/forgot-password` | Public |
| `/dashboard` | Protected |
| `/monitoring` | Protected |
| `/cameras` | Protected |
| `/incidents` | Protected |
| `/analytics` | Protected |
| `/users` | Admin only |
| `/settings` | Protected |

- JWT token stored in `localStorage`
- Automatic token refresh on 401 responses
- Auto-redirect to `/login` on token expiry

---

## 🌐 API Integration

### Backend URL: `http://localhost:8080`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login |
| `/api/auth/register` | POST | Register |
| `/api/auth/refresh` | POST | Refresh JWT |
| `/api/dashboard` | GET | Dashboard stats + charts |
| `/api/cameras` | GET/POST | Camera list/create |
| `/api/cameras/{id}` | PUT/DELETE | Camera update/delete |
| `/api/incidents` | GET | Paginated incidents |
| `/api/incidents/{id}` | GET/DELETE | Incident detail/delete |
| `/api/users` | GET/POST | User list/create |
| `/api/users/{id}` | PUT/DELETE | User update/delete |
| `/api/ml/analyze-camera` | POST | Trigger ML analysis |

### WebSocket Topics

| Topic | Event |
|-------|-------|
| `/topic/incidents` | New incident created |
| `/topic/alerts` | New alert triggered |

---

## 🎨 Design System

- **Theme**: Dark mode by default (toggleable to light)
- **Font**: Inter (Google Fonts)
- **Colors**: Cyan (`#00d4ff`), Purple (`#7c3aed`)
- **Cards**: Glassmorphism with `backdrop-filter: blur(20px)`
- **Animations**: Fade-in, slide-in, scale-up entry animations
- **Charts**: Apache ECharts with custom dark theme

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| `ADMIN` | Full access including User Management |
| `OPERATOR` | Dashboard, Monitoring, Cameras, Incidents, Analytics, Settings |

---

## 📊 Dashboard Charts

1. **Incident Trends** — 7-day bar + line combo chart
2. **Alert Distribution** — Donut chart by alert level
3. **Crowd Density** — Hourly area line chart
4. **Camera Status** — Nightingale rose chart

## 📈 Analytics Charts

1. Monthly incidents bar chart
2. Alert trends by level (area lines)
3. Camera performance dual-axis
4. Crowd density heatmap (Hour × Day)
5. Fight/Stampede radar chart by camera
6. Incident resolution rate pie chart

---

## 🔧 Scripts

```bash
npm run dev        # Start dev server (port 5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint check
npm run type-check # TypeScript check
```

---

## 🏗️ Architecture

```
React Frontend (localhost:5173)
      ↓ REST API + WebSocket
Spring Boot Backend (localhost:8080)
      ↓ ML Analysis requests
Python ML Service (localhost:8000)
```

---

## ✅ Features Checklist

- [x] JWT Authentication (Login / Register / Forgot Password)
- [x] Auto Login (localStorage persistence)
- [x] Auto Logout (token refresh + expiry)
- [x] Protected Routes
- [x] Role-based Navigation (ADMIN / OPERATOR)
- [x] Responsive Layout (Desktop / Tablet / Mobile)
- [x] Dark / Light Theme toggle
- [x] Glassmorphism UI cards
- [x] Real-time WebSocket alerts (SockJS + STOMP)
- [x] AntD notification popups on new incidents
- [x] 6 Dashboard stat cards with CountUp animations
- [x] 4 Dashboard ECharts
- [x] Live Camera Monitoring grid
- [x] Per-camera ML analysis trigger
- [x] Camera CRUD management
- [x] Incident table with filters + drawer details
- [x] 6 Analytics ECharts including heatmap & radar
- [x] Admin-only User Management
- [x] Settings: theme, color picker, language, notifications, change password
- [x] 404 / 403 / 500 error pages
- [x] Skeleton loading states
- [x] Empty states
- [x] Lazy-loaded routes (code splitting)

---

## 📄 License

MIT © Crowd Anomaly Detection System
