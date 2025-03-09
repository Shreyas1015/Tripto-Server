const asyncHand = require("express-async-handler");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const connection = require("../config/dbConfig");

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
    subject: "Password Reset OTP",
    text: `Your OTP for resetting the password is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
  console.log("OTP Sent to mail : ", email, "and the opt is : ", otp);
}

const forgetPass = asyncHand(async (req, res) => {
  const { email } = req.body;

  const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
  connection.query(checkEmailQuery, [email], async (err, userResult) => {
    if (err) {
      console.error("Error checking email: ", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (userResult.length === 0) {
      return res.status(400).json({ error: "Email not found" });
    }

    const otp = generateOTP();

    const insertOTPQuery =
      "INSERT INTO otps (email, otp, created_at) VALUES (?, ?, NOW())";
    connection.query(insertOTPQuery, [email, otp], async (err, result) => {
      if (err) {
        console.error("Error inserting OTP data: ", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      try {
        await sendOTPEmail(email, otp);
        res.json({ message: "OTP sent successfully" });
      } catch (error) {
        console.error("Error sending OTP email: ", error);
        res.status(500).json({ error: "Error sending OTP email" });
      }
    });
  });
});

const resetPass = asyncHand(async (req, res) => {
  try {
    const formData = req.body;

    console.log("Received reset password request.");
    console.log("formData:", formData);

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const passwordIsValid = passwordRegex.test(formData.newPassword);
    console.log("Password is valid:", passwordIsValid);

    if (!passwordIsValid) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and contain at least one lowercase letter, one special character, one uppercase letter, and one number",
      });
    }

    const verifyOTPQuery =
      "SELECT * FROM otps WHERE email = ? AND otp = ? AND created_at >= NOW() - INTERVAL 15 MINUTE";

    const otpResult = await query(verifyOTPQuery, [
      formData.email,
      formData.otp,
    ]);

    console.log("OTP verification result:", otpResult);

    if (otpResult.length === 0) {
      return res.status(400).json({ error: "Invalid OTP or OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(formData.newPassword, 10);
    const updatePasswordQuery = "UPDATE users SET password = ? WHERE email = ?";
    const updateResult = await query(updatePasswordQuery, [
      hashedPassword,
      formData.email,
    ]);

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  forgetPass,
  resetPass,
};
