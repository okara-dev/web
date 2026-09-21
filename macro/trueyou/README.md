# TrueYou

TrueYou is a full-stack personality test platform. Users can take up to 15 scientifically-inspired personality tests, view detailed results with charts and interpretations, and track their history over time.

## Features

- User registration and login (Supabase Auth)
- 15 personality tests across different categories:
  - Big Five, Attachment Style, Resilience (free)
  - Jung Archetypes, Shadow Sides, Communication Style, Decision Type, Conflict Style, Emotional Intelligence, Self-Worth, Life Roles, Life Values, Motivation Profile, Inner Drivers, Stress Profile (premium)
- Interactive test flow with progress bar
- Detailed results with charts, interpretations, and personalized insights
- Profile page with full test history and result deletion
- Premium unlock via Lemon Squeezy (one-time payment for all tests)
- Responsive design with dark theme and animated background
- German UI

## Architecture

\`\`\`
┌─────────────────────┐
│  Frontend (Static)  │  ← HTML, CSS, Vanilla JS
│  index.html         │
│  profil.html        │
└──────────┬──────────┘
           │ HTTP + Cookies
           ▼
┌─────────────────────┐
│  Backend (Express)  │  ← REST API
│  /api/auth          │
│  /api/tests         │
│  /api/premium       │
└──────────┬──────────┘
           │ Supabase Client
           ▼
┌─────────────────────┐
│  Supabase           │
│  ├─ Auth            │  ← User Management
│  └─ PostgreSQL      │  ← Users, Test Results
└─────────────────────┘
\`\`\`

## Project Structure

\`\`\`
trueyou/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── db/
│   │   └── supabase.js
│   ├── middleware/
│   │   └── auth.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── testsController.js
│   │   └── premiumController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tests.js
│   │   └── premium.js
│   └── data/               (15 test question files)
│
└── frontend/
    ├── index.html
    ├── profil.html
    ├── favicon.svg
    ├── assets/
    │   └── logo.svg
    ├── css/
    │   ├── style.css
    │   └── profil.css
    └── js/
        ├── api.js
        ├── main.js
        ├── profil.js
        └── store.js
\`\`\`

## Setup

### 1. Supabase Project

1. Create a project at [supabase.com](https://supabase.com)
2. Enable Email/Password Auth
3. Create the following tables in the SQL Editor:

\`\`\`sql
-- Users profile table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_activated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test results
CREATE TABLE test_results (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    test_id VARCHAR(50) NOT NULL,
    results JSONB NOT NULL,
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_test_id ON test_results(test_id);
CREATE INDEX idx_test_results_taken_at ON test_results(taken_at DESC);
\`\`\`

### 2. Backend

\`\`\`bash
cd backend
npm install
cp .env.example .env
# Fill in your Supabase credentials and Lemon Squeezy keys
npm start
\`\`\`

The backend runs on \`http://localhost:5003\`.

### 3. Frontend

\`\`\`bash
cd frontend
# Serve with any static server, e.g.:
npx serve .
# or use VS Code Live Server
\`\`\`

Open the frontend in your browser.

## Deployment

### Backend → Railway

1. Push the repo to GitHub
2. Create a new Railway project
3. Select the repo, set **Root Directory** to \`backend\`
4. Add environment variables (Supabase + Lemon Squeezy)
5. Railway auto-detects Node.js and starts with \`npm start\`

### Frontend → Railway (Static)

1. In the same Railway project, add a second service
2. Same repo, **Root Directory** to \`frontend\`
3. Set **Static Site** mode
4. Update \`FRONTEND_URL\` in the backend service to match

## Tech Stack

**Backend:**
- Node.js 18+
- Express
- Supabase (Auth + PostgreSQL)
- Helmet, CORS, Rate Limiting, Compression
- Cookie-based sessions

**Frontend:**
- HTML5
- CSS3 (custom properties, gradients, animations, glassmorphism)
- Vanilla JavaScript (ES modules)
- Fetch API

**External:**
- Lemon Squeezy (payments)
- Google Fonts (Inter)

## Privacy

- All user data is stored in Supabase (EU region recommended)
- Passwords are hashed and managed by Supabase Auth
- No third-party tracking
- Test results belong to the user and can be deleted anytime

## License

MIT