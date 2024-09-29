const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  fetchProfileData,
  passenger_document_auth,
  updateProfile,
  sendProfileUpdateEmailVerification,
  uploadProfileImage,
  fetchProfileIMG,
  handleOneWayTrip,
  handleRoundTrip,
  fetchPID,
  fetchBookingsDataTable,
} = require("../controllers/passengersController");

const router = express.Router();

router.post("/fetchProfileData", authenticateToken, fetchProfileData);
router.get("/passenger_document_auth", passenger_document_auth);
router.post("/updateProfile", authenticateToken, updateProfile);
router.post(
  "/sendProfileUpdateEmailVerification",
  authenticateToken,
  sendProfileUpdateEmailVerification
);

router.post("/uploadProfileImage", authenticateToken, uploadProfileImage);
router.post("/fetchProfileIMG", authenticateToken, fetchProfileIMG);
router.post("/handleOneWayTrip", authenticateToken, handleOneWayTrip);
router.post("/handleRoundTrip", authenticateToken, handleRoundTrip);
router.post("/fetchPID", authenticateToken, fetchPID);
router.post(
  "/fetchBookingsDataTable",
  authenticateToken,
  fetchBookingsDataTable
);

module.exports = router;
