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

const drivers_document_auth = asyncHand((req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    console.log("Authentication Parameters:", authenticationParameters);
    res.json(authenticationParameters);
  } catch (error) {
    console.error("Error generating authentication parameters:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const driversDocumentUpload = asyncHand(async (req, res) => {
  authenticateUser(req, res, () => {
    const formData = req.body.formData;

    // Define the list of fields that should have the corresponding _updated_at timestamp
    const documentFields = [
      "aadharFront",
      "aadharBack",
      "panCardFront",
      "selfie",
      "passbookOrCheque",
      "rc",
      "puc",
      "insurance",
      "permit",
      "fitnessCertificate",
      "taxReceipt",
      "drivingLicenseFront",
      "drivingLicenseBack",
    ];

    const selectQuery = "SELECT * FROM drivers WHERE uid = ?";
    connection.query(selectQuery, [formData.uid], (selectErr, selectResult) => {
      if (selectErr) {
        console.error(`Error in selecting data from the table: ${selectErr}`);
        res.status(500).json({ message: "Internal Server Error" });
      } else {
        if (selectResult.length > 0) {
          // Generate the update query fields
          const updateFields = Object.keys(formData)
            .filter((key) => formData[key] !== null)
            .map((key) => {
              // Check if the field is in the documentFields list and should have an _updated_at timestamp
              if (documentFields.includes(key)) {
                return `${key} = ?, ${key}_updated_at = NOW()`;
              }
              return `${key} = ?`;
            })
            .join(", ");

          // Update values excluding null values
          const updateValues = Object.values(formData).filter(
            (value) => value !== null
          );

          // Add the uid for the WHERE clause
          updateValues.push(formData.uid);

          const updateQuery = `
          UPDATE drivers
          SET ${updateFields}
          WHERE uid = ?
        `;

          connection.query(
            updateQuery,
            updateValues,
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error(
                  `Error in updating data in the table: ${updateErr}`
                );
                res.status(500).json({ message: "Internal Server Error" });
              } else {
                console.log(updateResult);
                console.log("Document Updated Successfully");
                res
                  .status(200)
                  .json({ message: "Document Updated Successfully" });
              }
            }
          );
        } else {
          // Insert new records, excluding _updated_at fields for uid and dcd_id
          const insertData = { ...formData };

          // Add _updated_at timestamps for the specific document fields
          const insertFields = [];
          const insertPlaceholders = [];
          const insertValues = [];

          for (const [key, value] of Object.entries(insertData)) {
            insertFields.push(key);
            insertPlaceholders.push("?");
            insertValues.push(value);

            // If the key is in the documentFields list, add an _updated_at field
            if (documentFields.includes(key)) {
              insertFields.push(`${key}_updated_at`);
              insertPlaceholders.push("NOW()");
            }
          }

          const insertQuery = `
            INSERT INTO drivers (${insertFields.join(", ")})
            VALUES (${insertPlaceholders.join(", ")})
          `;

          connection.query(
            insertQuery,
            insertValues,
            (insertErr, insertResult) => {
              if (insertErr) {
                console.error(
                  `Error in inserting data to the table: ${insertErr}`
                );
                res.status(500).json({ message: "Internal Server Error" });
              } else {
                console.log(insertResult);
                console.log("Documents Uploaded Successfully");
                res
                  .status(200)
                  .json({ message: "Documents Uploaded Successfully" });
              }
            }
          );
        }
      }
    });
  });
});

const fetchDocumentLink = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, documentType } = req.body;

    const searchQuery = "Select ? from drivers where uid = ?";

    connection.query(searchQuery, documentType, decryptedUID, (err, result) => {
      if (err) {
        console.error(`Error in searching for documents: ${err}`);
        res.status(500).json({ error: "Internal Server error" });
      } else {
        if (result.length == 0) {
          console.error("No Documents Found", err);
          res.status(404).json({ message: "No Document Found!" });
        } else {
          console.log("Document Link fetched");
          res.status(200).json({ link: result[0] });
        }
      }
    });
  });
});

