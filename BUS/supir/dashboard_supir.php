<?php require_once(__DIR__ . '/../config.php'); 
$supir_id = $_SESSION['user_id'];
?>
<div class="row mb-5">
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h1 class="display-5 fw-bold text-white mb-1"><i class="bi bi-person-badge-fill"></i> Panel Supir</h1>
                <p class="text-white-50 mb-0"><?php echo $_SESSION['nama']; ?></p>
            </div>
            <div class="stats-card bg-success text-white">
                <i class="bi bi-steering-wheel fs-1"></i>
                <h3>SUPIR</h3>
            </div>
        </div>
    </div>
</div>

<!-- Quick Actions Supir -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h5><i class="bi bi-lightning-charge"></i> Quick Actions</h5>
            </div>
            <div class="card-body">
                <div class="row g-2">
                    <div class="col-md-4">
                        <a href="jadwal_saya.php" class="btn btn-primary w-100">
                            <i class="bi bi-calendar3"></i> Jadwal Saya
                        </a>
                    </div>
                    <div class="col-md-4">
                        <a href="tracking.php" class="btn btn-success w-100">
                            <i class="bi bi-geo-alt"></i> Mulai Tracking
                        </a>
                    </div>
                    <div class="col-md-4">
                        <a href="../dashboard.php" class="btn btn-secondary w-100">
                            <i class="bi bi-house"></i> Dashboard Utama
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Jadwal Hari Ini -->
<div class="row mb-5">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="bi bi-calendar-check"></i> Jadwal Saya Hari Ini</h5>
                <span class="badge bg-info"><?php 
                    $stmt = $pdo->prepare("SELECT COUNT(*) FROM schedules WHERE supir_id=? AND DATE(tanggal)=CURDATE()");
                    $stmt->execute([$supir_id]);
                    echo $stmt->fetchColumn(); 
                ?> Trip</span>
            </div>
            <div class="card-body">
                <?php
                $stmt = $pdo->prepare("SELECT s.*, b.nomor_bus, r.nama_rute, r.rute_awal, r.rute_akhir
                                     FROM schedules s 
                                     JOIN buses b ON s.bus_id=b.id 
                                     JOIN routes r ON s.route_id=r.id 
                                     WHERE s.supir_id=? AND DATE(s.tanggal)=CURDATE()
                                     ORDER BY s.jam_berangkat");
                $stmt->execute([$supir_id]);
                
                if ($stmt->rowCount() == 0): ?>
                    <div class="text-center py-5 text-muted">
                        <i class="bi bi-calendar-x fs-1 mb-3"></i>
                        <h5>Tidak ada jadwal hari ini</h5>
                        <p class="mb-0">Tunggu penugasan dari operator</p>
                    </div>
                <?php else:
                    while ($jadwal = $stmt->fetch()): ?>
                    <div class="card mb-3 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 class="mb-1"><?php echo $jadwal['nomor_bus']; ?></h6>
                                    <small class="text-muted"><?php echo $jadwal['rute_awal']; ?> → <?php echo $jadwal['rute_akhir']; ?></small>
                                </div>
                                <span class="badge fs-6 bg-<?php 
                                    echo $jadwal['status']=='berjalan' ? 'warning' : 
                                         ($jadwal['status']=='selesai' ? 'success' : 'secondary');
                                ?>">
                                    <?php echo ucfirst($jadwal['status']); ?>
                                </span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <i class="bi bi-clock me-1"></i>
                                    <strong><?php echo date('H:i', strtotime($jadwal['jam_berangkat'])); ?></strong>
                                </div>
                                <?php if ($jadwal['status'] == 'menunggu'): ?>
                                    <a href="supir/start_trip.php?id=<?php echo $jadwal['id']; ?>" 
                                       class="btn btn-sm btn-success">
                                        <i class="bi bi-play-circle"></i> Mulai Trip
                                    </a>
                                <?php elseif ($jadwal['status'] == 'berjalan'): ?>
                                    <a href="supir/tracking.php?id=<?php echo $jadwal['id']; ?>" 
                                       class="btn btn-sm btn-warning">
                                        <i class="bi bi-geo-alt"></i> Tracking
                                    </a>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                <?php endwhile; endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- GPS Tracking -->
<div class="row">
    <div class="col-md-8">
        <div class="card h-100">
            <div class="card-header">
                <h5><i class="bi bi-geo-alt-fill"></i> Peta Tracking Real-time</h5>
            </div>
            <div class="card-body">
                <div id="map" class="mb-3"></div>
                <div id="tracking-status" class="text-center py-4 bg-light rounded p-3">
                    <i class="bi bi-geo-alt fs-1 text-muted mb-3"></i>
                    <h5 class="text-muted">Tracking Belum Aktif</h5>
                    <p class="text-muted mb-0">Klik "Share Lokasi" untuk mulai tracking GPS</p>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card h-100">
            <div class="card-header">
                <h5><i class="bi bi-phone"></i> Kontrol Tracking</h5>
            </div>
            <div class="card-body text-center">
                <button onclick="startTracking(<?php echo $supir_id; ?>)" 
                        class="btn btn-success btn-lg w-100 mb-3">
                    <i class="bi bi-share-fill"></i><br>
                    <small>SHARE LOKASI</small>
                </button>
                <div class="row text-start">
                    <div class="col-6">
                        <small class="text-muted">Status:</small><br>
                        <span id="status-gps" class="badge bg-secondary">OFFLINE</span>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">Kecepatan:</small><br>
                        <span id="speed">-- km/j</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script>
let map, trackingInterval;
const supirLat = -6.2088, supirLng = 106.8456; // Default Jakarta

// Init Map
map = L.map('map').setView([supirLat, supirLng], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Supir Marker
const supirMarker = L.marker([supirLat, supirLng]).addTo(map)
    .bindPopup('Anda di sini!')
    .openPopup();

function startTracking(supirId) {
    if (trackingInterval) clearInterval(trackingInterval);
    
    document.getElementById('tracking-status').innerHTML = `
        <div class="alert alert-success">
            <i class="bi bi-check-circle-fill"></i>
            <strong>TRACKING AKTIF!</strong><br>
            Update setiap 5 detik
        </div>
    `;
    
    trackingInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const speed = (pos.coords.speed * 3.6).toFixed(1);
            
            // Update map
            supirMarker.setLatLng([lat, lng]);
            map.setView([lat, lng], 15);
            
            // Update UI
            document.getElementById('status-gps').innerHTML = 'ONLINE';
            document.getElementById('status-gps').className = 'badge bg-success';
            document.getElementById('speed').textContent = speed + ' km/j';
            
            // Kirim ke server
            fetch('../api/track_location.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({schedule_id: 1, latitude: lat, longitude: lng, kecepatan: speed})
            });
        });
    }, 5000);
}
</script>