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
  getAllVendors,
  fetchAdminParticularVendorDocuments,
  handleVendorDocumentStatusChange,
  handleAllVendorDocsStatus,
  fetchAllVendorsList,
  getVendorFleetStats,
  getVendorRevenueTrend,
  getVendorBookingTrend,
  getPaymentMethodDistribution,
  getTopVendors,
  getRecentVendorTransactions,
  getFleetAllVendors,
  getDocumentVerificationStats,
  fetchQuickStats,
  fetchTripData,
  fetchRevenueData,
  fetchCancellationData,
  fetchPaymentData,
  fetchAllTransactions,
  fetchAllWallets,
  fetchAllBookings,
} = require("../controllers/adminController");
const router = express.Router();

router.post("/fetchAllDriversList", authenticateToken, fetchAllDriversList);
router.post("/fetchAllTransactions", authenticateToken, fetchAllTransactions);
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
router.post("/fetchRevenueData", authenticateToken, fetchRevenueData);
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
router.post("/getAllVendors", authenticateToken, getAllVendors);
router.post("/getVendorFleetStats", authenticateToken, getVendorFleetStats);
router.post("/getVendorRevenueTrend", authenticateToken, getVendorRevenueTrend);
router.post(
  "/handleAllVendorDocsStatus",
  authenticateToken,
  handleAllVendorDocsStatus
);
router.post("/fetchAllVendorsList", authenticateToken, fetchAllVendorsList);
router.post("/getVendorBookingTrend", authenticateToken, getVendorBookingTrend);
router.post("/getPaymentMethodDistribution", authenticateToken, getPaymentMethodDistribution);
router.post("/getTopVendors", authenticateToken, getTopVendors);
router.post("/getRecentVendorTransactions", authenticateToken, getRecentVendorTransactions);
router.post("/getFleetAllVendors", authenticateToken, getFleetAllVendors);
router.post("/getDocumentVerificationStats", authenticateToken, getDocumentVerificationStats);
router.post("/fetchQuickStats", authenticateToken, fetchQuickStats);
router.post("/fetchTripData", authenticateToken, fetchTripData);
router.post("/fetchCancellationData", authenticateToken, fetchCancellationData);
router.post("/fetchPaymentData", authenticateToken, fetchPaymentData);
router.post("/fetchAllWallets", authenticateToken, fetchAllWallets);
router.post("/fetchAllBookings", authenticateToken, fetchAllBookings);

router.post(
  "/handleVendorDocumentStatusChange",
  authenticateToken,
  handleVendorDocumentStatusChange
);
router.post(
  "/fetchAdminParticularVendorDocuments",
  authenticateToken,
  fetchAdminParticularVendorDocuments
);
router.delete("/deleteAdminPassenger", authenticateToken, deletePassenger);

module.exports = router;
