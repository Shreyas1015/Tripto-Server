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

const fetchAllVendorsList = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const query = `select * from users as u join vendors as v on v.uid = u.uid`;
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

const fetchAdminParticularVendorDocuments = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { vendorId } = req.body;

    const query = `select * from users as u join vendors as v on v.uid = u.uid where v.vid = ?`;
    connection.query(query, vendorId, (err, result) => {
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

const handleAllVendorDocsStatus = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { vendorId, newStatus } = req.body;

    const updateQuery = `UPDATE vendors SET all_documents_status = ? WHERE vid = ?`;
    connection.query(updateQuery, [newStatus, vendorId], (err, result) => {
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

const handleVendorDocumentStatusChange = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { documentKey, newStatus, reason, vendorId } = req.body;
    console.log(req.body);

    // Mapping function
    function getRejectReasonColumn(documentKey) {
      const mapping = {
        aadharFrontStatus: "aadharFrontRejectReason",
        aadharBackStatus: "aadharBackRejectReason",
        panCardFrontStatus: "panCardFrontRejectReason",
        profilePhotoStatus: "profilePhotoRejectReason",
        udyamAadharStatus: "udyamAadharRejectReason",
        ghumastaLicenseStatus: "ghumastaLicenseRejectReason",
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

    const selectQuery = `SELECT * FROM users AS u JOIN vendors AS v ON v.uid = u.uid WHERE v.vid = ?`;
    connection.query(selectQuery, [vendorId], (err, result) => {
      if (err) {
        console.error("Internal Server Error", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        if (result.length === 0) {
          res.status(404).json({ error: "Vendor not found" });
        } else {
          const updateQuery = `UPDATE vendors SET ?? = ?, ?? = ?, ?? = NOW() WHERE vid = ?`;
          connection.query(
            updateQuery,
            [
              documentKey,
              newStatus,
              rejectReasonColumn,
              reason,
              reasonUpdatedAtColumn,
              vendorId,
            ],
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error("Internal Server Error", updateErr);
                res.status(500).json({ error: "Internal Server Error" });
              } else {
                const fetchUpdatedRowQuery = `SELECT * FROM vendors WHERE vid = ?`;
                connection.query(
                  fetchUpdatedRowQuery,
                  [vendorId],
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

const getAllPassengerTrips = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const query =
      "SELECT b.*, p.* FROM bookings AS b JOIN passengers AS p ON p.uid = b.uid";
    connection.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching passenger trip details:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Passenger Trips not found" });
      }

      res.status(200).json(result);
    });
  });
});

const getAllDrivers = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const query =
      "SELECT d.*, u.name AS driver_name, u.phone_number, u.user_status, u.created_at, u.email, dcd.car_name, dcd.model_year, dcd.car_number, dcd.car_type, dcd.submit_status, GROUP_CONCAT(DISTINCT CONCAT('Rating: ', dr.rating, ' - ', dr.review) ORDER BY dr.created_at DESC SEPARATOR ' | ') AS reviews FROM drivers d LEFT JOIN users u ON d.uid = u.uid LEFT JOIN ( SELECT DISTINCT dcd_id, uid, car_name, model_year, car_number, car_type, submit_status FROM drivers_car_details ) dcd ON d.uid = dcd.uid LEFT JOIN driver_reviews dr ON d.did = dr.did GROUP BY d.did, dcd.dcd_id, dcd.car_name, dcd.model_year, dcd.car_number, dcd.car_type, dcd.submit_status; ";
    connection.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching drivers  details:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Driver Details not found" });
      }

      res.status(200).json(result);
    });
  });
});

const getAllVendors = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const query =
      "SELECT v.* , u.name AS vendor_name, u.phone_number, u.user_status, u.created_at, u.email FROM vendors v JOIN users u ON v.uid = u.uid";
    connection.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching vendor  details:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "vendor Details not found" });
      }

      res.status(200).json(result);
    });
  });
});

const updateTripStatus = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, bid, trip_status } = req.body;
    console.log("Received from admin update status :", bid, trip_status); // Log the received UID
    const query = "update bookings set trip_status = ? where bid = ?";
    connection.query(query, [trip_status, bid], (err, result) => {
      if (err) {
        console.error("Error updating trip status:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.status(200).json({ message: "Trip status updated successfully" });
    });
  });
});

const updateDriverStatus = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, user_status } = req.body;

    console.log(
      "Received from admin update status :",
      decryptedUID,
      user_status
    ); // Log the received UID
    const query = "update users set user_status = ? where uid = ?";
    connection.query(query, [user_status, decryptedUID], (err, result) => {
      if (err) {
        console.error("Error updating user status:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.status(200).json({ message: "User status updated successfully" });
    });
  });
});

const getVendorFleetStats = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const query =
      "WITH revenue_trend AS ( SELECT DATE(created_at) AS revenue_date, SUM(amount) AS daily_revenue FROM transactions WHERE status = 1 GROUP BY revenue_date ORDER BY revenue_date DESC ) SELECT (SELECT COUNT(*) FROM vendors) AS totalVendors, (SELECT COUNT(*) FROM vendors WHERE all_documents_status = 1) AS activeVendors, (SELECT COUNT(*) FROM vendors WHERE all_documents_status = 0) AS pendingVendors, (SELECT COUNT(*) FROM bookings WHERE vid IS NOT NULL) AS totalBookings, (SELECT SUM(amount) FROM transactions WHERE status = 1) AS totalRevenue, (SELECT ((daily_revenue - LAG(daily_revenue) OVER (ORDER BY revenue_date)) / NULLIF(LAG(daily_revenue) OVER (ORDER BY revenue_date), 0)) * 100 FROM revenue_trend LIMIT 1) AS revenueChange";
    connection.query(query, (err, result) => {
      if (err) {
        console.error("Error updating user status:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.status(200).json(result);
    });
  });
});

const deleteTrip = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, bid } = req.body;
    console.log("Received from admin delete status :", bid); // Log the received UID
    const query = "DELETE FROM bookings where bid = ?";
    connection.query(query, [bid], (err, result) => {
      if (err) {
        console.error("Error deleting trip:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.status(200).json({ message: "Trip deleted successfully" });
    });
  });
});

const deleteDriver = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, driver_uid } = req.body;

    if (!decryptedUID) {
      return res
        .status(400)
        .json({ error: "Invalid request. UID is required." });
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error starting transaction:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const queries = [
        "DELETE FROM driver_reviews WHERE did IN (SELECT did FROM drivers WHERE uid = ?)",
        "DELETE FROM drivers_car_details WHERE uid = ?",
        "DELETE FROM drivers WHERE uid = ?",
        "DELETE FROM users WHERE uid = ?",
      ];

      const executeQuery = (index) => {
        if (index >= queries.length) {
          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                console.error("Transaction commit failed:", err);
                res.status(500).json({ error: "Internal Server Error" });
              });
            }
            res.status(200).json({ message: "Driver deleted successfully" });
          });
          return;
        }

        connection.query(queries[index], [driver_uid], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Error executing query:", err);
              res.status(500).json({ error: "Internal Server Error" });
            });
          }
          executeQuery(index + 1);
        });
      };

      executeQuery(0);
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
};
