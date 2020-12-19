-- MySQL dump 10.13  Distrib 5.7.32, for Linux (x86_64)
--
-- Host: localhost    Database: music_together
-- ------------------------------------------------------
-- Server version	5.7.32-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adminUsers`
--

DROP TABLE IF EXISTS `adminUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adminUsers` (
  `adminID` int(10) NOT NULL AUTO_INCREMENT,
  `adminUsername` varchar(255) NOT NULL,
  `adminPassword` varchar(255) NOT NULL,
  `adminLevel` tinyint(1) NOT NULL,
  PRIMARY KEY (`adminID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adminUsers`
--

LOCK TABLES `adminUsers` WRITE;
/*!40000 ALTER TABLE `adminUsers` DISABLE KEYS */;
/*!40000 ALTER TABLE `adminUsers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bannedWords`
--

DROP TABLE IF EXISTS `bannedWords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bannedWords` (
  `wordID` int(10) NOT NULL AUTO_INCREMENT,
  `word` varchar(255) NOT NULL,
  `wordUses` int(10) NOT NULL DEFAULT '0',
  `wordAddedDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `wordAddedByID` int(10) NOT NULL,
  PRIMARY KEY (`wordID`),
  KEY `FK_bannedWords_adminUsers` (`wordAddedByID`),
  CONSTRAINT `FK_bannedWords_adminUsers` FOREIGN KEY (`wordAddedByID`) REFERENCES `adminUsers` (`adminID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bannedWords`
--

LOCK TABLES `bannedWords` WRITE;
/*!40000 ALTER TABLE `bannedWords` DISABLE KEYS */;
/*!40000 ALTER TABLE `bannedWords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bannedWordsUse`
--

DROP TABLE IF EXISTS `bannedWordsUse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bannedWordsUse` (
  `banUsgID` int(10) NOT NULL AUTO_INCREMENT,
  `banUsgWordID` int(10) NOT NULL,
  `banUsgSenderID` varchar(255) NOT NULL,
  `banUsgGroupID` varchar(32) NOT NULL,
  `banUsgDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`banUsgID`),
  KEY `FK_bannedWordsUse_bannedWords` (`banUsgWordID`),
  KEY `FK_bannedWordsUse_users` (`banUsgSenderID`),
  CONSTRAINT `FK_bannedWordsUse_bannedWords` FOREIGN KEY (`banUsgWordID`) REFERENCES `bannedWords` (`wordID`),
  CONSTRAINT `FK_bannedWordsUse_users` FOREIGN KEY (`banUsgSenderID`) REFERENCES `users` (`userSpotifyID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bannedWordsUse`
--

LOCK TABLES `bannedWordsUse` WRITE;
/*!40000 ALTER TABLE `bannedWordsUse` DISABLE KEYS */;
/*!40000 ALTER TABLE `bannedWordsUse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groupLogs`
--

DROP TABLE IF EXISTS `groupLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groupLogs` (
  `glogID` int(10) NOT NULL AUTO_INCREMENT,
  `glogSpotifyID` varchar(255) NOT NULL,
  `glogGroupID` varchar(32) NOT NULL,
  `glogAction` varchar(16) NOT NULL,
  `glogDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`glogID`),
  KEY `FK_groupLogs_users` (`glogSpotifyID`),
  CONSTRAINT `FK_groupLogs_users` FOREIGN KEY (`glogSpotifyID`) REFERENCES `users` (`userSpotifyID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groupLogs`
--

LOCK TABLES `groupLogs` WRITE;
/*!40000 ALTER TABLE `groupLogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `groupLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loginLogs`
--

DROP TABLE IF EXISTS `loginLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loginLogs` (
  `llogID` int(10) NOT NULL AUTO_INCREMENT,
  `llogSpotifyID` varchar(255) DEFAULT NULL,
  `llogAdminID` int(10) DEFAULT NULL,
  `llogDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`llogID`),
  KEY `FK_loginLogs_users` (`llogSpotifyID`),
  KEY `FK_loginLogs_adminUsers` (`llogAdminID`),
  CONSTRAINT `FK_loginLogs_adminUsers` FOREIGN KEY (`llogAdminID`) REFERENCES `adminUsers` (`adminID`),
  CONSTRAINT `FK_loginLogs_users` FOREIGN KEY (`llogSpotifyID`) REFERENCES `users` (`userSpotifyID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loginLogs`
--

LOCK TABLES `loginLogs` WRITE;
/*!40000 ALTER TABLE `loginLogs` DISABLE KEYS */;
INSERT INTO `loginLogs` VALUES (1,'u527hz4ubk69i65480dewn04n',NULL,'2020-12-15 21:45:52'),(2,'u527hz4ubk69i65480dewn04n',NULL,'2020-12-15 21:49:25'),(3,'u527hz4ubk69i65480dewn04n',NULL,'2020-12-15 21:50:27'),(4,'u527hz4ubk69i65480dewn04n',NULL,'2020-12-15 21:50:44'),(5,'u527hz4ubk69i65480dewn04n',NULL,'2020-12-16 09:17:01'),(6,'u527hz4ubk69i65480dewn04n',NULL,'2020-12-16 09:31:43'),(7,'u527hz4ubk69i65480dewn04n',NULL,'2020-12-18 16:14:01');
/*!40000 ALTER TABLE `loginLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `msgID` int(10) NOT NULL AUTO_INCREMENT,
  `msgSenderID` varchar(255) NOT NULL,
  `msgDateSent` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `msgContent` varchar(512) NOT NULL,
  `msgGroupID` varchar(32) NOT NULL,
  PRIMARY KEY (`msgID`),
  KEY `FK_messages_users` (`msgSenderID`),
  CONSTRAINT `FK_messages_users` FOREIGN KEY (`msgSenderID`) REFERENCES `users` (`userSpotifyID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `userSpotifyID` varchar(255) NOT NULL,
  `userName` varchar(255) NOT NULL,
  `userNickname` varchar(255) DEFAULT NULL,
  `userEmail` varchar(255) NOT NULL,
  `userProfilePicture` varchar(255) NOT NULL DEFAULT 'defaultProfilePicture.png',
  `userOnline` tinyint(1) NOT NULL DEFAULT '0',
  `userGroupID` varchar(32) DEFAULT NULL,
  `userDateCreated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `userBanned` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`userSpotifyID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('u527hz4ubk69i65480dewn04n','Mo',NULL,'mrahman150@outlook.com','defaultProfilePicture.png',0,NULL,'2020-12-15 21:35:25',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-12-19 10:43:29
