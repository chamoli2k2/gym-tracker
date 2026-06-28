export const API_ROOT = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const API_BASE = `${API_ROOT}/api`;

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_ROOT}${url.startsWith('/') ? url : `/${url}`}`;
};
