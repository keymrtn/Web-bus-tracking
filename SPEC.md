# SPEC: BusGo — Bus Booking & Real-Time Tracking Web

## 1. Project Overview

**Nama**: BusGo
**Tipe**: Single-Page Web Application (SPA) — pure HTML/JS/CSS, no backend
**Penyimpanan**: localStorage (tickets, bookings)
**Map**: Leaflet.js + OpenStreetMap tiles

---

## 2. Fitur Utama

### A. Pencarian Jadwal
- Filter berdasarkan rute (dropdown)
- Filter berdasarkan tanggal (date picker)
- Daftar jadwal dengan info: bus, jam berangkat, jam sampai, harga, status
- Status: `menunggu` (belum berangkat), `berjalan` (sedang di perjalanan), `selesai`

### B. Pemesanan Tiket
- Pilih jadwal ➔ form data penumpang (nama, no. HP, jumlah kursi)
- Generate nomor tiket unik (format: `BG-YYYYMMDD-XXXX`)
- Simpan ke localStorage
- Tampilkan konfirmasi + QR code dummy (CSS-only)

### C. Tiket Saya (Riwayat)
- Daftar tiket user (dari localStorage)
- Info: nomor tiket, rute, tanggal, jam, status tiket
- Tombol "Lacak Bus" (hanya muncul di tanggal yang sesuai)
- **Visibility rule**: 
  - Tanggal sekarang < tanggal tiket ➔ "Bus belum beroperasi"
  - Tanggal sekarang = tanggal tiket ➔ "Lacak Bus" aktif, map animasi berjalan
  - Tanggal sekarang > tanggal tiket ➔ "Perjalanan telah selesai"

### D. Tracking Bus (Map Animation)
- Map full-screen dengan Leaflet.js
- Marker bus bergerak sepanjang rute (interpolasi koordinat)
- Info panel: kecepatan simulasi, jarak tempuh, ETA
- Rute garis polyline dari titik awal ke tujuan
- Marker terminal awal & akhir
- Panel info perjalanan (warna hijau=rute, biru=bus, merah=tujuan)

---

## 3. Data Dummy

### Rute (5 rute):
| ID | Nama | Awal | Akhir | Estimasi (menit) |
|----|------|------|-------|-----------------|
| R1 | Jakarta - Bandung | Terminal Kalideres | Terminal Lebak Siliwangi | 180 |
| R2 | Bandung - Jakarta | Terminal Lebak Siliwangi | Terminal Kalideres | 180 |
| R3 | Jakarta - Bogor | Terminal Kalideres | Terminal Baranangsiang | 90 |
| R4 | Jakarta - Semarang | Terminal Kalideres | Terminal Tirtonadi | 480 |
| R5 | Jakarta - Surabaya | Terminal Kalideres | Terminal Bungurasih | 720 |

### Jadwal (per rute):
- 3 keberangkatan/hari: 07:00, 12:00, 18:00
- Tanggal: 18 Juni 2026 (bisa pilih tanggal lain)
- 5 bus berbeda (B-001 hingga B-005)

### Koordinat Rute (Lat/Lng waypoints):
- Jakarta - Bandung: [Kalideres] → [Cikarang] → [Karawang] → [Cikampek] → [Purwakarta] → [Bandung]
- Jakarta - Bogor: [Kalideres] → [Depok] → [Bogor]
- Jakarta - Semarang: [Kalideres] → [Cirebon] → [Tegal] → [Semarang]
- Jakarta - Surabaya: [Kalideres] → [Cirebon] → [Semarang] → [Surabaya]

---

## 4. Teknis

### Struktur File:
```
bus-tracking/
├── index.html           # Landing + pencarian jadwal
├── booking.html         # Form pemesanan tiket
├── my-tickets.html      # Daftar tiket user
├── tracking.html       # Map tracking bus (param: ?ticket=ID)
├── 404.html             # Page not found
├── SPEC.md
├── assets/
│   ├── css/
│   │   └── style.css    # Custom styles (dark theme bus app)
│   └── js/
│       ├── data.js      # Dummy data (routes, schedules, waypoints)
│       ├── storage.js   # localStorage wrapper
│       ├── app.js       # Main logic, routing, search
│       ├── booking.js   # Booking flow logic
│       ├── tickets.js   # My tickets logic
│       └── tracking.js  # Map animation + bus movement
```

### localStorage Schema:
```json
{
  "busgo_tickets": [
    {
      "id": "BG-20260618-0001",
      "ticketId": "BG-20260618-0001",
      "scheduleId": "S001",
      "busNomor": "B-001",
      "rute": "Jakarta - Bandung",
      "tanggal": "2026-06-18",
      "jamBerangkat": "07:00",
      "namaPenumpang": "Ricky Martin",
      "hp": "081234567890",
      "jumlahKursi": 2,
      "harga": 150000,
      "total": 300000,
      "statusTiket": "dibeli",
      "createdAt": "2026-06-12T10:00:00Z"
    }
  ]
}
```

---

## 5. Desain UI/UX

### Tema: Dark Transport
- Background: `#0f1923` (dark navy)
- Card: `#1a2332`
- Primary accent: `#ff6b35` (orange — warna bus)
- Secondary accent: `#00d4aa` (teal — online/tracking)
- Text: `#e0e6ed`
- Font: Inter (Google Fonts)

### Navigasi:
- Bottom navigation bar (mobile-first): Beranda | Cari Jadwal | Tiket Saya

---

## 6. Animasi Bus Tracking

- Bus bergerak dari waypoint ke waypoint
- Kecepatan: 1 waypoint per 30 detik ( simulasi )
- Marker bus berputar sesuai arah pergerakan
- Polyline rute hijau tebal
- Progress bar di bawah map menunjukkan % perjalanan
- ETA hitung mundur real-time