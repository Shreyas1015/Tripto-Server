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

const fetchBookingsDetails = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

    const query = "select * from bookings where trip_status = 0";
    connection.query(query, (err, result) => {
      if (err) {
        console.error("Internal Server Error : ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      } else {
        if (result.length === 0) {
          return res.status(404).json({ message: "No Bookings Found" });
        } else {
          res.status(200).json(result);
        }
      }
    });
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
};
