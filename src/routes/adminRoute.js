const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  fetchAllDriversList,
  fetchAdminParticularDriverDocuments,
  handleDocumentStatusChange,
  handleAllDocsStatus,
  getPassengerStats,
  fetchPassengers,
  exportPassengersData,

  updatePassengerStatus,
  getPassengerDetails,
  deletePassenger,
  getAllPassengerTrips,
  updateTripStatus,
  deleteTrip,
  getAllDrivers,
  updateDriverStatus,
  deleteDriver,
} = require("../controllers/adminController");
const router = express.Router();

router.post("/fetchAllDriversList", authenticateToken, fetchAllDriversList);
router.post(
  "/fetchAdminParticularDriverDocuments",
  authenticateToken,
  fetchAdminParticularDriverDocuments
);
router.post(
  "/handleDocumentStatusChange",
  authenticateToken,
  handleDocumentStatusChange
);
router.post("/handleAllDocsStatus", authenticateToken, handleAllDocsStatus);
router.post("/getPassengerStats", authenticateToken, getPassengerStats);
router.post("/fetchPassengers", authenticateToken, fetchPassengers);
router.post("/exportPassengersData", authenticateToken, exportPassengersData);
router.post("/updatePassengerStatus", authenticateToken, updatePassengerStatus);
router.post("/getPassengerDetails", authenticateToken, getPassengerDetails);
router.post("/getAllPassengerTrips", authenticateToken, getAllPassengerTrips);
router.post("/updateTripStatus", authenticateToken, updateTripStatus);
router.post("/deleteTrip", authenticateToken, deleteTrip);
router.post("/getAllDrivers", authenticateToken, getAllDrivers);
router.post("/updateDriverStatus", authenticateToken, updateDriverStatus);
router.post("/deleteDriver", authenticateToken, deleteDriver);
router.delete("/deleteAdminPassenger", authenticateToken, deletePassenger);

module.exports = router;
