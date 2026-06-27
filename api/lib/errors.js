// Custom Error Classes — WAJIB gunakan ini, bukan generic Error
// Sesuai rules: Service Layer Rules point 3

class AppError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 'VALIDATION_ERROR', 400);
    this.details = details;
  }
}

class AuthError extends AppError {
  constructor(message, code = 'UNAUTHORIZED') {
    super(message, code, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Anda tidak punya akses ke resource ini') {
    super(message, 'FORBIDDEN', 403);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} tidak ditemukan.`, 'NOT_FOUND', 404);
  }
}

class ConflictError extends AppError {
  constructor(message, code = 'DUPLICATE_USER') {
    super(message, code, 409);
  }
}

class InternalError extends AppError {
  constructor(message = 'Terjadi kesalahan sistem. Silakan coba lagi.') {
    super(message, 'INTERNAL_ERROR', 500);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalError,
};