const fetchParticularDocStatus = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    const query = `
      SELECT aadharFrontStatus, aadharBackStatus, panCardFrontStatus, selfieStatus, passbookOrChequeStatus, rcStatus, pucStatus, insuranceStatus, permitStatus, fitnessCertificateStatus, taxReceiptStatus, drivingLicenseFrontStatus, drivingLicenseBackStatus, all_documents_status, aadharFrontRejectReason, aadharBackRejectReason, panCardFrontRejectReason, selfieRejectReason, passbookOrChequeRejectReason, rcRejectReason, pucRejectReason, insuranceRejectReason, permitRejectReason, fitnessCertificateRejectReason, taxReceiptRejectReason, drivingLicenseFrontRejectReason, drivingLicenseBackRejectReason, aadharFront_updated_at, aadharBack_updated_at  , panCardFront_updated_at , selfie_updated_at   , passbookOrCheque_updated_at   , rc_updated_at      , puc_updated_at   , insurance_updated_at , permit_updated_at   , fitnessCertificate_updated_at  , taxReceipt_updated_at    , drivingLicenseFront_updated_at    , drivingLicenseBack_updated_at , aadharFrontReason_updated_at , aadharBackReason_updated_at , panCardFrontReason_updated_at , selfieReason_updated_at      , passbookOrChequeReason_updated_at , rcReason_updated_at      , pucReason_updated_at    , insuranceReason_updated_at , permitReason_updated_at     , fitnessCertificateReason_updated_at  , taxReceiptReason_updated_at    , drivingLicenseFrontReason_updated_at , drivingLicenseBackReason_updated_at 
      FROM drivers
      WHERE uid = ?
    `;

    connection.query(query, [decryptedUID], (err, result) => {
      if (err) {
        console.error("Internal Server error");
        res.status(500).json({ error: "Internal Server error" });
      }
      if (result.length > 0) {
        console.log("Doc Status :", result[0]);
        res.status(200).json(result[0]);
      } else {
        res
          .status(404)
          .json({ message: "Status indicators not found for the given UID" });
      }
    });
  });
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
      "UPDATE users SET email = ?, phone_number = ? WHERE uid = ?";
    const updateValues = [formData.email, formData.phone_number, formData.uid];

    connection.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        console.error(`Error updating profile: ${err}`);
        res.status(500).json({ error: "Server Error" });
      } else {
        console.log("Profile updated: ", result);
        res.status(200).json({ message: "Profile Updated Successfully" });
      }
    });
  });
});

const sendProfileUpdateEmailVerification = asyncHand(async (req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;
    const otp = generateOTP();

    try {
      // Fetch user's email using UID
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

const fetchProfileIMG = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    const query = "select profile_img from drivers where uid = ? ";
    connection.query(query, [decryptedUID], (err, result) => {
      if (err) {
        console.error(`Failed to execute ${query}`, err);
        res.status(500).json({ message: "Internal Server Error" });
      } else {
        console.log("Image link fetched", result[0]);
        res.status(200).json({ link: result[0] });
      }
    });
  });
});

