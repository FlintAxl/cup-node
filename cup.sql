-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 20, 2025 at 01:16 PM
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
-- Database: `cup`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Ceramic', NULL, NULL),
(2, 'Plastic', NULL, NULL),
(3, 'Glass', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `email_log`
--

CREATE TABLE `email_log` (
  `email_id` int(11) NOT NULL,
  `recipient_email` varchar(100) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('success','failed') DEFAULT 'success'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `item`
--

CREATE TABLE `item` (
  `item_id` int(11) NOT NULL,
  `pname` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `sell_price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `stock` int(11) DEFAULT 0,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `item`
--

INSERT INTO `item` (`item_id`, `pname`, `description`, `cost_price`, `sell_price`, `image`, `created_at`, `stock`, `category_id`) VALUES
(17, 'Tupperware Tumblers (Cup)', 'Durable and reusable plastic drinkware.', 900.00, 1500.00, NULL, '2025-07-20 10:48:29', 100, 2),
(18, 'Rubbermaid TakeAlongs', ' Common for everyday plastic cups and containers.', 350.00, 700.00, NULL, '2025-07-20 10:49:52', 100, 2),
(19, 'Solo Cup (red disposable party cups)', 'Famous for red party cups, especially in the U.S.', 50.00, 100.00, NULL, '2025-07-20 10:50:32', 100, 2),
(20, 'ZAK Designs', 'Colorful and themed reusable plastic cups', 150.00, 400.00, NULL, '2025-07-20 10:51:27', 100, 2),
(21, 'IKEA KALAS Cups', 'Popular BPA-free plastic cups for kids.', 120.00, 300.00, NULL, '2025-07-20 10:52:26', 100, 2),
(22, 'Le Creuset Mugs', ' Premium ceramic mugs with enamel finish.', 1500.00, 8000.00, NULL, '2025-07-20 10:53:32', 100, 1),
(23, 'Sweese Porcelain Cups', ' Known for modern, colorful ceramic mugs and cups.', 500.00, 1200.00, NULL, '2025-07-20 10:54:18', 100, 1),
(24, 'Denby Pottery ', 'High-quality handmade stoneware from the UK.', 1800.00, 4000.00, NULL, '2025-07-20 10:55:04', 100, 1),
(25, 'Corelle Mugs', 'Ceramic mugs often included with dinnerware sets.', 250.00, 600.00, NULL, '2025-07-20 10:55:43', 100, 1),
(26, 'Anthropologie Latte Bowls (ceramic cups/mugs)', 'Stylish, collectible ceramic cups/mugs.', 700.00, 1800.00, NULL, '2025-07-20 10:56:26', 100, 1),
(27, 'Libbey Glassware', 'Very popular for all types of glass cups and drinkware.', 120.00, 300.00, NULL, '2025-07-20 10:57:25', 100, 3),
(28, 'Duralex Picardie Glasses', 'Iconic French tempered glass tumblers.', 300.00, 500.00, NULL, '2025-07-20 10:58:12', 100, 3),
(29, 'Bormioli Rocco glassware', ' Italian brand offering stylish glass drinkware.', 200.00, 500.00, NULL, '2025-07-20 10:59:14', 100, 3),
(30, 'Anchor Hocking Glasses', ' Affordable American-made glass cups and mugs.', 240.00, 450.00, NULL, '2025-07-20 10:59:57', 100, 3),
(31, 'IKEA POKAL Glasses', 'Budget-friendly and simple glass cup series.', 120.00, 350.00, NULL, '2025-07-20 11:00:45', 100, 3);

-- --------------------------------------------------------

--
-- Table structure for table `item_images`
--

CREATE TABLE `item_images` (
  `image_id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `item_images`
--

INSERT INTO `item_images` (`image_id`, `item_id`, `image_path`, `uploaded_at`) VALUES
(26, 17, 'images/tupper1-1753008509420-236239249.jpg', '2025-07-20 10:48:29'),
(27, 17, 'images/tupper2-1753008509421-726328462.jpg', '2025-07-20 10:48:29'),
(28, 18, 'images/rubber1-1753008592314-447945114.jpg', '2025-07-20 10:49:52'),
(29, 18, 'images/rubber2-1753008592316-489523972.jpg', '2025-07-20 10:49:52'),
(30, 19, 'images/solo1-1753008632723-744479977.jpg', '2025-07-20 10:50:32'),
(31, 19, 'images/solo2-1753008632724-552405156.jpg', '2025-07-20 10:50:32'),
(32, 20, 'images/zak2-1753008687375-103130360.jpg', '2025-07-20 10:51:27'),
(33, 20, 'images/zak1-1753008687375-449167597.jpg', '2025-07-20 10:51:27'),
(34, 21, 'images/ikea-1753008746973-510249962.jpg', '2025-07-20 10:52:26'),
(35, 22, 'images/lecreuset1-1753008812576-726035748.jpg', '2025-07-20 10:53:32'),
(36, 22, 'images/lecreuset2-1753008812576-732874930.png', '2025-07-20 10:53:32'),
(37, 23, 'images/sweese1-1753008858701-493326841.jpg', '2025-07-20 10:54:18'),
(38, 23, 'images/sweese2-1753008858702-542249955.jpg', '2025-07-20 10:54:18'),
(39, 24, 'images/denby1-1753008904526-456899107.jpg', '2025-07-20 10:55:04'),
(40, 24, 'images/denby2-1753008904526-541312987.jpg', '2025-07-20 10:55:04'),
(41, 25, 'images/corelle1-1753008943119-827283284.jpg', '2025-07-20 10:55:43'),
(42, 25, 'images/corelle2-1753008943119-143671333.jpg', '2025-07-20 10:55:43'),
(43, 26, 'images/anthropologie2-1753008986651-798825649.jpg', '2025-07-20 10:56:26'),
(44, 26, 'images/anthropologie1-1753008986652-383258407.jpg', '2025-07-20 10:56:26'),
(45, 27, 'images/libbey1-1753009045838-14746508.jpg', '2025-07-20 10:57:25'),
(46, 27, 'images/libbey2-1753009045838-994494155.jpg', '2025-07-20 10:57:25'),
(47, 28, 'images/duralex1-1753009092809-174514511.jpg', '2025-07-20 10:58:12'),
(48, 28, 'images/duralex2-1753009092809-723507454.jpg', '2025-07-20 10:58:12'),
(49, 29, 'images/bormioli2-1753009154886-93625487.jpg', '2025-07-20 10:59:14'),
(50, 29, 'images/bromioli1-1753009154886-506351493.jpg', '2025-07-20 10:59:14'),
(51, 30, 'images/anchor1-1753009197781-707327263.jpg', '2025-07-20 10:59:57'),
(52, 30, 'images/anchor2-1753009197782-544986337.jpg', '2025-07-20 10:59:57'),
(53, 31, 'images/ikeapokal1-1753009245752-217230563.jpg', '2025-07-20 11:00:45'),
(54, 31, 'images/ikeapokal2-1753009245752-812701514.jpg', '2025-07-20 11:00:45');

-- --------------------------------------------------------

--
-- Table structure for table `orderinfo`
--

CREATE TABLE `orderinfo` (
  `order_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `date_placed` datetime DEFAULT current_timestamp(),
  `date_shipped` datetime DEFAULT NULL,
  `status` enum('pending','received','cancelled','shipped') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orderline`
--

CREATE TABLE `orderline` (
  `orderline_id` int(11) NOT NULL,
  `orderinfo_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('admin','customer') DEFAULT 'customer',
  `token` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `token`, `is_active`, `created_at`, `deleted_at`, `address`, `phone`, `image_path`) VALUES
(1, 'steve', 'steve@gmail.com', '$2b$10$CmU1ZoR7O/yJno313v1c1.ibvV7xHbMvjntWfOMejj3JtyyQOBU0O', 'customer', NULL, 1, '2025-07-08 13:37:42', NULL, 'Taguig', '0916784', 'images/WIN_20231124_07_57_39_Pro-1752163525721-756932282.jpg'),
(2, 'flint', 'flintaxl.celetaria@gmail.com', '$2b$10$ZQwQPVhuk6Cf49YBbg/3J.B9TRCWYhDbEfm3MF1ylrw9tbG0TzJ8K', 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUzMDA3MTAwfQ.ywDCmQ7a0fd1pU_YSlPICtm1RbukwhWzzj-LDcU1v2k', 1, '2025-07-09 05:37:42', NULL, 'Taguig', '123456', 'images/WIN_20240524_10_18_02_Pro-1752163564165-754044518.jpg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `email_log`
--
ALTER TABLE `email_log`
  ADD PRIMARY KEY (`email_id`);

--
-- Indexes for table `item`
--
ALTER TABLE `item`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `item_category_id_foreign` (`category_id`);

--
-- Indexes for table `item_images`
--
ALTER TABLE `item_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `orderinfo`
--
ALTER TABLE `orderinfo`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `orderline`
--
ALTER TABLE `orderline`
  ADD PRIMARY KEY (`orderline_id`),
  ADD KEY `orderinfo_id` (`orderinfo_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_item_order` (`user_id`,`item_id`,`order_id`),
  ADD KEY `reviews_orderinfo_id_foreign` (`order_id`),
  ADD KEY `reviews_item_id_foreign` (`item_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `email_log`
--
ALTER TABLE `email_log`
  MODIFY `email_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `item`
--
ALTER TABLE `item`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `item_images`
--
ALTER TABLE `item_images`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `orderinfo`
--
ALTER TABLE `orderinfo`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `orderline`
--
ALTER TABLE `orderline`
  MODIFY `orderline_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `item`
--
ALTER TABLE `item`
  ADD CONSTRAINT `item_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `item_images`
--
ALTER TABLE `item_images`
  ADD CONSTRAINT `item_images_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`) ON DELETE CASCADE;

--
-- Constraints for table `orderinfo`
--
ALTER TABLE `orderinfo`
  ADD CONSTRAINT `fk_orderinfo_user` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orderline`
--
ALTER TABLE `orderline`
  ADD CONSTRAINT `orderline_ibfk_1` FOREIGN KEY (`orderinfo_id`) REFERENCES `orderinfo` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orderline_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_orderinfo_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orderinfo` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
