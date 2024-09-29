const crypto = require("crypto");

const generateRefreshSecretKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = generateRefreshSecretKey;
