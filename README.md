# StudyOS

StudyOS is a full-stack AI-powered study operating system with:
- Express + MongoDB backend
- Next.js frontend
- planner, today execution, analytics, AI coach, learn, quiz, PYQ, sessions, calendar, and profile flows

## Stack
- Backend: Node.js, Express, Mongoose
- Frontend: Next.js 15, React 19, TypeScript
- Database: MongoDB
- Local orchestration: Docker Compose

## What is working
- Auth and profile
- Exam, subject, chapter, and topic hierarchy
- Study plan generation and daily task generation
- Today dashboard and execution tracking
- Analytics and AI coach
- Learn explorer with syllabus navigation
- Live quiz generation and timed attempts
- PYQ search and instant answer verification
- Sample question bank auto-seeding on backend startup

## Local development

### 1. Backend
```bash
npm install
copy .env.example .env
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Backend runs on `http://127.0.0.1:5000`
Frontend runs on `http://localhost:3000`

## Production-style local run with Docker

### 1. Prepare env
```bash
copy .env.example .env
```

Before using production mode, replace these values in `.env`:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `MONGODB_URI` if you are not using the bundled Docker MongoDB
- `GOOGLE_CLIENT_ID` if you want live Google sign-in
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` if you want the frontend Google button to activate

### 2. Start all services
```bash
npm run docker:up
```

This starts:
- MongoDB on `27017`
- Backend on `5000`
- Frontend on `3000`

### 3. Stop services
```bash
npm run docker:down
```

## Public access from anywhere

If the Docker stack is already running, you can expose StudyOS to the internet with:

```bash
npm run public:start
```

To print the current public URL again:

```bash
npm run public:url
```

To stop the public tunnel:

```bash
npm run public:stop
```

Notes:
- This uses a Cloudflare quick tunnel to expose the frontend.
- The frontend proxies `/api/v1/*`, so the backend works through the same public URL.
- The PC must stay on and connected to the internet for the public link to keep working.
- Quick tunnels are good for demos and testing, but they are not a permanent always-on production host.
- For Google sign-in on a public tunnel, the Google OAuth client must allow the current tunnel origin in its authorized JavaScript origins.

## Environment variables

### Backend
- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `FRONTEND_URL`
- `CORS_ORIGINS`
- `GOOGLE_CLIENT_ID`

### Frontend
- `NEXT_PUBLIC_API_URL`
- `INTERNAL_API_ORIGIN`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## Deployment notes
- Frontend is configured with `output: "standalone"` for container deployment.
- Backend now validates that production JWT secrets are not left on default fallback values.
- Backend CORS is restricted by `FRONTEND_URL` and `CORS_ORIGINS`.
- Google sign-in uses Google Identity Services on the frontend and verifies Google ID tokens on the backend.
- Next.js Turbopack root is pinned so the multiple-lockfile warning is silenced.

## Verification
The project has been verified with:
```bash
npm test
cd frontend && npm run lint
cd frontend && npx tsc --noEmit
cd frontend && npm run build
```

## Current caveats
- The seeded question bank is a starter dataset, not a full coaching-grade content library yet.
- To expand quiz and PYQ depth, add more question seeds or build admin upload flows.

## Important runtime note
If the backend was already running before the question-bank seeding changes, restart it once so the sample questions get inserted.
