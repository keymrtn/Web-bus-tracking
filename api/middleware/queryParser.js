// Pagination + Filter + Sort helper
// Sesuai rules: API-STANDARDS.md — query params section

/**
 * Parse pagination params dari req.query
 * @returns {object} { page, perPage, offset }
 */
function parsePagination(query, defaults = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || defaults.page || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(query.perPage, 10) || defaults.perPage || 20));
  return { page, perPage, offset: (page - 1) * perPage };
}

/**
 * Parse sort params dari req.query
 * @param {string} allowedFields - array field yang boleh di-sort
 * @returns {string} SQL ORDER BY clause atau ''
 * Contoh: "name:desc,created_at:asc" -> "name DESC, created_at ASC"
 */
function parseSort(query, allowedFields = []) {
  const sortStr = query.sort || '';
  if (!sortStr) return '';

  const clauses = sortStr.split(',').map(part => {
    const [field, direction = 'ASC'] = part.trim().split(':');
    const dir = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    if (allowedFields.includes(field)) return `${field} ${dir}`;
    return null;
  }).filter(Boolean);

  return clauses.length ? ` ORDER BY ${clauses.join(', ')}` : '';
}

/**
 * Parse filter params dari req.query
 * @param {object} filters - mapping field -> SQL condition
 * @param {object} query - req.query
 * @returns {object} { conditions: string[], params: any[] }
 */
function parseFilter(filters, query) {
  const conditions = [];
  const params = [];

  for (const [field, col] of Object.entries(filters)) {
    const key = `filter[${field}]`;
    const val = query[key] || query[field];
    if (val !== undefined && val !== '') {
      conditions.push(`${col} = ?`);
      params.push(val);
    }
  }

  return { conditions, params };
}

/**
 * Build LIMIT/OFFSET clause
 */
function buildLimitOffset(page, perPage, offset) {
  return ` LIMIT ${perPage} OFFSET ${offset}`;
}

module.exports = { parsePagination, parseSort, parseFilter, buildLimitOffset };