const uploadProfileImage = asyncHand(async (req, res) => {
  authenticateUser(req, res, () => {
    const formData = req.body;

    const checkUidQuery = "SELECT COUNT(*) AS count FROM drivers WHERE uid = ?";
    connection.query(checkUidQuery, [UserID], (checkUidErr, checkUidResult) => {
      if (checkUidErr) {
        console.error("Internal Server error: ", checkUidErr);
        return res.status(500).json({ error: "Internal Server error" });
      }

      const uidExists = checkUidResult[0].count > 0;

      if (uidExists) {
        const updateQuery = "UPDATE drivers SET profile_img = ? WHERE uid = ?";
        connection.query(
          updateQuery,
          [formData.profile_img, UserID],
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
        // Insert a new record
        const insertQuery =
          "INSERT INTO drivers (uid, profile_img) VALUES (?, ?)";
        connection.query(
          insertQuery,
          [UserID, formData.profile_img],
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
    });
  });
});

const uploadCarDetails = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const formData = req.body.carDetails;

    const isValidCarNumberFormat = (carNumber) => {
      const carNumberRegex = /^[A-Za-z]{2}\d{2}[A-Za-z]{2}\d{4}$/;
      return carNumberRegex.test(carNumber);
    };

    const query = `
    INSERT INTO drivers_car_details (uid, car_name, model_year, car_number, car_type, submit_status)
    VALUES (?, ?, ?, ?, ?, 1)`;

    const values = [
      formData.uid,
      formData.car_name,
      formData.model_year,
      formData.car_number,
      formData.car_type,
    ];

    connection.query(query, values, (err, result) => {
      if (err) {
        console.error("Internal Server error: ", err);
        res.status(500).json({ error: "Internal Server error" });
      } else {
        // Validate car number format after checking for errors
        if (!isValidCarNumberFormat(formData.car_number)) {
          console.log("Invalid Car Number");
          res.status(400).json({ message: "Invalid car number format" });
        } else {
          console.log("Car Details Uploaded");
          res.status(200).json({
            message: "Car Details Uploaded",
            dcd_id: result.insertId,
            submit_status: result.submit_status,
          });
        }
      }
    });
  });
});

const fetchCarDetails = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    const query = "select * from drivers_car_details where uid = ?";
    connection.query(query, [decryptedUID], (err, result) => {
      if (err) {
        console.error(`Error in retrieving user details: ${err}`);
        res.status(500).json({ error: `Server Error: ${err}` });
      } else {
        if (result.length === 0) {
          res.status(404).json({ message: "No data found for this user." });
        } else {
          console.log("Car Details Fetched");
          res.status(200).json(result[0]);
        }
      }
    });
  });
});

const handleTotalDocs = asyncHand(async (req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;
    const queryVerified = ` SELECT COUNT(*) AS verified_documents FROM drivers WHERE uid = ? AND aadharFrontStatus = 1 or aadharBackStatus = 1 or panCardFrontStatus = 1 or selfieStatus = 1 or passbookOrChequeStatus = 1 or rcStatus = 1 or pucStatus = 1 or insuranceStatus = 1 or permitStatus = 1 or fitnessCertificateStatus = 1 or taxReceiptStatus = 1 or drivingLicenseFrontStatus = 1 or drivingLicenseBackStatus = 1`;

    const queryPending = `SELECT
  CASE
    WHEN COUNT(*) < 0 THEN 0
    ELSE (
      SELECT
        (CASE WHEN aadharFrontStatus = 0 OR aadharFrontStatus = 2 THEN 1 ELSE 0 END) +
        (CASE WHEN aadharBackStatus = 0 OR aadharBackStatus = 2 THEN 1 ELSE 0 END) +
        (CASE WHEN panCardFrontStatus = 0 OR panCardFrontStatus = 2 THEN 1 ELSE 0 END) +
        (CASE WHEN selfieStatus = 0 OR selfieStatus = 2 THEN 1 ELSE 0 END) +
        (CASE WHEN passbookOrChequeStatus = 0 OR passbookOrChequeStatus = 2 THEN 1 ELSE 0 END) +
        (CASE WHEN rcStatus = 0 OR rcStatus = 2 THEN 1 ELSE 0 END) +
        (CASE WHEN pucStatus = 0 OR pucStatus = 2 THEN 1 ELSE 0 END) +
        (CASE WHEN insuranceStatus = 0 OR insuranceStatus = 2 THEN 1 ELSE 0 END) +
        (CASE WHEN permitStatus = 0 OR permitStatus = 2 THEN 1 ELSE 0 END) +
        (CASE WHEN fitnessCertificateStatus = 0 OR fitnessCertificateStatus = 2 THEN 1 ELSE 0 END) +
        (CASE WHEN taxReceiptStatus = 0 OR taxReceiptStatus = 2 THEN 1 ELSE 0 END) +
        (CASE WHEN drivingLicenseFrontStatus = 0 OR drivingLicenseFrontStatus = 2 THEN 1 ELSE 0 END) +
        (CASE WHEN drivingLicenseBackStatus = 0 OR drivingLicenseBackStatus = 2 THEN 1 ELSE 0 END) AS pending_documents
      FROM drivers
      WHERE uid = ?
    )
  END AS pending_documents;

`;

    const queryTotalColumns =
      "SELECT COUNT(*) AS total_columns " +
      "FROM information_schema.columns " +
      "WHERE table_name = 'drivers' AND " +
      "column_name IN ('aadharFront', 'aadharBack', 'panCardFront', 'selfie', 'passbookOrCheque', 'rc', 'puc', 'insurance', 'permit', 'fitnessCertificate', 'taxReceipt', 'drivingLicenseFront', 'drivingLicenseBack'); ";

    connection.query(
      queryVerified,
      decryptedUID,
      (errVerified, resultVerified) => {
        if (errVerified) {
          console.error("Verified Documents Query Error: ", errVerified);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        connection.query(
          queryPending,
          decryptedUID,
          (errPending, resultPending) => {
            if (errPending) {
              console.error("Pending Documents Query Error: ", errPending);
              return res.status(500).json({ error: "Internal Server Error" });
            }

            connection.query(
              queryTotalColumns,
              (errTotalColumns, resultTotalColumns) => {
                if (errTotalColumns) {
                  console.error("Total Columns Query Error: ", errTotalColumns);
                  return res
                    .status(500)
                    .json({ error: "Internal Server Error" });
                }

                console.log("Total Docs and Columns Fetched");
                res.status(200).json({
                  verified_documents: resultVerified[0].verified_documents,
                  pending_documents: resultPending[0].pending_documents,
                  total_documents: resultTotalColumns[0].total_columns,
                });
              }
            );
          }
        );
      }
    );
  });
});

