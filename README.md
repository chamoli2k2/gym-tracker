# GymTrack — MERN Gym Progress Tracker

A mobile-first gym workout tracker built with MongoDB, Express, React, and Node.js. Log exercises, sets, reps, and weights day by day, use a rest timer between sets, and analyze your progress with charts and personal records.

## Features

- **Day-wise workout logging** — One workout per day with multiple exercises
- **Exercise tracking** — Name, muscle group, weight (kg), sets, and reps
- **Set completion** — Tap to mark sets done; auto-saves
- **Rest timer** — Built-in timer with presets (30s–3min), vibration on iPhone
- **Copy previous workout** — Duplicate any past day to today
- **Analytics dashboard** — Volume charts, muscle group breakdown, streak counter
- **Personal records** — Max weight, volume, and estimated 1RM per exercise
- **Exercise autocomplete** — Suggestions from your workout history
- **Mobile optimized** — Bottom nav, large touch targets, iPhone safe areas, PWA-ready

## Project Structure (MVC)

```
Project Gym/
├── backend/                    # Express API (MVC)
│   ├── config/db.js            # MongoDB connection
│   ├── models/                 # Mongoose schemas
│   ├── controllers/            # Business logic
│   ├── routes/                 # API routes
│   ├── middleware/             # Error handling
│   └── server.js
├── frontend/                   # React app (MVC-inspired)
│   ├── src/
│   │   ├── models/             # Constants & helpers
│   │   ├── services/           # API layer
│   │   ├── controllers/        # Custom hooks (logic)
│   │   ├── views/              # Page components
│   │   └── components/         # Reusable UI
│   └── vite.config.js
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/) running locally (or MongoDB Atlas URI)

## Setup

### 1. Install MongoDB (optional — for persistent data)

The app works **without MongoDB** in dev mode using an in-memory database. Data resets when you restart the backend.

For **persistent storage**, install MongoDB:

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

API runs at `http://localhost:5001`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

### 4. Access on iPhone (same Wi-Fi)

1. Find your Mac's local IP: `ipconfig getifaddr en0`
2. Start frontend with network access (Vite exposes on all interfaces)
3. Open `http://<your-mac-ip>:5173` on iPhone Safari
4. Tap Share → **Add to Home Screen** for app-like experience

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workouts/today` | Get or create today's workout |
| GET | `/api/workouts` | List workouts (date filters) |
| PUT | `/api/workouts/:id` | Update workout |
| POST | `/api/workouts/:id/duplicate` | Copy workout to a date |
| GET | `/api/analytics/overview` | Stats & volume trends |
| GET | `/api/analytics/records` | Personal records |
| GET | `/api/templates` | Exercise suggestions |

## Usage Tips

1. Open **Workout** tab → tap **+** to add exercises
2. Enter weight and reps, tap **✓** to complete each set
3. Rest timer appears automatically after completing a set
4. Tap **Finish** when done for the day
5. Use **History** to copy a previous workout to today
6. Check **Stats** for volume trends, streaks, and PRs

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/gym-tracker
```

For MongoDB Atlas, replace `MONGODB_URI` with your connection string.

## Deploy online (free)

Host on **Render + MongoDB Atlas** so you can use the app on your phone from anywhere.

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step instructions.

Quick summary:
1. Allow `0.0.0.0/0` in MongoDB Atlas Network Access
2. Deploy `backend` as a Render **Web Service** (free)
3. Deploy `frontend` as a Render **Static Site** (free)
4. Set `VITE_API_URL` on frontend → your API URL
5. Set `CLIENT_URL` on backend → your frontend URL
6. Add to Home Screen on iPhone
