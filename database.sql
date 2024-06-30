-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 30, 2024 at 03:03 PM
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
  `duration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership_durations`
--

INSERT INTO `membership_durations` (`id`, `title`, `created_at`, `duration`) VALUES
(1, '1 month', '', 30),
(2, '6months', '', 180),
(3, 'Lifetime', '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `non_members`
--

CREATE TABLE `non_members` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `availed_promo` int(11) DEFAULT NULL,
  `payment_method` int(11) DEFAULT NULL,
  `created_at` varchar(255) NOT NULL,
  `note` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `non_members`
--

INSERT INTO `non_members` (`id`, `name`, `created_by`, `availed_promo`, `payment_method`, `created_at`, `note`) VALUES
(1, 'John Doe', 11, 82, 1, '1719732979101', 'test'),
(2, 'test', 11, 81, 1, '1719733173942', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor i');

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
  `member_type` tinyint(1) NOT NULL DEFAULT 1,
  `duration` int(11) NOT NULL,
  `created_at` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promos`
--

INSERT INTO `promos` (`id`, `title`, `price`, `member_type`, `duration`, `created_at`, `status`) VALUES
(79, 'eee', 222, 1, 1, '1719418464567', 1),
(80, 'Sample Hello', 200, 0, 1, '1719418530833', 0),
(81, 'test aaa', 222, 0, 1, '1719421842791', 1),
(82, '7 days', 222, 0, 1, '1719422076277', 1);

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

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `created_by`, `availed_promo`, `availed_by`, `created_at`, `mode_payments`, `status`) VALUES
(5, 11, 79, 61, '1719746734364', 1, 1),
(6, 11, 79, 61, '1719752267720', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` int(11) DEFAULT NULL,
  `avatar` varchar(255) NOT NULL,
  `avatar_color` varchar(255) NOT NULL,
  `qr_code` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `uuid`, `name`, `email`, `password`, `role`, `avatar`, `avatar_color`, `qr_code`, `status`, `deleted`) VALUES
(11, '', 'Mark Jaypee', 'admin@gmail.com', '$2b$10$lBm8j01sBeFNXdVeoosSkeT.eT4lyEliSekMuThcnET8tt8Xk/BIW', 1, 'pig', 'blue', '', 1, 0),
(15, '', 'Peter Co Lim', 'peterco@gmail.com', '$2b$10$Uyjk3zdXKWP4mtAsuhsjTe7rzGTEtyYaPlTX27ATfwpD01Nfhl7Jq', 1, 'bear', 'yellow', '', 1, 0),
(61, 'ae816fad-e0ea-4d46-80aa-df2b25d249ce', 'Restore User', 'sample@account.com', '$2b$10$ALgfChJh1aBTnnd.O3f4S.szAVm0vG7gXBdoGscWqo0CFgRE9Zoau', 3, 'owl', 'blue', '/images/qr-codes/ae816fad-e0ea-4d46-80aa-df2b25d249ce.png', 1, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `membership_durations`
--
ALTER TABLE `membership_durations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `non_members`
--
ALTER TABLE `non_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_nonMembersPromo` (`availed_promo`),
  ADD KEY `fk_nonMembersCreatedBy` (`created_by`),
  ADD KEY `fk_nonmembersPM` (`payment_method`);

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
-- AUTO_INCREMENT for table `non_members`
--
ALTER TABLE `non_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `offline_payment_gateways`
--
ALTER TABLE `offline_payment_gateways`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `promos`
--
ALTER TABLE `promos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `non_members`
--
ALTER TABLE `non_members`
  ADD CONSTRAINT `fk_nonMembersCreatedBy` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_nonMembersPromo` FOREIGN KEY (`availed_promo`) REFERENCES `promos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_nonmembersPM` FOREIGN KEY (`payment_method`) REFERENCES `offline_payment_gateways` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `fk_modeOfPayments` FOREIGN KEY (`mode_payments`) REFERENCES `offline_payment_gateways` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_role_id` FOREIGN KEY (`role`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
