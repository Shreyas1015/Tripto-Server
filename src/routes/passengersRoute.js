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
  checkDriverAssignment,
  cancelBooking,
  getCurrentRide,
  completeRide,
  rateDriver,
  getTripStatus,
  setRideStartOtp,
  verifyPaymentOtp,
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
router.post(
  "/fetchProfileIMG",
  authenticateToken,
  authenticateToken,
  fetchProfileIMG
);
router.post("/handleOneWayTrip", authenticateToken, handleOneWayTrip);
router.post("/handleRoundTrip", authenticateToken, handleRoundTrip);
router.post("/fetchPID", authenticateToken, fetchPID);
router.post(
  "/fetchBookingsDataTable",
  authenticateToken,
  fetchBookingsDataTable
);
router.post("/checkDriverAssignment", authenticateToken, checkDriverAssignment);
router.post("/cancelBooking", authenticateToken, cancelBooking);
router.post("/getCurrentRide", authenticateToken, getCurrentRide);
router.post("/setRideStartOtp", authenticateToken, setRideStartOtp);
router.post("/completeRide", authenticateToken, completeRide);
router.post("/rateDriver", authenticateToken, rateDriver);
router.post("/getTripStatus", authenticateToken, getTripStatus);
router.post("/verifyPaymentOtp", authenticateToken, verifyPaymentOtp);

module.exports = router;
