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
    subject: "Email Verification - TRIPTO TOURS",
    text: `Dear Valued Customer,

Thank you for choosing TRIPTO TOURS. To ensure the security of your account and complete the email verification process, please use the One-Time Password (OTP) provided below:

🔐 OTP: ${otp}

This OTP is valid for the next 10 minutes. Please do not share this code with anyone, including TRIPTO TOURS representatives. 

If you did not initiate this request or believe this message was sent to you in error, please disregard this email. No further action is required on your part. 

For assistance or inquiries, feel free to contact our support team at support@triptotours.com. 

We look forward to helping you explore new destinations and making your travel experiences seamless and memorable.

Best regards,  
The TRIPTO TOURS Team  
https://www.tripto-web.vercel.app  
Contact: +1-XXX-XXX-XXXX`,
  };

  await transporter.sendMail(mailOptions);
  console.log(
    `Verification OTP has been successfully sent to: ${email}. OTP: ${otp}`
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

const vendor_document_auth = asyncHand((req, res) => {
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

    const searchQuery =
      "Select u.*,v.firm_name from users as u join vendors as v on v.uid = u.uid where u.uid = ?";
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

const fetchProfileIMG = asyncHand(async (req, res) => {
  try {
    const { decryptedUID } = req.body;

    const query = "SELECT profilePhoto FROM vendors WHERE uid = ?";
    connection.query(query, [decryptedUID], (err, result) => {
      if (err) {
        console.error(`Failed to execute ${query}`, err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Profile image not found" });
      }

      console.log("Image link fetched", result[0].profilePhoto);
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
    const checkUidQuery = "SELECT COUNT(*) AS count FROM vendors WHERE uid = ?";
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
            "UPDATE vendors SET profile_img = ? WHERE uid = ?";
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
            "INSERT INTO vendors (uid, profile_img) VALUES (?, ?)";
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

const updateProfile = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const formData = req.body.profileData;
    console.log("Profile Data to be updated: ", formData);

    // Update users table first
    const updateUserQuery = `
      UPDATE users 
      SET name = ?, email = ?, phone_number = ? 
      WHERE uid = ?;
    `;
    const updateUserValues = [
      formData.name,
      formData.email,
      formData.phone_number,
      formData.uid,
    ];

    connection.query(updateUserQuery, updateUserValues, (err, userResult) => {
      if (err) {
        console.error(`Error updating user profile: ${err}`);
        return res.status(500).json({ error: "Server Error" });
      }

      // Update vendors table after updating users
      const updateVendorQuery = `
        UPDATE vendors 
        SET name = ?, email = ?, phone_number = ?, firm_name = ?
        WHERE uid = ?;
      `;
      const updateVendorValues = [
        formData.name,
        formData.email,
        formData.phone_number,
        formData.firm_name,
        formData.uid,
      ];

      connection.query(
        updateVendorQuery,
        updateVendorValues,
        (err, vendorResult) => {
          if (err) {
            console.error(`Error updating vendor profile: ${err}`);
            return res.status(500).json({ error: "Server Error" });
          }

          console.log("Profile updated successfully.");
          return res
            .status(200)
            .json({ message: "Profile Updated Successfully" });
        }
      );
    });
  });
});

const fetchParticularDocStatus = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;
    console.log("Start with the query");
    const query = `
      SELECT aadharFrontStatus, aadharBackStatus, panCardFrontStatus, udyamAadharStatus, ghumastaLicenseStatus, profilePhotoStatus, all_documents_status, 
             aadharFrontRejectReason, aadharBackRejectReason, panCardFrontRejectReason, profilePhotoRejectReason, udyamAadharRejectReason, ghumastaLicenseRejectReason, 
             aadharFront_updated_at, aadharBack_updated_at, panCardFront_updated_at, profilePhoto_updated_at, udyamAadhar_updated_at, ghumastaLicense_updated_at, 
             aadharFrontReason_updated_at, aadharBackReason_updated_at, panCardFrontReason_updated_at, profilePhotoReason_updated_at, udyamAadharReason_updated_at, ghumastaLicenseReason_updated_at
      FROM vendors
      WHERE uid = ?
    `;

    connection.query(query, [decryptedUID], (err, result) => {
      if (err) {
        console.error("Internal Server error:", err);
        return res.status(500).json({ error: "Internal Server error" }); // ✅ return added
      }

      if (result.length > 0) {
        console.log("Doc Status :", result[0]);
        return res.status(200).json(result[0]); // ✅ return added
      } else {
        return res
          .status(404)
          .json({ message: "Status indicators not found for the given UID" }); // ✅ return added
      }
    });
  });
});

const fetchDocLinks = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;
    console.log(decryptedUID);
    const query = "select * from vendors where uid = ?";
    connection.query(query, [decryptedUID], (err, result) => {
      if (err) {
        console.error("Fetch Doc Links Error: ", err);
        return res.status(500).json({ error: "Server Error" });
      } else {
        res.status(200).json(result[0]);
      }
    });
  });
});

