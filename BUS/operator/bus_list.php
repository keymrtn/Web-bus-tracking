<?php require_once(__DIR__ . '/../config.php'); 

if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    $stmt = $pdo->prepare("DELETE FROM buses WHERE id=?");
    $stmt->execute([$id]);
    header("Location: bus_list.php?msg=deleted");
}

$message = $_GET['msg'] == 'deleted' ? '<div class="alert alert-success">Bus dihapus!</div>' : '';
?>
<!DOCTYPE html>
<html>
<head>
    <title>Daftar Bus - Operator</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
    <link href="../assets/css/style.css" rel="stylesheet">
</head>
<body class="bg-light">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="../dashboard.php"><i class="bi bi-house"></i> Dashboard</a>
            <a class="btn btn-outline-light ms-auto" href="bus_add.php">
                <i class="bi bi-plus-circle"></i> Tambah Bus
            </a>
        </div>
    </nav>

    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-bus-front"></i> Daftar Bus</h2>
            <div class="btn-group">
                <a href="?status=aktif" class="btn btn-outline-primary <?php echo ($_GET['status']??'aktif')=='aktif' ? 'active' : ''; ?>">Aktif</a>
                <a href="?status=maintenance" class="btn btn-outline-warning <?php echo ($_GET['status']??'')=='maintenance' ? 'active' : ''; ?>">Maintenance</a>
                <a href="?status=nonaktif" class="btn btn-outline-danger <?php echo ($_GET['status']??'')=='nonaktif' ? 'active' : ''; ?>">Nonaktif</a>
            </div>
        </div>

        <?php echo $message; ?>

        <div class="card shadow-lg">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nomor Bus</th>
                                <th>Tipe</th>
                                <th>Kapasitas</th>
                                <th>Status</th>
                                <th>Tanggal Dibuat</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            $where = ($_GET['status']??'aktif') != 'semua' ? "WHERE status='".($_GET['status']??'aktif')."'" : '';
                            $stmt = $pdo->query("SELECT * FROM buses $where ORDER BY id DESC");
                            $no = 1;
                            while ($bus = $stmt->fetch()): ?>
                            <tr>
                                <td><?php echo $no++; ?></td>
                                <td><strong><?php echo $bus['nomor_bus']; ?></strong></td>
                                <td><span class="badge bg-info"><?php echo $bus['tipe_bus']; ?></span></td>
                                <td><?php echo $bus['kapasitas']; ?> kursi</td>
                                <td>
                                    <span class="badge bg-<?php 
                                        echo $bus['status']=='aktif' ? 'success' : 
                                             ($bus['status']=='maintenance' ? 'warning' : 'danger');
                                    ?>">
                                        <?php echo ucfirst($bus['status']); ?>
                                    </span>
                                </td>
                                <td><?php echo date('d/m/Y', strtotime($bus['created_at'])); ?></td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <a href="#" class="btn btn-outline-primary">Edit</a>
                                        <a href="?delete=<?php echo $bus['id']; ?>" 
                                           class="btn btn-outline-danger" 
                                           onclick="return confirm('Hapus bus ini?')">
                                            Hapus
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
</body>
</html>