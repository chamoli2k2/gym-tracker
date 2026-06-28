const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

// Any Render static site / web service subdomain
const RENDER_ORIGIN = /^https:\/\/[a-z0-9-]+\.onrender\.com$/i;

const normalizeOrigin = (url) => (url || '').trim().replace(/\/$/, '');

const getEnvOrigins = () => {
  const raw =
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    process.env.VITE_APP_URL ||
    '';

  return raw
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
};

const getAllowedOrigins = () => {
  const fromEnv = getEnvOrigins();
  return [...new Set([...DEFAULT_ORIGINS, ...fromEnv])];
};

const isOriginAllowed = (origin) => {
  const normalized = normalizeOrigin(origin);
  const allowed = getAllowedOrigins();

  if (allowed.includes(normalized)) {
    return true;
  }

  // Production: auto-allow Render-hosted frontends (free tier deploys)
  if (process.env.NODE_ENV === 'production' && RENDER_ORIGIN.test(normalized)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    console.warn(
      `CORS blocked origin: ${origin}. Allowed: ${getAllowedOrigins().join(', ')}` +
        (process.env.NODE_ENV === 'production' ? ' (+ *.onrender.com)' : '')
    );
    callback(null, false);
  },
};

module.exports = { corsOptions, getAllowedOrigins, isOriginAllowed };
