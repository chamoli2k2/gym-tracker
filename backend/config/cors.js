const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const normalizeOrigin = (url) => (url || '').trim().replace(/\/$/, '');

const getAllowedOrigins = () => {
  const fromEnv = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(normalizeOrigin).filter(Boolean)
    : [];

  return [...new Set([...DEFAULT_ORIGINS, ...fromEnv])];
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();

    // Server-to-server / health checks (no Origin header)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowed.includes(normalizeOrigin(origin))) {
      callback(null, true);
      return;
    }

    console.warn(`CORS blocked origin: ${origin}. Allowed: ${allowed.join(', ')}`);
    callback(null, false);
  },
};

module.exports = { corsOptions, getAllowedOrigins };