const documentUpload = asyncHand(async (req, res) => {
  authenticateUser(req, res, () => {
    const formData = req.body.formData;
    const uid = formData.uid;

    // Define document fields
    const documentFields = [
      "aadharFront",
      "aadharBack",
      "panCardFront",
      "profilePhoto",
      "udyamAadhar",
      "ghumastaLicense",
    ];

    // Check if vendor exists
    const selectQuery = "SELECT * FROM vendors WHERE uid = ?";
    connection.query(selectQuery, [uid], (selectErr, selectResult) => {
      if (selectErr) {
        console.error("Error fetching vendor data:", selectErr);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (selectResult.length === 0) {
        // First-time insert
        const insertFields = [];
        const insertValues = [];
        const placeholders = [];

        Object.keys(formData).forEach((key) => {
          if (formData[key] !== null) {
            insertFields.push(key);
            insertValues.push(formData[key]);
            placeholders.push("?");

            // Add updated timestamp for document fields
            if (documentFields.includes(key)) {
              insertFields.push(`${key}_updated_at`);
              placeholders.push("NOW()");
            }
          }
        });

        const insertQuery = `
          INSERT INTO vendors (${insertFields.join(", ")})
          VALUES (${placeholders.join(", ")})
        `;

        connection.query(
          insertQuery,
          insertValues,
          (insertErr, insertResult) => {
            if (insertErr) {
              console.error("Error inserting vendor documents:", insertErr);
              return res.status(500).json({ message: "Internal Server Error" });
            }
            res
              .status(200)
              .json({ message: "Documents Uploaded Successfully" });
          }
        );
      } else {
        // Vendor exists - update rejected documents only
        const vendor = selectResult[0];
        const updateFields = [];
        const updateValues = [];

        documentFields.forEach((field) => {
          const statusField = `${field}Status`;
          const reasonField = `${field}RejectReason`;

          if (formData[field] && vendor[statusField] === 2) {
            updateFields.push(
              `${field} = ?, ${statusField} = 0, ${reasonField} = NULL, ${field}_updated_at = NOW()`
            );
            updateValues.push(formData[field]);
          }
        });

        if (updateFields.length === 0) {
          return res
            .status(400)
            .json({ message: "No rejected documents found for update" });
        }

        updateValues.push(uid);

        const updateQuery = `
          UPDATE vendors
          SET ${updateFields.join(", ")}
          WHERE uid = ?
        `;

        connection.query(
          updateQuery,
          updateValues,
          (updateErr, updateResult) => {
            if (updateErr) {
              console.error("Error updating vendor documents:", updateErr);
              return res.status(500).json({ message: "Internal Server Error" });
            }
            res.status(200).json({ message: "Documents Updated Successfully" });
          }
        );
      }
    });
  });
});

const fetchVID = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    const query = "Select vid from vendors where uid = ?";
    connection.query(query, decryptedUID, (err, result) => {
      if (err) {
        console.error("Internal Server Error", err);

        res.status(500).json({ error: "Internal Server Error" });
      } else {
        console.log("VID : ", result[0].vid);
        res.status(200).json(result[0].vid);
      }
    });
  });
});

const handleOneWayTrip = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { formData, decryptedUID } = req.body;

    const values = [
      decryptedUID,
      formData.vid,
      formData.pickup_location,
      formData.drop_location,
      formData.pickup_date_time,
      formData.distance,
      formData.selected_car,
      formData.price,
      formData.passenger_name,
      formData.passenger_phone,
      formData.passenger_email
    ];
    const query =
      "INSERT INTO bookings (uid,vid,pickup_location,drop_location,pickup_date_time,trip_type,distance,selected_car,price,passenger_name,passenger_phone,passenger_email) VALUES (?,?,?,?,?,1,?,?,?,?,?,?) ";
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

