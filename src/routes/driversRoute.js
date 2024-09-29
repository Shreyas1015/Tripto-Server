const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  driversDocumentUpload,
  drivers_document_auth,
  fetchParticularDocStatus,
  fetchDocumentLink,
  fetchProfileData,
  updateProfile,
  sendProfileUpdateEmailVerification,
  uploadProfileImage,
  fetchProfileIMG,
  uploadCarDetails,
  fetchCarDetails,
  handleTotalDocs,
  fetchDocLinks,
  fetchDcdID,
  fetchBookingsDetails,
  fetchParticularBookingsDetails,
  driverAcceptBooking,
  fetchBookingsDataTable,
} = require("../controllers/driversController");
const router = express.Router();

router.post("/document_upload", authenticateToken, driversDocumentUpload);
router.get(
  "/drivers_document_auth",
  drivers_document_auth,
  drivers_document_auth
);
router.post(
  "/fetchParticularDocStatus",
  authenticateToken,
  fetchParticularDocStatus
);
router.post("/fetchDocumentLink", authenticateToken, fetchDocumentLink);
router.post("/fetchProfileData", authenticateToken, fetchProfileData);
router.post("/updateProfile", authenticateToken, updateProfile);
router.post(
  "/sendProfileUpdateEmailVerification",
  authenticateToken,
  sendProfileUpdateEmailVerification
);

router.post("/uploadProfileImage", authenticateToken, uploadProfileImage);
router.post("/fetchProfileIMG", authenticateToken, fetchProfileIMG);
router.post("/uploadCarDetails", authenticateToken, uploadCarDetails);
router.post("/fetchCarDetails", authenticateToken, fetchCarDetails);
router.post("/handleTotalDocs", authenticateToken, handleTotalDocs);
router.post("/fetchDocLinks", authenticateToken, fetchDocLinks);
router.post("/fetchDcdID", authenticateToken, fetchDcdID);
router.post("/fetchBookingsDetails", authenticateToken, fetchBookingsDetails);
router.post(
  "/fetchParticularBookingsDetails",
  authenticateToken,
  fetchParticularBookingsDetails
);
router.post("/driverAcceptBooking", authenticateToken, driverAcceptBooking);
router.post(
  "/fetchBookingsDataTable",
  authenticateToken,
  fetchBookingsDataTable
);

module.exports = router;
