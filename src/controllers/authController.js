require("dotenv").config();
const asyncHand = require("express-async-handler");
const jwt = require("jsonwebtoken");
const generateSecretKey = require("../utils/generateSecretKey");
const connection = require("../config/dbConfig");
const nodemailer = require("nodemailer");
const generateRefreshToken = require("../utils/generateRefreshToken");
const { verifyRefreshToken } = require("../middlewares/authMiddleware");

const secretKey = process.env.DB_SECRET_KEY || generateSecretKey();
console.log("SecretKey :", secretKey);

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
  console.log(
    "Phone verification OTP sent to phone:",
    phone,
    "and the OTP is:",
    otp
  );
}

const login = asyncHand((req, res) => {
  const { email } = req.body;
  const searchQuery = "SELECT * from users where email = ?";

  try {
    connection.query(searchQuery, [email], async (err, results) => {
      if (err) {
        console.error("Error running the query : ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      } else {
        const user = results[0];
        const uid = user.uid;
        const email = user.email;
        const user_type = user.user_type;

        const token = jwt.sign({ email: email }, secretKey, {
          expiresIn: "10h",
        });

        console.log("Generated Token:", token);
        const refreshToken = generateRefreshToken(email);

        console.log("Refresh Token:", refreshToken);

        res.cookie("token", token, {
          httpOnly: true,
          // secure: true,
          // sameSite: "None",
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          // secure: true,
          // sameSite: "None",
        });

        res.status(200).json({
          message: "Logged in successfully",
          email: email,
          uid: uid,
          user_type: user_type,
        });
      }
    });
  } catch (error) {
    console.error("Error running the query : ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const refresh = asyncHand((req, res) => {
  const refreshToken = req.cookies["refreshToken"];
  if (!refreshToken) return res.sendStatus(401);

  const user = verifyRefreshToken(refreshToken);
  if (!user) return res.sendStatus(403);

  console.log("Received Refresh Token:", refreshToken);

  const token = jwt.sign(user, secretKey, { expiresIn: "10h" });
  const newRefreshToken = generateRefreshToken(user.email);

  console.log("New Access Token:", token);
  console.log("New Refresh Token:", newRefreshToken);

  res.cookie("token", token, {
    httpOnly: true,
    // secure: true,
    // sameSite: "None",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // secure: true,
    // sameSite: "None",
  });
  res.sendStatus(200);
});

const handleUserExists = (res) => {
  return res.status(400).json({ error: "User already exists" });
};

const handleServerError = (res, errMessage) => {
  console.error(errMessage);
  return res.status(500).json({ error: "Internal Server Error" });
};

const handleSuccess = (res, message) => {
  console.log(message);
  return res.status(200).json({ message });
};

const sendEmailVerification = asyncHand(async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();

  try {
    connection.query(
      "INSERT INTO email_verification_otps (email, otp, created_at) VALUES (?, ?, NOW())",
      [email, otp],
      (err) => {
        if (err) {
          console.error("Error saving email OTP to the database:", err);
          return res.status(500).json({ success: false });
        }

        sendOTPEmail(email, otp);
        res.status(200).json({ success: true });
      }
    );
  } catch (error) {
    console.error("Error sending email verification code:", error);
    res.status(500).json({ success: false });
  }
});

const sendLoginEmailVerification = asyncHand(async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();

  try {
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, result) => {
        if (err) {
          console.error("Error checking email existence:", err);
          return res.status(500).json({ success: false });
        }

        if (result.length === 0) {
          return res.status(400).json({ error: "User not registered" });
        }

        connection.query(
          "INSERT INTO email_verification_otps (email, otp, created_at) VALUES (?, ?, NOW())",
          [email, otp],
          (err) => {
            if (err) {
              console.error("Error saving email OTP to the database:", err);
              return res.status(500).json({ success: false });
            }

            sendOTPEmail(email, otp);
            res.status(200).json({ success: true });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error sending email verification code:", error);
    res.status(500).json({ success: false });
  }
});

const confirmEmail = asyncHand(async (req, res) => {
  const { email, emailOtp } = req.body;
  // Verify the sent OTP
  const verifyEmailOTPQuery =
    "SELECT * FROM email_verification_otps WHERE email = ? AND otp = ? AND created_at >= NOW() - INTERVAL 15 MINUTE";

  try {
    connection.query(
      verifyEmailOTPQuery,
      [email, emailOtp],
      (err, emailOTPResult) => {
        if (err) {
          console.error("Error during email verification:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (emailOTPResult.length === 0) {
          return res.status(400).json({
            error:
              "Invalid email OTP or OTP expired. Please request a new OTP.",
          });
        }

        res.status(200).json({ success: true });
      }
    );
  } catch (error) {
    console.error("Error during email verification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// const sendPhoneVerification = asyncHand(async (req, res) => {
//   const { phone } = req.body;
//   const otp = generateOTP();

//   try {
//     await query(
//       "INSERT INTO phone_verification_otps (phone_number, otp, created_at) VALUES (?, ?, NOW())",
//       [phone, otp]
//     );

//     res.json({ success: true });
//   } catch (error) {
//     console.error("Error sending phone verification code:", error);
//     res.json({ success: false });
//   }

//   // Verify the sent OTP
//   const verifyPhoneOTPQuery =
//     "SELECT * FROM phone_verification_otps WHERE phone_number = ? AND otp = ? AND created_at >= NOW() - INTERVAL 15 MINUTE";
//   const phoneOTPResult = await query(verifyPhoneOTPQuery, [phone, otp]);

//   if (phoneOTPResult.length === 0) {
//     return res.status(400).json({ error: "Invalid phone OTP or OTP expired" });
//   }
// });
// const sendPhoneVerification = asyncHand(async (req, res) => {

const signUp = asyncHand(async (req, res) => {
  const formData = req.body;
  console.log("Received Sign-Up Request:", formData);

  try {
    // 1. Check if the user already exists
    const searchQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(searchQuery, [formData.email], async (err, result) => {
      if (err) {
        console.error("Database Query Error:", err);
        return handleServerError(res, "Error running the query: " + err);
      }

      if (result.length > 0) {
        console.log("User already exists:", formData.email);
        return handleUserExists(res);
      }

      // 2. Insert into Users Table
      const insertUserQuery =
        "INSERT INTO users (name, email, phone_number, user_type) VALUES (?, ?, ?, ?)";

      connection.query(
        insertUserQuery,
        [
          formData.name,
          formData.email,
          formData.phone_number,
          parseInt(formData.user_type, 10), // Ensure correct data type
        ],
        (err, userResult) => {
          if (err) {
            console.error("Error inserting into users:", err);
            return handleServerError(
              res,
              "Error inserting data into users: " + err
            );
          }

          console.log(
            "User Inserted Successfully. User ID:",
            userResult.insertId
          );

          // 3. Insert into Passengers or Vendors Table
          if (parseInt(formData.user_type, 10) === 2) {
            console.log("Registering as Passenger...");
            const insertPassengerQuery =
              "INSERT INTO passengers (uid, name, email, phone_number, profile_img) VALUES (?, ?, ?, ?, ?)";

            connection.query(
              insertPassengerQuery,
              [
                userResult.insertId,
                formData.name,
                formData.email,
                formData.phone_number,
                formData.profile_img || null,
              ],
              (err) => {
                if (err) {
                  console.error("Error inserting into passengers:", err);
                  return handleServerError(
                    res,
                    "Error inserting data into passengers: " + err
                  );
                }
                console.log("User and Passenger Registered Successfully");
                return handleSuccess(
                  res,
                  "User and Passenger Registered Successfully"
                );
              }
            );
          } else if (parseInt(formData.user_type, 10) === 4) {
            console.log("Registering as Vendor...");
            const insertVendorQuery =
              "INSERT INTO vendors (uid, name, email, phone_number, profile_img) VALUES (?, ?, ?, ?, ?)";

            connection.query(
              insertVendorQuery,
              [
                userResult.insertId,
                formData.name,
                formData.email,
                formData.phone_number,
                formData.profile_img || null,
              ],
              (err) => {
                if (err) {
                  console.error("Error inserting into vendors:", err);
                  return handleServerError(
                    res,
                    "Error inserting data into vendors: " + err
                  );
                }
                console.log("User and Vendor Registered Successfully");
                return handleSuccess(
                  res,
                  "User and Vendor Registered Successfully"
                );
              }
            );
          } else {
            console.log(
              "User Registered Successfully (No Passenger/Vendor Entry)"
            );
            return handleSuccess(res, "User Registered Successfully");
          }
        }
      );
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return handleServerError(res, "Error inserting data: " + error);
  }
});

const logout = asyncHand((req, res) => {
  res.clearCookie("token", { httpOnly: true });
  res.clearCookie("refreshToken", { httpOnly: true });

  res.status(200).json({ message: "Logout successful" });
});

module.exports = {
  login,
  signUp,
  sendEmailVerification,
  // sendPhoneVerification,
  confirmEmail,
  sendLoginEmailVerification,
  refresh,
  logout,
};
