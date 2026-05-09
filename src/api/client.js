const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) throw new Error(data?.message || 'Request failed');
  return data;
}

export const api = {
  auth: {
    signup: (userName, password) => request('/api/auth/signup', { method: 'POST', body: { userName, password } }),
    login:  (userName, password) => request('/api/auth/login',  { method: 'POST', body: { userName, password } }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
    me:     () => request('/api/auth/me'),
  },
  inventory: {
    parts:    () => request('/api/inventory/parts'),
    purchased:(payload) => request('/api/inventory/purchased', { method: 'POST', body: payload }),
    stockIn:  (payload) => request('/api/inventory/stock-in',  { method: 'POST', body: payload }),
    stockOut: (payload) => request('/api/inventory/stock-out', { method: 'POST', body: payload }),
  },
  reports: {
    daily:   (date)  => request(`/api/reports/daily?date=${encodeURIComponent(date)}`),
    monthly: (month) => request(`/api/reports/monthly?month=${encodeURIComponent(month)}`),
  },
};
