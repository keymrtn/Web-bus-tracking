<?php 
require_once(__DIR__ . '/../config.php'); 
$message = '';

$buses = $pdo->query("SELECT id, nomor_bus FROM buses WHERE status='aktif'")->fetchAll();
$routes = $pdo->query("SELECT id, nama_rute FROM routes")->fetchAll();
$supir = $pdo->query("SELECT id, nama FROM users WHERE role='supir'")->fetchAll();

if ($_POST) {
    $bus_id = (int)$_POST['bus_id'];
    $route_id = (int)$_POST['route_id'];
    $tanggal = $_POST['tanggal'];
    $jam_berangkat = $_POST['jam_berangkat'] . ':00';
    $supir_id = (int)$_POST['supir_id'];
    
    $stmt = $pdo->prepare("INSERT INTO schedules (bus_id, route_id, tanggal, jam_berangkat, supir_id, status) 
                          VALUES (?, ?, ?, ?, ?, 'menunggu')");
    if ($stmt->execute([$bus_id, $route_id, $tanggal, $jam_berangkat, $supir_id])) {
        $message = '<div class="alert alert-success">✅ Jadwal baru berhasil dibuat!</div>';
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Tambah Jadwal - Operator</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
    <link href="../assets/css/style.css" rel="stylesheet">
</head>
<body class="bg-light">
    <nav class="navbar navbar-expand-lg navbar-dark bg-success">
        <div class="container">
            <a class="navbar-brand" href="../dashboard.php"><i class="bi bi-arrow-left"></i> Dashboard</a>
            <a class="btn btn-outline-light ms-auto" href="schedule_list.php">Lihat Jadwal</a>
        </div>
    </nav>

    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <div class="card shadow-lg">
                    <div class="card-header bg-success text-white">
                        <h4><i class="bi bi-calendar-plus"></i> Buat Jadwal Baru</h4>
                    </div>
                    <div class="card-body p-5">
                        <?php echo $message ?? ''; ?>
                        <form method="POST">
                            <div class="row g-4">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Bus *</label>
                                    <select class="form-select" name="bus_id" required>
                                        <option value="">Pilih Bus</option>
                                        <?php foreach ($buses as $bus): ?>
                                            <option value="<?php echo $bus['id']; ?>">
                                                <?php echo $bus['nomor_bus']; ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Rute *</label>
                                    <select class="form-select" name="route_id" required>
                                        <option value="">Pilih Rute</option>
                                        <?php foreach ($routes as $route): ?>
                                            <option value="<?php echo $route['id']; ?>">
                                                <?php echo $route['nama_rute']; ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Tanggal *</label>
                                    <input type="date" class="form-control" name="tanggal" 
                                           value="<?php echo date('Y-m-d'); ?>" min="<?php echo date('Y-m-d'); ?>" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Jam Berangkat *</label>
                                    <select class="form-select" name="jam_berangkat" required>
                                        <?php for ($h=6; $h<=22; $h++): ?>
                                            <option><?php echo sprintf('%02d', $h); ?>:00</option>
                                            <option><?php echo sprintf('%02d', $h); ?>:30</option>
                                        <?php endfor; ?>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Supir *</label>
                                    <select class="form-select" name="supir_id" required>
                                        <option value="">Pilih Supir</option>
                                        <?php foreach ($supir as $s): ?>
                                            <option value="<?php echo $s['id']; ?>"><?php echo $s['nama']; ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                            </div>
                            <div class="d-grid gap-2 d-md-flex justify-content-end mt-5">
                                <a href="../dashboard.php" class="btn btn-secondary me-2">
                                    <i class="bi bi-x-circle"></i> Batal
                                </a>
                                <button type="submit" class="btn btn-success">
                                    <i class="bi bi-calendar-check"></i> Buat Jadwal
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