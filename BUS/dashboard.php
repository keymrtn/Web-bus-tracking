<?php
require_once 'config.php';
if (!isLoggedIn()) redirect('login.php');

$role = getUserRole();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Bus Management System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
    <link href="assets/css/style.css" rel="stylesheet">
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark">
        <div class="container">
            <a class="navbar-brand" href="#">
                <i class="bi bi-bus-front-fill"></i> Bus Management
            </a>
            <div class="navbar-nav ms-auto">
                <span class="navbar-text me-3">
                    Halo, <strong><?php echo $_SESSION['nama']; ?></strong> 
                    <span class="badge bg-light text-dark"><?php echo strtoupper($role); ?></span>
                </span>
                <a href="logout.php" class="nav-link">
                    <i class="bi bi-box-arrow-right"></i> Logout
                </a>
            </div>
        </div>
    </nav>

    <div class="container mt-5 fade-in">
        <?php if ($role == 'operator'): ?>
            <?php include 'operator/dashboard_operator.php'; ?>
        <?php elseif ($role == 'supir'): ?>
            <?php include 'supir/dashboard_supir.php'; ?>
        <?php else: ?>
            <?php include 'penumpang/dashboard_penumpang.php'; ?>
        <?php endif; ?>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/main.js"></script>
</body>
</html>