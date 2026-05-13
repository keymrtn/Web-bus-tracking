<?php
require_once '../config.php';

$rute_id = $_GET['rute'] ?? '';
$tanggal = $_GET['tanggal'] ?? date('Y-m-d');

if ($rute_id) {
    $stmt = $pdo->prepare("SELECT s.*, b.nomor_bus, r.nama_rute, r.rute_awal, r.rute_akhir
                         FROM schedules s
                         JOIN buses b ON s.bus_id=b.id
                         JOIN routes r ON s.route_id=r.id
                         WHERE s.route_id=? AND DATE(s.tanggal)=?
                         ORDER BY s.jam_berangkat");
    $stmt->execute([$rute_id, $tanggal]);
} else {
    $stmt = $pdo->query("SELECT s.*, b.nomor_bus, r.nama_rute
                       FROM schedules s
                       JOIN buses b ON s.bus_id=b.id
                       JOIN routes r ON s.route_id=r.id
                       WHERE DATE(s.tanggal)>=CURDATE()
                       ORDER BY s.tanggal, s.jam_berangkat
                       LIMIT 10");
}

if ($stmt->rowCount() == 0): ?>
    <div class="text-center py-5 text-muted">
        <i class="bi bi-inbox fs-1 mb-3 opacity-50"></i>
        <h5>Tidak ada jadwal ditemukan</h5>
        <p class="mb-0">Coba ubah tanggal atau rute pencarian</p>
    </div>
<?php else: ?>
    <?php while ($jadwal = $stmt->fetch()): ?>
    <div class="jadwal-item card mb-3 shadow-sm hover-shadow">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-md-3">
                    <h5 class="mb-1"><?php echo $jadwal['nomor_bus']; ?></h5>
                    <small class="text-muted"><?php echo $jadwal['nama_rute']; ?></small>
                </div>
                <div class="col-md-3">
                    <i class="bi bi-clock me-1"></i>
                    <strong><?php echo date('H:i', strtotime($jadwal['jam_berangkat'])); ?></strong>
                </div>
                <div class="col-md-3">
                    <span class="badge bg-<?php 
                        echo $jadwal['status']=='berjalan' ? 'warning' : 
                             ($jadwal['status']=='selesai' ? 'success' : 'secondary');
                    ?>">
                        <?php echo ucfirst($jadwal['status']); ?>
                    </span>
                </div>
                <div class="col-md-3 text-end">
                    <a href="penumpang/beli_tiket.php?id=<?php echo $jadwal['id']; ?>" 
                       class="btn btn-primary btn-sm">
                        <i class="bi bi-cart-plus"></i> Beli Tiket
                    </a>
                </div>
            </div>
        </div>
    </div>
    <?php endwhile; ?>
<?php endif; ?>