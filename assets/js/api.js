// BusGo API Client — connects frontend to backend
const BASE_URL = 'http://localhost:3000';

const api = {
  _token: localStorage.getItem('busgo_token'),

  _headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this._token) h['Authorization'] = `Bearer ${this._token}`;
    return h;
  },

  async _async(method, path, body) {
    const opts = { method, headers: this._headers() };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, opts);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  },

  // ── Auth ──────────────────────────────────────────────────
  async login(username, password) {
    const data = await this._async('POST', '/api/auth/login', { username, password });
    if (data.token) {
      this._token = data.token;
      localStorage.setItem('busgo_token', data.token);
      localStorage.setItem('busgo_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(username, password, name) {
    return this._async('POST', '/api/auth/register', { username, password, name });
  },

  logout() {
    this._token = null;
    localStorage.removeItem('busgo_token');
    localStorage.removeItem('busgo_user');
  },

  getCurrentUser() {
    const u = localStorage.getItem('busgo_user');
    return u ? JSON.parse(u) : null;
  },

  isLoggedIn() { return !!this._token; },

  // ── Buses ────────────────────────────────────────────────
  async getBuses() { return this._async('GET', '/api/buses'); },
  async addBus(data) { return this._async('POST', '/api/buses', data); },
  async updateBus(id, data) { return this._async('PUT', `/api/buses/${id}`, data); },
  async deleteBus(id) { return this._async('DELETE', `/api/buses/${id}`); },

  // ── Routes ───────────────────────────────────────────────
  async getRoutes() { return this._async('GET', '/api/routes'); },
  async addRoute(data) { return this._async('POST', '/api/routes', data); },
  async updateRoute(id, data) { return this._async('PUT', `/api/routes/${id}`, data); },
  async deleteRoute(id) { return this._async('DELETE', `/api/routes/${id}`); },

  // ── Schedules ───────────────────────────────────────────
  async getSchedules(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this._async('GET', `/api/schedules${qs ? '?' + qs : ''}`);
  },
  async addSchedule(data) { return this._async('POST', '/api/schedules', data); },
  async updateSchedule(id, data) { return this._async('PUT', `/api/schedules/${id}`, data); },
  async deleteSchedule(id) { return this._async('DELETE', `/api/schedules/${id}`); },

  // ── Tickets ──────────────────────────────────────────────
  async getTickets() { return this._async('GET', '/api/tickets'); },
  async bookTicket(schedule_id, seat_number) {
    return this._async('POST', '/api/tickets', { schedule_id, seat_number });
  },
  async updateTicketStatus(id, status) {
    return this._async('PUT', `/api/tickets/${id}`, { status });
  },

  // ── Seats ───────────────────────────────────────────────
  async getBookedSeats(scheduleId) { return this._async('GET', `/api/schedules/${scheduleId}/seats`); }
};

// Global alias
window.api = api;