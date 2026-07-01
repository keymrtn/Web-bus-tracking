// Dynamic data binder for BusGo with API-synced data, fallback defaults, and local storage overrides.
const DEFAULT_ROUTES = [
  { id: "R1", nama: "Jakarta - Bandung", awal: "Terminal Kalideres", akhir: "Terminal Lebak Siliwangi", estimasi: 180, coords: [[-6.1601, 106.7029],[-6.2625, 107.0012],[-6.3056, 107.2917],[-6.4014, 107.4431],[-6.8904, 107.6106]] },
  { id: "R2", nama: "Bandung - Jakarta", awal: "Terminal Lebak Siliwangi", akhir: "Terminal Kalideres", estimasi: 180, coords: [[-6.8904, 107.6106],[-6.4014, 107.4431],[-6.3056, 107.2917],[-6.2625, 107.0012],[-6.1601, 106.7029]] },
  { id: "R3", nama: "Jakarta - Bogor", awal: "Terminal Kalideres", akhir: "Terminal Baranangsiang", estimasi: 90, coords: [[-6.1601, 106.7029],[-6.4025, 106.8436],[-6.6025, 106.8083]] },
  { id: "R4", nama: "Jakarta - Semarang", awal: "Terminal Kalideres", akhir: "Terminal Tirtonadi", estimasi: 480, coords: [[-6.1601, 106.7029],[-6.7206, 108.5562],[-6.8687, 109.1384],[-6.9536, 109.6882],[-6.9667, 110.4167]] },
  { id: "R5", nama: "Jakarta - Surabaya", awal: "Terminal Kalideres", akhir: "Terminal Bungurasih", estimasi: 720, coords: [[-6.1601, 106.7029],[-6.7206, 108.5562],[-6.9667, 110.4167],[-6.8048, 110.8402],[-6.7588, 111.4382],[-7.1612, 111.9022],[-7.3524, 112.7246]] }
];
const DEFAULT_BUSES = [
  { id: "B1", nomor: "B 7001 VIP", tipe: "Double Decker", kapasitas: 40 },
  { id: "B2", nomor: "B 7002 VIP", tipe: "Executive AC", kapasitas: 30 },
  { id: "B3", nomor: "B 7003 VIP", tipe: "Super Executive", kapasitas: 20 },
  { id: "B4", nomor: "B 7004 VIP", tipe: "Executive AC", kapasitas: 30 },
  { id: "B5", nomor: "B 7005 VIP", tipe: "Sleeper Bus", kapasitas: 18 }
];

// Resolvers: check API-synced cache first, then localStorage custom, then defaults
const getRoutes = () => {
  // 1. API-synced cache (from DB, shared across browsers)
  // Empty array = API returned 0 routes (all deleted) — authoritative
  const synced = typeof getSyncedRoutes === 'function' ? getSyncedRoutes() : null;
  if (Array.isArray(synced)) return synced;
  // 2. Local custom routes (legacy admin)
  const custom = storage.getCustomRoutes();
  if (custom && custom.length > 0) return custom;
  // 3. Defaults
  return DEFAULT_ROUTES;
};

const getBuses = () => {
  const synced = typeof getSyncedBuses === 'function' ? getSyncedBuses() : null;
  if (Array.isArray(synced)) return synced;
  const custom = storage.getCustomBuses();
  if (custom && custom.length > 0) return custom;
  return DEFAULT_BUSES;
};

const ROUTES = getRoutes();
const BUSES = getBuses();

const JAM_BERANGKAT = ["07:00", "12:00", "18:00"];

function generateSchedulesForDate(dateStr) {
  // Auto-generate disabled — admin manages schedules manually via form
  return [];
}

// --- UTILITY ---
