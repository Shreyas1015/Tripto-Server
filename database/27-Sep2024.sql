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
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `bid` int NOT NULL AUTO_INCREMENT,
  `uid` int DEFAULT NULL,
  `pid` int DEFAULT NULL,
  `did` int DEFAULT NULL,
  `dcd_id` int DEFAULT NULL,
  `pickup_location` varchar(255) DEFAULT NULL,
  `drop_location` varchar(255) DEFAULT NULL,
  `pickup_date_time` datetime DEFAULT NULL,
  `drop_date_time` datetime DEFAULT NULL,
  `trip_status` tinyint DEFAULT '0',
  `trip_type` tinyint DEFAULT '0',
  `distance` varchar(100) DEFAULT NULL,
  `selected_car` tinyint DEFAULT NULL,
  `price` int DEFAULT NULL,
  `no_of_days` int DEFAULT NULL,
  PRIMARY KEY (`bid`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (26,12,4,1,4,'http://localhost:3000/roundTrip?uid=U2FsdGVkX197BH0yTrSliWbXMdO2ieYxMDZPq89WjmI=','http://localhost:3000/roundTrip?uid=U2FsdGVkX197BH0yTrSliWbXMdO2ieYxMDZPq89WjmI=','2024-08-09 13:38:00','2024-08-24 13:38:00',1,2,'450',2,18700,15),(27,12,4,NULL,NULL,'http://localhost:3000/roundTrip?uid=U2FsdGVkX197BH0yTrSliWbXMdO2ieYxMDZPq89WjmI=','http://localhost:3000/roundTrip?uid=U2FsdGVkX197BH0yTrSliWbXMdO2ieYxMDZPq89WjmI=','2024-08-17 13:48:00',NULL,0,1,'50',1,600,NULL);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver_status`
--

DROP TABLE IF EXISTS `driver_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_status` (
  `driver_status` int NOT NULL AUTO_INCREMENT,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`driver_status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_status`
--

LOCK TABLES `driver_status` WRITE;
/*!40000 ALTER TABLE `driver_status` DISABLE KEYS */;
INSERT INTO `driver_status` VALUES (1,'Available'),(2,'Booked');
/*!40000 ALTER TABLE `driver_status` ENABLE KEYS */;
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
  `aadharFront` varchar(500) DEFAULT NULL,
  `aadharBack` varchar(500) DEFAULT NULL,
  `panCardFront` varchar(500) DEFAULT NULL,
  `selfie` varchar(255) DEFAULT NULL,
  `passbookOrCheque` varchar(500) DEFAULT NULL,
  `rc` varchar(255) DEFAULT NULL,
  `puc` varchar(255) DEFAULT NULL,
  `insurance` varchar(255) DEFAULT NULL,
  `permit` varchar(255) DEFAULT NULL,
  `fitnessCertificate` varchar(255) DEFAULT NULL,
  `taxReceipt` varchar(255) DEFAULT NULL,
  `drivingLicenseFront` varchar(500) DEFAULT NULL,
  `drivingLicenseBack` varchar(255) DEFAULT NULL,
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
  `driver_status` tinyint DEFAULT '1',
  PRIMARY KEY (`did`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES (1,4,'','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/4_aadharBack.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/4_panCardFront.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/4_selfie.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/4_passbook_chequebook.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/4_rc.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/4_puc.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/4_insurance.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/4_permit.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/4_fitnessCertificate.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/4_taxReceipt.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/4_drivingLicenseFront.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/4_drivingLicenseBack.jpg',1,0,0,0,0,0,0,0,0,0,0,0,0,1,'https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/4_driverProfileIMG_XMogeYp9P.jpg',4,1),(2,2,'https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_aadharFront.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_aadharBack.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_panCardFront.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_selfie.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_passbook_chequebook.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_rc.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_puc.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_insurance.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_permit.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_fitnessCertificate.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_taxReceipt.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_drivingLicenseFront.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_drivingLicenseBack.jpg',1,0,0,0,0,0,0,0,0,0,0,0,0,0,'https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/2_driverProfileIMG_QNjFToHTZ.jpg',NULL,1),(3,5,'https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_aadharFront.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_aadharBack.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_panCardFront.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_selfie.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_passbook_chequebook.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_rc.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_puc.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_insurance.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_permit.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_fitnessCertificate.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_taxReceipt.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_drivingLicenseFront.jpg','https://ik.imagekit.io/triptoServices/Home/Tripto/drivers/5_drivingLicenseBack.jpg',1,0,0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,1),(5,6,'','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/6_aadharBack.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/6_panCardFront.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/6_selfie.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/6_passbook_chequebook.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/6_rc.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/6_puc.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/6_insurance.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/6_permit.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/6_fitnessCertificate.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/6_taxReceipt.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/6_drivingLicenseFront.jpg','https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/6_drivingLicenseBack.jpg',1,0,0,0,0,0,0,0,0,0,0,0,0,0,'https://ik.imagekit.io/TriptoServices/Home/Tripto/drivers/6_driverProfileIMG_HGh7OeqNL.jpg',10,1),(7,11,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'https://ik.imagekit.io/TriptoServices/Home/Tripto/passengers/11_passengerProfileIMG_RIevYjI915.jpg',NULL,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers_car_details`
--

LOCK TABLES `drivers_car_details` WRITE;
/*!40000 ALTER TABLE `drivers_car_details` DISABLE KEYS */;
INSERT INTO `drivers_car_details` VALUES (1,2,'Car Testing 1','2010','MH34HF3432','2',1),(2,2,'Car Testing 3','2010','bveruvbeervub','2',1),(3,2,'Car Testing 3','2010','bveruvbeervub','2',1),(4,4,'Car Testing 3','2010','MH04GH1023','2',1),(5,4,'evsfv','2010','dvsdv','1',1),(6,4,'evsfv','2010','mh45gh4444','1',1),(7,5,'Car Testing 3','2010','MH04GH1023','2',1),(10,6,'Car Testing 4','2010','MH04GH1023','1',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=200 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verification_otps`
--

LOCK TABLES `email_verification_otps` WRITE;
/*!40000 ALTER TABLE `email_verification_otps` DISABLE KEYS */;
INSERT INTO `email_verification_otps` VALUES (1,'shreyas1234gurav@gmail.com','936165','16:21:10'),(2,'shreyas1234gurav@gmail.com','853209','16:42:24'),(3,'user@gmail.com','604393','16:48:52'),(4,'dummy@gmail.com','343087','16:49:25'),(5,'shreyas1234gurav@gmail.com','676764','17:30:32'),(6,'shreyas1234gurav@gmail.com','739505','17:31:31'),(7,'shreyas1234gurav@gmail.com','841747','18:09:12'),(8,'shreyas1234gurav@gmail.com','863906','18:10:05'),(9,'user@gmail.com','838366','18:41:16'),(10,'user@gmail.com','866522','18:41:53'),(11,'dummy@gmail.com','714809','18:42:27'),(12,'dummy@gmail.com','792519','18:53:39'),(13,'shreyas1234gurav@gmail.com','416641','18:59:25'),(14,'shreyas1234gurav@gmail.com','334353','18:59:53'),(15,'shreyas1234gurav@gmail.com','955406','19:09:50'),(16,'test@gmail.com','723365','19:12:51'),(17,'user@gmail.com','904348','19:19:05'),(18,'user@gmail.com','736049','19:22:57'),(19,'user@gmail.com','168720','21:17:25'),(20,'user@gmail.com','264036','11:20:47'),(21,'user@gmail.com','944465','11:24:41'),(22,'user@gmail.com','121806','13:56:45'),(23,'user@gmail.com','933094','14:21:05'),(24,'user@gmail.com','779150','14:23:58'),(25,'user@gmail.com','163243','15:21:49'),(26,'user@gmail.com','795779','15:24:02'),(27,'user@gmail.com','658078','15:25:27'),(28,'user@gmail.com','269324','17:31:45'),(29,'user@gmail.com','327029','17:49:36'),(30,'shreyas1234gurav@gmail.com','831640','20:27:13'),(31,'user@gmail.com','318211','20:28:58'),(32,'shreyas1234gurav@gmail.com','378660','20:29:18'),(33,'user@gmail.com','206711','20:46:27'),(34,'user@gmail.com','117862','20:47:56'),(35,'user@gmail.com','171010','22:12:40'),(36,'user@gmail.com','630075','19:29:21'),(37,'driver2@gmail.com','894416','20:18:45'),(38,'driver2@gmail.com','822476','20:19:57'),(39,'user@gmail.com','768425','20:43:51'),(40,'driver3@gmail.com','193070','21:30:56'),(41,'driver3@gmail.com','459115','21:31:16'),(42,'user@gmail.com','214125','11:55:12'),(43,'user@gmail.com','383153','13:31:35'),(44,'user@gmail.com','857997','13:53:35'),(45,'user@gmail.com','135783','13:54:53'),(46,'user@gmail.com','522193','13:59:05'),(47,'user@gmail.com','841413','14:01:16'),(48,'user@gmail.com','867958','14:09:16'),(49,'user@gmail.com','438260','14:13:37'),(50,'user@gmail.com','695738','14:21:00'),(51,'user@gmail.com','537388','14:39:56'),(52,'user@gmail.com','658529','14:40:43'),(53,'driveruser@gmail.com','683683','14:45:36'),(54,'driveruser@gmail.com','705035','14:46:03'),(55,'driveruser2@gmail.com','774520','14:53:04'),(56,'driveruser2@gmail.com','622529','14:53:22'),(57,'user@gmail.com','180282','15:01:35'),(58,'user@gmail.com','978043','15:02:13'),(59,'user@gmail.com','313986','15:09:01'),(60,'dummy@gmail.com','494957','15:28:34'),(61,'dummy@gmail.com','874167','15:29:08'),(62,'dummy@gmail.com','526000','20:28:48'),(63,'dummy@gmail.com','217406','20:53:27'),(64,'driver3@gmail.com','609633','00:05:44'),(65,'dummy@gmail.com','815860','00:08:26'),(66,'dummy@gmail.com','236581','00:09:14'),(67,'dummy@gmail.com','121201','00:10:03'),(68,'dummy2@gmail.com','793305','00:10:37'),(69,'driver2@gmail.com','836500','00:15:25'),(70,'driver2@gmail.com','302364','00:15:33'),(71,'driver3@gmail.com','945381','00:59:41'),(72,'driver3@gmail.com','982907','01:23:19'),(73,'dummy2@gmail.com','691919','19:33:52'),(74,'dummy2@gmail.com','599518','13:04:31'),(75,'6gaurav2331@gmail.com','811047','13:05:07'),(76,'driver4@gmail.com','329254','13:18:08'),(77,'driver4@gmail.com','704949','13:18:29'),(78,'driver4@gmail.com','879081','13:42:16'),(79,'driver4@gmail.com','270455','14:10:48'),(80,'driver4@gmail.com','877964','15:11:08'),(81,'driver4@gmail.com','308155','15:18:09'),(82,'shreyas1234gurav@gmail.com','258079','15:22:38'),(83,'passenger2@gmail.com','655812','15:33:59'),(84,'passenger2@gmail.com','533287','15:34:17'),(85,'driver4@gmail.com','229460','16:26:15'),(86,'driver2@gmail.com','583521','16:29:23'),(87,'driver4@gmail.com','920822','16:37:13'),(88,'passenger2@gmail.com','951596','16:39:01'),(89,'passenger2@gmail.com','242435','19:01:47'),(90,'passenger3@gmail.com','179545','19:41:48'),(91,'passenger2@gmail.com','606991','19:43:23'),(92,'passenger4@gmail.com','393162','19:43:56'),(93,'passenger1@gmail.com','910487','19:46:35'),(94,'passenger1@gmail.com','986545','19:47:19'),(95,'passenger1@gmail.com','112082','19:49:39'),(96,'passenger@gmail.com','794098','19:50:08'),(97,'passenger@gmail.com','971708','19:50:44'),(98,'passenger@gmail.com','508215','19:54:59'),(99,'passenger@gmail.com','631251','20:08:29'),(100,'shreyas1234gurav@gmail.com','730790','20:08:44'),(101,'shreyas1234gurav@gmail.com','651927','20:09:16'),(102,'passenger@gmail.com','277227','20:15:43'),(103,'passenger@gmail.com','302736','20:16:10'),(104,'passenger@gmail.com','975344','20:16:48'),(105,'passenger@gmail.com','717022','20:18:57'),(106,'passenger1@gmail.com','137650','20:23:13'),(107,'passenger1@gmail.com','269649','23:02:12'),(108,'passenger1@gmail.com','822301','20:02:12'),(109,'passenger1@gmail.com','920596','21:40:13'),(110,'passenger1@gmail.com','962448','21:45:51'),(111,'passenger1@gmail.com','250251','21:50:07'),(112,'passenger1@gmail.com','778428','22:00:25'),(113,'passenger1@gmail.com','325707','22:01:19'),(114,'passenger1@gmail.com','296922','23:29:17'),(115,'passenger1@gmail.com','864974','16:24:04'),(116,'passenger1@gmail.com','668990','16:27:18'),(117,'passenger1@gmail.com','379501','16:36:23'),(118,'passenger1@gmail.com','447782','16:46:56'),(119,'passenger1@gmail.com','822844','16:49:57'),(120,'passenger1@gmail.com','697732','16:54:28'),(121,'passenger1@gmail.com','311581','17:04:27'),(122,'passenger1@gmail.com','427072','17:05:34'),(123,'passenger1@gmail.com','522951','17:06:02'),(124,'passenger1@gmail.com','966976','17:10:11'),(125,'passenger1@gmail.com','338789','17:10:52'),(126,'user@gmail.com','919945','17:11:44'),(127,'user@gmail.com','788311','20:19:17'),(128,'driver2@gmail.com','951467','20:48:53'),(129,'user@gmail.com','276364','21:27:10'),(130,'driver2@gmail.com','870707','21:41:54'),(131,'driver2@gmail.com','208638','14:46:03'),(132,'user@gmail.com','923924','21:23:37'),(133,'user@gmail.com','568338','21:24:11'),(134,'user@gmail.com','317800','21:38:56'),(135,'driver2@gmail.com','993957','22:53:19'),(136,'user@gmail.com','628837','13:06:57'),(137,'driver2@gmail.com','434904','13:08:46'),(138,'user@gmail.com','267517','17:48:52'),(139,'user@gmail.com','615984','17:49:38'),(140,'user@gmail.com','775013','17:50:37'),(141,'user@gmail.com','268511','17:51:27'),(142,'dummy2@gmail.com','597267','17:52:55'),(143,'driver5@gmail.com','502644','22:49:47'),(144,'driver5@gmail.com','459807','22:55:04'),(145,'shreyas1234gurav@gmail.com','473224','23:01:23'),(146,'driver2@gmail.com','946807','19:59:44'),(147,'driver2@gmail.com','865600','20:03:07'),(148,'driver2@gmail.com','538783','20:15:29'),(149,'driver2@gmail.com','459014','20:26:56'),(150,'driver2@gmail.com','461050','20:28:04'),(151,'driver2@gmail.com','398922','20:34:43'),(152,'driver2@gmail.com','286676','20:50:55'),(153,'user@gmail.com','919005','18:34:44'),(154,'driver4@gmail.com','317031','20:14:17'),(155,'driver2@gmail.com','846642','20:19:01'),(156,'driver2@gmail.com','377123','20:19:56'),(157,'driver2@gmail.com','563536','20:27:03'),(158,'driver2@gmail.com','141887','20:28:50'),(159,'driver2@gmail.com','105971','21:51:41'),(160,'driver2@gmail.com','742042','21:53:51'),(161,'driver2@gmail.com','971703','21:59:54'),(162,'driver4@gmail.com','645089','22:01:52'),(163,'driver2@gmail.com','335424','22:05:06'),(164,'driver2@gmail.com','380327','22:11:39'),(165,'driver2@gmail.com','220840','19:50:07'),(166,'driver2@gmail.com','963898','20:11:14'),(167,'driver2@gmail.com','841080','22:07:41'),(168,'passenger5@gmail.com','313126','22:09:21'),(169,'passenger5@gmail.com','760152','22:09:54'),(170,'passenger5@gmail.com','660177','20:18:07'),(171,'passenger5@gmail.com','392733','21:37:53'),(172,'passenger5@gmail.com','977361','20:08:16'),(173,'driver2@gmail.com','318939','21:35:12'),(174,'driver2@gmail.com','618827','19:58:01'),(175,'passenger5@gmail.com','518344','19:57:12'),(176,'driver2@gmail.com','584188','21:39:31'),(177,'driver2@gmail.com','179700','21:31:57'),(178,'passenger5@gmail.com','796319','21:45:15'),(179,'driver2@gmail.com','603953','21:49:01'),(180,'passenger5@gmail.com','888971','21:50:21'),(181,'passenger5@gmail.com','642057','13:30:45'),(182,'passenger5@gmail.com','435509','14:36:19'),(183,'passenger5@gmail.com','543098','19:50:15'),(184,'shreyas@gmail.com','262473','19:14:08'),(185,'shreyas@gmail.com','961926','19:22:23'),(186,'shreyas@gmail.com','518796','19:31:52'),(187,'shreyas@gmail.com','956469','19:50:23'),(188,'admin@gmail.com','523203','20:07:54'),(189,'admin@gmail.com','586399','20:08:43'),(190,'driver2@gmail.com','960888','20:32:35'),(191,'shreyas@gmail.com','425360','20:41:44'),(192,'driver2@gmail.com','523980','13:31:13'),(193,'passenger5@gmail.com','186525','13:37:54'),(194,'passenger5@gmail.com','601638','13:55:48'),(195,'driver2@gmail.com','406162','13:56:16'),(196,'shreyas@gmail.com','377089','22:27:21'),(197,'driver2@gmail.com','231083','20:09:11'),(198,'passenger5@gmail.com','856826','20:10:51'),(199,'passenger5@gmail.com','180539','21:38:04');
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
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `profile_img` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`pid`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passengers`
--

LOCK TABLES `passengers` WRITE;
/*!40000 ALTER TABLE `passengers` DISABLE KEYS */;
INSERT INTO `passengers` VALUES (3,11,'Shreyas Gurav','user@gmail.com','454544545454','https://ik.imagekit.io/TriptoServices/Home/Tripto/passengers/11_passengerProfileIMG_g17zF0HHw.jpg'),(4,12,'Passenger 5','passenger5@gmail.com','2353665657','https://ik.imagekit.io/TriptoServices/Home/Tripto/passengers/12_passengerProfileIMG_nL3hMfQTV.jpg'),(5,13,'Shreyas Gurav','shreyas@gmail.com','8888888888',NULL),(6,14,'Admin','admin@gmail.com','8888888888',NULL);
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
-- Table structure for table `trip_status`
--

DROP TABLE IF EXISTS `trip_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trip_status` (
  `trip_status` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trip_status`
--

LOCK TABLES `trip_status` WRITE;
/*!40000 ALTER TABLE `trip_status` DISABLE KEYS */;
INSERT INTO `trip_status` VALUES (0,'Pending'),(1,'Accepted'),(2,'Completed');
/*!40000 ALTER TABLE `trip_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trip_type`
--

DROP TABLE IF EXISTS `trip_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trip_type` (
  `trip_type` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trip_type`
--

LOCK TABLES `trip_type` WRITE;
/*!40000 ALTER TABLE `trip_type` DISABLE KEYS */;
INSERT INTO `trip_type` VALUES (1,'One Way Trip'),(2,'Round Trip');
/*!40000 ALTER TABLE `trip_type` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Shreyas Gurav','dummy2@gmail.com','35554654',3),(4,'Driver2','driver2@gmail.com','466456456',3),(5,'Driver 3','driver3@gmail.com','543545',3),(6,'Driver 4','driver4@gmail.com','6565656565',3),(11,'Shreyas Gurav','user@gmail.com','454544545454',2),(12,'Passenger 5','passenger5@gmail.com','2353665657',2),(13,'Shreyas Gurav','shreyas@gmail.com','8888888888',2),(14,'Admin','admin@gmail.com','8888888888',1);
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

-- Dump completed on 2024-09-27 22:58:51
