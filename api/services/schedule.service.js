// Schedule Service — CRUD operations untuk jadwal keberangkatan
// Sesuai rules: Service Layer Rules + filter/sort/pagination

const db = require('../db');
const { ValidationError, NotFoundError } = require('../lib/errors');
const { validateRequired, validatePositiveInt, validateDate, validateTime } = require('../lib/validators');

const ALLOWED_SORT_FIELDS = ['id', 'tanggal', 'time_start', 'time_end', 'price', 'created_at'];

/**
 * Get semua jadwal — dengan filter, sort, pagination
 * @param {object} options - { tanggal, route_id, status, search, sort, page, perPage }
 */
function getAll(options = {}) {
  const { tanggal, route_id, status, search, sort = 'id:asc', page = 1, perPage = 50 } = options;
  const offset = (page - 1) * perPage;

  const conditions = [];
  const params = [];
  if (tanggal) { conditions.push('s.tanggal = ?'); params.push(tanggal); }
  if (route_id) { conditions.push('s.route_id = ?'); params.push(route_id); }
  if (search) {
    conditions.push('(r.origin_name LIKE ? OR r.dest_name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

  // Sort
  const sortClauses = (sort || 'id:asc').split(',').map(part => {
    const [field, dir = 'asc'] = part.trim().split(':');
    const direction = dir.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    if (ALLOWED_SORT_FIELDS.includes(field)) return `s.${field} ${direction}`;
    return 's.id ASC';
  }).join(', ');

  const baseQuery = `
    SELECT s.*, r.origin_name, r.dest_name, b.nomor_bus, b.tipe_bus, b.kapasitas
    FROM schedules s
    JOIN routes r ON s.route_id = r.id
    JOIN buses b ON s.bus_id = b.id
  `;

  const countQuery = `SELECT COUNT(*) as total FROM schedules s JOIN routes r ON s.route_id = r.id${where}`;

  return new Promise((resolve, reject) => {
    db.get(countQuery, params, (err, countRow) => {
      if (err) return reject(err);
      const total = countRow ? countRow.total : 0;

      const sql = `${baseQuery}${where} ORDER BY ${sortClauses} LIMIT ${perPage} OFFSET ${offset}`;
      db.all(sql, params, (err2, rows) => {
        if (err2) return reject(err2);
        resolve({ data: rows, total, page, perPage });
      });
    });
  });
}

/**
 * Get jadwal by ID
 */
function getById(id) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT s.*, r.origin_name, r.dest_name, r.jarak, b.nomor_bus, b.tipe_bus, b.kapasitas
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      JOIN buses b ON s.bus_id = b.id
      WHERE s.id = ?
    `;
    db.get(query, [id], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new NotFoundError('Jadwal'));
      resolve(row);
    });
  });
}

/**
 * Create jadwal baru (admin only)
 */
function create({ route_id, bus_id, tanggal, time_start, time_end, price }) {
  validateRequired(['route_id', 'bus_id', 'tanggal', 'time_start', 'time_end', 'price'],
    { route_id, bus_id, tanggal, time_start, time_end, price });
  validatePositiveInt(route_id, 'route_id');
  validatePositiveInt(bus_id, 'bus_id');
  validateDate(tanggal, 'tanggal');
  validateTime(time_start, 'time_start');
  validateTime(time_end, 'time_end');
  const priceNum = validatePositiveInt(price, 'price');

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO schedules (route_id, bus_id, tanggal, time_start, time_end, price) VALUES (?,?,?,?,?,?)',
      [route_id, bus_id, tanggal, time_start, time_end, priceNum],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      }
    );
  });
}

/**
 * Update jadwal (PATCH — partial) atau full update (PUT)
 */
function update(id, data, isPatch = false) {
  // Validate date/time if provided
  if (data.tanggal) validateDate(data.tanggal, 'tanggal');
  if (data.time_start) validateTime(data.time_start, 'time_start');
  if (data.time_end) validateTime(data.time_end, 'time_end');
  if (data.price) validatePositiveInt(data.price, 'price');
  if (data.route_id) validatePositiveInt(data.route_id, 'route_id');
  if (data.bus_id) validatePositiveInt(data.bus_id, 'bus_id');

  // Filter out undefined
  const fields = Object.entries(data).filter(([, v]) => v !== undefined);
  if (!fields.length) return Promise.resolve({ success: true, unchanged: true });

  const cols = fields.map(([k]) => `${k}=?`);
  const vals = fields.map(([, v]) => v);
  const sql = `UPDATE schedules SET ${cols.join(',')} WHERE id=?`;

  return new Promise((resolve, reject) => {
    db.run(sql, [...vals, id], function (err) {
      if (err) return reject(err);
      if (this.changes === 0) return reject(new NotFoundError('Jadwal'));
      resolve({ success: true });
    });
  });
}

// Alias: full update (PUT)
function replace(id, { route_id, bus_id, tanggal, time_start, time_end, price }) {
  validateRequired(['route_id', 'bus_id', 'tanggal', 'time_start', 'time_end', 'price'],
    { route_id, bus_id, tanggal, time_start, time_end, price });
  return update(id, { route_id, bus_id, tanggal, time_start, time_end, price }, false);
}

/**
 * Delete jadwal (admin only)
 */
function remove(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM schedules WHERE id=?', [id], function (err) {
      if (err) return reject(err);
      if (this.changes === 0) return reject(new NotFoundError('Jadwal'));
      resolve({ success: true });
    });
  });
}

module.exports = { getAll, getById, create, update, replace, remove };