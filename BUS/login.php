<?php
require_once 'config.php';

if ($_POST) {
    $username = $_POST['username'];
    $password = md5($_POST['password']);
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
    $stmt->execute([$username, $password]);
    $user = $stmt->fetch();
    
    if ($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['nama'] = $user['nama'];
        redirect('dashboard.php');
    } else {
        $error = "Username atau password salah!";
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Bus Management</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
    <link href="assets/css/style.css" rel="stylesheet">
</head>
<body>
    <div class="login-container">
        <div class="login-card card fade-in">
            <div class="card-body text-center">
                <i class="bi bi-bus-front-fill fs-1 text-primary mb-4"></i>
                <h3 class="mb-4">Bus Management System</h3>
                
                <?php if (isset($error)): ?>
                    <div class="alert alert-danger"><?php echo $error; ?></div>
                <?php endif; ?>
                
                <form method="POST">
                    <div class="mb-4">
                        <input type="text" class="form-control" name="username" 
                               placeholder="Username" required>
                    </div>
                    <div class="mb-4">
                        <input type="password" class="form-control" name="password" 
                               placeholder="Password" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100 mb-3">
                        <i class="bi bi-box-arrow-in-right"></i> Masuk
                    </button>
                </form>
                
                <div class="mt-4">
                    <small class="text-muted">Demo Akun:</small><br>
                    <small><strong>Operator:</strong> operator1 / admin123</small><br>
                    <small><strong>Supir:</strong> supir1 / supir123</small><br>
                    <small><strong>Penumpang:</strong> penumpang1 / pass123</small>
                </div>
            </div>
        </div>
    </div>
</body>
</html>