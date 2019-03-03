-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jan 22, 2019 at 10:04 AM
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
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `category_id` int(11) NOT NULL,
  `img` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `subcategories`
--

INSERT INTO `subcategories` (`id`, `name`, `category_id`, `img`) VALUES
(28, 'KG', 2, NULL),
(29, 'Class 1', 2, NULL),
(30, 'Class 2', 2, NULL),
(31, 'Class 3', 2, NULL),
(32, 'Class 4', 2, NULL),
(33, 'Class 5', 2, NULL),
(34, 'Class 6', 2, NULL),
(35, 'Class 7', 2, NULL),
(36, 'Class 8', 2, NULL),
(37, 'Class 9', 2, NULL),
(38, 'Class 10', 2, NULL),
(39, 'Class 11', 2, NULL),
(40, 'Class 12', 2, NULL),
(41, 'Class 12 Passed', 2, NULL),
(42, 'Polytechnique/Diploma', 2, NULL),
(43, 'Graduation', 2, NULL),
(44, 'Post Graduation', 2, NULL),
(45, 'PhD', 2, NULL),
(46, 'Post Doctoral', 2, NULL),
(47, 'ITI', 2, NULL),
(48, 'Others', 2, NULL),
(49, 'Means Based Scholarships', 1, NULL),
(50, 'Merit(Education) Based Scholarships', 1, NULL),
(51, 'Scholarship for differently-abled', 1, NULL),
(52, 'Sports talent (individual/team sports)', 1, NULL),
(53, 'Others', 1, NULL),
(54, 'Male', 3, NULL),
(55, 'Female', 3, NULL),
(56, 'Transgender', 3, NULL),
(57, 'Buddhism', 4, NULL),
(58, 'Christian', 4, NULL),
(59, 'Hindu', 4, NULL),
(60, 'Jain', 4, NULL),
(61, 'Muslim', 4, NULL),
(62, 'Parsi', 4, NULL),
(63, 'Sikh', 4, NULL),
(64, 'Others', 4, NULL),
(65, 'India', 5, NULL),
(66, 'International', 5, NULL),
(67, 'General', 6, NULL),
(68, 'OBC', 6, NULL),
(69, 'OBC-C', 6, NULL),
(70, 'SC', 6, NULL),
(71, 'ST', 6, NULL),
(72, 'Others', 6, NULL),
(75, 'Visual Art', 1, NULL),
(76, 'Literary art', 1, NULL),
(77, 'Science & Maths Based', 1, NULL),
(78, 'Technology Based', 1, NULL),
(79, 'Women Based', 1, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `subcategories`
--
ALTER TABLE `subcategories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
