// Rate Limiting — protect sensitive endpoints
// Sesuai rules: API-STANDARDS.md Security — rate limiting WAJIB untuk endpoint sensitif
const rateLimit = require('express-rate-limit');

const RATE_MSG = { success: false, error: { code: 'RATE_LIMIT', message: 'Terlalu banyak request. Coba lagi nanti.' } };
const AUTH_MSG = { success: false, error: { code: 'RATE_LIMIT', message: 'Terlalu banyak percobaan login. Tunggu 15 menit.' } };

/** General rate limit — 500 req / 1 menit */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_MSG,
  validate: { trustProxy: true },
});

/** Auth rate limit — 10 req / 15 menit */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: AUTH_MSG,
  validate: { trustProxy: true },
});

module.exports = { generalLimiter, authLimiter };