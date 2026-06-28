# Deploy GymTrack for free (Render + MongoDB Atlas)

Use this guide to host the app online so you can open it on your iPhone from anywhere.

## Stack (all free tier)

| Service | Purpose | Free tier |
|---------|---------|-----------|
| [Render](https://render.com) | Backend API + frontend hosting | Yes (sleeps after 15 min idle) |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Database | Yes (512 MB) |

> **Note:** Render free backend sleeps when idle. First load after sleep takes ~30–60 seconds. Uploaded photos on Render are **not permanent** (disk resets on redeploy) — placeholder images always work.

---

## Step 1 — MongoDB Atlas (network access)

1. Open [MongoDB Atlas](https://cloud.mongodb.com)
2. Go to **Network Access** → **Add IP Address**
3. Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so Render can connect
4. Copy your connection string:
   ```
   mongodb+srv://USER:PASSWORD@cluster....mongodb.net/gym-tracker?appName=Cluster0
   ```

---

## Step 2 — Deploy backend on Render

1. Go to [render.com](https://render.com) → sign up with GitHub
2. **New +** → **Web Service**
3. Connect repo: `chamoli2k2/gym-tracker`
4. Settings:

   | Field | Value |
   |-------|-------|
   | Name | `gym-tracker-api` |
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | **Free** |

5. **Environment Variables:**

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | your Atlas connection string |
   | `CLIENT_URL` | *(add after Step 3 — your frontend URL)* |

6. Click **Create Web Service**
7. Copy your API URL, e.g. `https://gym-tracker-api.onrender.com`

---

## Step 3 — Deploy frontend on Render

1. **New +** → **Static Site**
2. Connect same repo: `chamoli2k2/gym-tracker`
3. Settings:

   | Field | Value |
   |-------|-------|
   | Name | `gym-tracker-web` |
   | Root Directory | `frontend` |
   | Build Command | `npm install && npm run build` |
   | Publish Directory | `dist` |

4. **Environment Variable** (required for Vite):

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://gym-tracker-api.onrender.com` *(your API URL, no trailing slash)* |

5. Click **Create Static Site**
6. Copy your frontend URL, e.g. `https://gym-tracker-web.onrender.com`

---

## Step 4 — Link frontend ↔ backend (CORS)

1. Go back to **gym-tracker-api** on Render
2. Edit environment variable:
   ```
   CLIENT_URL=https://gym-tracker-web.onrender.com
   ```
   *(your actual frontend URL)*
3. Save → Render redeploys the API

---

## Step 5 — Use on iPhone

1. Open your frontend URL in **Safari**
2. Tap **Share** → **Add to Home Screen**
3. Use it like a native app from anywhere

---

## One-click deploy (Blueprint)

You can also use the included `render.yaml`:

1. Render Dashboard → **New +** → **Blueprint**
2. Connect `chamoli2k2/gym-tracker`
3. Set `MONGODB_URI` when prompted
4. After both services deploy, set `CLIENT_URL` on the API to your static site URL
5. Set `VITE_API_URL` on the static site to your API URL, then redeploy frontend

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| App loads but "Cannot reach server" | Check `VITE_API_URL` on frontend, redeploy frontend |
| CORS error | Set `CLIENT_URL` on backend to exact frontend URL (https, no trailing slash) |
| MongoDB connection failed | Allow `0.0.0.0/0` in Atlas Network Access; check `MONGODB_URI` |
| Slow first load | Normal on Render free tier — server is waking up |
| Uploaded photos disappear | Expected on free tier — use placeholder images or upgrade storage |
