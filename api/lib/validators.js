// Input Validators — Basic validation helpers
// Sesuai rules: Validation Rules section — server-side validation WAJIB

const { ValidationError } = require('./errors');

// Validate required fields — throws ValidationError if fails
function validateRequired(fields, body) {
  const missing = [];
  const details = [];
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missing.push(field);
      details.push({ field, message: `Field "${field}" wajib diisi.` });
    }
  }
  if (missing.length > 0) {
    throw new ValidationError('Input tidak valid.', details);
  }
}

// Validate positive integer
function validatePositiveInt(value, fieldName = 'value') {
  const num = Number(value);
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    throw new ValidationError(`${fieldName} harus angka positif.`, [
      { field: fieldName, message: `${fieldName} harus angka positif.` },
    ]);
  }
  return num;
}

// Validate string length
function validateStringLength(value, fieldName, min = 1, max = 255) {
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    throw new ValidationError(`${fieldName} harus 1-${max} karakter.`, [
      { field: fieldName, message: `${fieldName} harus 1-${max} karakter.` },
    ]);
  }
  return value.trim();
}

// Validate date string (YYYY-MM-DD)
function validateDate(value, fieldName = 'date') {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!value || !dateRegex.test(value)) {
    throw new ValidationError(`${fieldName} format tidak valid (YYYY-MM-DD).`, [
      { field: fieldName, message: `${fieldName} harus format YYYY-MM-DD.` },
    ]);
  }
  return value;
}

// Validate time string (HH:MM)
function validateTime(value, fieldName = 'time') {
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!value || !timeRegex.test(value)) {
    throw new ValidationError(`${fieldName} format tidak valid (HH:MM).`, [
      { field: fieldName, message: `${fieldName} harus format HH:MM.` },
    ]);
  }
  return value;
}

// Validate enum value
function validateEnum(value, allowedValues, fieldName = 'field') {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(`${fieldName} tidak valid.`, [
      { field: fieldName, message: `Nilai ${fieldName} tidak valid.` },
    ]);
  }
  return value;
}

module.exports = {
  validateRequired,
  validatePositiveInt,
  validateStringLength,
  validateDate,
  validateTime,
  validateEnum,
};