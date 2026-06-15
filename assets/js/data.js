// Dynamic data binder for BusGo with fallback defaults and local storage overrides.
const DEFAULT_ROUTES = [
  {
    id: "R1",
    nama: "Jakarta - Bandung",
    awal: "Terminal Kalideres",
    akhir: "Terminal Lebak Siliwangi",
    estimasi: 180,
    coords: [
      [-6.1601, 106.7029], // Kalideres (Awal)
      [-6.2625, 107.0012], // Bekasi
      [-6.3056, 107.2917], // Karawang
      [-6.4014, 107.4431], // Purwakarta
      [-6.8904, 107.6106]  // Bandung (Akhir)
    ]
  },
  {
    id: "R2",
    nama: "Bandung - Jakarta",
    awal: "Terminal Lebak Siliwangi",
    akhir: "Terminal Kalideres",
    estimasi: 180,
    coords: [
      [-6.8904, 107.6106], // Bandung (Awal)
      [-6.4014, 107.4431], // Purwakarta
      [-6.3056, 107.2917], // Karawang
      [-6.2625, 107.0012], // Bekasi
      [-6.1601, 106.7029]  // Kalideres (Akhir)
    ]
  },
  {
    id: "R3",
    nama: "Jakarta - Bogor",
    awal: "Terminal Kalideres",
    akhir: "Terminal Baranangsiang",
    estimasi: 90,
    coords: [
      [-6.1601, 106.7029], // Kalideres (Awal)
      [-6.4025, 106.8436], // Depok
      [-6.6025, 106.8083]  // Bogor (Akhir)
    ]
  },
  {
    id: "R4",
    nama: "Jakarta - Semarang",
    awal: "Terminal Kalideres",
    akhir: "Terminal Tirtonadi",
    estimasi: 480,
    coords: [
      [-6.1601, 106.7029], // Kalideres (Awal)
      [-6.7206, 108.5562], // Cirebon
      [-6.8687, 109.1384], // Tegal
      [-6.9536, 109.6882], // Pekalongan
      [-6.9667, 110.4167]  // Semarang (Akhir)
    ]
  },
  {
    id: "R5",
    nama: "Jakarta - Surabaya",
    awal: "Terminal Kalideres",
    akhir: "Terminal Bungurasih",
    estimasi: 720,
    coords: [
      [-6.1601, 106.7029], // Kalideres (Awal)
      [-6.7206, 108.5562], // Cirebon
      [-6.9667, 110.4167], // Semarang
      [-6.8048, 110.8402], // Kudus
      [-6.7588, 111.4382], // Rembang
      [-7.1612, 111.9022], // Bojonegoro
      [-7.3524, 112.7246]  // Surabaya (Akhir)
    ]
  }
];

const DEFAULT_BUSES = [
  { id: "B1", nomor: "B 7001 VIP", tipe: "Double Decker", kapasitas: 40 },
  { id: "B2", nomor: "B 7002 VIP", tipe: "Executive AC", kapasitas: 30 },
  { id: "B3", nomor: "B 7003 VIP", tipe: "Super Executive", kapasitas: 20 },
  { id: "B4", nomor: "B 7004 VIP", tipe: "Executive AC", kapasitas: 30 },
  { id: "B5", nomor: "B 7005 VIP", tipe: "Sleeper Bus", kapasitas: 18 }
];

// Resolvers
const getRoutes = () => {
  const custom = storage.getCustomRoutes();
  return custom ? custom : DEFAULT_ROUTES;
};

const getBuses = () => {
  const custom = storage.getCustomBuses();
  return custom ? custom : DEFAULT_BUSES;
};

const ROUTES = getRoutes();
const BUSES = getBuses();

const JAM_BERANGKAT = ["07:00", "12:00", "18:00"];

function generateSchedulesForDate(dateStr) {
  const list = [];
  
  // Load standard auto-generated schedules
  ROUTES.forEach(route => {
    JAM_BERANGKAT.forEach((jam, idx) => {
      const bus = BUSES[(idx + parseInt(route.id.replace(/\D/g, "") || "1")) % BUSES.length];
      
      // Calculate ETA
      const [hour, min] = jam.split(":").map(Number);
      let totalMin = hour * 60 + min + route.estimasi;
      const hourSampai = Math.floor(totalMin / 60) % 24;
      const minSampai = totalMin % 60;
      const jamSampai = `${String(hourSampai).padStart(2, '0')}:${String(minSampai).padStart(2, '0')}`;
      
      list.push({
        id: `SCH-${route.id}-${idx}-${dateStr.replace(/-/g, "")}`,
        routeId: route.id,
        routeName: route.nama,
        ruteAwal: route.awal,
        ruteAkhir: route.akhir,
        busId: bus.id,
        busNomor: bus.nomor,
        busTipe: bus.tipe,
        tanggal: dateStr,
        jamBerangkat: jam,
        jamSampai: jamSampai,
        harga: 100000 + (route.estimasi * 500) + (bus.kapasitas < 25 ? 50000 : 0)
      });
    });
  });

  // Append custom schedules created by Admin (supporting raw custom inputs)
  const customs = storage.getCustomSchedules().filter(s => s.tanggal === dateStr);
  customs.forEach(c => {
    const route = ROUTES.find(r => r.id === c.routeId);
    if (route) {
      list.push({
        id: c.id,
        routeId: c.routeId,
        routeName: route.nama,
        ruteAwal: route.awal,
        ruteAkhir: route.akhir,
        busId: c.busId || "custom",
        busNomor: c.busNomor,
        busTipe: c.busTipe,
        tanggal: c.tanggal,
        jamBerangkat: c.jamBerangkat,
        jamSampai: c.jamSampai,
        harga: Number(c.harga)
      });
    }
  });
  
  return list;
}
