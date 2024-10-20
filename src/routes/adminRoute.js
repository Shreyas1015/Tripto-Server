const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  fetchAllDriversList,
  fetchAdminParticularDriverDocuments,
  handleDocumentStatusChange,
  handleAllDocsStatus,
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

module.exports = router;
