const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'busgo_jwt_secret_2026';

app.use(cors());
app.use(express.json());

// ============================================================
// MIDDLEWARE: Auth
// ============================================================
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ada.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid.' });
    req.user = user;
    next();
  });
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Hanya admin.' });
  next();
}

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ============================================================
// AUTH
// ============================================================
app.post('/api/auth/register', (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name) return res.status(400).json({ error: 'Field wajib.' });

  const hashed = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users (username, password, name, role) VALUES (?,?,?,?)',
    [username, hashed, name, 'user'],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Username sudah ada.' });
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ success: true, id: this.lastID });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Field wajib.' });

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET, { expiresIn: '1d' }
    );
    res.json({ success: true, token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
  });
});

// ============================================================
// BUSES
// ============================================================
app.get('/api/buses', (req, res) => {
  db.all('SELECT * FROM buses', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/buses', authenticate, adminOnly, (req, res) => {
  const { nomor, tipe, kapasitas } = req.body;
  if (!nomor || !tipe || !kapasitas) return res.status(400).json({ error: 'Field wajib.' });
  db.run('INSERT INTO buses (nomor, tipe, kapasitas) VALUES (?,?,?)', [nomor, tipe, Number(kapasitas)], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ id: this.lastID, nomor, tipe, kapasitas: Number(kapasitas) });
  });
});

app.put('/api/buses/:id', authenticate, adminOnly, (req, res) => {
  const { nomor, tipe, kapasitas } = req.body;
  db.run('UPDATE buses SET nomor=?, tipe=?, kapasitas=? WHERE id=?', [nomor, tipe, Number(kapasitas), req.params.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Bus tidak ditemukan.' });
    res.json({ success: true });
  });
});

app.delete('/api/buses/:id', authenticate, adminOnly, (req, res) => {
  db.run('DELETE FROM buses WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ============================================================
// ROUTES
// ============================================================
app.get('/api/routes', (req, res) => {
  db.all('SELECT * FROM routes', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({
      id: r.id, origin_name: r.origin_name, origin_coords: r.origin_coords,
      dest_name: r.dest_name, dest_coords: r.dest_coords, jarak: r.jarak
    })));
  });
});

