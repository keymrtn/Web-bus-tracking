// Ticket Service — CRUD operations untuk tiket + seat booking
const db = require('../db');
const { ValidationError, NotFoundError, ForbiddenError } = require('../lib/errors');
const { validateRequired, validatePositiveInt } = require('../lib/validators');

function parseJsonSafe(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
}

/** Get semua tiket untuk user (atau semua jika admin) */
function getAll(userId, isAdmin) {
  const sql = isAdmin
    ? 'SELECT t.*, s.tanggal, s.time_start, s.time_end, s.price, r.origin_name, r.dest_name FROM tickets t JOIN schedules s ON t.schedule_id=s.id JOIN routes r ON s.route_id=r.id ORDER BY t.created_at DESC'
    : 'SELECT t.*, s.tanggal, s.time_start, s.time_end, s.price, r.origin_name, r.dest_name FROM tickets t JOIN schedules s ON t.schedule_id=s.id JOIN routes r ON s.route_id=r.id WHERE t.user_id=? ORDER BY t.created_at DESC';
  const params = isAdmin ? [] : [userId];
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/** Get tiket by ID */
function getById(id) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT t.*, s.tanggal, s.time_start, s.time_end, s.price, r.origin_name, r.dest_name, b.nomor AS bus_nomor, b.kapasitas
      FROM tickets t
      JOIN schedules s ON t.schedule_id=s.id
      JOIN routes r ON s.route_id=r.id
      JOIN buses b ON s.bus_id=b.id
      WHERE t.id=?
    `;
    db.get(query, [id], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new NotFoundError('Tiket'));
      resolve(row);
    });
  });
}

/** Book seat */
function book(userId, { schedule_id, seat_number }) {
  validateRequired(['schedule_id', 'seat_number'], { schedule_id, seat_number });
  const sid = validatePositiveInt(schedule_id, 'schedule_id');
  const seat = String(seat_number).trim();

  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM schedules WHERE id=?', [sid], (err, schedule) => {
      if (err) return reject(err);
      if (!schedule) return reject(new NotFoundError('Jadwal'));

      // Check seat availability from tickets table
      db.all('SELECT seat_number FROM tickets WHERE schedule_id=? AND status != ?', [sid, 'cancelled'], (err2, bookedRows) => {
        if (err2) return reject(err2);
        const seats = bookedRows.map(r => String(r.seat_number));
        if (seats.includes(seat)) {
          return reject(new ConflictError(`Seat ${seat} sudah terbooking.`));
        }

        db.run(
          'INSERT INTO tickets (user_id, schedule_id, seat_number, status) VALUES (?,?,?,?)',
          [userId, sid, seat, 'pending'],
          function (err3) {
            if (err3) return reject(err3);
            resolve({ id: this.lastID });
          }
        );
      });
    });
  });
}

/** Update status tiket */
function updateStatus(id, status, userId, isAdmin) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM tickets WHERE id=?', [id], (err, ticket) => {
      if (err) return reject(err);
      if (!ticket) return reject(new NotFoundError('Tiket'));
      if (!isAdmin && ticket.user_id !== userId) return reject(new ForbiddenError());
      db.run('UPDATE tickets SET status=? WHERE id=?', [status, id], function (err2) {
        if (err2) return reject(err2);
        resolve({ success: true });
      });
    });
  });
}

/** Get booked seats untuk schedule */
function getBookedSeats(scheduleId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT seat_number FROM tickets WHERE schedule_id=? AND status != ?', [scheduleId, 'cancelled'], (err, rows) => {
      if (err) return reject(err);
      resolve({ bookedSeats: rows.map(r => r.seat_number) });
    });
  });
}

module.exports = { getAll, getById, book, updateStatus, getBookedSeats };