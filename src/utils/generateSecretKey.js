const crypto = require("crypto");

function generateSecretKey() {
  const secretKey = crypto.randomBytes(32).toString("hex");
  return secretKey;
}

module.exports = generateSecretKey;
