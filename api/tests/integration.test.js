// Test setup
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js'; // loads + starts server

const BASE = '/api/v1';
let adminToken = '';
let userToken = '';

beforeAll(async () => {
  // Get admin token
  const r = await request(app).post(`${BASE}/auth/login`).send({ username: 'admin', password: 'adminpassword' });
  adminToken = r.body.data?.token;
  // Get user token
  const r2 = await request(app).post(`${BASE}/auth/login`).send({ username: 'ricky', password: 'userpassword' });
  userToken = r2.body.data?.token;
});

afterAll(() => {
  // server closes via app.listen cleanup
});

describe('Health', () => {
  it('200 with success format', async () => {
    const r = await request(app).get('/api/health').set('X-Request-ID', 'test-health-1');
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    expect(r.body.data.status).toBe('ok');
    expect(r.headers['x-request-id']).toBe('test-health-1');
  });
});

describe('Auth — Login', () => {
  it('200 + token untuk credentials valid', async () => {
    const r = await request(app).post(`${BASE}/auth/login`).send({ username: 'admin', password: 'adminpassword' });
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    expect(r.body.data.token).toBeDefined();
    expect(r.body.data.user.role).toBe('admin');
    expect(r.body.data.user.password).toBeUndefined(); // no leak
  });

  it('401 untuk credentials invalid', async () => {
    const r = await request(app).post(`${BASE}/auth/login`).send({ username: 'admin', password: 'salah' });
    expect(r.status).toBe(401);
    expect(r.body.success).toBe(false);
    expect(r.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('400 jika username/password kosong', async () => {
    const r = await request(app).post(`${BASE}/auth/login`).send({ username: '', password: '' });
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Auth — Register', () => {
  it('201 untuk data valid', async () => {
    const id = Date.now();
    const r = await request(app).post(`${BASE}/auth/register`).send({ username: `newuser${id}`, password: 'password123', name: 'New User' });
    expect(r.status).toBe(201);
    expect(r.body.success).toBe(true);
    expect(r.body.data.user.username).toBe(`newuser${id}`);
  });

  it('409 jika username duplikat', async () => {
    const r = await request(app).post(`${BASE}/auth/register`).send({ username: 'admin', password: 'password123', name: 'Admin Clone' });
    expect(r.status).toBe(409);
    expect(r.body.error.code).toBe('DUPLICATE_USER');
  });

  it('400 jika field kosong', async () => {
    const r = await request(app).post(`${BASE}/auth/register`).send({ username: '', password: '', name: '' });
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Auth — /users/me', () => {
  it('200 dengan token valid', async () => {
    const r = await request(app).get(`${BASE}/users/me`).set('Authorization', `Bearer ${adminToken}`);
    expect(r.status).toBe(200);
    expect(r.body.data.username).toBeDefined();
    expect(r.body.data.password).toBeUndefined();
  });

  it('401 tanpa token', async () => {
    const r = await request(app).get(`${BASE}/users/me`);
    expect(r.status).toBe(401);
    expect(r.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('Auth — Logout', () => {
  it('200 stateless logout', async () => {
    const r = await request(app).post(`${BASE}/auth/logout`).set('Authorization', `Bearer ${adminToken}`);
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
  });
});

describe('Buses', () => {
  it('GET /buses 200 dengan pagination meta', async () => {
    const r = await request(app).get(`${BASE}/buses`);
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    expect(Array.isArray(r.body.data)).toBe(true);
    expect(r.body.meta.total).toBeDefined();
  });

  it('filter[status] + sort', async () => {
    const r = await request(app).get(`${BASE}/buses?filter[status]=active&sort=id:desc`);
    expect(r.status).toBe(200);
    expect(r.body.data.every(b => b.status === 'active')).toBe(true);
  });

  it('GET /buses/:id 200', async () => {
    const r = await request(app).get(`${BASE}/buses/1`);
    expect(r.status).toBe(200);
    expect(r.body.data.id).toBeDefined();
  });

  it('GET /buses/:id 404', async () => {
    const r = await request(app).get(`${BASE}/buses/99999`);
    expect(r.status).toBe(404);
    expect(r.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /buses 201 admin only', async () => {
    const r = await request(app)
      .post(`${BASE}/buses`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nomor: 'TEST-999', tipe: 'Test Bus', kapasitas: 40 });
    expect(r.status).toBe(201);
    expect(r.body.success).toBe(true);
  });

  it('POST /buses 401 tanpa auth', async () => {
    const r = await request(app)
      .post(`${BASE}/buses`)
      .send({ nomor: 'TEST-998', tipe: 'Test', kapasitas: 30 });
    expect(r.status).toBe(401);
  });

  it('PUT + DELETE /buses/:id', async () => {
    const id = 99;
    const post = await request(app).post(`${BASE}/buses`).set('Authorization', `Bearer ${adminToken}`).send({ nomor: `DEL-${id}`, tipe: 'Del Bus', kapasitas: 30 });
    const newId = post.body.data?.id;
    const r = await request(app).put(`${BASE}/buses/${newId}`).set('Authorization', `Bearer ${adminToken}`).send({ nomor: `DEL-${id}-UP`, tipe: 'Updated Bus', kapasitas: 35 });
    expect(r.status).toBe(200);
    const d = await request(app).delete(`${BASE}/buses/${newId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(d.status).toBe(200);
  });
});

describe('Schedules', () => {
  it('GET /schedules with sort', async () => {
    const r = await request(app).get(`${BASE}/schedules?sort=tanggal:asc`);
    expect(r.status).toBe(200);
    expect(r.body.data.length).toBeGreaterThan(0);
  });

  it('PATCH partial update — hanya price', async () => {
    const r = await request(app)
      .patch(`${BASE}/schedules/1`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 199999 });
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
  });

  it('GET /schedules/:id/seats', async () => {
    const r = await request(app).get(`${BASE}/schedules/1/seats`);
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body.data.bookedSeats)).toBe(true);
  });
});

describe('Routes', () => {
  it('GET /routes', async () => {
    const r = await request(app).get(`${BASE}/routes`);
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body.data)).toBe(true);
  });

  it('search param', async () => {
    const r = await request(app).get(`${BASE}/routes?search=Jakarta`);
    expect(r.status).toBe(200);
  });

  it('PATCH route partial', async () => {
    const r = await request(app)
      .patch(`${BASE}/routes/1`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ jarak: '200 km' });
    expect(r.status).toBe(200);
  });
});

describe('Tickets', () => {
  it('POST /tickets 201 booking', async () => {
    const r = await request(app)
      .post(`${BASE}/tickets`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ schedule_id: 1, seat_number: 'A99' });
    expect(r.status).toBe(201);
    expect(r.body.success).toBe(true);
  });

  it('PATCH /tickets/:id partial status', async () => {
    const r = await request(app)
      .patch(`${BASE}/tickets/1`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'cancelled' });
    expect(r.status).toBe(200);
  });
});

describe('Error handling — no DB leak', () => {
  it('404 resource → no internal detail', async () => {
    const r = await request(app).get(`${BASE}/buses/99999`);
    expect(r.status).toBe(404);
    expect(JSON.stringify(r.body)).not.toMatch(/sqlite/i);
    expect(JSON.stringify(r.body)).not.toMatch(/SQLITE/i);
  });

  it('500 error → generic message', async () => {
    // Inject invalid data to trigger error on bad id
    const r = await request(app).get(`${BASE}/buses/invalid-id`);
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe('VALIDATION_ERROR');
    expect(JSON.stringify(r.body)).not.toMatch(/sqlite/i);
  });
});

describe('Rate limiting headers', () => {
  it('RateLimit headers present', async () => {
    const r = await request(app).get('/api/health');
    expect(r.headers['ratelimit-limit']).toBeDefined();
    expect(r.headers['ratelimit-remaining']).toBeDefined();
  });
});

describe('Legacy deprecation', () => {
  it('/api/buses → 410 + Sunset', async () => {
    const r = await request(app).get('/api/buses');
    expect(r.status).toBe(410);
    expect(r.headers.sunset).toBeDefined();
    expect(r.headers.deprecation).toBe('true');
    expect(r.headers.link).toBeDefined();
  });

  it('/api/auth/login → 410', async () => {
    const r = await request(app).post('/api/auth/login').send({ username: 'a', password: 'b' });
    expect(r.status).toBe(410);
    expect(r.body.error.code).toBe('DEPRECATED');
  });
});