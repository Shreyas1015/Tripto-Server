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

module.exports = router;