app.post('/api/routes', authenticate, adminOnly, (req, res) => {
  const { origin_name, origin_coords, dest_name, dest_coords, jarak } = req.body;
  if (!origin_name || !dest_name) return res.status(400).json({ error: 'Field wajib.' });
  db.run(
    'INSERT INTO routes (origin_name, origin_coords, dest_name, dest_coords, jarak) VALUES (?,?,?,?,?)',
    [origin_name, JSON.stringify(origin_coords || []), dest_name, JSON.stringify(dest_coords || []), jarak || ''],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.put('/api/routes/:id', authenticate, adminOnly, (req, res) => {
  const { origin_name, dest_name, origin_coords, dest_coords, jarak } = req.body;
  db.run(
    'UPDATE routes SET origin_name=?, origin_coords=?, dest_name=?, dest_coords=?, jarak=? WHERE id=?',
    [origin_name, JSON.stringify(origin_coords || []), dest_name, JSON.stringify(dest_coords || []), jarak || '', req.params.id],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Rute tidak ditemukan.' });
      res.json({ success: true });
    }
  );
});

app.delete('/api/routes/:id', authenticate, adminOnly, (req, res) => {
  db.run('DELETE FROM routes WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ============================================================
// SCHEDULES
// ============================================================
app.get('/api/schedules', (req, res) => {
  const { tanggal, route_id } = req.query;
  let query = `
    SELECT s.*, r.origin_name, r.dest_name, b.nomor AS bus_nomor, b.tipe AS bus_tipe, b.kapasitas
    FROM schedules s
    JOIN routes r ON s.route_id = r.id
    JOIN buses b ON s.bus_id = b.id
  `;
  const params = [];
  const conditions = [];
  if (tanggal) { conditions.push('s.tanggal = ?'); params.push(tanggal); }
  if (route_id) { conditions.push('s.route_id = ?'); params.push(route_id); }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY s.tanggal, s.time_start';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/schedules', authenticate, adminOnly, (req, res) => {
  const { route_id, bus_id, tanggal, time_start, time_end, price } = req.body;
  if (!route_id || !bus_id || !tanggal || !time_start || !time_end || price == null) {
    return res.status(400).json({ error: 'Field wajib.' });
  }
  db.run(
    'INSERT INTO schedules (route_id, bus_id, tanggal, time_start, time_end, price) VALUES (?,?,?,?,?,?)',
    [route_id, bus_id, tanggal, time_start, time_end, Number(price)],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.put('/api/schedules/:id', authenticate, adminOnly, (req, res) => {
  const { route_id, bus_id, tanggal, time_start, time_end, price } = req.body;
  db.run(
    'UPDATE schedules SET route_id=?, bus_id=?, tanggal=?, time_start=?, time_end=?, price=? WHERE id=?',
    [route_id, bus_id, tanggal, time_start, time_end, Number(price), req.params.id],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Jadwal tidak ditemukan.' });
      res.json({ success: true });
    }
  );
});

app.delete('/api/schedules/:id', authenticate, adminOnly, (req, res) => {
  db.run('DELETE FROM schedules WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ============================================================
// TICKETS
// ============================================================
app.get('/api/tickets', authenticate, (req, res) => {
  const query = req.user.role === 'admin'
    ? `SELECT t.*, u.name AS user_name, u.username, s.tanggal, s.time_start, s.time_end, s.price,
              r.origin_name, r.dest_name, b.nomor AS bus_nomor, b.tipe AS bus_tipe
       FROM tickets t
       JOIN users u ON t.user_id = u.id
       JOIN schedules s ON t.schedule_id = s.id
       JOIN routes r ON s.route_id = r.id
       JOIN buses b ON s.bus_id = b.id
       ORDER BY t.created_at DESC`
    : `SELECT t.*, s.tanggal, s.time_start, s.time_end, s.price,
              r.origin_name, r.dest_name, b.nomor AS bus_nomor, b.tipe AS bus_tipe
       FROM tickets t
       JOIN schedules s ON t.schedule_id = s.id
       JOIN routes r ON s.route_id = r.id
       JOIN buses b ON s.bus_id = b.id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`;

  const params = req.user.role === 'admin' ? [] : [req.user.id];
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/tickets', authenticate, (req, res) => {
  const { schedule_id, seat_number } = req.body;
  if (!schedule_id || seat_number == null) return res.status(400).json({ error: 'Field wajib.' });

  db.get('SELECT id FROM tickets WHERE schedule_id=? AND seat_number=? AND status!="cancelled"', [schedule_id, seat_number], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'Kursi sudah dipesan.' });

    db.run('INSERT INTO tickets (user_id, schedule_id, seat_number) VALUES (?,?,?)', [req.user.id, schedule_id, seat_number], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, schedule_id, seat_number, status: 'booked' });
    });
  });
});

app.put('/api/tickets/:id', authenticate, (req, res) => {
  const { status } = req.body;
  const valid = ['booked', 'confirmed', 'cancelled', 'completed'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Status tidak valid.' });

  const cond = req.user.role === 'admin' ? '' : ' AND user_id=?';
  const params = req.user.role === 'admin' ? [status, req.params.id] : [status, req.params.id, req.user.id];

  db.run(`UPDATE tickets SET status=? WHERE id=${req.user.role === 'admin' ? '?' : '? AND user_id=?'}`, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Tiket tidak ditemukan.' });
    res.json({ success: true });
  });
});

// ============================================================
// SEAT AVAILABILITY (Booked seats per schedule)
// ============================================================
app.get('/api/schedules/:id/seats', (req, res) => {
  db.all('SELECT seat_number, status FROM tickets WHERE schedule_id=? AND status!="cancelled"', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ============================================================
// SEED DATA (Run once)
// ============================================================
function seedIfEmpty() {
  db.get('SELECT COUNT(*) as cnt FROM buses', [], (err, row) => {
    if (row.cnt > 0) return;
    console.log('Seeding default data...');

    // Buses
    const insertBus = db.prepare('INSERT INTO buses (nomor, tipe, kapasitas) VALUES (?,?,?)');
    insertBus.run('B 7001 VIP', 'Sleeper Class', 18);
    insertBus.run('B 7002 VIP', 'Executive AC', 30);
    insertBus.run('B 7003 VIP', 'Double Decker', 40);
    insertBus.run('B 7004 VIP', 'Executive AC', 30);

    // Routes
    const insertRoute = db.prepare('INSERT INTO routes (origin_name, origin_coords, dest_name, dest_coords, jarak) VALUES (?,?,?,?,?)');
    insertRoute.run('Jakarta (Kalideres)', JSON.stringify([-6.1601, 106.7029]), 'Bandung (Cicaheum)', JSON.stringify([-6.9011, 107.6534]), '180 km');
    insertRoute.run('Jakarta (Kalideres)', JSON.stringify([-6.1601, 106.7029]), 'Semarang (Terboyo)', JSON.stringify([-6.9602, 110.4578]), '450 km');
    insertRoute.run('Jakarta (Kalideres)', JSON.stringify([-6.1601, 106.7029]), 'Surabaya (Bungurasih)', JSON.stringify([-7.3617, 112.7506]), '780 km');
    insertRoute.run('Bandung (Cicaheum)', JSON.stringify([-6.9011, 107.6534]), 'Yogyakarta (Giwangan)', JSON.stringify([-7.8344, 110.3926]), '520 km');
    insertRoute.run('Solo (Tirtonadi)', JSON.stringify([-7.5512, 110.8198]), 'Jakarta (Kalideres)', JSON.stringify([-6.1601, 106.7029]), '510 km');

    // Schedules (from seed above)
    const insertSched = db.prepare('INSERT INTO schedules (route_id, bus_id, tanggal, time_start, time_end, price) VALUES (?,?,?,?,?,?)');
    // Jakarta - Bandung, bus_id=1, kapasitas 18, dates: 2026-06-25,26,27
    insertSched.run(1, 1, '2026-06-25', '07:00', '10:00', 150000);
    insertSched.run(1, 1, '2026-06-25', '13:00', '16:00', 150000);
    insertSched.run(1, 2, '2026-06-26', '08:00', '11:00', 120000);
    insertSched.run(1, 2, '2026-06-27', '09:00', '12:00', 120000);
    // Jakarta - Semarang, bus_id=2
    insertSched.run(2, 2, '2026-06-25', '07:30', '13:30', 250000);
    insertSched.run(2, 3, '2026-06-26', '19:00', '01:00', 280000);
    // Jakarta - Surabaya, bus_id=3
    insertSched.run(3, 3, '2026-06-25', '17:00', '06:00', 400000);
    insertSched.run(3, 4, '2026-06-27', '08:00', '17:00', 350000);
    // Bandung - Yogya, bus_id=4
    insertSched.run(4, 4, '2026-06-25', '06:00', '14:40', 300000);
    // Solo - Jakarta, bus_id=2
    insertSched.run(5, 2, '2026-06-26', '10:00', '17:30', 300000);

    console.log('Seed complete.');
  });
}

seedIfEmpty();

app.listen(PORT, () => console.log(`BusGo API running at http://localhost:${PORT}`));