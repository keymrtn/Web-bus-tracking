# Web-bus-tracking

Aplikasi web tracking dan pemesanan tiket bus dengan manajemen jadwal, rute, dan bus secara real-time.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla) — static files served by Express
- **Backend:** Node.js + Express
- **Database:** SQLite (`busgo.db`)
- **Map:** Leaflet.js

## Prasyarat

- **Node.js** >= 18
- **npm** (bundled with Node.js)

## Instalasi

```bash
cd api
npm install
```

## Menjalankan

### Mode Development

```bash
cd api
node server.js
```

Server akan berjalan di `http://localhost:3000`.

### Mode Production (Windows - Git Bash)

```bash
cd api
bash start.sh
```

## Login

### Portal Penumpang
- Buka `http://localhost:3000/login.html`
- **User:** `ricky` / `userpassword`
- **User:** `admin` / `adminpassword`

## Fitur

- **Cari Jadwal** — pilih rute & tanggal, lihat jadwal bus tersedia
- **Pesan Tiket** — pilih kursi, checkout dengan harga otomatis
- **Tiket Saya** — lihat tiket yang sudah dipesan
- **Tracking Bus (Live)** — lacak posisi bus via simulasi map interaktif
- **Admin Dashboard** (`admin.html`) — kelola rute, bus, jadwal, tiket
- **Cetak Boarding Pass** — cetak tiket sebagai boarding pass
- **Portal Admin Khusus** (`login-admin.html`) — login khusus admin

## Struktur Proyek

```
Web-bus-tracking/
├── api/                  # Backend server
│   ├── server.js         # Entry point Express
│   ├── db.js             # Koneksi SQLite
│   ├── services/         # Service layer
│   │   ├── auth.service.js
│   │   ├── bus.service.js
│   │   ├── route.service.js
│   │   ├── schedule.service.js
│   │   └── ticket.service.js
│   ├── middleware/
│   │   ├── rateLimit.js  # Rate limiter (500 req/menit)
│   │   └── requestId.js
│   ├── lib/
│   │   ├── response.js
│   │   └── errors.js
│   └── package.json
├── assets/
│   ├── js/
│   │   ├── api.js        # API client (fetch wrapper + auth)
│   │   ├── storage.js    # LocalStorage wrapper
│   │   └── data.js       # Data helpers & defaults
│   └── css/
│       └── style.css
├── *.html                # Halaman frontend (static)
├── busgo.db              # Database SQLite (auto-buat jika belum ada)
└── README.md
```

## API Endpoints

Prefix: `/api/v1`

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/auth/login` | ✗ | Login, dapat JWT |
| GET | `/routes` | ✗ | Daftar rute |
| POST | `/routes` | Admin | Tambah rute |
| PUT | `/routes/:id` | Admin | Update rute |
| DELETE | `/routes/:id` | Admin | Hapus rute |
| GET | `/buses` | ✗ | Daftar bus |
| POST | `/buses` | Admin | Tambah bus |
| PUT | `/buses/:id` | Admin | Update bus |
| DELETE | `/buses/:id` | Admin | Hapus bus |
| GET | `/schedules` | ✗ | Daftar jadwal (filter tanggal) |
| POST | `/schedules` | Admin | Tambah jadwal |
| PUT | `/schedules/:id` | Admin | Update jadwal |
| DELETE | `/schedules/:id` | Admin | Hapus jadwal |
| GET | `/tickets` | ✓ | Tiket user login |
| POST | `/tickets` | ✓ | Booking tiket |
| PUT / PATCH | `/tickets/:id` | ✓ | Update status tiket |

## Catatan

- Rate limiter: **500 request/menit** per IP untuk endpoint `/api/*`
- Tiket disimpan ke **localStorage** terlebih dahulu, lalu sync ke server
- Tracking bus menggunakan **simulasi client-side** (tidak real GPS)
