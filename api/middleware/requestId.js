// X-Request-ID middleware — generate/forward request ID untuk tracing
// Sesuai rules: API-STANDARDS.md — Request Headers WAJIB
const crypto = require('crypto');

module.exports = (req, res, next) => {
  // Use existing header or generate new one
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};