# InterviewAI

Premium, outcome-driven mock interviews with **real-time coaching**.

InterviewAI turns practice sessions into measurable signal: resume-aware questions, adaptive follow-ups, live speech analytics, and exportable scorecards—so you walk into the real loop already calibrated.

## Why this exists

Most “interview prep” products are either:
- A **generic chatbot** that can’t see your delivery
- A **static question bank** that can’t see your resume/JD
- A **human coach** that’s expensive and not available 24/7

InterviewAI blends the strengths: role-aware practice + delivery analytics + repeatable scorecards.

## Core product

- **Resume + JD aware questions**: practice the loop you actually applied for
- **Interactive coaching**: filler word highlighting, pacing, and presence signals
- **Adaptive follow-ups**: get probed like a real panel
- **Scorecards + PDF exports**: review what changed, not what you “felt”
- **Dashboard history**: track momentum over time
- **Privacy-first defaults**: clear policy + controllable data deletion

## Tech stack (high level)

- **Frontend**: React 18 + React Router + Tailwind
- **Backend**: Node.js + Express
- **DB**: MongoDB
- **Auth**: JWT
- **AI**: configurable provider (current implementation uses an API key in backend env)
- **Media**: browser camera + speech transcription
- **Reports**: jsPDF

## Repo structure

```
mock-interview-ai/
  backend/     # Express API + auth + interview routes
  frontend/    # React app (landing, auth, dashboard, interview, reports)
```

## Local development

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Set environment variables in `backend/.env` (see `.env.example` for the exact names expected by the server).

### 2) Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`.

## Key routes

- `/` landing
- `/register` create account
- `/login` sign in
- `/dashboard` interview history
- `/interview/new` create a new session
- `/interview/:id` answer questions
- `/interview/:id/report` view + export report

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/interview/create`
- `GET /api/interview`
- `GET /api/interview/:id`
- `POST /api/interview/:id/answer`
- `DELETE /api/interview/:id`

## Deployment

You can deploy the backend to any Node-compatible platform (Render/Fly/EC2) and the frontend to any static host (Vercel/Netlify).

- **Backend**: set env vars, run `npm install`, start with `npm start`
- **Frontend**: configure API base URL (or proxy), run `npm run build`, serve `/build`

## Notes

- Speech recognition support varies by browser; Chrome/Edge tends to work best.
- This repo is designed to evolve into a production-grade SaaS; contributions and improvements are welcome.

