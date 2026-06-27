// Route Service — CRUD operations untuk rute
// Sesuai rules: Service Layer Rules + filter/sort

const db = require('../db');
const { ValidationError, NotFoundError } = require('../lib/errors');
const { validateRequired, validateStringLength } = require('../lib/validators');

const ALLOWED_SORT = ['id', 'origin_name', 'dest_name', 'jarak', 'created_at'];

function parseJsonSafe(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
}

/**
 * Get semua rute — dengan filter, sort, pagination
 * @param {object} options - { search, sort, page, perPage }
 */
function getAll(options = {}) {
  const { search, sort = 'id:asc', page = 1, perPage = 50 } = options;
  const offset = (page - 1) * perPage;
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(origin_name LIKE ? OR dest_name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

  const sortClauses = (sort || 'id:asc').split(',').map(part => {
    const [field, dir = 'asc'] = part.trim().split(':');
    const direction = dir.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    if (ALLOWED_SORT.includes(field)) return `${field} ${direction}`;
    return 'id ASC';
  }).join(', ');

  const baseQuery = 'SELECT * FROM routes';
  const countQuery = `SELECT COUNT(*) as total FROM routes${where}`;

  return new Promise((resolve, reject) => {
    db.get(countQuery, params, (err, countRow) => {
      if (err) return reject(err);
      const total = countRow ? countRow.total : 0;
      const sql = `${baseQuery}${where} ORDER BY ${sortClauses} LIMIT ${perPage} OFFSET ${offset}`;
      db.all(sql, params, (err2, rows) => {
        if (err2) return reject(err2);
        const routes = rows.map(r => ({
          id: r.id,
          origin_name: r.origin_name,
          origin_coords: parseJsonSafe(r.origin_coords),
          dest_name: r.dest_name,
          dest_coords: parseJsonSafe(r.dest_coords),
          jarak: r.jarak,
        }));
        resolve({ data: routes, total, page, perPage });
      });
    });
  });
}

/**
 * Get rute by ID
 */
function getById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM routes WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new NotFoundError('Rute'));
      resolve({
        id: row.id,
        origin_name: row.origin_name,
        origin_coords: parseJsonSafe(row.origin_coords),
        dest_name: row.dest_name,
        dest_coords: parseJsonSafe(row.dest_coords),
        jarak: row.jarak,
      });
    });
  });
}

/**
 * Create rute baru (admin only)
 */
function create({ origin_name, origin_coords, dest_name, dest_coords, jarak }) {
  validateRequired(['origin_name', 'dest_name'], { origin_name, dest_name });
  validateStringLength(origin_name, 'Origin name', 1, 100);
  validateStringLength(dest_name, 'Dest name', 1, 100);

  const coords = (arr) => JSON.stringify(Array.isArray(arr) ? arr : []);

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO routes (origin_name, origin_coords, dest_name, dest_coords, jarak) VALUES (?,?,?,?,?)',
      [origin_name.trim(), coords(origin_coords), dest_name.trim(), coords(dest_coords), jarak || ''],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      }
    );
  });
}

/**
 * Update rute (PATCH — partial)
 */
function update(id, data) {
  validateRequired(['origin_name', 'dest_name'], { origin_name: data.origin_name, dest_name: data.dest_name });
  validateStringLength(data.origin_name || '', 'Origin name', 1, 100);
  validateStringLength(data.dest_name || '', 'Dest name', 1, 100);

  const coords = (arr) => JSON.stringify(Array.isArray(arr) ? arr : []);
  const fields = [
    data.origin_name ? ['origin_name', data.origin_name.trim()] : null,
    data.origin_coords !== undefined ? ['origin_coords', coords(data.origin_coords)] : null,
    data.dest_name ? ['dest_name', data.dest_name.trim()] : null,
    data.dest_coords !== undefined ? ['dest_coords', coords(data.dest_coords)] : null,
    data.jarak !== undefined ? ['jarak', data.jarak || ''] : null,
  ].filter(Boolean);

  if (!fields.length) return Promise.resolve({ success: true, unchanged: true });

  const sql = `UPDATE routes SET ${fields.map(([k]) => `${k}=?`).join(',')} WHERE id=?`;
  return new Promise((resolve, reject) => {
    db.run(sql, [...fields.map(([, v]) => v), id], function (err) {
      if (err) return reject(err);
      if (this.changes === 0) return reject(new NotFoundError('Rute'));
      resolve({ success: true });
    });
  });
}

// Full replace (PUT)
function replace(id, data) { return update(id, data); }

/**
 * Delete rute (admin only)
 */
function remove(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM routes WHERE id=?', [id], function (err) {
      if (err) return reject(err);
      if (this.changes === 0) return reject(new NotFoundError('Rute'));
      resolve({ success: true });
    });
  });
}

module.exports = { getAll, getById, create, update, replace, remove };