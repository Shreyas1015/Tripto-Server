-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: tripto
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `aid` int NOT NULL AUTO_INCREMENT,
  `uid` int DEFAULT NULL,
  PRIMARY KEY (`aid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `did` int NOT NULL AUTO_INCREMENT,
  `uid` int DEFAULT NULL,
  `aadharFront` varchar(500) NOT NULL,
  `aadharBack` varchar(500) NOT NULL,
  `panCardFront` varchar(500) NOT NULL,
  `selfie` varchar(255) NOT NULL,
  `passbookOrCheque` varchar(500) DEFAULT NULL,
  `rc` varchar(255) NOT NULL,
  `puc` varchar(255) NOT NULL,
  `insurance` varchar(255) NOT NULL,
  `permit` varchar(255) NOT NULL,
  `fitnessCertificate` varchar(255) DEFAULT NULL,
  `taxReceipt` varchar(255) DEFAULT NULL,
  `drivingLicenseFront` varchar(500) NOT NULL,
  `drivingLicenseBack` varchar(255) NOT NULL,
  `aadharFrontStatus` tinyint DEFAULT '0',
  `aadharBackStatus` tinyint DEFAULT '0',
  `panCardFrontStatus` tinyint DEFAULT '0',
  `selfieStatus` tinyint DEFAULT '0',
  `passbookOrChequeStatus` tinyint DEFAULT '0',
  `rcStatus` tinyint DEFAULT '0',
  `pucStatus` tinyint DEFAULT '0',
  `insuranceStatus` tinyint DEFAULT '0',
  `permitStatus` tinyint DEFAULT '0',
  `fitnessCertificateStatus` tinyint DEFAULT '0',
  `taxReceiptStatus` tinyint DEFAULT '0',
  `drivingLicenseFrontStatus` tinyint DEFAULT '0',
  `drivingLicenseBackStatus` tinyint DEFAULT '0',
  `all_documents_status` tinyint DEFAULT '0',
  `profile_img` varchar(255) DEFAULT NULL,
  `dcd_id` int DEFAULT NULL,
  PRIMARY KEY (`did`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES (1,4,'https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/4_aadharFront.jpg','','','','','','','','','','','','',1,0,0,0,0,0,0,0,0,0,0,0,0,1,'https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/4_driverProfileIMG_XMogeYp9P.jpg',NULL),(2,2,'','','','','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_passbook_chequebook.jpg','','','','','','','','',0,0,0,0,0,0,0,0,0,0,0,0,0,0,'https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_driverProfileIMG_QNjFToHTZ.jpg',NULL),(3,5,'https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_aadharFront.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_aadharBack.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_panCardFront.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_selfie.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_passbook_chequebook.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_rc.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_puc.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_insurance.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_permit.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_fitnessCertificate.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_taxReceipt.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_drivingLicenseFront.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_drivingLicenseBack.jpg',1,0,0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL);
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers_car_details`
--

DROP TABLE IF EXISTS `drivers_car_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers_car_details` (
  `dcd_id` int NOT NULL AUTO_INCREMENT,
  `uid` int DEFAULT NULL,
  `car_name` varchar(255) DEFAULT NULL,
  `model_year` varchar(255) DEFAULT NULL,
  `car_number` varchar(255) DEFAULT NULL,
  `car_type` varchar(255) DEFAULT NULL,
  `submit_status` tinyint DEFAULT '0',
  PRIMARY KEY (`dcd_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers_car_details`
--

LOCK TABLES `drivers_car_details` WRITE;
/*!40000 ALTER TABLE `drivers_car_details` DISABLE KEYS */;
INSERT INTO `drivers_car_details` VALUES (1,2,'Car Testing 1','2022','MH34HF3432','2',1),(2,2,'Car Testing 3','2020','bveruvbeervub','2',1),(3,2,'Car Testing 3','2020','bveruvbeervub','2',1),(4,4,'Car Testing 3','2006','MH04GH1023','2',1),(5,4,'evsfv','','dvsdv','',1),(6,4,'evsfv','','mh45gh4444','',1),(7,5,'Car Testing 3','2000','MH04GH1023','2',1);
/*!40000 ALTER TABLE `drivers_car_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verification_otps`
--

DROP TABLE IF EXISTS `email_verification_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verification_otps` (
  `evo_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp` varchar(20) NOT NULL,
  `created_at` time DEFAULT NULL,
  PRIMARY KEY (`evo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verification_otps`
--

LOCK TABLES `email_verification_otps` WRITE;
/*!40000 ALTER TABLE `email_verification_otps` DISABLE KEYS */;
INSERT INTO `email_verification_otps` VALUES (1,'shreyas1234gurav@gmail.com','936165','16:21:10'),(2,'shreyas1234gurav@gmail.com','853209','16:42:24'),(3,'user@gmail.com','604393','16:48:52'),(4,'dummy@gmail.com','343087','16:49:25'),(5,'shreyas1234gurav@gmail.com','676764','17:30:32'),(6,'shreyas1234gurav@gmail.com','739505','17:31:31'),(7,'shreyas1234gurav@gmail.com','841747','18:09:12'),(8,'shreyas1234gurav@gmail.com','863906','18:10:05'),(9,'user@gmail.com','838366','18:41:16'),(10,'user@gmail.com','866522','18:41:53'),(11,'dummy@gmail.com','714809','18:42:27'),(12,'dummy@gmail.com','792519','18:53:39'),(13,'shreyas1234gurav@gmail.com','416641','18:59:25'),(14,'shreyas1234gurav@gmail.com','334353','18:59:53'),(15,'shreyas1234gurav@gmail.com','955406','19:09:50'),(16,'test@gmail.com','723365','19:12:51'),(17,'user@gmail.com','904348','19:19:05'),(18,'user@gmail.com','736049','19:22:57'),(19,'user@gmail.com','168720','21:17:25'),(20,'user@gmail.com','264036','11:20:47'),(21,'user@gmail.com','944465','11:24:41'),(22,'user@gmail.com','121806','13:56:45'),(23,'user@gmail.com','933094','14:21:05'),(24,'user@gmail.com','779150','14:23:58'),(25,'user@gmail.com','163243','15:21:49'),(26,'user@gmail.com','795779','15:24:02'),(27,'user@gmail.com','658078','15:25:27'),(28,'user@gmail.com','269324','17:31:45'),(29,'user@gmail.com','327029','17:49:36'),(30,'shreyas1234gurav@gmail.com','831640','20:27:13'),(31,'user@gmail.com','318211','20:28:58'),(32,'shreyas1234gurav@gmail.com','378660','20:29:18'),(33,'user@gmail.com','206711','20:46:27'),(34,'user@gmail.com','117862','20:47:56'),(35,'user@gmail.com','171010','22:12:40'),(36,'user@gmail.com','630075','19:29:21'),(37,'driver2@gmail.com','894416','20:18:45'),(38,'driver2@gmail.com','822476','20:19:57'),(39,'user@gmail.com','768425','20:43:51'),(40,'driver3@gmail.com','193070','21:30:56'),(41,'driver3@gmail.com','459115','21:31:16'),(42,'user@gmail.com','214125','11:55:12'),(43,'user@gmail.com','383153','13:31:35'),(44,'user@gmail.com','857997','13:53:35'),(45,'user@gmail.com','135783','13:54:53'),(46,'user@gmail.com','522193','13:59:05'),(47,'user@gmail.com','841413','14:01:16'),(48,'user@gmail.com','867958','14:09:16'),(49,'user@gmail.com','438260','14:13:37'),(50,'user@gmail.com','695738','14:21:00'),(51,'user@gmail.com','537388','14:39:56'),(52,'user@gmail.com','658529','14:40:43'),(53,'driveruser@gmail.com','683683','14:45:36'),(54,'driveruser@gmail.com','705035','14:46:03'),(55,'driveruser2@gmail.com','774520','14:53:04'),(56,'driveruser2@gmail.com','622529','14:53:22'),(57,'user@gmail.com','180282','15:01:35'),(58,'user@gmail.com','978043','15:02:13'),(59,'user@gmail.com','313986','15:09:01'),(60,'dummy@gmail.com','494957','15:28:34'),(61,'dummy@gmail.com','874167','15:29:08'),(62,'dummy@gmail.com','526000','20:28:48'),(63,'dummy@gmail.com','217406','20:53:27'),(64,'driver3@gmail.com','609633','00:05:44'),(65,'dummy@gmail.com','815860','00:08:26'),(66,'dummy@gmail.com','236581','00:09:14'),(67,'dummy@gmail.com','121201','00:10:03'),(68,'dummy2@gmail.com','793305','00:10:37'),(69,'driver2@gmail.com','836500','00:15:25'),(70,'driver2@gmail.com','302364','00:15:33'),(71,'driver3@gmail.com','945381','00:59:41'),(72,'driver3@gmail.com','982907','01:23:19');
/*!40000 ALTER TABLE `email_verification_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passengers`
--

DROP TABLE IF EXISTS `passengers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passengers` (
  `pid` int NOT NULL AUTO_INCREMENT,
  `uid` int DEFAULT NULL,
  PRIMARY KEY (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passengers`
--

LOCK TABLES `passengers` WRITE;
/*!40000 ALTER TABLE `passengers` DISABLE KEYS */;
/*!40000 ALTER TABLE `passengers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phone_verification_otps`
--

DROP TABLE IF EXISTS `phone_verification_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phone_verification_otps` (
  `pvo_id` int NOT NULL AUTO_INCREMENT,
  `phone_number` varchar(20) NOT NULL,
  `otp` varchar(20) NOT NULL,
  `created_at` time DEFAULT NULL,
  PRIMARY KEY (`pvo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phone_verification_otps`
--

LOCK TABLES `phone_verification_otps` WRITE;
/*!40000 ALTER TABLE `phone_verification_otps` DISABLE KEYS */;
/*!40000 ALTER TABLE `phone_verification_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_type_details`
--

DROP TABLE IF EXISTS `user_type_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_type_details` (
  `user_type` int NOT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_type_details`
--

LOCK TABLES `user_type_details` WRITE;
/*!40000 ALTER TABLE `user_type_details` DISABLE KEYS */;
INSERT INTO `user_type_details` VALUES (1,'Admin'),(2,'Passengers'),(3,'Drivers'),(4,'Vendors');
/*!40000 ALTER TABLE `user_type_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `uid` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `user_type` int NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Passenger 1','shreyas1234gurav@gmail.com','6565656565',2),(2,'Shreyas Gurav','dummy2@gmail.com','35554654',3),(3,'Passenger 2','test@gmail.com','234443',2),(4,'Driver2','driver2@gmail.com','466456456',3),(5,'Driver 3','driver3@gmail.com','543545',3);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `vid` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`vid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-20 19:17:21
