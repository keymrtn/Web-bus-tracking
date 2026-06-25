const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('busgo.db');

// Create tables sequentially
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS buses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomor TEXT UNIQUE NOT NULL,
      tipe TEXT NOT NULL,
      kapasitas INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      origin_name TEXT NOT NULL,
      origin_coords TEXT NOT NULL,
      dest_name TEXT NOT NULL,
      dest_coords TEXT NOT NULL,
      jarak TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route_id INTEGER NOT NULL,
      bus_id INTEGER NOT NULL,
      tanggal TEXT NOT NULL,
      time_start TEXT NOT NULL,
      time_end TEXT NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY(route_id) REFERENCES routes(id) ON DELETE CASCADE,
      FOREIGN KEY(bus_id) REFERENCES buses(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      schedule_id INTEGER NOT NULL,
      seat_number INTEGER NOT NULL,
      status TEXT DEFAULT 'booked',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
    )
  `);

  // Insert default accounts safely
  db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
    if (!row) {
      const bcrypt = require('bcryptjs');
      const adminHash = bcrypt.hashSync('adminpassword', 10);
      const userHash = bcrypt.hashSync('userpassword', 10);
      
      db.run('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)', ['admin', adminHash, 'Administrator', 'admin']);
      db.run('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)', ['ricky', userHash, 'Ricky Martin', 'user']);
    }
  });
});

module.exports = db;