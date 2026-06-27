// API Response Helpers — Standarisasi format response
// Sesuai rules: API Response Format section

/**
 * Kirim response sukses dengan data
 * @param {object} res - Express response object
 * @param {*} data - Data yang dikembalikan
 * @param {number} statusCode - HTTP status (default 200)
 * @param {object} meta - Optional metadata (pagination, etc)
 */
function success(res, data, statusCode = 200, meta = null) {
  const response = {
    success: true,
    data,
  };
  if (meta) response.meta = { ...meta, timestamp: new Date().toISOString() };
  else response.meta = { timestamp: new Date().toISOString() };
  return res.status(statusCode).json(response);
}

/**
 * Kirim response sukses untuk list (dengan pagination)
 * @param {object} res - Express response object
 * @param {Array} data - Array data
 * @param {object} pagination - { page, perPage, total }
 */
function successList(res, data, pagination) {
  const { page = 1, perPage = 20, total = 0 } = pagination;
  const totalPages = Math.ceil(total / perPage);
  return success(res, data, 200, {
    page,
    perPage,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  });
}

/**
 * Kirim response sukses tanpa data (no content)
 * @param {object} res - Express response object
 */
function noContent(res) {
  return res.status(204).send();
}

/**
 * Kirim response error terstruktur
 * @param {object} res - Express response object
 * @param {Error} error - Error object
 * @param {boolean} logError - Apakah perlu log error (jangan log di response)
 */
function error(res, err, logError = true) {
  const code = err.code || 'INTERNAL_ERROR';
  const statusCode = err.statusCode || 500;

  // Log error detail ke server console — JANGAN kirim ke client
  if (logError && statusCode >= 500) {
    console.error(`[${code}] ${err.message}`, {
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
  }

  const response = {
    success: false,
    error: {
      code,
      message: err.message || 'Terjadi kesalahan.',
    },
  };

  // Include details hanya untuk VALIDATION_ERROR
  if (code === 'VALIDATION_ERROR' && err.details) {
    response.error.details = err.details;
  }

  return res.status(statusCode).json(response);
}

module.exports = { success, successList, noContent, error };