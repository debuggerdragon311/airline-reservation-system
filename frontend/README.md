# AeroBook — Frontend

React + Vite frontend for the AeroBook flight reservation system.

---

## Stack

| Package         | Purpose |
|-----------------|---|
| React 19+       | UI framework |
| Vite            | Dev server and bundler |
| Tailwind CSS    | Utility-first styling |
| React Router    | Client-side routing |
| Axios           | HTTP client for API calls |
| Lucide React    | Icon set |
| React Hot Toast | Toast notifications |

---

## Getting Started

**Prerequisites:** Bun, Node.js 20+, backend running on port 8080

```bash
cd frontend
bun install
bun run dev
```

Runs on `http://localhost:5173`
API requests proxy to `http://localhost:8080` automatically — no CORS config needed.

> Backend must be running before you test any API calls.
> See root `README.md` for backend setup.

---

## Folder Structure

```
frontend/src/
├── api/          ← Axios instance and API call functions
├── components/   ← Reusable UI components (buttons, inputs, cards)
├── pages/        ← One folder per page (Login, Register, Flights, Booking)
├── hooks/        ← Custom React hooks
├── context/      ← Auth context (token storage, user state)
├── utils/        ← Helper functions
└── App.jsx       ← Routes defined here
```

---

## How to Pick Up Work

**1. Pull the latest dev branch**
```bash
git checkout dev
git pull origin dev
```

**2. Create your feature branch off `feature/ui` branch**
```bash
git checkout -b feature/ui-<your-page>
```

Examples:
```
feature/ui-auth        → /login and /register pages
feature/ui-flights     → flight search page
feature/ui-booking     → booking flow and confirmation
feature/ui-dashboard   → passenger dashboard, my bookings
```

**3. Build your page inside `src/pages/`**

**4. Register your route in `App.jsx`**

**5. Open a PR from your branch → dev**

---

## API Base URL

All API calls go through the Axios instance in `src/api/client.js` (create this first).
The Vite proxy handles routing to the backend — always use `/api/v1/...` paths.

```js
// src/api/client.js
import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
})

// Attach JWT token to every request automatically
client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default client
```

---

## Auth Flow

After login or register, store the token in `sessionStorage`:

```js
sessionStorage.setItem('token', response.data.token)
```

The Axios interceptor above picks it up automatically on every subsequent request.

---

## Commit Convention

Same as the rest of the project:

```
feat(ui-auth): add login and register pages
feat(ui-flights): add flight search with filters
fix(ui-booking): fix seat selection not updating on reselect
chore(ui): set up Axios client and auth context
```

---

## Available Scripts

```bash
bun run dev      # start dev server
bun run build    # production build
bun run preview  # preview production build locally
bun run lint     # run ESLint
```