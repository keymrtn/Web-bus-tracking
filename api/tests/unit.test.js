// Service unit tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError, ValidationError, NotFoundError, ConflictError, AuthError } from '../lib/errors.js';
import * as validators from '../lib/validators.js';
import * as response from '../lib/response.js';

// Mock DB
const mockRows = vi.fn();
const mockOne = vi.fn();
const mockRun = vi.fn();
vi.mock('../db', () => ({ default: { all: mockRows, get: mockOne, run: mockRun } }));

const authService = (await import('../services/auth.service.js')).default;
const busService = (await import('../services/bus.service.js')).default;

describe('Auth Service', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('login throws AuthError jika username tidak ada', async () => {
    mockOne.mockImplementation((sql, params, cb) => cb(null, null));
    await expect(authService.login({ username: 'nouser', password: 'any' })).rejects.toThrow();
  });

  it('login throws AuthError jika password salah', async () => {
    mockOne.mockImplementation((sql, params, cb) => cb(null, { id: 1, username: 'admin', password: '$2a$10$wronghash', role: 'admin' }));
    await expect(authService.login({ username: 'admin', password: 'salah' })).rejects.toThrow();
  });

  it('register throws ConflictError jika username duplikat', async () => {
    mockRun.mockImplementation((sql, p, cb) => cb(new Error('UNIQUE constraint failed: users.username')));
    await expect(authService.register({ username: 'admin', password: 'pass1234', name: 'Admin' })).rejects.toThrow();
  });
});

describe('Bus Service', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('getAll returns { data, total }', async () => {
    mockOne.mockImplementation((sql, p, cb) => cb(null, { total: 2 }));
    mockRows.mockImplementation((sql, p, cb) => cb(null, [{ id: 1, nomor_bus: 'B1' }, { id: 2, nomor_bus: 'B2' }]));
    const result = await busService.getAll({});
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('getAll dengan filter status', async () => {
    mockOne.mockImplementation((sql, p, cb) => { expect(p).toContain('active'); cb(null, { total: 1 }); });
    mockRows.mockImplementation((sql, p, cb) => cb(null, [{ id: 1 }]));
    await busService.getAll({ status: 'active' });
  });

  it('getById throws NotFoundError jika tidak ada', async () => {
    mockOne.mockImplementation((sql, p, cb) => cb(null, null));
    await expect(busService.getById(999)).rejects.toThrow();
  });

  it('create throws ValidationError jika field kosong', async () => {
    await expect(busService.create({})).rejects.toThrow();
  });

  it('update throws NotFoundError jika ID tidak ada', async () => {
    mockRun.mockImplementation((sql, p, cb) => cb(null, { changes: 0 }));
    await expect(busService.update(999, { nomor: 'X', tipe: 'Y', kapasitas: 10 })).rejects.toThrow();
  });
});

describe('Response helpers', () => {
  it('success sets success:true + timestamp', () => {
    const mockRes = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    response.success(mockRes, { foo: 'bar' });
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: { foo: 'bar' } }));
  });

  it('successList adds pagination meta', () => {
    const mockRes = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    response.successList(mockRes, [{ id: 1 }], { page: 1, perPage: 10, total: 100 });
    const called = mockRes.json.mock.calls[0][0];
    expect(called.meta.page).toBe(1);
    expect(called.meta.total).toBe(100);
    expect(called.meta.totalPages).toBe(10);
    expect(called.meta.hasNext).toBe(true);
    expect(called.meta.hasPrev).toBe(false);
  });

  it('error sends AppError format', () => {
    const mockRes = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    const err = new AppError('Test error', 'TEST_CODE', 400);
    response.error(mockRes, err);
    const called = mockRes.json.mock.calls[0][0];
    expect(called.success).toBe(false);
    expect(called.error.code).toBe('TEST_CODE');
    expect(called.error.message).toBe('Test error');
  });
});

describe('Validators', () => {
  it('validatePositiveInt throws jika bukan angka', () => {
    expect(() => validators.validatePositiveInt('abc', 'test')).toThrow();
  });

  it('validatePositiveInt throws jika <= 0', () => {
    expect(() => validators.validatePositiveInt(0, 'test')).toThrow();
    expect(() => validators.validatePositiveInt(-1, 'test')).toThrow();
  });

  it('validatePositiveInt returns number jika valid', () => {
    expect(validators.validatePositiveInt('42', 'test')).toBe(42);
    expect(validators.validatePositiveInt(42, 'test')).toBe(42);
  });

  it('validateDate throws format invalid', () => {
    expect(() => validators.validateDate('2026-13-40', 'd')).toThrow();
    expect(() => validators.validateDate('not-a-date', 'd')).toThrow();
  });

  it('validateDate passes format valid', () => {
    expect(() => validators.validateDate('2026-06-27', 'd')).not.toThrow();
  });

  it('validateTime throws format invalid', () => {
    expect(() => validators.validateTime('25:99', 't')).toThrow();
    expect(() => validators.validateTime('abc', 't')).toThrow();
  });

  it('validateTime passes format valid', () => {
    expect(() => validators.validateTime('07:30', 't')).not.toThrow();
    expect(() => validators.validateTime('23:59', 't')).not.toThrow();
  });

  it('checkRequired throws untuk field kosong', () => {
    expect(() => validators.checkRequired(['a', 'b'], { a: 'x' })).toThrow();
  });

  it('checkRequired passes semua ada', () => {
    expect(() => validators.checkRequired(['a', 'b'], { a: 'x', b: 'y' })).not.toThrow();
  });
});

describe('Custom Errors', () => {
  it('AppError has code + status', () => {
    const e = new AppError('msg', 'CODE', 422);
    expect(e.message).toBe('msg');
    expect(e.code).toBe('CODE');
    expect(e.status).toBe(422);
    expect(e.name).toBe('AppError');
  });

  it('ValidationError has details array', () => {
    const e = new ValidationError('Invalid', [{ field: 'x', message: 'required' }]);
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.status).toBe(400);
    expect(e.details).toHaveLength(1);
  });

  it('NotFoundError 404', () => {
    const e = new NotFoundError('Bus');
    expect(e.status).toBe(404);
    expect(e.code).toBe('NOT_FOUND');
    expect(e.message).toBe('Bus tidak ditemukan.');
  });

  it('ConflictError 409', () => {
    const e = new ConflictError('Already exists');
    expect(e.status).toBe(409);
    expect(e.code).toBe('DUPLICATE_USER');
  });

  it('AuthError 401', () => {
    const e = new AuthError('Bad token', 'UNAUTHORIZED');
    expect(e.status).toBe(401);
    expect(e.code).toBe('UNAUTHORIZED');
  });
});