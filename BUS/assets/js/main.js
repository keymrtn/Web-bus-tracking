// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Auto refresh dashboard setiap 30 detik untuk supir
    if (window.location.pathname.includes('supir')) {
        setInterval(refreshDashboard, 30000);
    }
});

function refreshDashboard() {
    location.reload();
}

// GPS Tracking untuk Supir
function startTracking(scheduleId) {
    if (!navigator.geolocation) {
        alert('Geolocation tidak didukung browser ini');
        return;
    }
    
    const statusDiv = document.getElementById('tracking-status');
    statusDiv.innerHTML = `
        <div class="text-center p-4 tracking-active">
            <i class="bi bi-geo-alt-fill fs-1 text-success mb-3"></i>
            <h5 class="text-success">Tracking Aktif</h5>
            <p class="text-muted">Membagikan lokasi setiap 5 detik</p>
            <button onclick="stopTracking()" class="btn btn-danger btn-sm mt-2">
                <i class="bi bi-stop-circle"></i> Stop Tracking
            </button>
        </div>
    `;
    
    let trackingInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const data = {
                    schedule_id: scheduleId,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    kecepatan: (position.coords.speed * 3.6).toFixed(1) // m/s to km/h
                };
                
                fetch('api/track_location.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(data => {
                    updateTrackingDisplay(data);
                })
                .catch(error => console.error('Error:', error));
            },
            (error) => {
                console.error('Geolocation error:', error);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }, 5000);
}

function stopTracking() {
    clearInterval(window.trackingInterval);
    document.getElementById('tracking-status').innerHTML = `
        <div class="text-center py-4 text-muted">
            <i class="bi bi-geo-alt fs-1"></i>
            <p>Tracking Berhenti</p>
        </div>
    `;
}

function updateTrackingDisplay(data) {
    const statusDiv = document.getElementById('tracking-status');
    statusDiv.innerHTML += `
        <div class="alert alert-success alert-dismissible fade show mt-2 small" role="alert">
            Lokasi terupdate: ${data.latitude}, ${data.longitude}<br>
            Kecepatan: ${data.kecepatan} km/jam
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

// Search Form
function searchJadwal() {
    const rute = document.getElementById('rute').value;
    const tanggal = document.getElementById('tanggal').value;
    
    // Implementasi search AJAX
    fetch(`penumpang/search.php?rute=${rute}&tanggal=${tanggal}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('jadwal-list').innerHTML = html;
        });
}