const fetchDocLinks = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;
    console.log(decryptedUID);
    const query = "select * from drivers where uid = ?";
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

const fetchDcdID = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    const query = "select dcd_id from drivers_car_details where uid = ?";
    connection.query(query, [decryptedUID], (err, result) => {
      if (err) {
        console.error("Fetch dcd_id Error: ", err);
        return res.status(500).json({ error: "Server Error" });
      } else {
        if (result.length === 0) {
          res.status(404).json({ message: "No DCD ID Found" });
        } else {
          res.status(200).json(result[0].dcd_id);
        }
      }
    });
  });
});

const fetchBookingsDetails = asyncHand(async (req, res) => {
  authenticateUser(req, res, async () => {
    const { decryptedUID } = req.body;

    console.log("Received request body:", req.body); // Debugging
    if (!decryptedUID) {
      return res.status(400).json({ error: "Missing decryptedUID" });
    }

    if (!connection) {
      return res.status(500).json({ error: "Database connection unavailable" });
    }

    try {
      // Step 1: Get the driver's car type
      const getCarTypeQuery = `SELECT car_type FROM drivers_car_details WHERE uid = ?`;
      connection.query(getCarTypeQuery, [decryptedUID], (err, carResult) => {
        if (err) {
          console.error("Error fetching car type:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (carResult.length === 0) {
          return res
            .status(404)
            .json({ message: "No car details found for the driver" });
        }

        const driverCarType = carResult[0].car_type;
        console.log("Driver car type:", driverCarType); // Debugging

        // Step 2: Fetch bookings that match the driver's car type
        const getBookingsQuery = `
          SELECT * FROM bookings 
          WHERE trip_status = 0 
          AND pickup_date_time >= NOW()
          AND selected_car = ?
          ORDER BY pickup_date_time ASC
        `;

        connection.query(getBookingsQuery, [driverCarType], (err, bookings) => {
          if (err) {
            console.error("Error fetching bookings:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          // if (bookings.length === 0) {
          //   return res.status(404).json({ message: "No Bookings Found" });
          // }

          console.log("Bookings fetched successfully:", bookings.length); // Debugging
          res.status(200).json(bookings);
        });
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

const fetchParticularBookingsDetails = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, bid } = req.body;

    const query = "select * from bookings where bid = ?";
    connection.query(query, bid, (err, result) => {
      if (err) {
        console.error("Internal Server Error : ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      } else {
        if (result.length === 0) {
          return res.status(404).json({ message: "No Bookings Found" });
        } else {
          res.status(200).json(result[0]);
        }
      }
    });
  });
});

const fetchBookingsDataTable = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    const query1 = "SELECT did FROM drivers WHERE uid = ?";
    connection.query(query1, decryptedUID, (err1, result1) => {
      if (err1) {
        console.error("Internal Server Error: ", err1);
        return res.status(500).json({ error: "Internal Server Error" });
      } else {
        if (result1.length === 0) {
          return res.status(404).json({ message: "No DID Found" });
        } else {
          const did = result1[0].did; // Extracting did from result1

          const query2 = "SELECT * FROM bookings WHERE did = ?";
          connection.query(query2, did, (err2, result2) => {
            if (err2) {
              console.error("Internal Server Error: ", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            } else {
              if (result2.length === 0) {
                return res.status(404).json({
                  message: "No Data Found In Bookings Table of this DID",
                });
              } else {
                const pid = result2[0].pid; // Extracting pid from result2
                const query3 = "SELECT * FROM passengers WHERE pid = ?";
                connection.query(query3, pid, (err3, result3) => {
                  if (err3) {
                    console.error("Internal Server Error: ", err3);
                    return res
                      .status(500)
                      .json({ error: "Internal Server Error" });
                  } else {
                    res
                      .status(200)
                      .json({ passengerInfo: result3, bookingInfo: result2 });
                  }
                });
              }
            }
          });
        }
      }
    });
  });
});

const driverAcceptBooking = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, booking } = req.body;

    const query1 = "SELECT did, dcd_id FROM drivers WHERE uid = ?";
    connection.query(query1, decryptedUID, (err1, result1) => {
      if (err1) {
        console.error("Internal Server Error: ", err1);
        return res.status(500).json({ error: "Internal Server Error" });
      } else if (result1.length === 0) {
        return res.status(404).json({ message: "No Driver Found" });
      } else {
        const { did, dcd_id } = result1[0];

        const query2 =
          "SELECT car_type FROM drivers_car_details WHERE dcd_id = ?";
        connection.query(query2, dcd_id, (err2, result2) => {
          if (err2) {
            console.error("Internal Server Error: ", err2);
            return res.status(500).json({ error: "Internal Server Error" });
          } else if (result2.length === 0) {
            return res.status(404).json({ message: "No Car Type Found" });
          } else {
            const carType = result2[0].car_type;

            if (carType == booking.selected_car) {
              const updateQuery =
                "UPDATE bookings SET did = ?, dcd_id = ?, trip_status = 1 WHERE bid = ?";
              connection.query(
                updateQuery,
                [did, dcd_id, booking.bid],
                (err3, result3) => {
                  if (err3) {
                    console.error("Internal Server Error: ", err3);
                    return res
                      .status(500)
                      .json({ error: "Internal Server Error" });
                  } else {
                    res
                      .status(200)
                      .json({ message: "Booking updated successfully" });
                  }
                }
              );
            } else {
              return res.status(400).json({ error: "Car Type does not match" });
            }
          }
        });
      }
    });
  });
});

