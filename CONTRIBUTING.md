# Contributing to InterviewAI

Thanks for improving InterviewAI. This repo is a full-stack app with a React frontend and an Express backend.

## Development setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Code style

- Run formatters before opening a PR:

```bash
cd frontend && npm run format
cd ../backend && npm run format
```

- Prefer semantic HTML and accessible components (keyboard + screen reader).
- Keep copy outcome-driven (avoid tech-stack marketing on user-facing pages).

## Pull requests

- Keep PRs small and reviewable (one theme per PR).
- Include a short test plan (what you clicked, what you verified).
- Avoid committing secrets (`.env`, API keys). Use `.env.example`.

## Reporting issues

When filing bugs, include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshot/video if relevant
- Browser + OS

