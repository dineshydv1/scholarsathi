-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jan 21, 2019 at 11:04 AM
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
-- Table structure for table `best_scholarships`
--

CREATE TABLE `best_scholarships` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `sub_title` varchar(255) NOT NULL DEFAULT '',
  `subcategories` varchar(255) NOT NULL DEFAULT '',
  `order` varchar(255) NOT NULL DEFAULT '',
  `img` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `best_scholarships`
--

INSERT INTO `best_scholarships` (`id`, `name`, `sub_title`, `subcategories`, `order`, `img`) VALUES
(1, 'Means Based Scholarships', 'Scholarships for families with low income', '49', '1', '/public/assets/best-scholarship/card-1.png'),
(2, 'Merit/Education based Scholarships', 'Merit Based (Competition & academic performance) Scholarships for students who want to pursue higher studies', '49,50', '2', '/public/assets/best-scholarship/card-2.png'),
(3, 'Scholarships for Differently-Abled', 'Scholarships for Differently-Abled students', '51', '3', '/public/assets/best-scholarship/card-3.png'),
(4, 'School Scholarships', 'Scholarships from KG to class 12+', '28,29,30,31,32,33,34,35,36,37,38,39,40,41', '4', '/public/assets/best-scholarship/card-4.png'),
(5, 'College Scholarships', 'Scholarships for Class 12+, Graduation and college admission', '40,41,43', '5', '/public/assets/best-scholarship/card-5.png'),
(6, 'International Scholarships', 'International Scholarships', '66', '6', '/public/assets/best-scholarship/card-6.png'),
(7, 'Minorities Scholarships', 'Scholarships for Minority Categories (SC/ST/OBC) ', '68,70,71', '7', '/public/assets/best-scholarship/card-7.png'),
(8, 'Talent Based Scholarships', 'Talent Based. E.g. sport based who have represented at state/country level, high-performing athletes, theatre artists etc.', '52', '8', '/public/assets/best-scholarship/card-8.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `best_scholarships`
--
ALTER TABLE `best_scholarships`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `best_scholarships`
--
ALTER TABLE `best_scholarships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
