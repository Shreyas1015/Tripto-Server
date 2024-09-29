require("dotenv").config();
const jwt = require("jsonwebtoken");
const connection = require("../config/dbConfig");
const generateSecretKey = require("../utils/generateSecretKey");
const generateRefreshSecretKey = require("../utils/generateRefreshSecretKey");

const secretKey = process.env.DB_SECRET_KEY || generateSecretKey();

const refreshSecretKey =
  process.env.REFRESH_SECRET_KEY || generateRefreshSecretKey();
console.log("refreshSecretKey :", refreshSecretKey);

const authenticateToken = (req, res, next) => {
  const token = req.cookies["token"];
  console.log("Received Token:", token);

  if (!token) {
    console.log("Unauthorized: Token not provided");
    return res
      .status(401)
      .json({ message: "Unauthorized: Token not provided" });
  } else {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        console.log("Forbidden: Invalid token");
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      } else {
        req.user = decoded;
        console.log("Decoded User :", decoded);
        connection.query(
          "SELECT * FROM users WHERE email = ?",
          [req.user.email],
          (err, result) => {
            if (err) {
              console.log(err);
              return res
                .status(500)
                .json({ message: "Error fetching user data" });
            } else if (result.length === 0) {
              console.log("User not found in the database");
              return res
                .status(404)
                .json({ message: "User not found in the database" });
            } else {
              req.uid = result[0].uid;
              req.user_type = result[0].user_type;
              req.email = result[0].email;

              console.log("UID :", req.uid);
              console.log("USER_TYPE :", req.user_type);
              console.log("EMAIL :", req.email);
              next();
            }
          }
        );
      }
    });
  }
};

const verifyRefreshToken = (refreshToken) => {
  try {
    const payload = jwt.verify(refreshToken, refreshSecretKey);
    return { email: payload.email };
  } catch (err) {
    return null;
  }
};

const authenticateUser = async (req, res, next) => {
  if (!req.user || !req.user.email) {
    return res
      .status(401)
      .json({ message: "Unauthorized - Missing or invalid token" });
  }

  const UserIDFromBody = parseInt(req.body.decryptedUID);
  const UserIDFromQuery = parseInt(req.query.decryptedUID);
  console.log("User Id From Body ", UserIDFromBody);
  console.log("User Id From Query ", UserIDFromBody);

  const authenticatedUserID = req.uid;
  console.log("authenticatedUserID: ", authenticatedUserID);

  if (
    (UserIDFromBody && authenticatedUserID === UserIDFromBody) ||
    (UserIDFromQuery && authenticatedUserID === UserIDFromQuery)
  ) {
    console.log("User authenticated successfully");
    next();
  } else {
    console.log("Forbidden - Access denied");
    return res.status(403).json({ message: "Forbidden - Access denied" });
  }
};

module.exports = {
  authenticateToken,
  verifyRefreshToken,
  authenticateUser,
};
