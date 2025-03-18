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

const fetchProfileIMG = asyncHand(async (req, res) => {
  try {
    const { decryptedUID } = req.body;

    const query = "SELECT profile_img FROM vendors WHERE uid = ?";
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
        const updateVendorQuery =
          "UPDATE vendors SET name = ?, email = ?, phone_number = ? WHERE uid = ?";
        const updateVendorValues = [
          formData.name,
          formData.email,
          formData.phone_number,
          formData.uid,
        ];

        connection.query(updateVendorQuery, updateVendorValues, (err) => {
          if (err) {
            console.error(`Error updating vendor profile: ${err}`);
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
const fetchParticularDocStatus = asyncHand((req, res) => {
  authenticateUser(req, res, () => {
    const { decryptedUID } = req.body;

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

    // Define the list of fields that should have the corresponding _updated_at timestamp
    const documentFields = [
      "aadharFront",
      "aadharBack",
      "panCardFront",
      "profilePhoto",
      "udyamAadhar",
      "ghumastaLicense",
    ];

    const selectQuery = "SELECT * FROM vendors WHERE uid = ?";
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
          UPDATE vendors
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
            INSERT INTO vendors (${insertFields.join(", ")})
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

module.exports = {
  vendor_document_auth,
  fetchProfileData,
  fetchProfileIMG,
  uploadProfileImage,
  sendProfileUpdateEmailVerification,
  updateProfile,
  fetchParticularDocStatus,
  fetchDocLinks,
  documentUpload,
};
