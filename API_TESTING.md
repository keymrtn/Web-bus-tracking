# BusGo API — Testing Guide

REST API for BusGo bus tracking application.

## Quick Start

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Start Server

```bash
cd api
node server.js
# → BusGo API v1 running at http://localhost:3000
```

> **Note:** Default JWT secret is for development only. For production, set env var:
> ```bash
> JWT_SECRET=your_secret_here node server.js
> ```

### 3. Open API Documentation & Test

Browse to:
```
https://registry.scalar.com/@team-elite/apis/busgo-api@latest
```

Click **"Test Request"** on any endpoint to test directly from the browser. Server must be running locally for live testing.

Alternatively, view the raw OpenAPI spec:
```
http://localhost:3000/api/spec.json
```

---

## Test Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `adminpassword` | admin |
| `admin` (register baru) | min 6 chars | user |

---

## Testing with curl

Start server first (`node server.js`), then:

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpassword"}'
```

### Get Buses (requires auth — use token from login)
```bash
curl http://localhost:3000/api/v1/buses \
  -H "Authorization: Bearer <token>"
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"secret123","name":"New User"}'
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/login` | — | Login user |
| POST | `/api/v1/auth/register` | — | Register new user |
| POST | `/api/v1/auth/logout` | ✓ | Logout user |
| GET | `/api/v1/users/me` | ✓ | Get current user profile |
| GET | `/api/v1/buses` | ✓ | List all buses |
| POST | `/api/v1/buses` | admin | Create bus |
| PUT | `/api/v1/buses/:id` | admin | Update bus |
| DELETE | `/api/v1/buses/:id` | admin | Delete bus |
| GET | `/api/v1/routes` | ✓ | List all routes |
| POST | `/api/v1/routes` | admin | Create route |
| PUT | `/api/v1/routes/:id` | admin | Update route |
| DELETE | `/api/v1/routes/:id` | admin | Delete route |
| GET | `/api/v1/schedules` | ✓ | List schedules |
| POST | `/api/v1/schedules` | admin | Create schedule |
| GET | `/api/v1/tickets` | ✓ | List user tickets |
| POST | `/api/v1/tickets` | ✓ | Book ticket |
| PATCH | `/api/v1/tickets/:id/status` | admin | Update ticket status |
| GET | `/api/health` | — | Health check |

---

## Run Tests

```bash
cd api
npm test
```

---

## File Structure

```
api/
  server.js          # Entry point, all routes, seed data
  services/          # Business logic (auth, bus, route, schedule, ticket)
  lib/               # Utilities (errors, response, validators)
  middleware/        # Auth & rate-limit middleware
  db.js              # SQLite connection
  docs/              # OpenAPI spec & Scalar config
  tests/             # Integration tests
```

---

## Troubleshooting

**Server won't start?**
- Port 3000 may be in use: `taskkill //F //PID $(netstat -ano | grep :3000 | awk '{print $5}')`
- Check `JWT_SECRET` env var is not empty if you set it

**"Token tidak ada" on protected endpoints?**
- Login first, copy the `token` from response, then add header:
  `Authorization: Bearer <token>`

**"INVALID_CREDENTIALS" on login?**
- Credentials are case-sensitive. Default: `admin` / `adminpassword`
- If you changed the password in DB, use the correct one or re-run seed

**Database empty?**
- Seed runs automatically on first start. If `busgo.db` is missing, `node server.js` will create and seed it.