# InterviewAI — AI-Powered Morak Interview Platform
### Final Year Project | Computer Engineering | MERN Stack

---

## What this app does
1. User signs up / logs in
2. Uploads their resume (PDF or paste) + job description
3. Claude AI generates 7 tailored interview questions
4. User answers each question on camera — speech is transcribed live
5. Claude gives instant feedback: score out of 10, strengths, improvements
6. A full report is generated with PDF download

---

## Tech Stack
| Part        | Technology              |
|-------------|-------------------------|
| Frontend    | React 18, React Router 6 |
| Backend     | Node.js, Express        |
| Database    | MongoDB Atlas (free)    |
| AI          | Anthropic Claude API    |
| Auth        | JWT (JSON Web Tokens)   |
| File upload | Multer                  |
| PDF parse   | pdf-parse               |
| PDF export  | jsPDF                   |

---

## Project Structure
```
mock-interview-ai/
├── backend/
│   ├── server.js              ← Express app entry
│   ├── .env.example           ← Copy to .env and fill in
│   ├── models/
│   │   ├── User.js            ← User schema
│   │   └── Interview.js       ← Interview + Question schema
│   ├── routes/
│   │   ├── auth.js            ← /api/auth/register, /login, /me
│   │   └── interview.js       ← /api/interview/* (create, answer, report)
│   └── middleware/
│       └── auth.js            ← JWT protection middleware
│
└── frontend/
    └── src/
        ├── App.js             ← Routes + auth provider
        ├── index.css          ← Global dark theme styles
        ├── context/
        │   └── AuthContext.js ← Global login state
        ├── utils/
        │   ├── api.js         ← Axios API calls
        │   └── pdfReport.js   ← PDF generation
        ├── components/
        │   ├── Navbar.js
        │   └── CameraRecorder.js ← Camera + speech-to-text
        └── pages/
            ├── LandingPage.js
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── DashboardPage.js
            ├── NewInterviewPage.js  ← Resume upload + JD
            ├── InterviewPage.js     ← Camera + Q&A session
            └── ReportPage.js        ← Results + PDF download
```

---

## Step-by-Step Setup

### Step 1: Get your API keys

**MongoDB Atlas (free database)**
1. Go to https://cloud.mongodb.com and create a free account
2. Create a new project → Build a Database → Free tier (M0)
3. Set username + password → click "Create"
4. In Network Access → Add IP Address → "Allow Access from Anywhere"
5. In Database → Connect → Drivers → copy the connection string
6. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mockinterview`

**Anthropic Claude API**
1. Go to https://console.anthropic.com
2. Sign up → go to API Keys → Create Key
3. Copy the key (starts with `sk-ant-...`)

### Step 2: Set up the Backend

```bash
# Go into the backend folder
cd mock-interview-ai/backend

# Install all packages
npm install

# Create your environment file
cp .env.example .env
```

Now open `.env` in any text editor and fill in:
```
PORT=5001
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mockinterview
JWT_SECRET=make_up_any_long_random_string_here_like_abc123xyz456
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

Start the backend:
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected
✅ Server running on port 5001
```

### Step 3: Set up the Frontend

Open a NEW terminal window:
```bash
# Go into the frontend folder
cd mock-interview-ai/frontend

# Install all packages
npm install

# Start the React app
npm start
```

Browser will open at http://localhost:3000

### Step 4: Test the full flow

1. Go to http://localhost:3000
2. Click "Sign Up" → create an account
3. Click "+ New Interview"
4. Enter a job role like "Software Engineer"
5. Paste any resume text (copy from your own resume)
6. Click "Generate Interview Questions"
7. Wait ~10 seconds for Claude to generate questions
8. Answer each question on camera
9. View your AI report + download PDF

---

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user |
| POST | /api/interview/create | Create interview (upload resume) |
| GET  | /api/interview | Get all my interviews |
| GET  | /api/interview/:id | Get one interview |
| POST | /api/interview/:id/answer | Submit answer + get AI feedback |
| DELETE | /api/interview/:id | Delete interview |

---

## Common Errors & Fixes

**"Camera access denied"**
→ Click the camera icon in your browser address bar → Allow

**"CORS error" in browser console**
→ Make sure backend is running on port 5001 and frontend has `"proxy": "http://localhost:5001"` in package.json

**"MongoDB connection error"**
→ Check your MONGO_URI in .env — make sure username/password is correct and "Allow Access from Anywhere" is set in Atlas

**"Claude API error"**
→ Check your ANTHROPIC_API_KEY in .env — make sure it starts with `sk-ant-`

**Speech recognition not working**
→ Only works in Chrome/Edge. Use Chrome browser for development.

---

## Features for Extra Marks (Optional additions)

- **Facial expression analysis** using face-api.js
- **Filler word counter** ("um", "uh", "like") from transcript
- **Answer timer** — track how long each answer took
- **Interview history graph** — score trends over time
- **Question categories** — label each question as behavioral/technical/situational
- **Admin dashboard** — for professors to view student interviews

---

## Deployment (for project demo)

**Backend → Render.com (free)**
1. Push code to GitHub
2. Go to render.com → New Web Service → connect repo
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables from your .env

**Frontend → Vercel (free)**
1. Go to vercel.com → Import from GitHub
2. Set root directory to `frontend`
3. Change `proxy` in package.json to your Render backend URL

---

*Built with React, Node.js, MongoDB, and Anthropic Claude API*
