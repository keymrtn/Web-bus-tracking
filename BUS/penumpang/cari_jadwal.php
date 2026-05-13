<?php 
require_once '../config.php'; 

// Filter
$rute_id = $_GET['rute'] ?? '';
$tanggal = $_GET['tanggal'] ?? date('Y-m-d');

// Ambil semua rute
$routes = $pdo->query("SELECT * FROM routes ORDER BY nama_rute")->fetchAll();

// Query jadwal berdasarkan