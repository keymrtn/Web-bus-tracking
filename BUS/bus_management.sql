-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 06, 2026 at 02:31 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bus_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `buses`
--

CREATE TABLE `buses` (
  `id` int NOT NULL,
  `nomor_bus` varchar(20) NOT NULL,
  `tipe_bus` varchar(50) DEFAULT NULL,
  `kapasitas` int DEFAULT NULL,
  `status` enum('aktif','maintenance','nonaktif') DEFAULT 'aktif',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `buses`
--

INSERT INTO `buses` (`id`, `nomor_bus`, `tipe_bus`, `kapasitas`, `status`, `created_by`, `created_at`) VALUES
(1, 'B 4567 BYU', 'AC Eksekutif', 24, 'aktif', NULL, '2026-04-27 07:35:46'),
(3, 'BD 7654 XY', 'AC Eksekutif', 32, 'aktif', NULL, '2026-04-27 07:48:54'),
(4, 'B 1234 ZT', 'Non AC', 45, 'aktif', NULL, '2026-04-27 07:48:54'),
(5, 'BD 9999 AB', 'AC Patas', 28, 'maintenance', NULL, '2026-04-27 07:48:54'),
(10, 'b999b', 'Big Bus', 20, 'maintenance', NULL, '2026-04-28 12:56:26');

-- --------------------------------------------------------

--
-- Table structure for table `routes`
--

CREATE TABLE `routes` (
  `id` int NOT NULL,
  `nama_rute` varchar(100) NOT NULL,
  `rute_awal` varchar(100) DEFAULT NULL,
  `rute_akhir` varchar(100) DEFAULT NULL,
  `jarak` float DEFAULT NULL,
  `estimasi_waktu` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `routes`
--

INSERT INTO `routes` (`id`, `nama_rute`, `rute_awal`, `rute_akhir`, `jarak`, `estimasi_waktu`, `created_by`, `created_at`) VALUES
(1, 'Jakarta - Bandung', 'Gambir', 'Lebaksari', 150, 180, NULL, '2026-04-27 07:48:54'),
(2, 'Bandung - Jakarta', 'Lebaksari', 'Gambir', 150, 180, NULL, '2026-04-27 07:48:54'),
(3, 'Jakarta - Bogor', 'Monas', 'Botani Square', 60, 90, NULL, '2026-04-27 07:48:54'),
(7, 'Jakarta - Yogyakarta', 'Kota', 'Jombor', 577, 420, NULL, '2026-05-04 01:44:50');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int NOT NULL,
  `bus_id` int DEFAULT NULL,
  `route_id` int DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `jam_berangkat` time DEFAULT NULL,
  `jam_sampai` time DEFAULT NULL,
  `supir_id` int DEFAULT NULL,
  `status` enum('menunggu','berjalan','selesai','batal') DEFAULT 'menunggu',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `bus_id`, `route_id`, `tanggal`, `jam_berangkat`, `jam_sampai`, `supir_id`, `status`, `created_at`) VALUES
(3, 1, 1, '2026-04-27', '08:00:00', NULL, 2, 'menunggu', '2026-04-27 07:51:33'),
(4, 3, 3, '2026-04-28', '09:30:00', NULL, 2, 'menunggu', '2026-04-27 07:51:33');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int NOT NULL,
  `schedule_id` int DEFAULT NULL,
  `penumpang_id` int DEFAULT NULL,
  `nomor_tiket` varchar(20) DEFAULT NULL,
  `harga` decimal(10,2) DEFAULT NULL,
  `status` enum('dibeli','digunakan','kadaluarsa') DEFAULT 'dibeli',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tracking`
--

CREATE TABLE `tracking` (
  `id` int NOT NULL,
  `schedule_id` int DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `kecepatan` float DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('operator','supir','penumpang') NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telepon` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `nama`, `email`, `telepon`, `created_at`) VALUES
(1, 'operator1', '0192023a7bbd73250516f069df18b500', 'operator', 'Operator Utama', 'operator@bus.com', '081234567890', '2026-04-25 11:09:50'),
(2, 'supir1', 'fc6a6b1d2ff1986c3beb36dd02171fe4', 'supir', 'Budi Supir', 'budi@bus.com', '081111111111', '2026-04-25 11:09:50'),
(3, 'penumpang1', '32250170a0dca92d53ec9624f336ca24', 'penumpang', 'Andi Penumpang', 'andi@email.com', '082222222222', '2026-04-25 11:09:50');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `buses`
--
ALTER TABLE `buses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nomor_bus` (`nomor_bus`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `routes`
--
ALTER TABLE `routes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bus_id` (`bus_id`),
  ADD KEY `route_id` (`route_id`),
  ADD KEY `supir_id` (`supir_id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nomor_tiket` (`nomor_tiket`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `penumpang_id` (`penumpang_id`);

--
-- Indexes for table `tracking`
--
ALTER TABLE `tracking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `schedule_id` (`schedule_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `buses`
--
ALTER TABLE `buses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `routes`
--
ALTER TABLE `routes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tracking`
--
ALTER TABLE `tracking`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `buses`
--
ALTER TABLE `buses`
  ADD CONSTRAINT `buses_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `routes`
--
ALTER TABLE `routes`
  ADD CONSTRAINT `routes_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`),
  ADD CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`),
  ADD CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`supir_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`),
  ADD CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`penumpang_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `tracking`
--
ALTER TABLE `tracking`
  ADD CONSTRAINT `tracking_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
