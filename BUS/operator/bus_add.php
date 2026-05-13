<?php 
require_once(__DIR__ . '/../config.php'); 
$message = '';

if ($_POST) {
    $nomor_bus = $_POST['nomor_bus'];
    $tipe_bus = $_POST['tipe_bus'];
    $kapasitas = $_POST['kapasitas'];
    $status = $_POST['status'];
    
    $stmt = $pdo->prepare("INSERT INTO buses (nomor_bus, tipe_bus, kapasitas, status) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$nomor_bus, $tipe_bus, $kapasitas, $status])) {
        $message = '<div class="alert alert-success">Bus berhasil ditambah!</div>';
    } else {
        $message = '<div class="alert alert-danger">Error menambah bus!</div>';
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Tambah Bus - Operator</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
    <link href="../assets/css/style.css" rel="stylesheet">
</head>
<body class="bg-light">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="../dashboard.php"><i class="bi bi-arrow-left"></i> Kembali</a>
        </div>
    </nav>

    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow-lg">
                    <div class="card-header bg-primary text-white">
                        <h4><i class="bi bi-plus-circle"></i> Tambah Bus Baru</h4>
                    </div>
                    <div class="card-body p-4">
                        <?php echo $message; ?>
                        <form method="POST">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Nomor Bus *</label>
                                    <input type="text" class="form-control" name="nomor_bus" required 
                                           placeholder="BD 1234 AB" maxlength="20">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Tipe Bus *</label>
                                    <select class="form-select" name="tipe_bus" required>
                                        <option value="">Pilih Tipe</option>
                                        <option value="AC Eksekutif">AC Eksekutif</option>
                                        <option value="AC Patas">AC Patas</option>
                                        <option value="Non AC">Non AC</option>
                                        <option value="Big Bus">Big Bus</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Kapasitas (kursi) *</label>
                                    <input type="number" class="form-control" name="kapasitas" 
                                           min="20" max="60" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Status *</label>
                                    <select class="form-select" name="status" required>
                                        <option value="aktif">✅ Aktif</option>
                                        <option value="maintenance">🔧 Maintenance</option>
                                        <option value="nonaktif">❌ Nonaktif</option>
                                    </select>
                                </div>
                            </div>
                            <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                                <a href="../dashboard.php" class="btn btn-secondary me-md-2">
                                    <i class="bi bi-arrow-left"></i> Batal
                                </a>
                                <button type="submit" class="btn btn-success">
                                    <i class="bi bi-check-circle"></i> Simpan Bus
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>