const handleRoundTrip = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { formData, decryptedUID } = req.body;

    const values = [
      decryptedUID,
      formData.vid,
      formData.pickup_location,
      formData.drop_location,
      formData.pickup_date_time,
      formData.return_date_time,
      formData.distance,
      formData.selected_car,
      formData.price,
      formData.no_of_days,
      formData.passenger_name,
      formData.passenger_phone,
      formData.passenger_email
    ];

    const query =
      "INSERT INTO bookings (uid,vid,pickup_location,drop_location,pickup_date_time,drop_date_time,trip_type,distance,selected_car,price,no_of_days,passenger_name,passenger_phone, passenger_email) VALUES (?,?,?,?,?,?,2,?,?,?,?,?,?,?) ";
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

const fetchVendorBookingsData = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    if (!decryptedUID) {
      return res.status(400).json({ error: "Vendor ID is required" });
    }

    const query = `SELECT b.*, u.name AS driver_name FROM bookings b LEFT JOIN drivers d ON b.did = d.did LEFT JOIN users u ON d.uid = u.uid WHERE b.uid = ? order by b.bid DESC`;

    connection.query(query, [decryptedUID], (err, results) => {
      if (err) {
        console.error("Error fetching vendor bookings:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }


      res.status(200).json(results);
    });
  });
});

const fetchVendorIncomeData = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    if (!decryptedUID) {
      return res.status(400).json({ error: "Vendor ID is required" });
    }

    const query = `SELECT 'weekly' AS period, DATE_FORMAT(created_at, '%Y-%u') AS week, SUM(amount) AS total_income FROM transactions GROUP BY week UNION ALL SELECT 'monthly' AS period, DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(amount) AS total_income FROM transactions GROUP BY month UNION ALL SELECT 'yearly' AS period, DATE_FORMAT(created_at, '%Y') AS year, SUM(amount) AS total_income FROM transactions GROUP BY year`;

    connection.query(query, [decryptedUID], (err, results) => {
      if (err) {
        console.error("Error fetching vendor bookings:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.status(200).json(results);
    });
  });
});

const fetchVendorBookingStatusData = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    if (!decryptedUID) {
      return res.status(400).json({ error: "Vendor ID is required" });
    }

    const query = `SELECT SUM(CASE WHEN trip_status = 2 THEN 1 ELSE 0 END) AS completed_bookings, SUM(CASE WHEN trip_status = 0 THEN 1 ELSE 0 END) AS pending_bookings, SUM(CASE WHEN trip_status = 3 THEN 1 ELSE 0 END) AS cancelled_by_passenger, SUM(CASE WHEN trip_status = 4 THEN 1 ELSE 0 END) AS cancelled_by_driver FROM bookings WHERE uid = ? `;

    connection.query(query, [decryptedUID], (err, results) => {
      if (err) {
        console.error("Error fetching vendor bookings:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.status(200).json(results);
    });
  });
});

const fetchVendorDriverData = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    if (!decryptedUID) {
      return res.status(400).json({ error: "Vendor ID is required" });
    }

    const query = `SELECT b.bid, b.did, u.name AS driver_name, u.phone_number AS driver_phone, dcd.car_name, dcd.car_number, dcd.car_type FROM bookings b JOIN drivers d ON b.did = d.did JOIN users u ON d.uid = u.uid JOIN drivers_car_details dcd ON d.uid = dcd.uid WHERE b.uid = ? AND b.trip_status IN (1, 2, 5) `;

    connection.query(query, [decryptedUID], (err, results) => {
      if (err) {
        console.error("Error fetching vendor bookings:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.status(200).json(results);
    });
  });
});

module.exports = {
  vendor_document_auth,
  fetchProfileData,
  fetchProfileIMG,
  uploadProfileImage,
  sendProfileUpdateEmailVerification,
  updateProfile,
  fetchParticularDocStatus,
  fetchDocLinks,
  fetchVID,
  documentUpload,
  handleRoundTrip,
  handleOneWayTrip,
  fetchVendorBookingsData,
  fetchVendorIncomeData,
  fetchVendorBookingStatusData,
  fetchVendorDriverData,
};
