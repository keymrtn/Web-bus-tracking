<?php 
require_once(__DIR__ . '/../config.php'); 
if (!isset($_GET['id'])) header("Location: dashboard_supir.php");

$schedule_id = $_GET['id'];
$stmt = $pdo->prepare("UPDATE schedules SET status='berjalan' WHERE id=? AND supir_id=?");
$stmt->execute([$schedule_id, $_SESSION['user_id']]);

header("Location: tracking.php?id=$schedule_id");
?>