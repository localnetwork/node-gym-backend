-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 21, 2024 at 09:20 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gym_project`
--

-- --------------------------------------------------------

--
-- Table structure for table `membership_durations`
--

CREATE TABLE `membership_durations` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `created_at` varchar(255) NOT NULL,
  `months_total` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership_durations`
--

INSERT INTO `membership_durations` (`id`, `title`, `created_at`, `months_total`) VALUES
(1, '3months', '', 3),
(2, '6months', '', 6),
(3, 'Lifetime', '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `offline_payment_gateways`
--

CREATE TABLE `offline_payment_gateways` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `created_at` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `offline_payment_gateways`
--

INSERT INTO `offline_payment_gateways` (`id`, `title`, `created_at`) VALUES
(1, 'Cash', '2147483647'),
(2, 'Gcash', '2147483647'),
(3, 'Paymaya', '2147483647');

-- --------------------------------------------------------

--
-- Table structure for table `promos`
--

CREATE TABLE `promos` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `price` int(11) NOT NULL,
  `duration` int(11) NOT NULL,
  `created_at` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promos`
--

INSERT INTO `promos` (`id`, `title`, `price`, `duration`, `created_at`, `status`) VALUES
(62, 'sample promo here', 500, 1, 2147483647, 1),
(65, 'test', 2500, 1, 2147483647, 0),
(66, 'eee', 800, 1, 2147483647, 1);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'admin'),
(2, 'employee'),
(3, 'member');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `availed_promo` int(11) NOT NULL,
  `availed_by` int(11) NOT NULL,
  `created_at` varchar(255) NOT NULL,
  `mode_payments` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` int(11) DEFAULT NULL,
  `avatar` varchar(255) NOT NULL,
  `avatar_color` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `role`, `avatar`, `avatar_color`) VALUES
(6, 'John Dee Doo', 'admin@gmail.com', '$2b$10$R56J/o0Im9BvoyLIdh0YdOPbwtO.UWVqJq97ubPp5VdOYlc/rVOzK', 1, 'cow', 'blue'),
(11, 'John Dee', 'johndee@gmail.com', '$2b$10$lBm8j01sBeFNXdVeoosSkeT.eT4lyEliSekMuThcnET8tt8Xk/BIW', 1, 'cat', 'yellow'),
(15, 'Peter Co', 'peterco@gmail.com', '$2b$10$Uyjk3zdXKWP4mtAsuhsjTe7rzGTEtyYaPlTX27ATfwpD01Nfhl7Jq', 2, 'bear', 'yellow'),
(17, 'test', 'e@e.com', '$2b$10$fyR6XXnruZHpx8uSgDPfReGE91ALd3Irb6pd5JAxb9Lq8MgNiAavq', 3, 'bear', 'yellow');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `membership_durations`
--
ALTER TABLE `membership_durations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `offline_payment_gateways`
--
ALTER TABLE `offline_payment_gateways`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `promos`
--
ALTER TABLE `promos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_duration` (`duration`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_modeOfPayments` (`mode_payments`),
  ADD KEY `fk_availedPromo` (`availed_promo`),
  ADD KEY `fk_createdBy` (`created_by`),
  ADD KEY `fk_availedBy` (`availed_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `fk_role_id` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `membership_durations`
--
ALTER TABLE `membership_durations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `offline_payment_gateways`
--
ALTER TABLE `offline_payment_gateways`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `promos`
--
ALTER TABLE `promos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `promos`
--
ALTER TABLE `promos`
  ADD CONSTRAINT `fk_duration` FOREIGN KEY (`duration`) REFERENCES `membership_durations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `fk_availedBy` FOREIGN KEY (`availed_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_availedPromo` FOREIGN KEY (`availed_promo`) REFERENCES `promos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_createdBy` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_modeOfPayments` FOREIGN KEY (`mode_payments`) REFERENCES `offline_payment_gateways` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_role_id` FOREIGN KEY (`role`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
