<?php require_once(__DIR__ . '/../config.php'); ?>
<div class="row mb-5">
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h1 class="display-5 fw-bold text-white mb-1"><i class="bi bi-gear-fill"></i> Panel Operator</h1>
                <p class="text-white-50 mb-0">Kelola seluruh sistem bus</p>
            </div>
            <div class="stats-card bg-primary text-white">
                <i class="bi bi-person-badge fs-1"></i>
                <h3>ADMIN</h3>
            </div>
        </div>
    </div>
</div>

<!-- Stats Cards -->
<div class="row g-4 mb-5">
    <div class="col-xl-3 col-md-6">
        <div class="stats-card bg-primary text-white">
            <i class="bi bi-bus-front-fill stats-icon"></i>
            <h3 class="stats-number"><?php 
                $stmt = $pdo->query("SELECT COUNT(*) FROM buses WHERE status='aktif'");
                echo $stmt->fetchColumn();
            ?></h3>
            <p class="mb-0">Bus Aktif</p>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="stats-card bg-success text-white">
            <i class="bi bi-map-fill stats-icon"></i>
            <h3 class="stats-number"><?php 
                $stmt = $pdo->query("SELECT COUNT(*) FROM routes");
                echo $stmt->fetchColumn();
            ?></h3>
            <p class="mb-0">Total Rute</p>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="stats-card bg-info text-white">
            <i class="bi bi-calendar-check-fill stats-icon"></i>
            <h3 class="stats-number"><?php 
                $stmt = $pdo->query("SELECT COUNT(*) FROM schedules WHERE DATE(tanggal)=CURDATE()");
                echo $stmt->fetchColumn();
            ?></h3>
            <p class="mb-0">Jadwal Hari Ini</p>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="stats-card bg-warning text-white">
            <i class="bi bi-people-fill stats-icon"></i>
            <h3 class="stats-number"><?php 
                $stmt = $pdo->query("SELECT COUNT(*) FROM tickets WHERE status='dibeli'");
                echo $stmt->fetchColumn();
            ?></h3>
            <p class="mb-0">Tiket Terjual</p>
        </div>
    </div>
</div>

<!-- Quick Actions -->
<div class="row mb-5">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h5><i class="bi bi-lightning-charge"></i> Quick Actions</h5>
            </div>
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-3 col-sm-6">
                        <a href="operator/bus_add.php" class="btn btn-success w-100 h-100">
                            <i class="bi bi-plus-circle fs-4 d-block mb-2"></i>
                            Tambah Bus
                        </a>
                    </div>
                    <div class="col-md-3 col-sm-6">
                        <a href="operator/route_add.php" class="btn btn-info w-100 h-100">
                            <i class="bi bi-map fs-4 d-block mb-2"></i>
                            Tambah Rute
                        </a>
                    </div>
                    <div class="col-md-3 col-sm-6">
                        <a href="operator/schedule_add.php" class="btn btn-primary w-100 h-100">
                            <i class="bi bi-calendar-plus fs-4 d-block mb-2"></i>
                            Jadwal Baru
                        </a>
                    </div>
                    <div class="col-md-3 col-sm-6">
                        <a href="operator/bus_list.php" class="btn btn-outline-secondary w-100 h-100">
                            <i class="bi bi-list-ul fs-4 d-block mb-2"></i>
                            Lihat Semua
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Recent Activities -->
<div class="row">
    <div class="col-md-6 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h6>Bus Aktif</h6>
            </div>
            <div class="card-body">
                <?php
                $stmt = $pdo->query("SELECT * FROM buses WHERE status='aktif' ORDER BY id DESC LIMIT 5");
                if ($stmt->rowCount() == 0): ?>
                    <div class="text-center text-muted py-4">
                        <i class="bi bi-bus-front fs-1"></i>
                        <p>Tidak ada bus aktif</p>
                    </div>
                <?php else:
                    while ($bus = $stmt->fetch()): ?>
                    <div class="bus-status aktif mb-2">
                        <div class="d-flex justify-content-between">
                            <strong><?php echo $bus['nomor_bus']; ?></strong>
                            <span class="badge bg-dark"><?php echo $bus['tipe_bus']; ?></span>
                        </div>
                        <small>Kapasitas: <?php echo $bus['kapasitas']; ?> kursi</small>
                    </div>
                <?php endwhile; endif; ?>
                <a href="operator/bus_list.php" class="btn btn-sm btn-outline-primary w-100 mt-2">Lihat Semua</a>
            </div>
        </div>
    </div>
    
    <div class="col-md-6 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h6>Jadwal Hari Ini</h6>
            </div>
            <div class="card-body">
                <?php
                $stmt = $pdo->query("SELECT s.*, b.nomor_bus, r.nama_rute 
                                   FROM schedules s 
                                   JOIN buses b ON s.bus_id=b.id 
                                   JOIN routes r ON s.route_id=r.id 
                                   WHERE DATE(s.tanggal)=CURDATE() 
                                   ORDER BY s.jam_berangkat LIMIT 5");
                if ($stmt->rowCount() == 0): ?>
                    <div class="text-center text-muted py-4">
                        <i class="bi bi-calendar-x fs-1"></i>
                        <p>Tidak ada jadwal</p>
                    </div>
                <?php else:
                    while ($schedule = $stmt->fetch()): ?>
                    <div class="d-flex justify-content-between align-items-center p-2 border-bottom">
                        <div>
                            <strong><?php echo $schedule['nomor_bus']; ?></strong><br>
                            <small><?php echo $schedule['nama_rute']; ?></small>
                        </div>
                        <span class="badge bg-<?php 
                            echo $schedule['status']=='berjalan' ? 'warning' : 
                                 ($schedule['status']=='selesai' ? 'success' : 'secondary');
                        ?>">
                            <?php echo ucfirst($schedule['status']); ?>
                        </span>
                    </div>
                <?php endwhile; endif; ?>
                <a href="operator/schedule_list.php" class="btn btn-sm btn-outline-primary w-100 mt-2">Kelola Jadwal</a>
            </div>
        </div>
    </div>
</div>