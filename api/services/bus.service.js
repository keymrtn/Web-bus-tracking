// Bus Service — CRUD operations untuk bus
const db = require('../db');
const { ValidationError, NotFoundError } = require('../lib/errors');
const { validateRequired, validateStringLength, validatePositiveInt } = require('../lib/validators');

/** Get semua bus dengan filter & sort */
function getAll(options = {}) {
  const { status, tipe, search, page = 1, perPage = 50 } = options;
  const offset = (page - 1) * perPage;
  const conditions = [];
  const params = [];

  if (status) { conditions.push('status = ?'); params.push(status); }
  if (tipe) { conditions.push('tipe_bus LIKE ?'); params.push(`%${tipe}%`); }
  if (search) { conditions.push('(nomor_bus LIKE ? OR tipe_bus LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  const sql = `SELECT * FROM buses${where} ORDER BY id ASC LIMIT ${perPage} OFFSET ${offset}`;
  const countSql = `SELECT COUNT(*) as total FROM buses${where}`;

  return new Promise((resolve, reject) => {
    db.get(countSql, params, (err, countRow) => {
      if (err) return reject(err);
      db.all(sql, params, (err2, rows) => {
        if (err2) return reject(err2);
        const buses = rows.map(r => ({
          id: r.id,
          nomor: r.nomor_bus, nomor_bus: r.nomor_bus,
          tipe: r.tipe_bus, tipe_bus: r.tipe_bus,
          kapasitas: r.kapasitas, status: r.status
        }));
        resolve({ data: buses, total: countRow ? countRow.total : 0 });
      });
    });
  });
}

/** Get bus by ID */
function getById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM buses WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new NotFoundError('Bus'));
      resolve({
        id: row.id,
        nomor: row.nomor_bus, nomor_bus: row.nomor_bus,
        tipe: row.tipe_bus, tipe_bus: row.tipe_bus,
        kapasitas: row.kapasitas, status: row.status
      });
    });
  });
}

/** Create bus baru (admin only) */
function create({ nomor, tipe, nomor_bus, tipe_bus, kapasitas, status }) {
  const nomorVal = (nomor || nomor_bus || '').trim();
  const tipeVal = (tipe || tipe_bus || '').trim();
  validateRequired(['nomor', 'tipe', 'kapasitas'], { nomor: nomorVal, tipe: tipeVal, kapasitas });
  validateStringLength(nomorVal, 'Nomor bus', 1, 50);
  validateStringLength(tipeVal, 'Tipe bus', 1, 50);
  const kapasitasNum = validatePositiveInt(kapasitas, 'Kapasitas');
  const statusVal = status || 'active';

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO buses (nomor_bus, tipe_bus, kapasitas, status) VALUES (?,?,?,?)',
      [nomorVal, tipeVal, kapasitasNum, statusVal],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) return reject(new ValidationError('Nomor bus sudah ada.', [{ field: 'nomor', message: 'Nomor bus sudah terdaftar.' }]));
          return reject(err);
        }
        resolve({ id: this.lastID });
      }
    );
  });
}

/** Update bus (admin only) */
function update(id, { nomor, tipe, nomor_bus, tipe_bus, kapasitas, status }) {
  const nomorVal = (nomor || nomor_bus || '').trim();
  const tipeVal = (tipe || tipe_bus || '').trim();
  validateRequired(['nomor', 'tipe', 'kapasitas'], { nomor: nomorVal, tipe: tipeVal, kapasitas });
  validateStringLength(nomorVal, 'Nomor bus', 1, 50);
  validateStringLength(tipeVal, 'Tipe bus', 1, 50);
  const kapasitasNum = validatePositiveInt(kapasitas, 'Kapasitas');
  const statusVal = status || 'active';

  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE buses SET nomor_bus=?, tipe_bus=?, kapasitas=?, status=? WHERE id=?',
      [nomorVal, tipeVal, kapasitasNum, statusVal, id],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new NotFoundError('Bus'));
        resolve({ success: true });
      }
    );
  });
}

/** Delete bus (admin only) */
function remove(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM buses WHERE id=?', [id], function (err) {
      if (err) return reject(err);
      if (this.changes === 0) return reject(new NotFoundError('Bus'));
      resolve({ success: true });
    });
  });
}

module.exports = { getAll, getById, create, update, remove };