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

const getVendorFleetStats = asyncHand(async (req, res) => {
  authenticateUser(req, res, async () => {
    const { timeRange } = req.body;

    // Valid time range mapping
    const validRanges = {
      day: "DAY",
      week: "WEEK",
      month: "MONTH",
      year: "YEAR",
    };

    if (!validRanges[timeRange]) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    console.log("🔍 [DEBUG] Selected Time Range:", timeRange);

    // Adjust interval
    const interval = validRanges[timeRange];

    // SQL Queries
    const vendorQuery = `SELECT COUNT(DISTINCT v.vid) as totalVendors, 
                                COUNT(DISTINCT CASE WHEN u.user_status = 0 THEN v.vid END) as activeVendors,
                                COUNT(DISTINCT CASE WHEN u.user_status = 1 THEN v.vid END) as inactiveVendors,
                                COUNT(DISTINCT CASE WHEN u.user_status = 2 THEN v.vid END) as suspendedVendors
                         FROM vendors v 
                         JOIN users u ON v.uid = u.uid 
                         WHERE u.user_type = 4`;

    const pendingVendorQuery = `SELECT COUNT(DISTINCT u.uid) as pendingVendors 
                                FROM users u 
                                WHERE u.user_type = 4 AND u.user_status = 0`;

    const bookingQuery = `SELECT COUNT(DISTINCT b.bid) as totalBookings 
                          FROM bookings b 
                          WHERE b.vid IS NOT NULL 
                          AND b.pickup_date_time >= DATE_SUB(CURDATE(), INTERVAL 1 ${interval})`;

    const revenueQuery = `SELECT SUM(t.amount) as totalRevenue 
                          FROM transactions t 
                          JOIN bookings b ON t.bid = b.bid 
                          WHERE b.vid IS NOT NULL 
                          AND b.pickup_date_time >= DATE_SUB(CURDATE(), INTERVAL 1 ${interval})`;

    const prevRevenueQuery = `SELECT SUM(t.amount) as prevRevenue 
                              FROM transactions t 
                              JOIN bookings b ON t.bid = b.bid 
                              WHERE b.vid IS NOT NULL 
                              AND b.pickup_date_time BETWEEN DATE_SUB(CURDATE(), INTERVAL 2 ${interval}) 
                              AND DATE_SUB(CURDATE(), INTERVAL 1 ${interval})`;

    const prevBookingQuery = `SELECT COUNT(DISTINCT b.bid) as prevBookings 
                              FROM bookings b 
                              WHERE b.vid IS NOT NULL 
                              AND b.pickup_date_time BETWEEN DATE_SUB(CURDATE(), INTERVAL 2 ${interval}) 
                              AND DATE_SUB(CURDATE(), INTERVAL 1 ${interval})`;

    const documentQuery = `SELECT 
        COUNT(CASE WHEN aadharFrontStatus = 1 AND aadharBackStatus = 1 AND panCardFrontStatus = 1 
        AND profilePhotoStatus = 1 AND udyamAadharStatus = 1 AND ghumastaLicenseStatus = 1 THEN 1 END) as verified,
        COUNT(CASE WHEN aadharFrontStatus = 0 OR aadharBackStatus = 0 OR panCardFrontStatus = 0 
        OR profilePhotoStatus = 0 OR udyamAadharStatus = 0 OR ghumastaLicenseStatus = 0 THEN 1 END) as pending,
        COUNT(CASE WHEN aadharFrontStatus = 2 OR aadharBackStatus = 2 OR panCardFrontStatus = 2 
        OR profilePhotoStatus = 2 OR udyamAadharStatus = 2 OR ghumastaLicenseStatus = 2 THEN 1 END) as rejected
        FROM vendors`;

    try {
      // Execute queries
      connection.query(vendorQuery, (err, vendorStats) => {
        if (err) throw err;

        connection.query(pendingVendorQuery, (err, pendingVendorStats) => {
          if (err) throw err;

          connection.query(bookingQuery, (err, bookingStats) => {
            if (err) throw err;

            connection.query(revenueQuery, (err, revenueStats) => {
              if (err) throw err;

              connection.query(prevRevenueQuery, (err, prevRevenueStats) => {
                if (err) throw err;

                connection.query(prevBookingQuery, (err, prevBookingStats) => {
                  if (err) throw err;

                  connection.query(documentQuery, (err, documentStats) => {
                    if (err) throw err;

                    // Process results
                    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
                    const prevRevenue = prevRevenueStats[0]?.prevRevenue || 0;
                    const revenueChange =
                      prevRevenue > 0
                        ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
                        : 0;

                    const prevBookings = prevBookingStats[0]?.prevBookings || 0;
                    const totalBookings = bookingStats[0]?.totalBookings || 0;
                    const bookingsChange =
                      prevBookings > 0
                        ? ((totalBookings - prevBookings) / prevBookings) * 100
                        : 0;

                    // Construct response
                    const stats = {
                      totalVendors: vendorStats[0]?.totalVendors || 0,
                      activeVendors: vendorStats[0]?.activeVendors || 0,
                      inactiveVendors: vendorStats[0]?.inactiveVendors || 0,
                      suspendedVendors: vendorStats[0]?.suspendedVendors || 0,
                      pendingVendors: pendingVendorStats[0]?.pendingVendors || 0,
                      totalBookings,
                      totalRevenue,
                      revenueChange: parseFloat(revenueChange.toFixed(2)),
                      bookingsChange: parseFloat(bookingsChange.toFixed(2)),
                      verified: documentStats[0]?.verified || 0,
                      pending: documentStats[0]?.pending || 0,
                      rejected: documentStats[0]?.rejected || 0,
                    };

                    console.log("📊 [DEBUG] Final Stats Response:", stats);
                    res.status(200).json([stats]); // Sending as array to match frontend expectation
                  });
                });
              });
            });
          });
        });
      });
    } catch (error) {
      console.error("❌ [ERROR]:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
});

const getPaymentMethodDistribution = asyncHand(async (req, res) => {
  authenticateUser(req, res, async () => {
    const { timeRange } = req.body;

    // Define valid time ranges
    const validRanges = {
      day: "DAY",
      week: "WEEK",
      month: "MONTH",
      year: "YEAR",
    };

    if (!validRanges[timeRange]) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    console.log("🔍 [DEBUG] Selected Time Range:", timeRange);

    const interval = validRanges[timeRange];

    // ✅ Fixed Query: Fetch transactions with vid NOT NULL
    const paymentQuery = `
      SELECT 
        CASE 
          WHEN t.payment_mode = 1 THEN 'Cash' 
          WHEN t.payment_mode = 2 THEN 'UPI' 
          WHEN t.payment_mode = 3 THEN 'Credit Card' 
          ELSE 'Other' 
        END AS name, 
        COUNT(t.txn_id) AS value
      FROM transactions t
      WHERE t.vid IS NOT NULL 
        AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 ${interval}) 
      GROUP BY t.payment_mode
    `;

    try {
      connection.query(paymentQuery, (err, results) => {
        if (err) {
          console.error("❌ [ERROR]:", err);
          return res.status(500).json({ message: "Failed to fetch payment method distribution" });
        }

        console.log("📊 [DEBUG] Vendor Payment Method Distribution:", results);
        res.status(200).json(results);
      });
    } catch (error) {
      console.error("❌ [ERROR]:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
});


const getTopVendors = asyncHand(async (req, res) => {
  authenticateUser(req, res, async () => {
    const { limit = 5 } = req.body; // Default limit is 5

    console.log("🔍 [DEBUG] Fetching top vendors...");

    // ✅ Query to get top vendors based on total revenue and booking count
    const query = `
      SELECT 
        v.vid,
        v.name,
        v.firm_name,
        v.profilePhoto,
        COUNT(t.txn_id) AS bookings,
        SUM(t.amount) AS revenue
      FROM transactions t
      JOIN vendors v ON t.vid = v.vid
      WHERE t.vid IS NOT NULL AND t.status = 1
      GROUP BY v.vid
      ORDER BY revenue DESC
      LIMIT ?;
    `;

    connection.query(query, [parseInt(limit)], (err, results) => {
      if (err) {
        console.error("❌ [ERROR]:", err);
        return res.status(500).json({ message: "Failed to fetch top vendors" });
      }

      console.log("📊 [DEBUG] Top Vendors:", results);
      res.status(200).json(results);
    });
  });
});

const getRecentVendorTransactions = asyncHand(async (req, res) => {
  authenticateUser(req, res, async () => {
    const { limit = 5 } = req.body; // Default limit is 5

    console.log("🔍 [DEBUG] Fetching recent vendor transactions...");

    // ✅ Query to fetch recent transactions for vendors
    const query = `
      SELECT 
        t.txn_id,
        v.vid,
        v.name AS vendor_name,
        v.firm_name AS vendor_firm,
        v.profilePhoto AS vendor_profile,
        t.bid,
        t.amount,
        t.payment_mode,
        t.created_at,
        t.status
      FROM transactions t
      JOIN vendors v ON t.vid = v.vid
      WHERE t.vid IS NOT NULL
      ORDER BY t.created_at DESC
      LIMIT ?;
    `;

    connection.query(query, [parseInt(limit)], (err, results) => {
      if (err) {
        console.error("❌ [ERROR]:", err);
        return res.status(500).json({ message: "Failed to fetch recent transactions" });
      }

      console.log("📊 [DEBUG] Recent Transactions:", results);
      res.status(200).json(results);
    });
  });
});




const getVendorBookingTrend = asyncHand(async (req, res) => {
  try {
    const { decryptedUID, timeRange } = req.body;

    // Validate timeRange
    const validRanges = {
      "day": "1 DAY",
      "week": "1 WEEK",
      "month": "1 MONTH",
      "year": "1 YEAR"
    };

    if (!validRanges[timeRange]) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    const interval = validRanges[timeRange];

    // SQL Query to fetch vendor booking trend
    const bookingTrendQuery = `
      SELECT DATE(b.pickup_date_time) AS bookingDate, COUNT(b.bid) AS totalBookings
      FROM bookings b
      WHERE b.vid is not null
      AND b.pickup_date_time >= DATE_SUB(CURDATE(), INTERVAL ${interval})
      GROUP BY bookingDate
      ORDER BY bookingDate ASC;
    `;

    connection.query(bookingTrendQuery, [decryptedUID], (err, results) => {
      if (err) {
        console.error("❌ [ERROR] Failed to fetch vendor booking trend:", err);
        return res.status(500).json({ message: "Failed to fetch booking trend" });
      }

      console.log("✅ [DEBUG] Booking Trend Data:", results);
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("❌ [ERROR]:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getVendorRevenueTrend = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { timeRange } = req.body;

    console.log(`Received request for vendor revenue trend`);
    console.log(`Time Range: ${timeRange}`);

    if (!timeRange) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Determine interval and date format
    let interval = "";
    let dateFormat = "";

    switch (timeRange.toLowerCase()) {
      case "day":
        interval = "DAY";
        dateFormat = "%Y-%m-%d"; // Format as Year-Month-Day
        break;
      case "week":
        interval = "WEEK";
        dateFormat = "%Y-%u"; // Format as Year-WeekNumber
        break;
      case "month":
        interval = "MONTH";
        dateFormat = "%Y-%m"; // Format as Year-Month
        break;
      case "year":
        interval = "YEAR";
        dateFormat = "%Y"; // Format as Year
        break;
      default:
        return res.status(400).json({ error: "Invalid time range provided" });
    }

    const query = `
      SELECT 
        DATE_FORMAT(t.created_at, '${dateFormat}') AS period, 
        SUM(t.amount) AS revenue
      FROM transactions t
      WHERE t.vid IS NOT NULL  -- Only consider vendor transactions
        AND t.created_at >= DATE_SUB(NOW(), INTERVAL 1 ${interval})
      GROUP BY period
      ORDER BY period ASC;
    `;

    connection.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching vendor revenue trend:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      console.log("Vendor Revenue Trend Data:", result);
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

const getFleetAllVendors = asyncHand(async (req, res) => {
  authenticateUser(req, res, async () => {
    console.log("🔍 [DEBUG] Fetching all vendors...");

    // ✅ Query to fetch all vendors with relevant details
    const query = `
      SELECT 
        v.vid,
        v.name,
        v.firm_name,
        v.profilePhoto,
        v.created_at,
        COUNT(b.bid) AS bookings,
        COALESCE(SUM(t.amount), 0) AS revenue,
        v.all_documents_status
      FROM vendors v
      LEFT JOIN bookings b ON v.vid = b.vid
      LEFT JOIN transactions t ON v.vid = t.vid
      GROUP BY v.vid
      ORDER BY v.created_at DESC;
    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error("❌ [ERROR]:", err);
        return res.status(500).json({ message: "Failed to fetch vendors list" });
      }

      console.log("📊 [DEBUG] Vendors List:", results);
      res.status(200).json(results);
    });
  });
});

const getDocumentVerificationStats = asyncHand(async (req, res) => {
  authenticateUser(req, res, async () => {
    console.log("🔍 [DEBUG] Fetching document verification stats...");

    // ✅ Query to count document verification statuses
    const query = `
      SELECT 
        COUNT(CASE WHEN all_documents_status = 1 THEN 1 END) AS verified,
        COUNT(CASE WHEN all_documents_status = 0 THEN 1 END) AS pending,
        COUNT(CASE WHEN all_documents_status = 2 THEN 1 END) AS rejected
      FROM vendors;
    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error("❌ [ERROR]:", err);
        return res.status(500).json({ message: "Failed to fetch document stats" });
      }

      const stats = results[0];

      // 🛠️ Convert values from string to numbers
      const formattedStats = {
        verified: Number(stats.verified) || 0,
        pending: Number(stats.pending) || 0,
        rejected: Number(stats.rejected) || 0,
      };

      console.log("📊 [DEBUG] Document Stats:", formattedStats);
      res.status(200).json(formattedStats);
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
  getVendorRevenueTrend,
  getVendorBookingTrend,
  getPaymentMethodDistribution,
  getTopVendors,
  getRecentVendorTransactions,
  getFleetAllVendors,
  getDocumentVerificationStats,
};
