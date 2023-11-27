-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 27, 2023 at 12:05 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `campusconnect`
--

-- --------------------------------------------------------

--
-- Table structure for table `PinnedPosts`
--

CREATE TABLE `PinnedPosts` (
  `PinnedPostID` int(11) NOT NULL,
  `PostID` int(11) NOT NULL,
  `SubForumID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  `TimePinnedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `PinnedPosts`
--

INSERT INTO `PinnedPosts` (`PinnedPostID`, `PostID`, `SubForumID`, `UserID`, `TimePinnedAt`) VALUES
(1, 2, 2, 1, '2023-12-05 12:00:00'),
(2, 3, 3, 1, '2023-12-06 15:30:00'),
(3, 4, 4, 4, '2023-12-07 10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `Posts`
--

CREATE TABLE `Posts` (
  `PostID` int(11) NOT NULL,
  `SubForumID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `UpVotes` int(11) DEFAULT 0,
  `Content` text DEFAULT '',
  `ViewCount` int(11) DEFAULT 0,
  `PostDate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Posts`
--

INSERT INTO `Posts` (`PostID`, `SubForumID`, `UserID`, `Title`, `UpVotes`, `Content`, `ViewCount`, `PostDate`) VALUES
(1, 1, 1, 'Introduction', 10, 'Hello, I am new here!', 35, '2023-11-23 08:00:00'),
(2, 2, 2, 'Python Error', 5, 'I am facing an issue with my Python code...', 15, '2023-11-23 09:00:00'),
(3, 3, 3, 'Calculus question', 4, 'What is integration by parts?', 17, '2023-11-23 10:00:00'),
(4, 4, 4, 'Favorite Music Genre', 3, 'Discuss your favorite music genres and artists', 15, '2023-11-23 11:00:00'),
(5, 5, 5, 'Space Exploration', 4, 'Discuss the future of space exploration', 20, '2023-11-23 12:00:00'),
(6, 6, 6, 'Book Recommendations', 5, 'Share your favorite books and recommendations', 15, '2023-11-23 13:00:00'),
(7, 7, 7, 'Healthy Recipes', 6, 'Share your favorite healthy recipes', 14, '2023-11-23 14:00:00'),
(8, 8, 8, 'Best Travel Destinations', 1, 'Discuss the best travel destinations around the world', 10, '2023-11-23 15:00:00'),
(9, 9, 9, 'Favorite Cuisine', 2, 'Discuss your favorite cuisines and restaurants', 5, '2023-11-23 16:00:00'),
(10, 10, 10, 'Top 10 Movies of All Time', 10, 'Share your list of top 10 movies', 40, '2023-11-23 17:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `PostSubscriptions`
--

CREATE TABLE `PostSubscriptions` (
  `SubscriptionID` int(11) NOT NULL,
  `SubscriberID` int(11) NOT NULL,
  `PostID` int(11) NOT NULL,
  `TimeCreated` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `PostSubscriptions`
--

INSERT INTO `PostSubscriptions` (`SubscriptionID`, `SubscriberID`, `PostID`, `TimeCreated`) VALUES
(1, 1, 1, '2023-12-05 08:30:00'),
(2, 2, 1, '2023-12-06 10:45:00'),
(3, 3, 1, '2023-12-07 12:00:00'),
(4, 4, 2, '2023-12-08 13:15:00'),
(5, 5, 2, '2023-12-09 14:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `Responses`
--

CREATE TABLE `Responses` (
  `ResponseID` int(11) NOT NULL,
  `PostID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  `Content` varchar(8000) DEFAULT '',
  `ResponceDate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Responses`
--

INSERT INTO `Responses` (`ResponseID`, `PostID`, `UserID`, `Content`, `ResponceDate`) VALUES
(1, 1, 2, 'Welcome! Feel free to ask any questions.', '2023-11-24 08:00:00'),
(2, 2, 1, 'Can you post the error message?', '2023-11-24 09:30:00'),
(3, 3, 3, 'its just integration in parts', '2023-11-24 10:45:00'),
(4, 4, 4, 'I love rock music! What about you?', '2023-11-24 12:15:00'),
(5, 5, 5, 'The future of space exploration is exciting!', '2023-11-24 14:00:00'),
(6, 6, 6, 'I recommend \"The Great Gatsby\" for classic literature lovers.', '2023-11-24 16:30:00'),
(7, 7, 7, 'Here is a delicious and healthy smoothie recipe...', '2023-11-24 18:45:00'),
(8, 8, 8, 'My favorite travel destination is Santorini, Greece!', '2023-11-24 20:00:00'),
(9, 9, 9, 'Italian cuisine is the best!', '2023-11-24 22:15:00'),
(10, 10, 10, 'Inception and The Shawshank Redemption are must-watch movies.', '2023-11-25 00:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `SubForums`
--

CREATE TABLE `SubForums` (
  `SubForumID` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Description` varchar(255) DEFAULT '',
  `ViewCount` int(11) DEFAULT 0,
  `CreatorID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `SubForums`
--

INSERT INTO `SubForums` (`SubForumID`, `Name`, `Description`, `ViewCount`, `CreatorID`) VALUES
(1, 'TCSS', 'Discuss anything and everything', 0, 1),
(2, 'Programming Help', 'Get help with coding problems', 0, 1),
(3, 'TMATH', 'Share your creative works', 0, 1),
(4, 'Music Lovers', 'Discuss your favorite tunes', 0, 4),
(5, 'Science and Technology', 'Explore the latest advancements', 0, 4),
(6, 'Book Club', 'Discuss your favorite books', 0, 5),
(7, 'Health and Fitness', 'Share tips for a healthy lifestyle', 0, 6),
(8, 'Travel Enthusiasts', 'Share your travel experiences', 0, 7),
(9, 'Foodies Unite', 'Discuss your favorite cuisines', 0, 8),
(10, 'Movie Buffs', 'Talk about your favorite films', 0, 9);

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `User_ID` int(11) NOT NULL,
  `UserName` varchar(255) NOT NULL,
  `UserPassword` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `UserType` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`User_ID`, `UserName`, `UserPassword`, `Email`, `UserType`) VALUES
(1, 'jason78', 'password1', 'user1@example.com', 1),
(2, 'harvet90', 'password2', 'user2@example.com', 1),
(3, 'kelly67', 'password3', 'user3@example.com', 1),
(4, 'bob123', 'password4', 'user4@example.com', 1),
(5, 'somedude23', 'password5', 'user5@example.com', 1),
(6, 'somegirl67', 'password6', 'user6@example.com', 1),
(7, 'coolGuy89', 'password7', 'user7@example.com', 1),
(8, '1313po', 'password8', 'user8@example.com', 1),
(9, 'alex45', 'password9', 'user9@example.com', 2),
(10, 'wallace55', 'password10', 'user10@example.com', 2);

-- --------------------------------------------------------

--
-- Table structure for table `UserType`
--

CREATE TABLE `UserType` (
  `UserType` int(11) NOT NULL,
  `Description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `UserType`
--

INSERT INTO `UserType` (`UserType`, `Description`) VALUES
(1, 'Standard'),
(2, 'Admin'),
(3, 'Moderator'),
(4, 'Guest');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `PinnedPosts`
--
ALTER TABLE `PinnedPosts`
  ADD PRIMARY KEY (`PinnedPostID`),
  ADD KEY `pinnedposts_ibfk_1` (`PostID`),
  ADD KEY `pinnedposts_ibfk_2` (`SubForumID`),
  ADD KEY `pinnedposts_ibfk_3` (`UserID`);

--
-- Indexes for table `Posts`
--
ALTER TABLE `Posts`
  ADD PRIMARY KEY (`PostID`),
  ADD KEY `posts_ibfk_2` (`SubForumID`),
  ADD KEY `posts_ibfk_1` (`UserID`);

--
-- Indexes for table `PostSubscriptions`
--
ALTER TABLE `PostSubscriptions`
  ADD PRIMARY KEY (`SubscriptionID`),
  ADD KEY `postsubscriptions_ibfk_1` (`SubscriberID`),
  ADD KEY `postsubscriptions_ibfk_2` (`PostID`);

--
-- Indexes for table `Responses`
--
ALTER TABLE `Responses`
  ADD PRIMARY KEY (`ResponseID`),
  ADD KEY `responses_ibfk_1` (`PostID`),
  ADD KEY `responses_ibfk_2` (`UserID`);

--
-- Indexes for table `SubForums`
--
ALTER TABLE `SubForums`
  ADD PRIMARY KEY (`SubForumID`),
  ADD KEY `creator` (`CreatorID`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`User_ID`),
  ADD UNIQUE KEY `UserName` (`UserName`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `UserType` (`UserType`);

--
-- Indexes for table `UserType`
--
ALTER TABLE `UserType`
  ADD PRIMARY KEY (`UserType`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `PinnedPosts`
--
ALTER TABLE `PinnedPosts`
  MODIFY `PinnedPostID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Posts`
--
ALTER TABLE `Posts`
  MODIFY `PostID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `PostSubscriptions`
--
ALTER TABLE `PostSubscriptions`
  MODIFY `SubscriptionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `Responses`
--
ALTER TABLE `Responses`
  MODIFY `ResponseID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `SubForums`
--
ALTER TABLE `SubForums`
  MODIFY `SubForumID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `User_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `PinnedPosts`
--
ALTER TABLE `PinnedPosts`
  ADD CONSTRAINT `pinnedposts_ibfk_1` FOREIGN KEY (`PostID`) REFERENCES `campusconnect`.`Posts` (`PostID`) ON DELETE CASCADE,
  ADD CONSTRAINT `pinnedposts_ibfk_2` FOREIGN KEY (`SubForumID`) REFERENCES `campusconnect`.`SubForums` (`SubForumID`) ON DELETE CASCADE,
  ADD CONSTRAINT `pinnedposts_ibfk_3` FOREIGN KEY (`UserID`) REFERENCES `campusconnect`.`Users` (`User_ID`) ON DELETE SET NULL;

--
-- Constraints for table `Posts`
--
ALTER TABLE `Posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `campusconnect`.`Users` (`User_ID`),
  ADD CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`SubForumID`) REFERENCES `campusconnect`.`SubForums` (`SubForumID`) ON DELETE CASCADE;

--
-- Constraints for table `PostSubscriptions`
--
ALTER TABLE `PostSubscriptions`
  ADD CONSTRAINT `postsubscriptions_ibfk_1` FOREIGN KEY (`SubscriberID`) REFERENCES `campusconnect`.`Users` (`User_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `postsubscriptions_ibfk_2` FOREIGN KEY (`PostID`) REFERENCES `campusconnect`.`Posts` (`PostID`) ON DELETE CASCADE;

--
-- Constraints for table `Responses`
--
ALTER TABLE `Responses`
  ADD CONSTRAINT `responses_ibfk_1` FOREIGN KEY (`PostID`) REFERENCES `campusconnect`.`Posts` (`PostID`) ON DELETE CASCADE,
  ADD CONSTRAINT `responses_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `campusconnect`.`Users` (`User_ID`) ON DELETE SET NULL;

--
-- Constraints for table `SubForums`
--
ALTER TABLE `SubForums`
  ADD CONSTRAINT `creator` FOREIGN KEY (`CreatorID`) REFERENCES `campusconnect`.`Users` (`User_ID`) ON DELETE SET NULL;

--
-- Constraints for table `Users`
--
ALTER TABLE `Users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`UserType`) REFERENCES `campusconnect`.`UserType` (`UserType`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
