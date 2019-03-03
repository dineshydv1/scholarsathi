-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jan 21, 2019 at 08:35 AM
-- Server version: 10.1.8-MariaDB
-- PHP Version: 5.6.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `scholarsathi`
--

-- --------------------------------------------------------

--
-- Table structure for table `header_menus`
--

CREATE TABLE `header_menus` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `subcategories` varchar(255) NOT NULL DEFAULT '',
  `order` varchar(255) NOT NULL DEFAULT '',
  `search_below` enum('y','n') DEFAULT 'n'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `header_menus`
--

INSERT INTO `header_menus` (`id`, `name`, `subcategories`, `order`, `search_below`) VALUES
(1, 'Means based (low family income)', '49', '1', 'n'),
(2, 'Merit based (competition & academic performance)', '50', '2', 'n'),
(3, 'Scholarships for differently-abled', '51', '3', 'n'),
(4, 'Talent Based Scholarships', '52', '4', 'n'),
(5, 'Below Class 10', '28,29,30,31,32,33,34,35,36,37,38', '5', 'n'),
(6, 'Class 10 to 12+', '38,39,40,41', '6', 'n'),
(7, 'Polytechnic/ITI/Diploma', '42,47', '7', 'n'),
(8, 'Graduate/Post Graduate', '43,44', '8', 'n'),
(9, 'PhD/Post-Doctoral', '45,46', '9', 'n'),
(10, 'Sports', '52', '1', 'y'),
(11, 'Academic', '28,29,30,31,32,33', '2', 'y'),
(12, 'Class 12+', '28,29,30,31,32,33,34,35,36,37,38,39,40,41', '3', 'y'),
(13, 'International', '66', '4', 'y');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `header_menus`
--
ALTER TABLE `header_menus`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `header_menus`
--
ALTER TABLE `header_menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
