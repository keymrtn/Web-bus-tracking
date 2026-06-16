// Database Terminal Bus Terbesar di Indonesia beserta koordinat GPS-nya
const INDONESIA_TERMINALS = [
  // JABODETABEK & JAWA BARAT
  { nama: "Terminal Kalideres", daerah: "Jakarta Barat", coords: [-6.1601, 106.7029] },
  { nama: "Terminal Kampung Rambutan", daerah: "Jakarta Timur", coords: [-6.3090, 106.8824] },
  { nama: "Terminal Pulo Gebang", daerah: "Jakarta Timur", coords: [-6.2120, 106.9427] },
  { nama: "Terminal Tanjung Priok", daerah: "Jakarta Utara", coords: [-6.1118, 106.8893] },
  { nama: "Terminal Baranangsiang", daerah: "Bogor", coords: [-6.6025, 106.8083] },
  { nama: "Terminal Margonda", daerah: "Depok", coords: [-6.3912, 106.8273] },
  { nama: "Terminal Bekasi", daerah: "Bekasi", coords: [-6.2625, 107.0012] },
  { nama: "Terminal Cicaheum", daerah: "Bandung", coords: [-6.9011, 107.6534] },
  { nama: "Terminal Leuwipanjang", daerah: "Bandung", coords: [-6.9472, 107.5937] },
  { nama: "Terminal Harjamukti", daerah: "Cirebon", coords: [-6.7485, 108.5630] },
  { nama: "Terminal Guntur Melati", daerah: "Garut", coords: [-7.2023, 107.8932] },
  { nama: "Terminal Tasikmalaya (Indhiang)", daerah: "Tasikmalaya", coords: [-7.3005, 108.2045] },
  { nama: "Terminal Sukabumi", daerah: "Sukabumi", coords: [-6.9360, 106.9234] },

  // JAWA TENGAH & DIY
  { nama: "Terminal Tirtonadi", daerah: "Solo", coords: [-7.5512, 110.8198] },
  { nama: "Terminal Giwangan", daerah: "Yogyakarta", coords: [-7.8344, 110.3926] },
  { nama: "Terminal Jombor", daerah: "Sleman, Yogyakarta", coords: [-7.7475, 110.3601] },
  { nama: "Terminal Terboyo", daerah: "Semarang", coords: [-6.9602, 110.4578] },
  { nama: "Terminal Bawen", daerah: "Ungaran, Semarang", coords: [-7.2514, 110.4345] },
  { nama: "Terminal Pekalongan", daerah: "Pekalongan", coords: [-6.8920, 109.6882] },
  { nama: "Terminal Tegal", daerah: "Tegal", coords: [-6.8710, 109.1220] },
  { nama: "Terminal Purabaya (Purwokerto)", daerah: "Banyumas", coords: [-7.4560, 109.2482] },
  { nama: "Terminal Pemalang", daerah: "Pemalang", coords: [-6.8972, 109.4002] },
  { nama: "Terminal Kudus", daerah: "Kudus", coords: [-6.8202, 110.8354] },

  // JAWA TIMUR & BALI
  { nama: "Terminal Purabaya (Bungurasih)", daerah: "Sidoarjo, Surabaya", coords: [-7.3524, 112.7246] },
  { nama: "Terminal Arjosari", daerah: "Malang", coords: [-7.9256, 112.6582] },
  { nama: "Terminal Landungsari", daerah: "Malang", coords: [-7.9271, 112.5932] },
  { nama: "Terminal Bayuangga", daerah: "Probolinggo", coords: [-7.7654, 113.1932] },
  { nama: "Terminal Tawang Alun", daerah: "Jember", coords: [-8.2045, 113.6340] },
  { nama: "Terminal Purboyo", daerah: "Madiun", coords: [-7.6120, 111.5320] },
  { nama: "Terminal Seloaji", daerah: "Ponorogo", coords: [-7.8423, 111.4682] },
  { nama: "Terminal Gayatri", daerah: "Tulungagung", coords: [-8.0673, 111.9056] },
  { nama: "Terminal Kertonegoro", daerah: "Ngawi", coords: [-7.3892, 111.4468] },
  { nama: "Terminal Mengwi", daerah: "Badung, Bali", coords: [-8.5712, 115.1706] },
  { nama: "Terminal Ubung", daerah: "Denpasar, Bali", coords: [-8.6322, 115.2078] },

  // SUMATERA & KALIMANTAN & SULAWESI
  { nama: "Terminal Alang-Alang Lebar", daerah: "Palembang", coords: [-2.9102, 104.6890] },
  { nama: "Terminal Rajabasa", daerah: "Bandar Lampung", coords: [-5.3725, 105.2284] },
  { nama: "Terminal Amplas", daerah: "Medan", coords: [3.5350, 98.7180] },
  { nama: "Terminal Pinang Baris", daerah: "Medan", coords: [3.6050, 98.6120] },
  { nama: "Terminal Aur Duri", daerah: "Jambi", coords: [-1.6240, 103.5824] },
  { nama: "Terminal Bareh Solok", daerah: "Solok, Sumbar", coords: [-0.7932, 100.6540] },
  { nama: "Terminal Kilo 6", daerah: "Banjarmasin", coords: [-3.3423, 114.6212] },
  { nama: "Terminal Batu Ampar", daerah: "Balikpapan", coords: [-1.2185, 116.8524] },
  { nama: "Terminal Malengkeri", daerah: "Makassar", coords: [-5.1852, 119.4456] },
  { nama: "Terminal Daya", daerah: "Makassar", coords: [-5.1012, 119.5078] }
];
