require("dotenv").config();
const nodemailer = require("nodemailer");
const asyncHand = require("express-async-handler");
const connection = require("../config/dbConfig");
const ImageKit = require("imagekit");
const { authenticateUser } = require("../middlewares/authMiddleware");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  // logger: true,
  secureConnection: false,
  auth: {
    user: process.env.TRANSPORTER_EMAIL,
    pass: process.env.TRANSPORTER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: process.env.TRANSPORTER_EMAIL,
    to: email,
    subject: "Email Verification OTP",
    text: `Your OTP for email verification is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
  console.log(
    "Email verification OTP sent to mail:",
    email,
    "and the OTP is:",
    otp
  );
}

async function sendOTPPhone(phone, otp) {
  // Implement code to send the OTP via SMS (not provided here)
  console.log(
    "Phone verification OTP sent to phone:",
    phone,
    "and the OTP is:",
    otp
  );
}

const imagekit = new ImageKit({
  publicKey: "public_ytabO1+xt+yMhICKtVeVGbWi/u8=",
  privateKey: "private_b65RyEF/ud3utxYKAJ8mvx7BWSw=",
  urlEndpoint: "https://ik.imagekit.io/TriptoServices",
});

const passenger_document_auth = asyncHand((req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    console.log("Authentication Parameters:", authenticationParameters);
    res.json(authenticationParameters);
  } catch (error) {
    console.error("Error generating authentication parameters:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const fetchProfileData = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    const searchQuery = "Select * from users where uid = ?";
    connection.query(searchQuery, decryptedUID, (err, result) => {
      if (err) {
        console.error(`Error executing query ${err}`);
        res.status(500).json({ error: "Server Error" });
      } else {
        if (result.length === 0) {
          res.status(404).json({ message: "No such user found." });
        } else {
          let data = result[0];
          console.log("Profle Data Fetched");
          res.status(200).json(data);
        }
      }
    });
  });
});

const updateProfile = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const formData = req.body;
    console.log("FormData.uid :", formData.uid);

    const updateQuery =
      "UPDATE users SET name = ?, email = ?, phone_number = ? WHERE uid = ?";
    const updateValues = [
      formData.name,
      formData.email,
      formData.phone_number,
      formData.uid,
    ];

    connection.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        console.error(`Error updating profile: ${err}`);
        return res.status(500).json({ error: "Server Error" });
      }

      if (formData.user_type == 2) {
        const updatePassengerQuery =
          "UPDATE passengers SET name = ?, email = ?, phone_number = ? WHERE uid = ?";
        const updatePassengerValues = [
          formData.name,
          formData.email,
          formData.phone_number,
          formData.uid,
        ];

        connection.query(updatePassengerQuery, updatePassengerValues, (err) => {
          if (err) {
            console.error(`Error updating passenger profile: ${err}`);
            return res.status(500).json({ error: "Server Error" });
          }

          console.log("Profile updated: ", result);
          return res
            .status(200)
            .json({ message: "Profile Updated Successfully" });
        });
      } else {
        console.log("Profile updated: ", result);
        return res
          .status(200)
          .json({ message: "Profile Updated Successfully" });
      }
    });
  });
});

const sendProfileUpdateEmailVerification = asyncHand(async (req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;
    const otp = generateOTP();

    try {
      const selectQuery = "SELECT email FROM users WHERE uid = ?";
      connection.query(
        selectQuery,
        [decryptedUID],
        (selectErr, selectResult) => {
          if (selectErr) {
            console.error("Error fetching user email:", selectErr);
            return res.status(500).json({ success: false, email: null });
          }

          const email = selectResult[0].email;

          connection.query(
            "INSERT INTO email_verification_otps (email, otp, created_at) VALUES (?, ?, NOW())",
            [email, otp],
            (insertErr) => {
              if (insertErr) {
                console.error(
                  "Error saving email OTP to the database:",
                  insertErr
                );
                return res.status(500).json({ success: false, email: null });
              }

              sendOTPEmail(email, otp);
              res.status(200).json({ success: true, email });
            }
          );
        }
      );
    } catch (error) {
      console.error("Error sending email verification code:", error);
      res.status(500).json({ success: false, email: null });
    }
  });
});

const fetchProfileIMG = asyncHand(async (req, res) => {
  try {
    await authenticateUser(req, res);
    const { decryptedUID } = req.body;

    const query = "SELECT profile_img FROM passengers WHERE uid = ?";
    connection.query(query, [decryptedUID], (err, result) => {
      if (err) {
        console.error(`Failed to execute ${query}`, err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Profile image not found" });
      }

      console.log("Image link fetched", result[0].profile_img);
      res.status(200).json({ link: result[0] });
    });
  } catch (error) {
    console.error("Error fetching profile image:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const uploadProfileImage = asyncHand(async (req, res) => {
  authenticateUser(req, res, () => {
    const { formData, decryptedUID } = req.body;
    console.log("Image link to be uploaded in the db : ", formData.profile_img);
    const checkUidQuery =
      "SELECT COUNT(*) AS count FROM passengers WHERE uid = ?";
    connection.query(
      checkUidQuery,
      [decryptedUID],
      (checkUidErr, checkUidResult) => {
        if (checkUidErr) {
          console.error("Internal Server error: ", checkUidErr);
          return res.status(500).json({ error: "Internal Server error" });
        }

        const uidExists = checkUidResult[0].count > 0;

        if (uidExists) {
          const updateQuery =
            "UPDATE passengers SET profile_img = ? WHERE uid = ?";
          connection.query(
            updateQuery,
            [formData.profile_img, decryptedUID],
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error("Internal Server error: ", updateErr);
                return res.status(500).json({ error: "Internal Server error" });
              }

              console.log("Profile Img Updated");
              res.status(200).json({ message: "Profile Img Updated" });
            }
          );
        } else {
          const insertQuery =
            "INSERT INTO passengers (uid, profile_img) VALUES (?, ?)";
          connection.query(
            insertQuery,
            [decryptedUID, formData.profile_img],
            (insertErr, insertResult) => {
              if (insertErr) {
                console.error("Internal Server error: ", insertErr);
                return res.status(500).json({ error: "Internal Server error" });
              }

              console.log("Profile Img Inserted");
              res.status(200).json({ message: "Profile Img Inserted" });
            }
          );
        }
      }
    );
  });
});

const handleOneWayTrip = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { formData, decryptedUID } = req.body;

    const values = [
      decryptedUID,
      formData.pid,
      formData.pickup_location,
      formData.drop_location,
      formData.pickup_date_time,
      formData.distance,
      formData.selected_car,
      formData.price,
    ];
    const query =
      "INSERT INTO bookings (uid,pid,pickup_location,drop_location,pickup_date_time,trip_type,distance,selected_car,price) VALUES (?,?,?,?,?,1,?,?,?) ";
    connection.query(query, values, (err, result) => {
      if (err) {
        console.error(
          `Error executing MySQL Query for adding one way trip: ${err}`
        );

        return res.status(500).json({ error: "Server Error" });
      } else {
        console.log("Trip booked Successfully");
        res
          .status(200)
          .json({ message: "Trip Booked Successfully", bid: result.insertId });
      }
    });
  });
});

const handleRoundTrip = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { formData, decryptedUID } = req.body;

    const values = [
      decryptedUID,
      formData.pid,
      formData.pickup_location,
      formData.drop_location,
      formData.pickup_date_time,
      formData.return_date_time,
      formData.distance,
      formData.selected_car,
      formData.price,
      formData.no_of_days,
    ];

    const query =
      "INSERT INTO bookings (uid,pid,pickup_location,drop_location,pickup_date_time,drop_date_time,trip_type,distance,selected_car,price,no_of_days) VALUES (?,?,?,?,?,?,2,?,?,?,?)";
    connection.query(query, values, (err, result) => {
      if (err) {
        console.error(
          `Error executing MySQL Query for adding one way trip: ${err}`
        );
        return res.status(500).json({ error: "Server Error" });
      } else {
        console.log("Trip booked Successfully");
        res.status(200).json({ message: "Trip Booked Successfully" });
      }
    });
  });
});

const fetchPID = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    const query = "Select pid from passengers where uid = ?";
    connection.query(query, decryptedUID, (err, result) => {
      if (err) {
        console.error("Internal Server Error", err);

        res.status(500).json({ error: "Internal Server Error" });
      } else {
        console.log("PID : ", result[0].pid);
        res.status(200).json(result[0].pid);
      }
    });
  });
});

const fetchBookingsDataTable = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    const query = `
      SELECT bookings.*, users.name, users.email, users.phone_number 
      FROM bookings 
      JOIN users ON bookings.uid = users.uid 
      WHERE bookings.uid = ? 
      ORDER BY bookings.bid DESC
    `;
    connection.query(query, decryptedUID, (err, result) => {
      if (err) {
        console.error("Internal Server Error", err);

        res.status(500).json({ error: "Internal Server Error" });
      } else {
        console.log("Bookings Data : ", result);
        res.status(200).json(result);
      }
    });
  });
});

const checkDriverAssignment = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, bookingId } = req.body;
    console.log("Checking driver assignment for booking:", bookingId);

    const query = `
      SELECT 
        users.name AS driver_name, 
        users.phone_number AS driver_phone, 
        drivers_car_details.car_number AS car_license_plate, 
        drivers_car_details.car_name AS car_model, 
        bookings.trip_status AS booking_status 
      FROM bookings
      JOIN drivers ON bookings.did = drivers.did
      JOIN users ON drivers.uid = users.uid
      JOIN drivers_car_details ON drivers.dcd_id = drivers_car_details.dcd_id
      WHERE bookings.uid = ? 
        AND bookings.bid = ? 
        AND bookings.trip_status = 1
    `;

    connection.query(query, [decryptedUID, bookingId], (err, result) => {
      if (err) {
        console.error("Error checking driver assignment:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length === 0) {
        console.log("No driver assigned for booking:", bookingId);
        return res.status(200).json({ driverAssigned: false });
      }

      const rideDetails = {
        driverName: result[0].driver_name,
        driverPhone: result[0].driver_phone,
        carLicensePlate: result[0].car_license_plate,
        carModel: result[0].car_model,
        bookingStatus: result[0].booking_status,
      };

      console.log("Driver assigned:", rideDetails);
      res.status(200).json({ driverAssigned: true, rideDetails });
    });
  });
});

const cancelBooking = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, bookingId, reason } = req.body;

    if (!decryptedUID || !bookingId || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the booking exists and belongs to the user
    const checkBookingQuery = `
      SELECT bid, uid, trip_status FROM bookings WHERE bid = ? AND uid = ?
    `;

    connection.query(
      checkBookingQuery,
      [bookingId, decryptedUID],
      (err, results) => {
        if (err) {
          console.error("Error checking booking:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "Booking not found" });
        }

        const booking = results[0];

        // Check if the booking is already completed or canceled
        if (booking.trip_status === 2) {
          return res
            .status(400)
            .json({ error: "Booking is already completed" });
        }
        if (booking.trip_status === 3 || booking.trip_status === 4) {
          return res.status(400).json({ error: "Booking is already canceled" });
        }

        // Update the booking status to 'Cancelled By Passenger' (status = 3)
        const cancelBookingQuery = `
        UPDATE bookings SET trip_status = 3 WHERE bid = ? AND uid = ?
      `;

        connection.query(
          cancelBookingQuery,
          [bookingId, decryptedUID],
          (updateErr) => {
            if (updateErr) {
              console.error("Error canceling booking:", updateErr);
              return res.status(500).json({ error: "Internal Server Error" });
            }

            console.log(
              `Booking ID ${bookingId} canceled by user ${decryptedUID}`
            );

            res.status(200).json({ message: "Booking canceled successfully" });
          }
        );
      }
    );
  });
});

const getCurrentRide = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    if (!decryptedUID) {
      return res.status(400).json({ message: "UID is required" });
    }

    const query = `
    SELECT * FROM bookings 
    WHERE uid = ? AND trip_status = 1 
    ORDER BY pickup_date_time DESC 
    LIMIT 1
  `;

    connection.query(query, [decryptedUID], (err, results) => {
      if (err) {
        console.error("Error fetching ride:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No active ride found" });
      }

      const ride = results[0];
      return res.status(200).json(ride);
    });
  });
});

const setRideOtp = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, rideId, otp } = req.body;
    console.log("Ride OTP: ", otp);
    if (!decryptedUID || !rideId || !otp) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const query = `
    UPDATE bookings 
    SET ride_otp = ? 
    WHERE bid = ? AND uid = ?
  `;

    connection.query(query, [otp, rideId, decryptedUID], (err, result) => {
      if (err) {
        console.error("Error setting OTP:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      return res.status(200).json({ message: "OTP set successfully" });
    });
  });
});

const verifyRideOtp = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, rideId, enteredOtp } = req.body;

    if (!decryptedUID || !rideId || !enteredOtp) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const selectQuery = `
    SELECT ride_otp FROM bookings 
    WHERE bid = ? AND uid = ?
  `;

    connection.query(selectQuery, [rideId, decryptedUID], (err, results) => {
      if (err) {
        console.error("Error fetching ride OTP:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Ride not found" });
      }

      const dbOtp = results[0].ride_otp;

      if (Number(dbOtp) === Number(enteredOtp)) {
        // OTP matches, update ride status
        const updateQuery = `
        UPDATE bookings 
        SET trip_status = 2 
        WHERE bid = ? AND uid = ?
      `;

        connection.query(updateQuery, [rideId, decryptedUID], (updateErr) => {
          if (updateErr) {
            console.error("Error updating trip status:", updateErr);
            return res.status(500).json({ message: "Internal server error" });
          }

          return res
            .status(200)
            .json({ message: "OTP verified. Ride started." });
        });
      } else {
        return res.status(401).json({ message: "Invalid OTP" });
      }
    });
  });
});

const startRide = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, rideId } = req.body;

    if (!decryptedUID || !rideId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if ride exists
    const selectQuery = `
    SELECT bid, trip_status 
    FROM bookings 
    WHERE bid = ? AND uid = ?
  `;

    connection.query(selectQuery, [rideId, decryptedUID], (err, results) => {
      if (err) {
        console.error("Error checking ride:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Ride not found" });
      }

      const currentStatus = results[0].trip_status;

      // Prevent starting if already started/completed/cancelled
      if (currentStatus === 2) {
        return res.status(400).json({ message: "Ride already completed" });
      }
      if (currentStatus === 3) {
        return res.status(400).json({ message: "Ride cancelled by passenger" });
      }
      if (currentStatus === 4) {
        return res.status(400).json({ message: "Ride cancelled by driver" });
      }
      if (currentStatus === 5) {
        return res.status(400).json({ message: "Ride already started" });
      }

      // Update ride to Started (status = 5)
      const updateQuery = `
      UPDATE bookings 
      SET trip_status = 5 
      WHERE bid = ? AND uid = ?
    `;

      connection.query(updateQuery, [rideId, decryptedUID], (updateErr) => {
        if (updateErr) {
          console.error("Error updating ride status:", updateErr);
          return res.status(500).json({ message: "Error starting ride" });
        }

        return res
          .status(200)
          .json({ message: "Ride started successfully", status: 5 });
      });
    });
  });
});

const completeRide = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, rideId } = req.body;

    if (!decryptedUID || !rideId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if ride exists
    const selectQuery = `
      SELECT bid, trip_status 
      FROM bookings 
      WHERE bid = ? AND uid = ?
    `;

    connection.query(selectQuery, [rideId, decryptedUID], (err, results) => {
      if (err) {
        console.error("Error checking ride:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Ride not found" });
      }

      const currentStatus = results[0].trip_status;

      // Only allow completion if ride has started
      if (currentStatus !== 5) {
        return res
          .status(400)
          .json({ message: "Ride not in progress. Cannot complete." });
      }

      // Update ride to Completed (status = 2)
      const updateQuery = `
        UPDATE bookings 
        SET trip_status = 2, drop_date_time = NOW() 
        WHERE bid = ? AND uid = ?
      `;

      connection.query(updateQuery, [rideId, decryptedUID], (updateErr) => {
        if (updateErr) {
          console.error("Error updating ride status:", updateErr);
          return res.status(500).json({ message: "Error completing ride" });
        }

        return res
          .status(200)
          .json({ message: "Ride completed successfully", status: 2 });
      });
    });
  });
});

const rateDriver = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, rideId, driverId, rating, review } = req.body;

    // Validation
    if (!decryptedUID || !rideId || !driverId || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      // Insert review
      const insertReviewQuery = `
      INSERT INTO driver_reviews (bid, did, uid, rating, review)
      VALUES (?, ?, ?, ?, ?)
    `;

      connection.query(insertReviewQuery, [
        rideId,
        driverId,
        decryptedUID,
        rating,
        review,
      ]);

      res.status(200).json({ message: "Review submitted successfully" });
    } catch (error) {
      console.error("Error inserting review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});

module.exports = {
  passenger_document_auth,
  fetchProfileData,
  updateProfile,
  sendProfileUpdateEmailVerification,
  fetchProfileIMG,
  uploadProfileImage,
  handleOneWayTrip,
  handleRoundTrip,
  fetchPID,
  fetchBookingsDataTable,
  checkDriverAssignment,
  cancelBooking,
  getCurrentRide,
  setRideOtp,
  completeRide,
  startRide,
  verifyRideOtp,
  rateDriver,
};
