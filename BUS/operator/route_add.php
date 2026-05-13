<?php 
declare(strict_types=1);
require_once(__DIR__ . '/../config.php'); 
$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama_rute = filter_input(INPUT_POST, 'nama_rute', FILTER_SANITIZE_STRING);
    $rute_awal = filter_input(INPUT_POST, 'rute_awal', FILTER_SANITIZE_STRING);
    $rute_akhir = filter_input(INPUT_POST, 'rute_akhir', FILTER_SANITIZE_STRING);
    $jarak = filter_input(INPUT_POST, 'jarak', FILTER_VALIDATE_FLOAT);
    $estimasi_waktu = filter_input(INPUT_POST, 'estimasi_waktu', FILTER_VALIDATE_INT);
    
    if ($nama_rute && $rute_awal && $rute_akhir && $jarak && $estimasi_waktu) {
        $stmt = $pdo->prepare('INSERT INTO routes (nama_rute, rute_awal, rute_akhir, jarak, estimasi_waktu) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$nama_rute, $rute_awal, $rute_akhir, $jarak, $estimasi_waktu]);
        $message = '<div class="alert alert-success">✅ Rute baru ditambah! ID: ' . $pdo->lastInsertId() . '</div>';
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Tambah Rute - Operator</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
    <link href="../assets/css/style.css" rel="stylesheet">
</head>
<body class="bg-light">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container">
            <a class="navbar-brand" href="../dashboard.php"><i class="bi bi-arrow-left"></i> Dashboard</a>
            <a class="btn btn-outline-light ms-auto" href="route_list.php">Lihat Rute</a>
        </div>
    </nav>

    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-10">
                <div class="card shadow-lg border-0">
                    <div class="card-header bg-info text-white">
                        <h4><i class="bi bi-map"></i> Tambah Rute Baru</h4>
                    </div>
                    <div class="card-body p-5">
                        <?php echo $message ?? ''; ?>
                        <form method="POST">
                            <div class="row g-4">
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Nama Rute *</label>
                                    <input type="text" class="form-control" name="nama_rute" required 
                                           placeholder="Jakarta - Bandung">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Rute Awal *</label>
                                    <input type="text" class="form-control" name="rute_awal" required 
                                           placeholder="Gambir">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Rute Akhir *</label>
                                    <input type="text" class="form-control" name="rute_akhir" required 
                                           placeholder="Lebaksari">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Jarak (KM) *</label>
                                    <input type="number" class="form-control" name="jarak" step="0.1" 
                                           min="1" max="1000" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Estimasi Waktu (Menit) *</label>
                                    <input type="number" class="form-control" name="estimasi_waktu" 
                                           min="30" max="1440" required>
                                </div>
                            </div>
                            <div class="d-grid gap-2 d-md-flex justify-content-end mt-4">
                                <a href="../dashboard.php" class="btn btn-secondary me-2">
                                    <i class="bi bi-x-circle"></i> Batal
                                </a>
                                <button type="submit" class="btn btn-info text-white">
                                    <i class="bi bi-check-circle"></i> Simpan Rute
                                </button>
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