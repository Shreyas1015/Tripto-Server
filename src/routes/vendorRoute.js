const express = require("express");
const {
  authenticateToken,
  authenticateUser,
} = require("../middlewares/authMiddleware");
const {
  vendor_document_auth,
  fetchProfileData,
  uploadProfileImage,
  updateProfile,
  fetchProfileIMG,
  sendProfileUpdateEmailVerification,
  fetchParticularDocStatus,
  fetchDocLinks,
  documentUpload,
  fetchVID,
  handleOneWayTrip,
  handleRoundTrip,
  fetchVendorBookingsData,
  fetchVendorBookingStatusData,
  fetchVendorIncomeData,
  fetchVendorDriverData,
} = require("../controllers/vendorController");

const router = express.Router();

router.get("/vendor_document_auth", vendor_document_auth);
router.post("/fetchProfileData", authenticateToken, fetchProfileData);
router.post("/uploadProfileImage", authenticateToken, uploadProfileImage);
router.post("/updateProfile", authenticateToken, updateProfile);
router.post(
  "/sendProfileUpdateEmailVerification",
  authenticateToken,
  sendProfileUpdateEmailVerification
);
router.post(
  "/fetchProfileIMG",
  authenticateToken,
  authenticateUser,
  fetchProfileIMG
);
router.post(
  "/fetchParticularDocStatus",
  authenticateToken,
  fetchParticularDocStatus
);
router.post("/fetchDocLinks", authenticateToken, fetchDocLinks);
router.post("/document_upload", authenticateToken, documentUpload);
router.post("/fetchVID", authenticateToken, fetchVID);
router.post("/handleOneWayTrip", authenticateToken, handleOneWayTrip);
router.post("/handleRoundTrip", authenticateToken, handleRoundTrip);
router.post(
  "/fetchVendorBookingsData",
  authenticateToken,
  fetchVendorBookingsData
);
router.post("/fetchVendorIncomeData", authenticateToken, fetchVendorIncomeData);
router.post(
  "/fetchVendorBookingStatusData",
  authenticateToken,
  fetchVendorBookingStatusData
);
router.post("/fetchVendorDriverData", authenticateToken, fetchVendorDriverData);

module.exports = router;
