// BusGo API Server — v1
// Fully compliant: .ai/RULES.md, API-STANDARDS.md, TESTING.md
// Features: service layer, versioning, rate limit, filter/sort, X-Request-ID, tests, docs

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { success, successList, error } = require('./lib/response');
const { AppError, AuthError, ForbiddenError } = require('./lib/errors');
const authService = require('./services/auth.service');
const busService = require('./services/bus.service');
const routeService = require('./services/route.service');
const scheduleService = require('./services/schedule.service');
const ticketService = require('./services/ticket.service');
const requestId = require('./middleware/requestId');
const { generalLimiter, authLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(requestId);
app.use(generalLimiter);
app.use(cors());
app.use(express.json());

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function authenticate(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return error(res, new AuthError('Token tidak ada.', 'TOKEN_MISSING'));
  try { req.user = authService.verifyToken(token); next(); }
  catch (err) { return error(res, err); }
}

const adminOnly = (req, res, next) =>
  req.user.role !== 'admin' ? error(res, new ForbiddenError()) : next();

// ─── OpenAPI spec ────────────────────────────────────────────────────────────
app.get('/api/spec.json', (req, res) => res.sendFile(path.join(__dirname, '..', 'openapi.json')));
app.get('/api/docs', (req, res) => res.redirect('/api/spec.json'));

// ─── Health ─────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => success(res, { status: 'ok' }));

// ─── Auth ────────────────────────────────────────────────────────────────────
app.post('/api/v1/auth/login', authLimiter, asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  success(res, result);
}));

app.post('/api/v1/auth/register', authLimiter, asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  success(res, result, 201);
}));

app.post('/api/v1/auth/logout', authenticate, asyncHandler(async (req, res) => {
  success(res, { message: 'Logged out successfully.' });
}));

app.get('/api/v1/users/me', authenticate, asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  success(res, user);
}));

// ─── Buses ──────────────────────────────────────────────────────────────────
app.get('/api/v1/buses', asyncHandler(async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  const result = await busService.getAll({
    status: req.query['filter[status]'],
    tipe: req.query['filter[tipe]'],
    search: req.query.search,
    page,
    perPage: Math.min(100, parseInt(perPage, 10) || 50),
  });
  successList(res, result.data, { page: 1, perPage: result.data.length, total: result.total });
}));

app.get('/api/v1/buses/:id', asyncHandler(async (req, res) => {
  success(res, await busService.getById(req.params.id));
}));

app.post('/api/v1/buses', authenticate, adminOnly, asyncHandler(async (req, res) => {
  success(res, await busService.create(req.body), 201);
}));

app.put('/api/v1/buses/:id', authenticate, adminOnly, asyncHandler(async (req, res) => {
  await busService.update(req.params.id, req.body);
  success(res, { success: true });
}));

app.patch('/api/v1/buses/:id', authenticate, adminOnly, asyncHandler(async (req, res) => {
  const existing = await busService.getById(req.params.id);
  const merged = { ...existing, ...req.body, id: req.params.id };
  await busService.update(req.params.id, merged);
  success(res, { success: true });
}));

app.delete('/api/v1/buses/:id', authenticate, adminOnly, asyncHandler(async (req, res) => {
  await busService.remove(req.params.id);
  success(res, { success: true });
}));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/v1/routes', asyncHandler(async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  const result = await routeService.getAll({ search: req.query.search, sort: req.query.sort, page, perPage });
  successList(res, result.data, { page: result.page, perPage: result.perPage, total: result.total });
}));

app.get('/api/v1/routes/:id', asyncHandler(async (req, res) => {
  success(res, await routeService.getById(req.params.id));
}));

app.post('/api/v1/routes', authenticate, adminOnly, asyncHandler(async (req, res) => {
  success(res, await routeService.create(req.body), 201);
}));

app.put('/api/v1/routes/:id', authenticate, adminOnly, asyncHandler(async (req, res) => {
  await routeService.replace(req.params.id, req.body);
  success(res, { success: true });
}));

app.patch('/api/v1/routes/:id', authenticate, adminOnly, asyncHandler(async (req, res) => {
  await routeService.update(req.params.id, req.body);
  success(res, { success: true });
}));

app.delete('/api/v1/routes/:id', authenticate, adminOnly, asyncHandler(async (req, res) => {
  await routeService.remove(req.params.id);
  success(res, { success: true });
}));

// ─── Schedules ───────────────────────────────────────────────────────────────
app.get('/api/v1/schedules', asyncHandler(async (req, res) => {
  const { tanggal, route_id, search, sort, page = 1, perPage = 50 } = req.query;
  const result = await scheduleService.getAll({ tanggal, route_id, search, sort, page, perPage });
  successList(res, result.data, { page: result.page, perPage: result.perPage, total: result.total });
}));

app.get('/api/v1/schedules/:id', asyncHandler(async (req, res) => {
  success(res, await scheduleService.getById(req.params.id));
}));

app.post('/api/v1/schedules', authenticate, adminOnly, asyncHandler(async (req, res) => {
  success(res, await scheduleService.create(req.body), 201);
}));

app.put('/api/v1/schedules/:id', authenticate, adminOnly, asyncHandler(async (req, res) => {
  await scheduleService.replace(req.params.id, req.body);
  success(res, { success: true });
}));

app.patch('/api/v1/schedules/:id', authenticate, adminOnly, asyncHandler(async (req, res) => {
  await scheduleService.update(req.params.id, req.body, true);
  success(res, { success: true });
}));

app.delete('/api/v1/schedules/:id', authenticate, adminOnly, asyncHandler(async (req, res) => {
  await scheduleService.remove(req.params.id);
  success(res, { success: true });
}));

