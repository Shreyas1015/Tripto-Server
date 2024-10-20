require("dotenv").config();
const nodemailer = require("nodemailer");
const asyncHand = require("express-async-handler");
const connection = require("../config/dbConfig");
const ImageKit = require("imagekit");
const { authenticateUser } = require("../middlewares/authMiddleware");

const fetchAllDriversList = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const query = `select * from users as u join drivers as d on d.uid = u.uid`;
    connection.query(query, (err, result) => {
      if (err) {
        console.error("Internal Server Error", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(200).json(result);
      }
    });
  });
});

const fetchAdminParticularDriverDocuments = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { driverId } = req.body;

    const query = `select * from users as u join drivers as d on d.uid = u.uid where d.did = ?`;
    connection.query(query, driverId, (err, result) => {
      if (err) {
        console.error("Internal Server Error", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        console.log(result);
        res.status(200).json(result);
      }
    });
  });
});

const handleAllDocsStatus = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { driverId, newStatus } = req.body;

    const updateQuery = `UPDATE drivers SET all_documents_status = ? WHERE did = ?`;
    connection.query(updateQuery, [newStatus, driverId], (err, result) => {
      if (err) {
        console.error("Internal Server Error", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        console.log("Updated all_documents_status:", result);
        const statusToSend = newStatus === 1 ? 1 : 2;
        res.status(200).json({
          message: "All documents status updated successfully",
          status: statusToSend,
        });
      }
    });
  });
});

const handleDocumentStatusChange = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { documentKey, newStatus, reason, driverId } = req.body;
    console.log(req.body);

    // Mapping function
    function getRejectReasonColumn(documentKey) {
      const mapping = {
        aadharFrontStatus: "aadharFrontRejectReason",
        aadharBackStatus: "aadharBackRejectReason",
        panCardFrontStatus: "panCardFrontRejectReason",
        selfieStatus: "selfieRejectReason",
        passbookOrChequeStatus: "passbookOrChequeRejectReason",
        rcStatus: "rcRejectReason",
        pucStatus: "pucRejectReason",
        insuranceStatus: "insuranceRejectReason",
        permitStatus: "permitRejectReason",
        fitnessCertificateStatus: "fitnessCertificateRejectReason",
        taxReceiptStatus: "taxReceiptRejectReason",
        drivingLicenseFrontStatus: "drivingLicenseFrontRejectReason",
        drivingLicenseBackStatus: "drivingLicenseBackRejectReason",
      };
      return mapping[documentKey];
    }

    // Validate input
    if (!documentKey) {
      return res.status(400).json({ error: "documentKey is required" });
    }

    const rejectReasonColumn = getRejectReasonColumn(documentKey);
    if (!rejectReasonColumn) {
      return res.status(400).json({ error: "Invalid documentKey" });
    }

    const selectQuery = `SELECT * FROM users AS u JOIN drivers AS d ON d.uid = u.uid WHERE d.did = ?`;
    connection.query(selectQuery, [driverId], (err, result) => {
      if (err) {
        console.error("Internal Server Error", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        if (result.length === 0) {
          res.status(404).json({ error: "Driver not found" });
        } else {
          const updateQuery = `UPDATE drivers SET ?? = ?, ?? = ?, reason_updated_at = NOW() WHERE did = ?`;
          connection.query(
            updateQuery,
            [documentKey, newStatus, rejectReasonColumn, reason, driverId],
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error("Internal Server Error", updateErr);
                res.status(500).json({ error: "Internal Server Error" });
              } else {
                console.log(updateResult);
                res
                  .status(200)
                  .json({ message: "Document status updated successfully" });
              }
            }
          );
        }
      }
    });
  });
});

module.exports = {
  fetchAllDriversList,
  fetchAdminParticularDriverDocuments,
  handleDocumentStatusChange,
  handleAllDocsStatus,
};
