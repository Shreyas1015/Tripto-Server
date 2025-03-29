require("dotenv").config();
const nodemailer = require("nodemailer");
const { Parser } = require("json2csv");
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

    const reasonUpdatedAtColumn = `${documentKey.replace(
      "Status",
      "Reason_updated_at"
    )}`;

    const selectQuery = `SELECT * FROM users AS u JOIN drivers AS d ON d.uid = u.uid WHERE d.did = ?`;
    connection.query(selectQuery, [driverId], (err, result) => {
      if (err) {
        console.error("Internal Server Error", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        if (result.length === 0) {
          res.status(404).json({ error: "Driver not found" });
        } else {
          const updateQuery = `UPDATE drivers SET ?? = ?, ?? = ?, ?? = NOW() WHERE did = ?`;
          connection.query(
            updateQuery,
            [
              documentKey,
              newStatus,
              rejectReasonColumn,
              reason,
              reasonUpdatedAtColumn,
              driverId,
            ],
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error("Internal Server Error", updateErr);
                res.status(500).json({ error: "Internal Server Error" });
              } else {
                const fetchUpdatedRowQuery = `SELECT * FROM drivers WHERE did = ?`;
                connection.query(
                  fetchUpdatedRowQuery,
                  [driverId],
                  (fetchErr, fetchResult) => {
                    if (fetchErr) {
                      console.error("Internal Server Error", fetchErr);
                      res.status(500).json({ error: "Internal Server Error" });
                    } else {
                      console.log("Updated Row:", fetchResult);
                      res.status(200).json({
                        message: "Document status updated successfully",
                        updatedRow: fetchResult,
                      });
                    }
                  }
                );
              }
            }
          );
        }
      }
    });
  });
});

const getPassengerStats = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE user_type = 2) AS total,
        (SELECT COUNT(*) FROM users WHERE user_status = 0 and user_type = 2 ) AS active,
        (SELECT COUNT(*) FROM users WHERE user_status = 1 and user_type = 2 ) AS inactive,
        (SELECT COUNT(*) FROM users WHERE user_status = 2 and user_type = 2 ) AS suspended
    `;

    connection.query(statsQuery, (err, result) => {
      if (err) {
        console.error("Error fetching passenger stats:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.status(200).json(result[0]);
    });
  });
});

const fetchPassengers = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { page = 1, limit = 20, status } = req.body;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.*, p.*
      FROM users u
      LEFT JOIN passengers p ON u.uid = p.uid
      WHERE u.user_type = 2
    `;

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM users u
      LEFT JOIN passengers p ON u.uid = p.uid
      WHERE u.user_type = 2
    `;

    let queryValues = [];
    let countValues = [];

    // Debugging input parameters
    console.log("Received Input:", { page, limit, status, offset });

    // Filter based on user_status (0 = active, 1 = inactive, 2 = suspended)
    if (status !== undefined && status !== null) {
      query += " AND u.user_status = ?";
      countQuery += " AND u.user_status = ?";
      queryValues.push(status);
      countValues.push(status);
    }

    query += " LIMIT ? OFFSET ?";
    queryValues.push(limit, offset);

    // Debugging SQL queries
    console.log("Executing Query:", query, "with values:", queryValues);
    console.log(
      "Executing Count Query:",
      countQuery,
      "with values:",
      countValues
    );

    connection.query(query, queryValues, (err, result) => {
      if (err) {
        console.error("Error fetching passengers:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Count total passengers (separate queryValues for countQuery)
      connection.query(countQuery, countValues, (countErr, countResult) => {
        if (countErr) {
          console.error("Error fetching passenger count:", countErr);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(200).json({
          passengers: result,
          totalPages: Math.ceil(countResult[0].total / limit),
        });
      });
    });
  });
});

const exportPassengersData = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { status } = req.body;

    let query = "SELECT * FROM users WHERE user_type = 2";
    let values = [];

    // Handle user_status filter (0 = active, 1 = inactive, 2 = suspended)
    if (status !== undefined) {
      query += " AND user_status = ?";
      values.push(status);
    }

    connection.query(query, values, (err, result) => {
      if (err) {
        console.error("Error exporting data:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "No data available" });
      }

      const parser = new Parser();
      const csv = parser.parse(result);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=passengers.csv`
      );
      res.status(200).send(csv);
    });
  });
});

const deletePassenger = asyncHand((req, res) => {
  console.log("deletePassenger endpoint hit"); // Log when the endpoint is hit

  authenticateUser(req, res, () => {
    const { decryptedUID, passengerUID } = req.body; // Get UID from the request body
    console.log("Received decryptedUID:", decryptedUID); // Log the received UID

    if (!decryptedUID) {
      console.error("Error: User ID is missing");
      return res.status(400).json({ error: "User ID is required" });
    }

    // Delete from passengers table first
    const deletePassengerQuery = "DELETE FROM passengers WHERE uid = ?";
    console.log(
      "Executing query:",
      deletePassengerQuery,
      "with UID:",
      passengerUID
    );

    connection.query(deletePassengerQuery, [passengerUID], (err, result) => {
      if (err) {
        console.error("Error deleting from passengers table:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      console.log("Passengers table delete result:", result);

      // Delete from users table
      const deleteUserQuery =
        "DELETE FROM users WHERE uid = ? AND user_type = 2";
      console.log(
        "Executing query:",
        deleteUserQuery,
        "with UID:",
        passengerUID
      );

      connection.query(deleteUserQuery, [passengerUID], (err, result) => {
        if (err) {
          console.error("Error deleting from users table:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        console.log("Users table delete result:", result);

        if (result.affectedRows === 0) {
          console.warn("No user found with the given UID");
          return res.status(404).json({ error: "Passenger not found" });
        }

        console.log("Passenger deleted successfully");
        res.status(200).json({ message: "Passenger deleted successfully" });
      });
    });
  });
});

const updatePassengerStatus = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, status } = req.body; // Use decryptedUID instead of passengerId

    if (!decryptedUID || status === undefined) {
      return res.status(400).json({ error: "User ID and status are required" });
    }

    // Convert status string to corresponding numerical value
    let statusValue;
    switch (status) {
      case "active":
        statusValue = 0;
        break;
      case "inactive":
        statusValue = 1;
        break;
      case "suspended":
        statusValue = 2;
        break;
      default:
        return res.status(400).json({ error: "Invalid status provided" });
    }

    // Update user_status in users table
    const query =
      "UPDATE users SET user_status = ? WHERE uid = ? AND user_type = 2";
    connection.query(query, [statusValue, decryptedUID], (err, result) => {
      if (err) {
        console.error("Error updating passenger status:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Passenger not found" });
      }

      res
        .status(200)
        .json({ message: "Passenger status updated successfully" });
    });
  });
});

const getPassengerDetails = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { passengerId } = req.body;

    if (!passengerId) {
      return res.status(400).json({ error: "Decrypted ID is required" });
    }

    const query =
      "SELECT p.*,u.*  FROM passengers as p join users as u on u.uid = p.uid WHERE pid = ?";
    connection.query(query, [passengerId], (err, result) => {
      if (err) {
        console.error("Error fetching passenger details:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Passenger not found" });
      }

      res.status(200).json(result[0]);
    });
  });
});

module.exports = {
  fetchAllDriversList,
  fetchAdminParticularDriverDocuments,
  handleDocumentStatusChange,
  handleAllDocsStatus,
  getPassengerStats,
  fetchPassengers,
  exportPassengersData,
  deletePassenger,
  updatePassengerStatus,
  getPassengerDetails,
};