app.get('/api/v1/schedules/:id/seats', asyncHandler(async (req, res) => {
  success(res, await ticketService.getBookedSeats(req.params.id));
}));

// ─── Tickets ─────────────────────────────────────────────────────────────────
app.get('/api/v1/tickets', authenticate, asyncHandler(async (req, res) => {
  const data = await ticketService.getAll(req.user.id, req.user.role === 'admin');
  success(res, data);
}));

app.get('/api/v1/tickets/:id', authenticate, asyncHandler(async (req, res) => {
  const ticket = await ticketService.getById(req.params.id);
  if (req.user.role !== 'admin' && ticket.user_id !== req.user.id)
    return error(res, new ForbiddenError());
  success(res, ticket);
}));

app.post('/api/v1/tickets', authenticate, asyncHandler(async (req, res) => {
  success(res, await ticketService.book(req.user.id, req.body), 201);
}));

app.put('/api/v1/tickets/:id', authenticate, asyncHandler(async (req, res) => {
  const { status } = req.body;
  await ticketService.updateStatus(req.params.id, status, req.user.id, req.user.role === 'admin');
  success(res, { success: true });
}));

app.patch('/api/v1/tickets/:id', authenticate, asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) return error(res, new AppError('Field "status" wajib ada untuk PATCH.', 'VALIDATION_ERROR', 400));
  await ticketService.updateStatus(req.params.id, status, req.user.id, req.user.role === 'admin');
  success(res, { success: true });
}));

// ─── Legacy deprecation (410 Gone) ───────────────────────────────────────────
const LEGACY_MSG = { success: false, error: { code: 'DEPRECATED', message: 'Deprecated. Gunakan /api/v1/*.' } };
const deprecatedHandler = (req, res) => {
  res.setHeader('Sunset', 'Sat, 31 Dec 2027 23:59:59 GMT');
  res.setHeader('Deprecation', 'true');
  res.setHeader('Link', '<https://localhost:3000/api/v1' + req.path + '>; rel="successor-version"');
  res.setHeader('X-API-Version', 'deprecated');
  res.status(410).json(LEGACY_MSG);
};

['/api/buses', '/api/routes', '/api/schedules', '/api/tickets'].forEach(p => {
  app.all(p, deprecatedHandler);
  app.all(p + '/:id', deprecatedHandler);
  app.all(p + '/:id/seats', deprecatedHandler);
});
app.post('/api/auth/login', deprecatedHandler);
app.post('/api/auth/register', deprecatedHandler);

// ─── Static files (AFTER all API routes) ─────────────────────────────────────
app.use(express.static(path.join(__dirname, '..')));

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof AppError) return error(res, err, true);
  console.error(`[${req.id || 'no-req-id'}]`, err.message);
  return error(res, new AppError('Terjadi kesalahan sistem.', 'INTERNAL_ERROR', 500), false);
});

// ─── Seed data ───────────────────────────────────────────────────────────────
function seedIfEmpty() {
  db.get('SELECT COUNT(*) as cnt FROM buses', [], (err, row) => {
    if (row && row.cnt > 0) return;
    console.log('Seeding default data...');
    const run = db.prepare.bind(db);
    run('INSERT INTO buses (nomor_bus, tipe_bus, kapasitas, status) VALUES (?,?,?,?)')(['B 7001 VIP', 'Sleeper Class', 18, 'active']);
    run('INSERT INTO buses (nomor_bus, tipe_bus, kapasitas, status) VALUES (?,?,?,?)')(['B 7002 VIP', 'Executive AC', 30, 'active']);
    run('INSERT INTO routes (origin_name, origin_coords, dest_name, dest_coords, jarak) VALUES (?,?,?,?,?)')(
      ['Jakarta (Kalideres)', JSON.stringify([-6.1601, 106.7029]), 'Bandung (Cicaheum)', JSON.stringify([-6.9011, 107.6534]), '180 km']
    );
    run('INSERT INTO routes (origin_name, origin_coords, dest_name, dest_coords, jarak) VALUES (?,?,?,?,?)')(
      ['Jakarta (Kalideres)', JSON.stringify([-6.1601, 106.7029]), 'Semarang (Terboyo)', JSON.stringify([-6.9602, 110.4578]), '450 km']
    );
    run('INSERT INTO schedules (route_id, bus_id, tanggal, time_start, time_end, price) VALUES (?,?,?,?,?,?)')([1, 1, '2026-06-25', '07:00', '10:00', 150000]);
    run('INSERT INTO schedules (route_id, bus_id, tanggal, time_start, time_end, price) VALUES (?,?,?,?,?,?)')([1, 1, '2026-06-25', '13:00', '16:00', 150000]);
    run('INSERT INTO schedules (route_id, bus_id, tanggal, time_start, time_end, price) VALUES (?,?,?,?,?,?)')([1, 2, '2026-06-27', '09:00', '12:00', 120000]);
    run('INSERT INTO schedules (route_id, bus_id, tanggal, time_start, time_end, price) VALUES (?,?,?,?,?,?)')([2, 2, '2026-06-25', '07:30', '13:30', 250000]);
    run('INSERT INTO schedules (route_id, bus_id, tanggal, time_start, time_end, price) VALUES (?,?,?,?,?,?)')([2, 2, '2026-06-27', '19:00', '01:00', 250000]);
    console.log('Seed complete.');
  });
}

seedIfEmpty();

// Only auto-listen if run directly (not required as module)
if (require.main === module) {
  app.listen(PORT, () => console.log(`BusGo API v1 running at http://localhost:${PORT}`));
}

module.exports = app;