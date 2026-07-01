// BusGo API Client — connects frontend to backend
// Updated: Handle standardized {success, data, error} response format
// Sesuai rules: API Response Format
const BASE_URL = 'http://localhost:3000';

// ── Translation helpers: API ←→ Frontend format ────────────

function apiRouteToFrontend(r) {
  return {
    id: 'R' + r.id,
    nama: (r.origin_name || '') + ' - ' + (r.dest_name || ''),
    awal: r.origin_name || '',
    akhir: r.dest_name || '',
    estimasi: r.estimasi || 0,
    coords: (r.origin_coords && r.dest_coords)
      ? [r.origin_coords, r.dest_coords]
      : []
  };
}

function apiBusToFrontend(b) {
  return {
    id: 'B' + b.id,
    nomor: b.nomor || b.nomor_bus,
    tipe: b.tipe || b.tipe_bus,
    kapasitas: b.kapasitas || 30
  };
}

function apiScheduleToFrontend(s) {
  return {
    id: s.id,
    routeId: 'R' + s.route_id,
    routeName: (s.origin_name || '') + ' - ' + (s.dest_name || ''),
    ruteAwal: s.origin_name || '',
    ruteAkhir: s.dest_name || '',
    busId: 'B' + s.bus_id,
    busNomor: s.nomor_bus || '',
    busTipe: s.tipe_bus || '',
    tanggal: s.tanggal,
    jamBerangkat: s.time_start,
    jamSampai: s.time_end,
    harga: s.price || 0,
    kapasitas: s.kapasitas || 0
  };
}

// ── Sync from API → localStorage cache ──────────────────────

async function syncFromAPI() {
  try {
    // Fetch all routes
    const apiRoutes = await apiRequest('GET', '/api/v1/routes');
    const routes = (Array.isArray(apiRoutes) ? apiRoutes : []).map(apiRouteToFrontend);
    localStorage.setItem('busgo_synced_routes', JSON.stringify(routes));

    // Fetch all buses
    const apiBuses = await apiRequest('GET', '/api/v1/buses');
    const buses = (Array.isArray(apiBuses) ? apiBuses : []).map(apiBusToFrontend);
    localStorage.setItem('busgo_synced_buses', JSON.stringify(buses));

    // Fetch all schedules
    const apiSchedules = await apiRequest('GET', '/api/v1/schedules');
    const schedules = (Array.isArray(apiSchedules) ? apiSchedules : []).map(apiScheduleToFrontend);
    localStorage.setItem('busgo_synced_schedules', JSON.stringify(schedules));

    return { success: true };
  } catch (e) {
    console.warn('syncFromAPI failed:', e.message);
    return { success: false, error: e.message };
  }
}

// ── Sync cache readers ──────────────────────────────────────

function getSyncedRoutes() {
  const data = localStorage.getItem('busgo_synced_routes');
  return data ? JSON.parse(data) : null;
}

function getSyncedBuses() {
  const data = localStorage.getItem('busgo_synced_buses');
  return data ? JSON.parse(data) : null;
}

function getSyncedSchedules() {
  const data = localStorage.getItem('busgo_synced_schedules');
  return data ? JSON.parse(data) : [];
}

// ── API Request wrapper ─────────────────────────────────────

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
    const data = await apiRequest('POST', '/api/v1/auth/login', { username, password });
    if (data.token) {
      localStorage.setItem('busgo_token', data.token);
      localStorage.setItem('busgo_user', JSON.stringify(data.user));
      localStorage.setItem('busgo_current_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(username, password, name) {
    return apiRequest('POST', '/api/v1/auth/register', { username, password, name });
  },

  logout() {
    localStorage.removeItem('busgo_token');
    localStorage.removeItem('busgo_user');
    localStorage.removeItem('busgo_current_user');
  },

  getCurrentUser() {
    const u = localStorage.getItem('busgo_user');
    return u ? JSON.parse(u) : null;
  },

  isLoggedIn() {
    return !!localStorage.getItem('busgo_token');
  },

  // ── Buses ───────────────────────────────────────────────
  async getBuses() { return apiRequest('GET', '/api/v1/buses'); },
  async addBus(data) { return apiRequest('POST', '/api/v1/buses', data); },
  async updateBus(id, data) { return apiRequest('PUT', `/api/v1/buses/${id}`, data); },
  async deleteBus(id) { return apiRequest('DELETE', `/api/v1/buses/${id}`); },

  // ── Routes ──────────────────────────────────────────────
  async getRoutes() { return apiRequest('GET', '/api/v1/routes'); },
  async addRoute(data) { return apiRequest('POST', '/api/v1/routes', data); },
  async updateRoute(id, data) { return apiRequest('PUT', `/api/v1/routes/${id}`, data); },
  async deleteRoute(id) { return apiRequest('DELETE', `/api/v1/routes/${id}`); },

  // ── Schedules ────────────────────────────────────────────
  async getSchedules(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest('GET', `/api/v1/schedules${qs ? '?' + qs : ''}`);
  },
  async addSchedule(data) { return apiRequest('POST', '/api/v1/schedules', data); },
  async updateSchedule(id, data) { return apiRequest('PUT', `/api/v1/schedules/${id}`, data); },
  async deleteSchedule(id) { return apiRequest('DELETE', `/api/v1/schedules/${id}`); },

  // ── Tickets ─────────────────────────────────────────────
  async getTickets() { return apiRequest('GET', '/api/v1/tickets'); },
  async bookTicket(schedule_id, seat_number) {
    return apiRequest('POST', '/api/v1/tickets', { schedule_id, seat_number });
  },
  async updateTicketStatus(id, status) {
    return apiRequest('PUT', `/api/v1/tickets/${id}`, { status });
  },

  // ── Seats ───────────────────────────────────────────────
  async getBookedSeats(scheduleId) {
    return apiRequest('GET', `/api/v1/schedules/${scheduleId}/seats`);
  },
};

// Global alias
window.api = api;