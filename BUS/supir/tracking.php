<?php 
require_once(__DIR__ . '/../config.php');
$schedule_id = $_GET['id'] ?? 0;
?>
<!DOCTYPE html>
<html>
<head>
    <title>GPS Tracking - Supir</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
    <link href="../assets/css/style.css" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</head>
<body class="bg-dark text-white">
    <nav class="navbar navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="../dashboard.php">
                <i class="bi bi-arrow-left"></i> Dashboard
            </a>
            <span class="navbar-text">Tracking Aktif</span>
        </div>
    </nav>

    <div class="container-fluid mt-3">
        <div class="row">
            <div class="col-md-8">
                <div id="map" style="height: 70vh;"></div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 bg-dark border-0">
                    <div class="card-body">
                        <h5 class="card-title">Status Perjalanan</h5>
                        <div id="gps-status" class="mb-3 p-3 rounded bg-secondary bg-opacity-25">
                            <div class="d-flex justify-content-between">
                                <span>Status GPS:</span>
                                <span id="status-text" class="badge bg-secondary">OFFLINE</span>
                            </div>
                            <div class="d-flex justify-content-between mt-2">
                                <span>Kecepatan:</span>
                                <span id="speed-text">-- km/j</span>
                            </div>
                            <div class="d-flex justify-content-between mt-2">
                                <span>Update:</span>
                                <span id="last-update">--</span>
                            </div>
                        </div>
                        
                        <button onclick="startGPS()" class="btn btn-success w-100 mb-3">
                            <i class="bi bi-play-circle"></i> Mulai Tracking
                        </button>
                        <button onclick="stopGPS()" class="btn btn-danger w-100 mb-3" id="stop-btn" style="display:none">
                            <i class="bi bi-stop-circle"></i> Stop Tracking
                        </button>
                        
                        <div class="mt-4">
                            <small class="text-muted">Data terkirim ke server setiap 5 detik</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
    let map, marker, trackingId;
    
    // Init Map
    map = L.map('map').setView([-6.2088, 106.8456], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
    
    marker = L.marker([-6.2088, 106.8456]).addTo(map)
        .bindPopup('Bus Anda')
        .openPopup();
    
    function startGPS() {
        if (!navigator.geolocation) {
            alert('GPS tidak didukung!');
            return;
        }
        
        document.getElementById('stop-btn').style.display = 'block';
        document.getElementById('status-text').textContent = 'MENYALA';
        document.getElementById('status-text').className = 'badge bg-success';
        
        trackingId = setInterval(() => {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const speed = Math.round(position.coords.speed * 3.6);
                
                // Update Map
                marker.setLatLng([lat, lng]);
                map.setView([lat, lng], 16);
                
                // Update UI
                document.getElementById('speed-text').textContent = speed + ' km/j';
                document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
                
                // Kirim ke Server
                fetch('../api/track_location.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        schedule_id: <?php echo $schedule_id; ?>,
                        latitude: lat,
                        longitude: lng,
                        kecepatan: speed
                    })
                }).then(res => res.json())
                  .then(data => console.log('GPS OK:', data));
            }, error => {
                console.error('GPS Error:', error);
            }, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        }, 5000);
    }
    
    function stopGPS() {
        clearInterval(trackingId);
        document.getElementById('stop-btn').style.display = 'none';
        document.getElementById('status-text').textContent = 'OFFLINE';
        document.getElementById('status-text').className = 'badge bg-secondary';
    }
    </script>
</body>
</html>