const verifyRideStartOtp = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, rideId, enteredOtp } = req.body;
    console.log("Ride ID:", rideId);
    console.log("Entered OTP:", enteredOtp);

    if (!decryptedUID || !rideId || !enteredOtp) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const selectQuery = `
    SELECT ride_otp FROM bookings 
    WHERE bid = ?
  `;

    connection.query(selectQuery, [rideId], (err, results) => {
      if (err) {
        console.error("Error fetching ride OTP:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Ride not found" });
      }

      const dbOtp = results[0].ride_otp;
      console.log("DB OTP:", dbOtp);

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

          console.log("Ride started successfully");

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

const getTripStatus = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, bookingId } = req.body;
    console.log("Booking ID:", bookingId);

    if (!decryptedUID || !bookingId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const query = `
      SELECT trip_status FROM bookings WHERE bid = ?
    `;

    connection.query(query, [bookingId], (err, results) => {
      if (err) {
        console.error("Error fetching trip status:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const tripStatus = results[0].trip_status;
      return res.status(200).json(tripStatus);
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
      WHERE bid = ? 
    `;

    connection.query(selectQuery, [rideId], (err, results) => {
      if (err) {
        console.error("Error checking ride:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Ride not found" });
      }

      const currentStatus = results[0].trip_status;

      // Prevent starting if already started/completed/cancelled
      if ([3, 5, 6, 7].includes(currentStatus)) {
        const statusMessages = {
          3: "Ride already started",
          5: "Ride already completed",
          6: "Ride cancelled by passenger",
          7: "Ride cancelled by driver",
        };
        return res.status(400).json({ message: statusMessages[currentStatus] });
      }

      // Update ride to Started (status = 3)
      const updateToStartedQuery = `UPDATE bookings SET trip_status = 3 WHERE bid = ?`;

      connection.query(updateToStartedQuery, [rideId], (updateErr) => {
        if (updateErr) {
          console.error("Error updating ride status to 3:", updateErr);
          return res.status(500).json({ message: "Error starting ride" });
        }
        console.log("Ride started successfully");

        // Update ride to In Progress (status = 4) after success
        const updateToInProgressQuery = `UPDATE bookings SET trip_status = 4 WHERE bid = ?`;

        connection.query(updateToInProgressQuery, [rideId], (updateErr2) => {
          if (updateErr2) {
            console.error("Error updating ride status to 4:", updateErr2);
            return res
              .status(500)
              .json({ message: "Error updating ride progress" });
          }
          console.log("Ride status updated to 4 (In Progress)");

          return res.status(200).json({
            message: "Ride started and updated successfully to In Progress",
          });
        });
      });
    });
  });
});

const setPaymentOtp = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, rideId, otp } = req.body;
    const query = `
      UPDATE bookings
      SET payment_otp = ?
      WHERE bid = ? 
      `;

    connection.query(query, [otp, rideId], (err, result) => {
      if (err) {
        console.error("Error setting payment OTP:", err);
        return res.status(500).json({ message: "Error setting payment OTP" });
      }
      if (result.affectedRows === 0) {
        return res.status(400).json({ message: "Invalid ride ID or user ID" });
      }
      return res.status(200).json({ message: "Payment OTP set successfully" });
    });
  });
});

const arrivedAtPickup = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID, rideId } = req.body;
    console.log("Arrived at pickup location:", rideId);
    const query = `
      UPDATE bookings
      SET trip_status = 2
      WHERE bid = ?
    `;

    connection.query(query, [rideId], (err, result) => {
      if (err) {
        console.error("Error updating trip status:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({ message: "Invalid ride ID or user ID" });
      }

      return res.status(200).json({ message: "Arrived at pickup location" });
    });
  });
});

module.exports = {
  fetchDcdID,
  fetchDocLinks,
  handleTotalDocs,
  fetchCarDetails,
  uploadCarDetails,
  drivers_document_auth,
  uploadProfileImage,
  fetchProfileIMG,
  sendProfileUpdateEmailVerification,
  updateProfile,
  fetchProfileData,
  fetchParticularDocStatus,
  fetchDocumentLink,
  driversDocumentUpload,
  fetchBookingsDetails,
  fetchParticularBookingsDetails,
  driverAcceptBooking,
  fetchBookingsDataTable,
  verifyRideStartOtp,
  getTripStatus,
  startRide,
  setPaymentOtp,
  arrivedAtPickup,
};
