const jwt = require("jsonwebtoken");
const generateRefreshSecretKey = require("./generateRefreshSecretKey");
const refreshSecretKey =
  process.env.REFRESH_SECRET_KEY || generateRefreshSecretKey();

const generateRefreshToken = (email) => {
  return jwt.sign({ email: email }, refreshSecretKey, { expiresIn: "7d" });
};

module.exports = generateRefreshToken;
