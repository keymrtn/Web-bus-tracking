<?php 
require_once(__DIR__ . '/../config.php'); 
$schedule_id = $_GET['id'] ?? 0;

if ($_POST) {
    $penumpang_id = $_SESSION['user_id'];
    $nomor_tiket = 'TKT' . time() . rand(100,999);
    $harga = $_POST['harga'];
    
    $stmt = $pdo->prepare("INSERT INTO tickets (schedule_id, penumpang_id, nomor_tiket, harga, status) 
                          VALUES (?, ?, ?, ?, 'dibeli')");
    if ($stmt->execute([$schedule_id, $penumpang_id, $nomor_tiket, $harga])) {
        $success = "Tiket berhasil dibeli! No: $nomor_tiket";
    }
}

// Ambil data jadwal
$stmt = $pdo->prepare("SELECT s.*, b.nomor_bus, r.nama_rute, r.rute_awal, r.rute_akhir
                     FROM schedules s
                     JOIN buses b ON s.bus_id=b.id
                     JOIN routes r ON s.route_id=r.id
                     WHERE s.id=?");
$stmt->execute([$schedule_id]);
$jadwal = $stmt->fetch();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Beli Tiket - <?php echo $jadwal['nomor_bus']??''; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
</head>
<body class="bg-light">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="../dashboard.php">Dashboard</a>
            <a class="btn btn-outline-light ms-auto" href="cari_jadwal.php">Cari Lagi</a>
        </div>
    </nav>

    <div class="container mt-5">
        <?php if (isset($success)): ?>
            <div class="alert alert-success alert-dismissible fade show">
                <?php echo $success; ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow-lg border-0">
                    <div class="card-header bg-success text-white text-center py-4">
                        <i class="bi bi-ticket-perforated-fill fs-1 mb-2"></i>
                        <h3>Beli Tiket Bus</h3>
                        <p class="mb-0 opacity-75"><?php echo $jadwal['nomor_bus']??''; ?></p>
                    </div>
                    <div class="card-body p-4">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <h6><i class="bi bi-geo-alt"></i> Rute</h6>
                                <p class="mb-1"><?php echo $jadwal['rute_awal']; ?> → <?php echo $jadwal['rute_akhir']; ?></p>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="bi bi-clock"></i> Jadwal</h6>
                                <p class="mb-0"><?php echo date('d/m/Y H:i', strtotime($jadwal['tanggal'].' '.$jadwal['jam_berangkat'])); ?></p>
                            </div>
                        </div>
                        
                        <form method="POST">
                            <div class="mb-4">
                                <label class="form-label fw-bold">Harga Tiket (Rp)</label>
                                <input type="number" class="form-control" name="harga" 
                                       value="25000" min="10000" max="100000" required>
                                <div class="form-text">Masukkan harga tiket</div>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-success btn-lg">
                                    <i class="bi bi-credit-card"></i> Bayar & Beli Tiket
                                </button>
                                <a href="cari_jadwal.php" class="btn btn-outline-secondary">
                                    <i class="bi bi-arrow-left"></i> Kembali
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>