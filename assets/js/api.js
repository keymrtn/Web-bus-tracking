// BusGo API Client — connects frontend to backend
// Updated: Handle standardized {success, data, error} response format
// Sesuai rules: API Response Format
const BASE_URL = 'http://localhost:3000';

// Wrapper untuk fetch dengan standardized response handling
async function apiRequest(method, path, body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Attach auth token if available
  const token = localStorage.getItem('busgo_token');
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;

  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const response = await res.json();

  // Handle error response format (new standardized format)
  if (!response.success) {
    const errorMsg = response.error?.message || `HTTP ${res.status}`;
    const error = new Error(errorMsg);
    error.code = response.error?.code;
    error.details = response.error?.details;
    error.status = res.status;
    throw error;
  }

  return response.data;
}

const api = {
  // ── Auth ──────────────────────────────────────────────────
  async login(username, password) {
    const data = await apiRequest('POST', '/api/auth/login', { username, password });
    if (data.token) {
      localStorage.setItem('busgo_token', data.token);
      localStorage.setItem('busgo_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(username, password, name) {
    return apiRequest('POST', '/api/auth/register', { username, password, name });
  },

  logout() {
    localStorage.removeItem('busgo_token');
    localStorage.removeItem('busgo_user');
  },

  getCurrentUser() {
    const u = localStorage.getItem('busgo_user');
    return u ? JSON.parse(u) : null;
  },

  isLoggedIn() {
    return !!localStorage.getItem('busgo_token');
  },

  // ── Buses ───────────────────────────────────────────────
  async getBuses() { return apiRequest('GET', '/api/buses'); },
  async addBus(data) { return apiRequest('POST', '/api/buses', data); },
  async updateBus(id, data) { return apiRequest('PUT', `/api/buses/${id}`, data); },
  async deleteBus(id) { return apiRequest('DELETE', `/api/buses/${id}`); },

  // ── Routes ──────────────────────────────────────────────
  async getRoutes() { return apiRequest('GET', '/api/routes'); },
  async addRoute(data) { return apiRequest('POST', '/api/routes', data); },
  async updateRoute(id, data) { return apiRequest('PUT', `/api/routes/${id}`, data); },
  async deleteRoute(id) { return apiRequest('DELETE', `/api/routes/${id}`); },

  // ── Schedules ────────────────────────────────────────────
  async getSchedules(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest('GET', `/api/schedules${qs ? '?' + qs : ''}`);
  },
  async addSchedule(data) { return apiRequest('POST', '/api/schedules', data); },
  async updateSchedule(id, data) { return apiRequest('PUT', `/api/schedules/${id}`, data); },
  async deleteSchedule(id) { return apiRequest('DELETE', `/api/schedules/${id}`); },

  // ── Tickets ─────────────────────────────────────────────
  async getTickets() { return apiRequest('GET', '/api/tickets'); },
  async bookTicket(schedule_id, seat_number) {
    return apiRequest('POST', '/api/tickets', { schedule_id, seat_number });
  },
  async updateTicketStatus(id, status) {
    return apiRequest('PUT', `/api/tickets/${id}`, { status });
  },

  // ── Seats ───────────────────────────────────────────────
  async getBookedSeats(scheduleId) {
    return apiRequest('GET', `/api/schedules/${scheduleId}/seats`);
  },
};

// Global alias
window.api = api;