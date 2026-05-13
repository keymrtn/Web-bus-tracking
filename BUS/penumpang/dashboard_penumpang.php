<?php require_once(__DIR__ . '/../config.php'); ?>
<div class="row mb-5">
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h1 class="display-5 fw-bold text-white mb-1"><i class="bi bi-person-circle"></i> Halo Penumpang</h1>
                <p class="text-white-50 mb-0"><?php echo $_SESSION['nama']; ?></p>
            </div>
            <div class="stats-card bg-info text-white">
                <i class="bi bi-person fs-1"></i>
                <h3>PENUMPANG</h3>
            </div>
        </div>
    </div>
</div>

<!-- Search Jadwal -->
<div class="row mb-5">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h5><i class="bi bi-search"></i> Cari Jadwal Bus</h5>
            </div>
            <div class="card-body">
                <form id="searchForm" class="row g-3">
                    <div class="col-md-4">
                        <select class="form-select" id="rute">
                            <option value="">Pilih Rute</option>
                            <?php
                            $stmt = $pdo->query("SELECT * FROM routes ORDER BY nama_rute");
                            while ($rute = $stmt->fetch()): ?>
                                <option value="<?php echo $rute['id']; ?>"><?php echo $rute['nama_rute']; ?></option>
                            <?php endwhile; ?>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <input type="date" class="form-control" id="tanggal" value="<?php echo date('Y-m-d'); ?>">
                    </div>
                    <div class="col-md-3">
                        <button type="button" onclick="cariJadwal()" class="btn btn-primary w-100">
                            <i class="bi bi-search"></i> Cari
                        </button>
                    </div
                                        <div class="col-md-2">
                        <a href="penumpang/cari_jadwal.php" class="btn btn-outline-secondary w-100">
                            Lihat Semua
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Hasil Pencarian -->
<div class="row mb-5">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h5><i class="bi bi-list-ul"></i> Jadwal Tersedia <span id="jadwal-count" class="badge bg-secondary ms-2">0</span></h5>
            </div>
            <div class="card-body">
                <div id="jadwal-list" class="jadwal-empty">
                    <div class="text-center py-5 text-muted">
                        <i class="bi bi-bus-front fs-1 mb-3 opacity-50"></i>
                        <h5>Pilih rute dan tanggal untuk mencari jadwal</h5>
                        <p class="mb-0">Cari bus yang sesuai kebutuhan Anda</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Tiket Saya -->
<div class="row">
    <div class="col-md-6 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h6><i class="bi bi-ticket-perforated"></i> Tiket Aktif</h6>
            </div>
            <div class="card-body">
                <?php
                $stmt = $pdo->prepare("SELECT t.*, s.jam_berangkat, b.nomor_bus, r.nama_rute
                                     FROM tickets t
                                     JOIN schedules s ON t.schedule_id=s.id
                                     JOIN buses b ON s.bus_id=b.id
                                     JOIN routes r ON s.route_id=r.id
                                     WHERE t.penumpang_id=? AND t.status='dibeli'
                                     ORDER BY t.created_at DESC LIMIT 3");
                $stmt->execute([$_SESSION['user_id']]);
                
                if ($stmt->rowCount() == 0): ?>
                    <div class="text-center py-4 text-muted">
                        <i class="bi bi-ticket-detailed fs-1"></i>
                        <p>Tidak ada tiket aktif</p>
                        <a href="penumpang/cari_jadwal.php" class="btn btn-outline-primary btn-sm">Beli Tiket</a>
                    </div>
                <?php else:
                    while ($tiket = $stmt->fetch()): ?>
                    <div class="border-bottom pb-2 mb-2">
                        <div class="d-flex justify-content-between">
                            <small class="text-muted">No. <?php echo $tiket['nomor_tiket']; ?></small>
                            <span class="badge bg-success">Rp <?php echo number_format($tiket['harga'],0,',','.'); ?></span>
                        </div>
                        <h6 class="mb-1"><?php echo $tiket['nomor_bus']; ?> - <?php echo $tiket['nama_rute']; ?></h6>
                        <small class="text-muted"><?php echo date('d/m H:i', strtotime($tiket['jam_berangkat'])); ?></small>
                    </div>
                <?php endwhile; endif; ?>
                <a href="penumpang/tiket_saya.php" class="btn btn-sm btn-outline-primary w-100">Lihat Semua Tiket</a>
            </div>
        </div>
    </div>
    
    <div class="col-md-6 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h6><i class="bi bi-clock-history"></i> Bus Berjalan Sekarang</h6>
            </div>
            <div class="card-body">
                <?php
                $stmt = $pdo->query("SELECT s.*, b.nomor_bus, r.nama_rute
                                   FROM schedules s
                                   JOIN buses b ON s.bus_id=b.id
                                   JOIN routes r ON s.route_id=r.id
                                   WHERE s.status='berjalan'
                                   ORDER BY s.jam_berangkat DESC LIMIT 3");
                if ($stmt->rowCount() == 0): ?>
                    <div class="text-center py-4 text-muted">
                        <i class="bi bi-bus-front fs-1 opacity-50"></i>
                        <p>Tidak ada bus berjalan</p>
                    </div>
                <?php else:
                    while ($bus = $stmt->fetch()): ?>
                    <div class="d-flex justify-content-between align-items-center p-2 bg-light rounded mb-2">
                        <div>
                            <strong><?php echo $bus['nomor_bus']; ?></strong><br>
                            <small class="text-muted"><?php echo $bus['nama_rute']; ?></small>
                        </div>
                        <span class="badge bg-warning">Berjalan</span>
                    </div>
                <?php endwhile; endif; ?>
            </div>
        </div>
    </div>
</div>

<script>
function cariJadwal() {
    const ruteId = document.getElementById('rute').value;
    const tanggal = document.getElementById('tanggal').value;
    
    if (!ruteId || !tanggal) {
        alert('Pilih rute dan tanggal!');
        return;
    }
    
    fetch(`../api/search_jadwal.php?rute=${ruteId}&tanggal=${tanggal}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('jadwal-list').innerHTML = html;
            document.getElementById('jadwal-count').textContent = 'Loading...';
        });
}
</script>