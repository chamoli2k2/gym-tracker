const API_BASE = '/api';

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error(
      'Cannot reach server. Start the backend with: cd backend && npm run dev'
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `Request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const workoutService = {
  getToday: () => request('/workouts/today'),
  getById: (id) => request(`/workouts/${id}`),
  getByDate: (date) => request(`/workouts/date/${date}`),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/workouts${query ? `?${query}` : ''}`);
  },
  create: (data) => request('/workouts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/workouts/${id}`, { method: 'DELETE' }),
  duplicate: (id, date) =>
    request(`/workouts/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    }),
};

export const analyticsService = {
  getOverview: (days = 30) => request(`/analytics/overview?days=${days}`),
  getRecords: () => request('/analytics/records'),
  getExerciseHistory: (name) =>
    request(`/analytics/exercise/${encodeURIComponent(name)}`),
};

export const templateService = {
  getAll: () => request('/templates'),
  create: (data) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/templates/${id}`, { method: 'DELETE' }),
};

export const planService = {
  getAll: (weekday) =>
    request(`/plans${weekday !== undefined ? `?weekday=${weekday}` : ''}`),
  getByWeekday: (weekday) => request(`/plans/weekday/${weekday}`),
  getById: (id) => request(`/plans/${id}`),
  create: (data) => request('/plans', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/plans/${id}`, { method: 'DELETE' }),
  start: (id, date, mode = 'replace') =>
    request(`/plans/${id}/start`, {
      method: 'POST',
      body: JSON.stringify({ date, mode }),
    }),
};

export const uploadService = {
  image: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    let response;
    try {
      response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
    } catch {
      throw new Error('Upload failed. Check your connection.');
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }
    return response.json();
  },
};
