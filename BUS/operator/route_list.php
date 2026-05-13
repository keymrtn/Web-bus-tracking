<?php 
require_once(__DIR__ . '/../config.php'); 
if (isset($_GET['delete'])) {
    $id = (int)$_GET['delete'];
    $pdo->prepare("DELETE FROM routes WHERE id=?")->execute([$id]);
    header("Location: route_list.php?msg=deleted");
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Daftar Rute - Operator</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
    <link href="../assets/css/style.css" rel="stylesheet">
</head>
<body class="bg-light">
    <nav class="navbar navbar-expand-lg navbar-dark bg-info">
        <div class="container">
            <a class="navbar-brand" href="../dashboard.php"><i class="bi bi-house"></i> Dashboard</a>
            <a class="btn btn-outline-light ms-auto" href="route_add.php">
                <i class="bi bi-plus-circle"></i> Tambah Rute
            </a>
        </div>
    </nav>

    <div class="container mt-4">
        <h2 class="mb-4"><i class="bi bi-map-fill text-info"></i> Daftar Rute</h2>
        
        <?php if (isset($_GET['msg'])): ?>
            <div class="alert alert-success alert-dismissible fade show">
                Rute berhasil dihapus!
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <div class="card shadow-lg">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Nama Rute</th>
                                <th>Rute</th>
                                <th>Jarak</th>
                                <th>Waktu</th>
                                <th>Dibuat</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            $stmt = $pdo->query("SELECT * FROM routes ORDER BY id DESC");
                            $no = 1;
                            while ($rute = $stmt->fetch()): 
                                $waktu_jam = floor($rute['estimasi_waktu']/60);
                                $waktu_menit = $rute['estimasi_waktu'] % 60;
                            ?>
                            <tr>
                                <td><?php echo $no++; ?></td>
                                <td><strong><?php echo htmlspecialchars($rute['nama_rute']); ?></strong></td>
                                <td>
                                    <small class="text-muted"><?php echo htmlspecialchars($rute['rute_awal']); ?></small><br>
                                    <i class="bi bi-arrow-right"></i> 
                                    <small><?php echo htmlspecialchars($rute['rute_akhir']); ?></small>
                                </td>
                                <td><strong><?php echo $rute['jarak']; ?> km</strong></td>
                                <td><?php echo $waktu_jam; ?>j <?php echo $waktu_menit; ?>m</td>
                                <td><?php echo date('d/m/Y', strtotime($rute['created_at'])); ?></td>
                                <td>
                                    <div class="btn-group btn-group-sm" role="group">
                                        <button class="btn btn-outline-primary" onclick="editRute(<?php echo $rute['id']; ?>)">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <a href="?delete=<?php echo $rute['id']; ?>" 
                                           class="btn btn-outline-danger" 
                                           onclick="return confirm('Hapus rute <?php echo $rute['nama_rute']; ?>?')">
                                            <i class="bi bi-trash"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            <?php endwhile; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
    function editRute(id) {
        if (confirm('Edit rute ID ' + id + '?')) {
            // Modal edit nanti
            alert('Fitur edit coming soon!');
        }
    }
    </script>
</body>
</html>
    