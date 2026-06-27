// Auth Service — Login, register, token verification
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { ValidationError, ConflictError, AuthError, NotFoundError } = require('../lib/errors');
const { validateRequired, validateStringLength } = require('../lib/validators');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_only_not_prod';
const JWT_EXPIRES_IN = '1d';
const BCRYPT_COST = 12;

/** Register user baru */
function register({ username, password, name }) {
  validateRequired(['username', 'password', 'name'], { username, password, name });
  validateStringLength(username, 'Username', 3, 30);
  if (password.length < 6) throw new ValidationError('Password minimal 6 karakter.', [{ field: 'password', message: 'Minimal 6 karakter.' }]);
  validateStringLength(name, 'Name', 1, 100);
  const hash = bcrypt.hashSync(password, BCRYPT_COST);

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, password, name, role) VALUES (?,?,?,?)',
      [username.trim(), hash, name.trim(), 'user'],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) return reject(new ConflictError('Username sudah terdaftar.'));
          return reject(err);
        }
        const user = { id: this.lastID, username: username.trim(), name: name.trim(), role: 'user' };
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        resolve({ user, token });
      }
    );
  });
}

/** Login */
function login({ username, password }) {
  validateRequired(['username', 'password'], { username, password });
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username=?', [username.trim()], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new AuthError('Username atau password salah.', 'INVALID_CREDENTIALS'));
      if (!bcrypt.compareSync(password, row.password)) return reject(new AuthError('Username atau password salah.', 'INVALID_CREDENTIALS'));
      const user = { id: row.id, username: row.username, name: row.name, role: row.role };
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      resolve({ user, token });
    });
  });
}

/** Verify token */
function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); }
  catch { throw new AuthError('Token tidak valid atau sudah expired.', 'UNAUTHORIZED'); }
}

/** Get user by ID */
function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, username, name, role FROM users WHERE id=?', [id], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new NotFoundError('User'));
      resolve(row);
    });
  });
}

module.exports = { register, login, verifyToken, getUserById };